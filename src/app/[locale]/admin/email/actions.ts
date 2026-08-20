'use server'

import { sendEmail, emailLayout } from '@/lib/email'
import { isAdmin } from '@/lib/admin-auth'

/**
 * Los avisos internos se mandan en segundo plano y `notifyAdmin` nunca corta el
 * flujo si fallan, así que un correo que no llega no deja rastro visible. Esto
 * hace el mismo envío a mano y devuelve el motivo exacto del rechazo.
 */
export async function sendTestEmail(
  _prev: { ok?: boolean; error?: string; to?: string } | null,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string; to?: string }> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const typed = String(formData.get('to') || '').trim()
  const to = typed || process.env.ADMIN_NOTIFY_EMAIL || ''
  if (!to) return { error: 'No hay ninguna dirección configurada ni escrita.' }

  const result = await sendEmail({
    to,
    subject: 'Prueba de correo — Tocca Amalfi Coast',
    html: emailLayout(
      'La configuración de correo funciona',
      `<p>Si estás leyendo esto, los avisos del portal pueden llegar a <strong>${to}</strong>.</p>
       <p>Enviado desde el panel, en la sección Correo.</p>`,
    ),
  })

  return result.error ? { error: result.error, to } : { ok: true, to }
}
