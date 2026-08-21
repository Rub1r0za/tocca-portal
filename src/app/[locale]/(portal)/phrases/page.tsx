import { getTranslations } from 'next-intl/server'
import { AppHeader } from '@/components/app-header'
import { PhraseList } from './phrase-list'

export default async function PhrasesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tSections = await getTranslations('sections')
  const t = await getTranslations('phrases')

  return (
    <div>
      <AppHeader
        title={tSections('phrases.title')}
        subtitle={tSections('phrases.subtitle')}
        locale={locale}
      />

      <div className="px-5 py-6">
        <p className="mb-5 text-center text-sm leading-relaxed text-mist">{t('intro')}</p>
        <PhraseList
          defaultLang={locale === 'en' ? 'en' : 'es'}
          labelEs="Español"
          labelEn="English"
          switchLabel={t('switchLabel')}
        />
      </div>
    </div>
  )
}
