import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { ImageWithFallback } from './image-with-fallback'

export type CardMeta = { icon?: ReactNode; text: string }

export function ExperienceCard({
  href,
  imageUrl,
  eyebrow,
  title,
  description,
  meta,
  priority = false,
}: {
  href: string
  imageUrl: string | null | undefined
  eyebrow?: string
  title: string
  description?: string
  meta?: CardMeta[]
  priority?: boolean
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-hairline bg-panel transition-colors hover:border-gold/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
    >
      <ImageWithFallback
        src={imageUrl}
        alt={title}
        priority={priority}
        className="aspect-[16/10] w-full"
      />
      <div className="flex items-start gap-3 px-4 py-4">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="mb-1 text-[0.65rem] tracking-[0.2em] text-gold uppercase">{eyebrow}</p>
          )}
          <h3
            className="text-xl leading-snug text-foreground"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-mist">{description}</p>
          )}
          {meta && meta.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-mist">
              {meta.map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  {m.icon}
                  {m.text}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight
          className="mt-1 size-5 shrink-0 text-mist/60 transition-transform group-hover:translate-x-0.5 group-hover:text-gold"
          aria-hidden
        />
      </div>
    </Link>
  )
}
