'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyAdmin, emailLayout } from '@/lib/email'
import { getStripe, siteUrl } from '@/lib/stripe'
import { cardFee, toCents } from '@/lib/payments'

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024

export async function submitPayment(
  locale: string,
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'auth' }

  const amount = Number(formData.get('amount'))
  const method = String(formData.get('method') || '')
  const reference = String(formData.get('reference') || '').trim()
  const notes = String(formData.get('notes') || '').trim()
  const receipt = formData.get('receipt') as File | null

  if (!Number.isFinite(amount) || amount <= 0) return { error: 'amount' }
  if (!['zelle', 'transfer'].includes(method)) return { error: 'method' }

  const admin = createAdminClient()
  const { data: booking } = await admin
    .from('bookings')
    .select('id, applicant_name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!booking) return { error: 'no_booking' }

  let receiptPath: string | null = null
  if (receipt && receipt.size > 0) {
    if (receipt.size > MAX_RECEIPT_BYTES) return { error: 'receipt_size' }
    const ext = (receipt.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    receiptPath = `${booking.id}/${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await admin.storage
      .from('receipts')
      .upload(receiptPath, receipt, { contentType: receipt.type || 'application/octet-stream' })
    if (upErr) return { error: upErr.message }
  }

  const { error } = await admin.from('payments').insert({
    booking_id: booking.id,
    amount,
    method,
    reference: reference || null,
    notes: notes || null,
    receipt_path: receiptPath,
  })
  if (error) return { error: error.message }

  await notifyAdmin(
    `Nuevo pago por revisar — $${amount.toFixed(2)}`,
    emailLayout(
      'Pago pendiente de revisión',
      `<p><strong>${booking.applicant_name || user.email}</strong> registró un pago de <strong>USD $${amount.toFixed(2)}</strong> vía ${method === 'zelle' ? 'Zelle' : 'transferencia'}.</p>
       ${reference ? `<p>Referencia: ${reference}</p>` : ''}
       ${receiptPath ? '<p>Incluye comprobante adjunto ✓</p>' : '<p>⚠️ Sin comprobante adjunto</p>'}
       <p><a href="https://tocca-portal.vercel.app/es/admin/payments" style="color:#4A9A92;">Revisar en el panel →</a></p>`,
    ),
  )

  revalidatePath(`/${locale}/payments`)
  return { ok: true }
}

/**
 * Pago con tarjeta: crea una Checkout Session y manda al cliente a Stripe.
 * No se registra nada en `payments` todavía — eso lo hace el webhook cuando
 * Stripe confirma el cobro, que es la única fuente confiable de que se pagó.
 */
export async function startCardPayment(
  locale: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'auth' }

  const amount = Number(formData.get('amount'))
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'amount' }

  const admin = createAdminClient()
  const { data: booking } = await admin
    .from('bookings')
    .select('id, title, applicant_email')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!booking) return { error: 'no_booking' }

  const fee = cardFee(amount)
  const tripName = (booking.title as Record<string, string> | null)?.[locale] || 'Tocca Amalfi Coast'

  let url: string | null = null
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      client_reference_id: booking.id,
      customer_email: booking.applicant_email || user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: toCents(amount),
            product_data: {
              name: tripName,
              description: locale === 'en' ? 'Payment toward your trip' : 'Abono a tu viaje',
            },
          },
        },
        ...(fee > 0
          ? [{
              quantity: 1,
              price_data: {
                currency: 'usd' as const,
                unit_amount: toCents(fee),
                product_data: {
                  name: locale === 'en' ? 'Card service fee' : 'Cargo de servicio por tarjeta',
                },
              },
            }]
          : []),
      ],
      // El webhook lee esto para saber cuánto abonar al viaje vs. cuánto fue cargo.
      metadata: {
        booking_id: booking.id,
        base_amount: amount.toFixed(2),
        fee_amount: fee.toFixed(2),
      },
      success_url: `${siteUrl()}/${locale}/payments?pago=ok`,
      cancel_url: `${siteUrl()}/${locale}/payments?pago=cancelado`,
    })
    url = session.url
  } catch (e) {
    console.error('[stripe] no se pudo crear la Checkout Session', e)
    return { error: 'stripe' }
  }

  if (!url) return { error: 'stripe' }
  redirect(url)
}
