import { Plane, Car, Sparkles, BedDouble, UtensilsCrossed, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MapPin } from 'lucide-react'
import type { TimelineEventType } from '@/lib/types'

export type TimelineItem = {
  id: string
  type: TimelineEventType
  time: string
  title: string
  description: string
  location: string
}

export type TimelineGroup = {
  dateText: string
  items: TimelineItem[]
}

const typeIcon: Record<TimelineEventType, LucideIcon> = {
  flight: Plane,
  transfer: Car,
  experience: Sparkles,
  accommodation: BedDouble,
  meal: UtensilsCrossed,
  leisure: Waves,
}

const typeTint: Record<TimelineEventType, string> = {
  flight: 'text-azure',
  transfer: 'text-gold',
  experience: 'text-azure',
  accommodation: 'text-gold',
  meal: 'text-azure',
  leisure: 'text-gold',
}

export function TimelineView({ groups }: { groups: TimelineGroup[] }) {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.dateText}>
          {group.dateText && (
            <p className="mb-4 text-xs font-medium tracking-[0.18em] text-gold uppercase">
              {group.dateText}
            </p>
          )}
          <ol className="relative space-y-5">
            <span
              className="absolute top-2 bottom-2 left-[18px] w-px bg-hairline"
              aria-hidden
            />
            {group.items.map((item) => {
              const Icon = typeIcon[item.type]
              return (
                <li key={item.id} className="relative flex gap-4">
                  <span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-panel">
                    <Icon className={`size-[18px] ${typeTint[item.type]}`} strokeWidth={1.7} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    {item.time && (
                      <p className="text-xs font-medium text-gold">{item.time}</p>
                    )}
                    <h3
                      className="text-lg leading-snug text-foreground"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-0.5 text-sm leading-relaxed text-mist">{item.description}</p>
                    )}
                    {item.location && (
                      <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-mist/80">
                        <MapPin className="size-3.5" aria-hidden />
                        {item.location}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
