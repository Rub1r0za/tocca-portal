// El alta de cuenta ocurre en el navegador (`supabase.auth.signUp`), así que no
// hay código de servidor que se entere. El formulario avisa por aquí y esto lo
// verifica contra Supabase antes de mandar nada: sin verificación, cualquiera
// podría provocar correos al equipo posteando ids al azar.

import { createAdminClient } from '@/lib/supabase/admin'
import { notifyAdmin, emailLayout } from '@/lib/email'

export const runtime = 'nodejs'

/** Solo avisamos de altas recientes; un id viejo reenviado no dispara nada. */
const MAX_AGE_MS = 15 * 60 * 1000

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://tocca-portal.vercel.app'

export async function POST(request: Request) {
  let userId = ''
  try {
    const body = (await request.json()) as { userId?: unknown }
    userId = typeof body.userId === 'string' ? body.userId : ''
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }
  if (!userId) return Response.json({ ok: false }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.getUserById(userId)
  const user = data?.user
  if (error || !user) return Response.json({ ok: false }, { status: 404 })

  if (Date.now() - new Date(user.created_at).getTime() > MAX_AGE_MS) {
    return Response.json({ ok: true, skipped: 'stale' })
  }
  // Marca puesta en app_metadata (el usuario no puede escribirla) para que dos
  // peticiones seguidas no manden el mismo aviso dos veces.
  if (user.app_metadata?.admin_notified_at) {
    return Response.json({ ok: true, skipped: 'already-notified' })
  }

  const confirmed = Boolean(user.email_confirmed_at)
  const sent = await notifyAdmin(
    `Nueva cuenta creada — ${user.email}`,
    emailLayout(
      'Nueva cuenta en el portal',
      `<p><strong>${user.email}</strong> acaba de crear su cuenta.</p>
       <p>Estado: ${confirmed ? 'correo confirmado ✓' : 'pendiente de confirmar su correo'}</p>
       <p>Todavía no ha completado el registro del viaje; recibirás otro aviso cuando lo haga.</p>
       <p><a href="${SITE}/es/admin/clients" style="color:#4A9A92;">Ver clientes en el panel →</a></p>`,
    ),
  )

  // Solo se marca si el correo salió: si Resend falla, el siguiente intento
  // puede volver a mandarlo en vez de perderse en silencio.
  if (!sent.error) {
    await admin.auth.admin.updateUserById(userId, {
      app_metadata: { ...user.app_metadata, admin_notified_at: new Date().toISOString() },
    })
  }

  return Response.json({ ok: !sent.error })
}
