import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RegisterForm } from './register-form'

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('register')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // Si ya tiene una reserva (en cualquier estado), no hay nada que registrar
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  if (existing) redirect(`/${locale}/dashboard`)

  return (
    <div className="mx-auto max-w-lg px-5 py-8">
      <p className="text-[0.65rem] tracking-[0.3em] text-gold uppercase">Tocca Amalfi Coast</p>
      <h1
        className="mt-1 text-2xl text-foreground"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
      >
        {t('title')}
      </h1>
      <p className="mt-2 mb-7 text-sm leading-relaxed text-mist">{t('subtitle')}</p>
      <RegisterForm />
    </div>
  )
}
