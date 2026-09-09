'use client'

import { useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { MealDay } from './meal-day'

type Meal = {
  id: string
  course: 'breakfast' | 'lunch' | 'dinner' | 'starter' | 'main' | 'dessert'
  name: Record<string, string> | null
  description: Record<string, string> | null
  allergens: string | null
  image_url: string | null
  journey_day_id: string
}

type Traveler = { id: string; first_name: string; last_name: string }
type Selection = { meal_id: string; traveler_id: string }
type Day = {
  id: string
  day_number: number
  title: Record<string, string>
  meals: Meal[]
  menu_image_url: string | null
}

type DayEntry = { day: Day; travelers: Traveler[] }

export function MealsList({
  days,
  selections,
  bookingId,
  locale,
}: {
  days: DayEntry[]
  selections: Selection[]
  bookingId: string
  locale: string
}) {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const selectedDay = days.find(({ day }) => day.id === selectedDayId)
  const isSpanish = locale === 'es'

  if (selectedDay) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setSelectedDayId(null)}
          className="inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {isSpanish ? 'Ver todos los días' : 'View all days'}
        </button>
        <MealDay
          day={selectedDay.day}
          travelers={selectedDay.travelers}
          selections={selections}
          bookingId={bookingId}
          locale={locale}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {days.map(({ day }) => {
        const title = day.title?.[locale] ?? day.title?.en ?? ''
        return (
          <button
            key={day.id}
            type="button"
            onClick={() => setSelectedDayId(day.id)}
            className="flex w-full items-center gap-4 rounded-2xl border border-hairline bg-panel px-5 py-4 text-left transition-colors hover:border-gold/40 hover:bg-panel-2/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-base text-gold"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              {day.day_number}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.65rem] tracking-[0.18em] text-mist uppercase">
                {isSpanish ? 'Día' : 'Day'} {day.day_number}
              </span>
              {title && (
                <span className="mt-0.5 block truncate text-lg text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                  {title}
                </span>
              )}
            </span>
            <ChevronRight className="size-5 shrink-0 text-gold" aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
