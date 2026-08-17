// Correos transaccionales vía Resend. El fallo se devuelve al que llama en vez
// de tragárselo: un correo que nunca llega y que nadie ve fallar es mucho peor
// que uno que falla ruidosamente.

const FROM = process.env.EMAIL_FROM || 'Tocca Amalfi Coast <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'jordan-raf-fer@protonmail.com'

/** `{}` si el correo salió; `{ error }` con un motivo accionable si no. */
export type SendResult = { error?: string }

/** Traduce los rechazos de Resend a algo que se pueda accionar desde el panel. */
function explain(status: number, body: string): string {
  // Con el remitente compartido `onboarding@resend.dev`, Resend solo entrega al
  // dueño de la cuenta y responde 403 a cualquier otro destinatario. Es la causa
  // más común de "al cliente nunca le llegó".
  if (status === 403 && body.includes('testing emails')) {
    return 'Resend solo entrega a tu propia dirección mientras no verifiques un dominio. Verifícalo en resend.com/domains y define EMAIL_FROM en Vercel.'
  }
  if (status === 401 || status === 403) return 'Resend rechazó la API key (revisa RESEND_API_KEY en Vercel).'
  if (status === 422) return `Resend rechazó el remitente o el destinatario: ${body}`
  if (status === 429) return 'Resend está limitando el envío. Espera un momento y reintenta.'
  return `Resend respondió ${status}: ${body}`
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { error: 'Falta configurar el correo (RESEND_API_KEY) en Vercel.' }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    })
    if (!res.ok) {
      const error = explain(res.status, await res.text())
      console.error('[email] no salió el correo a', to, '—', error)
      return { error }
    }
    return {}
  } catch (err) {
    console.error('[email] send failed', err)
    return { error: 'No se pudo contactar con Resend.' }
  }
}

/**
 * Aviso interno. Nunca corta el flujo de quien lo llama (un webhook de Stripe no
 * debe fallar porque el correo no salga); el motivo queda en los logs.
 */
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
