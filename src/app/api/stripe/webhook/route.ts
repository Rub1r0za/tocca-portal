import type Stripe from 'stripe'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyAdmin, emailLayout } from '@/lib/email'

// El SDK de Stripe necesita Node (crypto), no el runtime edge.
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[stripe] falta STRIPE_WEBHOOK_SECRET')
    return new Response('webhook no configurado', { status: 500 })
  }

  // La firma se calcula sobre el cuerpo crudo: leerlo como JSON lo invalidaría.
  const payload = await request.text()
  const signature = (await headers()).get('stripe-signature')
  if (!signature) return new Response('sin firma', { status: 400 })

  let event: Stripe.Event
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret)
  } catch (e) {
    console.error('[stripe] firma inválida', e)
    return new Response('firma inválida', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // Con tarjeta esto ya viene 'paid'; con métodos diferidos puede llegar
    // sin pagar todavía y no queremos abonarlo a la reserva.
    if (session.payment_status !== 'paid') {
      return Response.json({ received: true, skipped: 'unpaid' })
    }

    const bookingId = session.metadata?.booking_id || session.client_reference_id
    if (!bookingId) {
      console.error('[stripe] sesión sin booking_id', session.id)
      return new Response('sin booking_id', { status: 400 })
    }

    const fee = Number(session.metadata?.fee_amount ?? 0) || 0
    const base = Number(session.metadata?.base_amount ?? 0)
      || Math.max(0, (session.amount_total ?? 0) / 100 - fee)

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null

    const admin = createAdminClient()
    const { error } = await admin.from('payments').insert({
      booking_id: bookingId,
      amount: base,
      fee_amount: fee,
      currency: (session.currency ?? 'usd').toUpperCase(),
      method: 'stripe',
      // Cobrado por Stripe: no hay comprobante que revisar a mano.
      status: 'approved',
      reference: paymentIntentId,
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      reviewed_at: new Date().toISOString(),
    })

    if (error) {
      // 23505 = el índice único sobre stripe_session_id. Es un reintento de
      // Stripe sobre un evento ya procesado: respondemos 200 para que pare.
      if (error.code === '23505') {
        return Response.json({ received: true, duplicate: true })
      }
      console.error('[stripe] no se pudo guardar el pago', error)
      // 500 → Stripe reintenta más tarde en vez de perder el cobro.
      return new Response('error al guardar', { status: 500 })
    }

    const { data: booking } = await admin
      .from('bookings')
      .select('applicant_name, applicant_email')
      .eq('id', bookingId)
      .maybeSingle()

    await notifyAdmin(
      `Pago con tarjeta recibido — $${base.toFixed(2)}`,
      emailLayout(
        'Pago con tarjeta confirmado',
        `<p><strong>${booking?.applicant_name || booking?.applicant_email || 'Un cliente'}</strong> pagó <strong>USD $${base.toFixed(2)}</strong> con tarjeta.</p>
         ${fee > 0 ? `<p>Cargo de servicio cobrado aparte: $${fee.toFixed(2)}</p>` : ''}
         <p>Ya quedó aprobado automáticamente — no hay que revisar comprobante.</p>`,
      ),
    )

    for (const locale of ['es', 'en']) {
      revalidatePath(`/${locale}/payments`)
      revalidatePath(`/${locale}/admin/payments`)
      revalidatePath(`/${locale}/admin/bookings/${bookingId}/payments`)
    }
  }

  return Response.json({ received: true })
}
