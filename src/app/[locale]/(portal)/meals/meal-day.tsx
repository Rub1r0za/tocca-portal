'use client'

import { Fragment, useTransition, useOptimistic } from 'react'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { selectMeal } from './actions'
import { splitAllergens } from '@/lib/format'
import { cn } from '@/lib/utils'

type Meal = {
  id: string
  course: 'starter' | 'main' | 'dessert'
  name: Record<string, string> | null
  description: Record<string, string> | null
  allergens: string | null
  image_url: string | null
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
  const [isPending, startTransition] = useTransition()
  const [optimisticSelections, setOptimistic] = useOptimistic(
    selections,
    (state: Selection[], newSel: Selection) => {
      const course = day.meals.find((m) => m.id === newSel.meal_id)?.course
      if (!course) return state
      const sameCourseMeals = day.meals.filter((m) => m.course === course).map((m) => m.id)
      return [
        ...state.filter(
          (s) => !(sameCourseMeals.includes(s.meal_id) && s.traveler_id === newSel.traveler_id)
        ),
        newSel,
      ]
    }
  )

  const title = day.title?.[locale] ?? day.title?.['en'] ?? ''

  function handleSelect(meal: Meal, travelerId: string) {
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
  }, {})

  const hasMeals = day.meals.length > 0

  return (
    <section className="space-y-5">
      {/* Day header */}
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-sm text-gold" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {day.day_number}
        </span>
        <h2 className="text-xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          {title}
        </h2>
      </div>

      {!hasMeals && <p className="text-sm text-mist">{t('noMeals')}</p>}

      {COURSES.map((course) => {
        const options = mealsByCourse[course] ?? []
        if (options.length === 0) return null

        return (
          <div key={course} className="overflow-hidden rounded-2xl border border-hairline bg-panel">
            <div className="border-b border-hairline px-5 py-2.5 text-center">
              <p className="text-xs tracking-[0.22em] text-gold uppercase">{t(course)}</p>
            </div>

            {/* Menu — readable, "Dinner Notes" style */}
            <div className="px-5 py-5">
              {options.map((meal, i) => {
                const mealName = meal.name?.[locale] ?? meal.name?.['en'] ?? ''
                const mealDesc = meal.description?.[locale] ?? meal.description?.['en'] ?? ''
                const dishes = mealDesc ? mealDesc.split(' · ') : []
                const dietary = splitAllergens(meal.allergens)
                return (
                  <Fragment key={meal.id}>
                    {i > 0 && (
                      <div className="my-4 flex items-center gap-3" aria-hidden>
                        <span className="h-px flex-1 bg-hairline" />
                        <span className="text-[0.65rem] tracking-[0.2em] text-mist/70 uppercase">{t('or')}</span>
                        <span className="h-px flex-1 bg-hairline" />
                      </div>
                    )}
                    <div className="text-center">
                      <p
                        className="text-base text-foreground"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                      >
                        {mealName}
                      </p>
                      {dishes.map((dish, j) => (
                        <p key={j} className="mt-1 text-xs leading-relaxed text-mist">
                          {dish}
                        </p>
                      ))}
                      {dietary.length > 0 && (
                        <span className="mt-1.5 inline-flex flex-wrap justify-center gap-1">
                          {dietary.map((d) => (
                            <span
                              key={d}
                              className="rounded-full border border-hairline bg-night/40 px-2 py-0.5 text-[0.625rem] text-mist"
                            >
                              {d}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </Fragment>
                )
              })}
            </div>

            {/* Selection — one short chip per option, per traveler */}
            {travelers.length > 0 && (
              <div className="border-t border-hairline bg-panel-2/30 px-5 py-4">
                <p className="mb-3 text-center text-[0.65rem] tracking-[0.18em] text-mist/80 uppercase">
                  {t('chooseBelow')}
                </p>
                <div className="space-y-3">
                  {travelers.map((traveler) => (
                    <div key={traveler.id}>
                      {travelers.length > 1 && (
                        <p className="mb-1.5 text-xs font-medium tracking-wide text-gold">
                          {traveler.first_name} {traveler.last_name}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {options.map((meal) => {
                          const isSelected = optimisticSelections.some(
                            (s) => s.meal_id === meal.id && s.traveler_id === traveler.id
                          )
                          const mealName = meal.name?.[locale] ?? meal.name?.['en'] ?? ''
                          return (
                            <button
                              key={meal.id}
                              type="button"
                              onClick={() => handleSelect(meal, traveler.id)}
                              disabled={isPending}
                              aria-pressed={isSelected}
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
                                isSelected
                                  ? 'border-gold/60 bg-gold/15 font-medium text-gold'
                                  : 'border-hairline bg-panel text-mist hover:border-gold/40 hover:text-foreground'
                              )}
                            >
                              {isSelected && <Check className="size-3.5" aria-hidden />}
                              {mealName}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}
