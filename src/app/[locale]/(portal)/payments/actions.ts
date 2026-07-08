'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyAdmin, emailLayout } from '@/lib/email'

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
