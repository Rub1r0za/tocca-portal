import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Uppercase, letter-spaced eyebrow + optional title used at the top of sections. */
export function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string
  title?: string
  className?: string
}) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="text-[0.65rem] tracking-[0.22em] text-gold uppercase mb-1.5">{eyebrow}</p>
      )}
      {title && (
        <h2
          className="text-2xl text-foreground"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {title}
        </h2>
      )}
    </div>
  )
}

const statusStyles: Record<string, string> = {
  approved: 'bg-azure/15 text-azure border-azure/30',
  confirmed: 'bg-azure/15 text-azure border-azure/30',
  pending: 'bg-gold/15 text-gold border-gold/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
  declined: 'bg-destructive/15 text-destructive border-destructive/30',
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  const style = statusStyles[status] ?? 'bg-panel-2 text-mist border-hairline'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide capitalize',
        style
      )}
    >
      {label}
    </span>
  )
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-panel/60 px-6 py-12 text-center">
      {icon && <div className="mb-3 flex justify-center text-mist/50">{icon}</div>}
      <p
        className="text-lg text-foreground"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
      >
        {title}
      </p>
      {description && <p className="mt-1.5 text-sm text-mist">{description}</p>}
    </div>
  )
}
