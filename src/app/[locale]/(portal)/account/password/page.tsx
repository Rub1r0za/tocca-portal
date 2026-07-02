import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { PasswordForm } from './password-form'

export default async function AccountPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const t = await getTranslations('account')

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[380px] flex-col justify-center px-4 py-12">
      <h1
        className="mb-6 text-center text-2xl text-foreground"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
      >
        {t('passwordTitle')}
      </h1>
      <PasswordForm />
    </div>
  )
}
