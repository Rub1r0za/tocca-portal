'use client'

import { useState } from 'react'
import { PHRASES } from '@/lib/travel-content'
import { cn } from '@/lib/utils'

/**
 * El italiano manda y debajo va la traducción. El idioma de la traducción se
 * elige aquí y no con el de la app: viajan familias mezcladas y en la misma
 * mesa alguien va a querer leerlo en inglés.
 */
export function PhraseList({
  defaultLang,
  labelEs,
  labelEn,
  switchLabel,
}: {
  defaultLang: 'es' | 'en'
  labelEs: string
  labelEn: string
  switchLabel: string
}) {
  const [lang, setLang] = useState<'es' | 'en'>(defaultLang)

  return (
    <div>
      <div className="mb-5 flex items-center justify-center gap-2">
        <span className="sr-only" id="phrase-lang-label">
          {switchLabel}
        </span>
        <div
          role="group"
          aria-labelledby="phrase-lang-label"
          className="inline-flex rounded-full border border-hairline bg-panel/60 p-1"
        >
          {([['es', labelEs], ['en', labelEn]] as const).map(([code, label]) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-azure/40',
                lang === code ? 'bg-azure text-white' : 'text-mist hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2.5">
        {PHRASES.map((phrase) => (
          <li
            key={phrase.it}
            className="rounded-2xl border border-hairline bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(62,45,35,0.06)]"
          >
            <p
              className="text-lg leading-snug text-foreground"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontStyle: 'italic' }}
              lang="it"
            >
              {phrase.it}
            </p>
            <p className="mt-0.5 text-sm text-mist" lang={lang}>
              {phrase[lang]}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
