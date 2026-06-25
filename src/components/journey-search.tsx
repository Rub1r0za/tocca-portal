'use client'

import { useMemo, useState } from 'react'
import { Search, CalendarDays, MapPin } from 'lucide-react'
import { ExperienceCard } from './experience-card'
import { EmptyState } from './primitives'

export type JourneyItem = {
  id: string
  href: string
  imageUrl: string | null
  dayLabel: string
  dateText: string
  location: string
  title: string
  description: string
  search: string
}

export function JourneySearch({
  items,
  placeholder,
  noResultsText,
}: {
  items: JourneyItem[]
  placeholder: string
  noResultsText: string
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) => it.search.includes(q))
  }, [items, query])

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-mist"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-xl border border-input bg-panel-2 py-3 pr-4 pl-10 text-sm text-foreground placeholder:text-mist/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={noResultsText} />
      ) : (
        <div className="space-y-4">
          {filtered.map((it, idx) => (
            <ExperienceCard
              key={it.id}
              href={it.href}
              imageUrl={it.imageUrl}
              eyebrow={it.dayLabel}
              title={it.title}
              description={it.description}
              priority={idx === 0}
              meta={[
                ...(it.dateText
                  ? [{ icon: <CalendarDays className="size-3.5" aria-hidden />, text: it.dateText }]
                  : []),
                ...(it.location
                  ? [{ icon: <MapPin className="size-3.5" aria-hidden />, text: it.location }]
                  : []),
              ]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
