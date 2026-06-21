'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { selectMeal } from './actions'
import { useOptimistic } from 'react'

type Meal = {
  id: string
  course: 'starter' | 'main' | 'dessert'
  name: Record<string, string>
  description: Record<string, string>
  journey_day_id: string
}
type Traveler = { id: string; first_name: string; last_name: string }
type Selection = { meal_id: string; traveler_id: string }

const COURSES: Array<'starter' | 'main' | 'dessert'> = ['starter', 'main', 'dessert']

export function MealDay({
  day,
  travelers,
  selections,
  bookingId,
  locale,
}: {
  day: { id: string; day_number: number; title: Record<string, string>; meals: Meal[] }
  travelers: Traveler[]
  selections: Selection[]
  bookingId: string
  locale: string
}) {
  const t = useTranslations('meals')
  const [optimisticSelections, setOptimistic] = useOptimistic(
    selections,
    (state: Selection[], newSel: Selection) => {
      const course = day.meals.find((m) => m.id === newSel.meal_id)?.course
      if (!course) return state
      const sameCourseMeals = day.meals.filter((m) => m.course === course).map((m) => m.id)
      return [
        ...state.filter((s) => !(sameCourseMeals.includes(s.meal_id) && s.traveler_id === newSel.traveler_id)),
        newSel,
      ]
    }
  )

  const [isPending, startTransition] = useTransition()
  const title = day.title?.[locale] ?? day.title?.['en'] ?? ''

  async function handleSelect(meal: Meal, travelerId: string) {
    startTransition(async () => {
      setOptimistic({ meal_id: meal.id, traveler_id: travelerId })
      await selectMeal({
        mealId: meal.id,
        travelerId,
        bookingId,
        course: meal.course,
        journeyDayId: day.id,
      })
    })
  }

  const mealsByCourse = COURSES.reduce<Record<string, Meal[]>>((acc, course) => {
    acc[course] = day.meals.filter((m) => m.course === course)
    return acc
  }, {} as Record<string, Meal[]>)

  return (
    <section className="space-y-6">
      {/* Day header */}
      <div className="flex items-center gap-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#11487E', boxShadow: '0 0 0 2px #F2C200' }}
        >
          <span className="text-white text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {day.day_number}
          </span>
        </div>
        <h2 className="text-xl text-ink" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          {title}
        </h2>
      </div>

      {/* Traveler tabs per course */}
      {COURSES.map((course) => {
        const options = mealsByCourse[course] ?? []
        if (options.length === 0) return null

        return (
          <div key={course} className="border border-sand rounded-lg overflow-hidden bg-white">
            <div className="px-5 py-3 border-b border-sand bg-[#FBFAF6]">
              <p className="text-xs tracking-widest text-[#6b7280] uppercase">{t(course)}</p>
            </div>

            <div className="divide-y divide-sand">
              {travelers.map((traveler) => {
                const selected = optimisticSelections.find(
                  (s) => options.some((m) => m.id === s.meal_id) && s.traveler_id === traveler.id
                )

                return (
                  <div key={traveler.id} className="p-5">
                    <p className="text-xs font-medium text-ink mb-3">
                      {traveler.first_name} {traveler.last_name}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {options.map((meal) => {
                        const isSelected = selected?.meal_id === meal.id
                        const mealName = meal.name?.[locale] ?? meal.name?.['en'] ?? ''
                        const mealDesc = meal.description?.[locale] ?? meal.description?.['en'] ?? ''

                        return (
                          <button
                            key={meal.id}
                            onClick={() => handleSelect(meal, traveler.id)}
                            disabled={isPending}
                            aria-pressed={isSelected}
                            className={`text-left rounded-lg border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#11487E]/30 ${
                              isSelected
                                ? 'border-[#11487E] bg-[#11487E]/5 text-ink'
                                : 'border-sand bg-white text-[#6b7280] hover:border-[#11487E]/30 hover:text-ink'
                            }`}
                          >
                            <span className="block font-medium text-inherit mb-0.5">{mealName}</span>
                            <span className="block text-xs text-[#9ca3af] leading-relaxed">{mealDesc}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </section>
  )
}
