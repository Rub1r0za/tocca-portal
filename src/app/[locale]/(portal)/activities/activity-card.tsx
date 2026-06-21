'use client'

import { useTranslations } from 'next-intl'
import { useOptimistic, useTransition } from 'react'
import { toggleActivity } from './actions'

type Activity = {
  id: string
  name: Record<string, string>
  description: Record<string, string>
  price: number
  capacity: number | null
}
type Traveler = { id: string; first_name: string; last_name: string }
type Selection = { activity_id: string; traveler_id: string }

export function ActivityCard({
  activity,
  travelers,
  selections,
  bookingId,
  locale,
}: {
  activity: Activity
  travelers: Traveler[]
  selections: Selection[]
  bookingId: string
  locale: string
}) {
  const t = useTranslations('activities')
  const [isPending, startTransition] = useTransition()

  const initialSels = selections.filter((s) => s.activity_id === activity.id)

  const [optimisticSels, setOptimistic] = useOptimistic(
    initialSels,
    (state: Selection[], update: { travelerId: string; selected: boolean }) => {
      if (update.selected) {
        if (state.some((s) => s.traveler_id === update.travelerId)) return state
        return [...state, { activity_id: activity.id, traveler_id: update.travelerId }]
      }
      return state.filter((s) => s.traveler_id !== update.travelerId)
    }
  )

  function handleToggle(travelerId: string, currentlySelected: boolean) {
    startTransition(async () => {
      setOptimistic({ travelerId, selected: !currentlySelected })
      await toggleActivity({
        activityId: activity.id,
        travelerId,
        bookingId,
        selected: !currentlySelected,
      })
    })
  }

  const name = activity.name?.[locale] ?? activity.name?.['en'] ?? ''
  const description = activity.description?.[locale] ?? activity.description?.['en'] ?? ''

  return (
    <div className="border border-sand rounded-lg bg-white overflow-hidden">
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-sand">
        <h3
          className="text-xl text-ink mb-1"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {name}
        </h3>
        <p className="text-xs text-[#6b7280] leading-relaxed mb-3">{description}</p>
        <div className="flex items-center gap-3 text-xs text-[#6b7280]">
          <span className="font-medium text-[#2F7E72]">
            ${activity.price} <span className="font-normal">/ person</span>
          </span>
          {activity.capacity !== null && (
            <span>{t('capacity', { n: activity.capacity })}</span>
          )}
        </div>
      </div>

      {/* Travelers */}
      <div className="divide-y divide-sand">
        {travelers.map((traveler) => {
          const isSelected = optimisticSels.some((s) => s.traveler_id === traveler.id)
          return (
            <div
              key={traveler.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <span className="text-sm text-ink">
                {traveler.first_name} {traveler.last_name}
              </span>
              <button
                onClick={() => handleToggle(traveler.id, isSelected)}
                disabled={isPending}
                aria-pressed={isSelected}
                className={`px-3 py-1.5 text-xs rounded border transition-all focus:outline-none focus:ring-2 focus:ring-[#11487E]/30 ${
                  isSelected
                    ? 'bg-[#11487E] text-white border-[#11487E] hover:bg-[#0d3a66] hover:border-[#0d3a66]'
                    : 'bg-white text-[#6b7280] border-sand hover:border-[#11487E]/40 hover:text-ink'
                }`}
              >
                {isSelected ? t('remove') : t('add')}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
