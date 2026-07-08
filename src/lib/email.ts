// Correos transaccionales vía Resend. Si RESEND_API_KEY no está configurada,
// todo es un no-op silencioso para no romper los flujos.

const FROM = process.env.EMAIL_FROM || 'Tocca Amalfi Coast <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'jordan-raf-fer@protonmail.com'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) return

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    })
    if (!res.ok) {
      console.error('[email] Resend error', res.status, await res.text())
    }
  } catch (err) {
    console.error('[email] send failed', err)
  }
}

export async function notifyAdmin(subject: string, html: string): Promise<void> {
  await sendEmail({ to: ADMIN_EMAIL, subject, html })
}

/** Plantilla mínima con el estilo de la marca. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `
  <div style="background:#F4F1EB;padding:32px 16px;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#23374D 0%,#1a2d3f 100%);padding:28px 32px;">
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">Tocca Amalfi Coast</p>
        <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:500;font-style:italic;">${title}</h1>
      </div>
      <div style="padding:28px 32px;color:#3E2D23;font-size:14px;line-height:1.7;">
        ${bodyHtml}
      </div>
      <div style="padding:16px 32px;border-top:1px solid rgba(62,45,35,0.1);color:#7A7168;font-size:11px;">
        Tocca Amalfi Coast · tocca-portal.vercel.app
      </div>
    </div>
  </div>`
}
