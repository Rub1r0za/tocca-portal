'use client'

import { useState } from 'react'
import { Pencil, Trash2, ChevronUp, PlusCircle } from 'lucide-react'
import { deleteMeal } from '../../../actions'
import { MealForm, COURSES, type Meal } from './meal-form'

type Day = {
  id: string
  day_number: number
  title: Record<string, string>
  meals: Meal[]
}

function MealRow({
  meal,
  bookingId,
  locale,
}: {
  meal: Meal
  bookingId: string
  locale: string
}) {
  const [editing, setEditing] = useState(false)
  const deleteAction = deleteMeal.bind(null, meal.id, bookingId, locale)

  const nameEn = meal.name?.en || meal.name?.es || 'Sin nombre'
  const nameEs = meal.name?.es || ''
  const courseLabel = COURSES.find((c) => c.value === meal.course)?.label ?? meal.course

  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex w-20 shrink-0 items-center justify-center rounded-full border border-[rgba(74,154,146,0.3)] bg-[#4A9A92]/10 px-2 py-0.5 text-[0.65rem] font-medium text-[#4A9A92]">
          {courseLabel}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#3E2D23]">{nameEn}</p>
          {nameEs && nameEs !== nameEn && <p className="text-xs text-[#7A7168]">{nameEs}</p>}
          {meal.allergens && (
            <p className="mt-0.5 text-xs text-amber-700">⚠ {meal.allergens}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            title={editing ? 'Cerrar' : 'Editar'}
            className="rounded-lg p-1.5 text-[#7A7168] transition-colors hover:bg-[#F4F1EB] hover:text-[#3E2D23]"
          >
            {editing ? <ChevronUp className="size-4" /> : <Pencil className="size-4" />}
          </button>
          <form action={deleteAction}>
            <button
              type="submit"
              title="Eliminar"
              className="rounded-lg p-1.5 text-[#7A7168] transition-colors hover:bg-red-50 hover:text-red-600"
              onClick={(e) => {
                if (!confirm(`¿Eliminar "${nameEn}"?`)) e.preventDefault()
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </form>
        </div>
      </div>
      {editing && (
        <div className="mt-3 border-t border-[rgba(62,45,35,0.08)] pt-3">
          <MealForm
            meal={meal}
            journeyDayId={meal.journey_day_id}
            bookingId={bookingId}
            locale={locale}
            onClose={() => setEditing(false)}
          />
        </div>
      )}
    </li>
  )
}

export function DayMeals({
  day,
  bookingId,
  locale,
}: {
  day: Day
  bookingId: string
  locale: string
}) {
  const [adding, setAdding] = useState(false)

  const titleEn = day.title?.en || day.title?.es || `Day ${day.day_number}`
  const courseOrder: Record<string, number> = { starter: 0, main: 1, dessert: 2 }
  const meals = [...(day.meals ?? [])].sort(
    (a, b) => (courseOrder[a.course] ?? 9) - (courseOrder[b.course] ?? 9)
  )

  return (
    <div className="rounded-2xl border border-[rgba(62,45,35,0.12)] bg-white p-5 shadow-[0_1px_4px_rgba(62,45,35,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(74,154,146,0.3)] bg-[#4A9A92]/10 text-sm font-medium text-[#4A9A92]">
            {day.day_number}
          </span>
          <p className="text-base font-medium text-[#3E2D23]" style={{ fontFamily: 'var(--font-display)' }}>
            {titleEn}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm text-[#4A9A92] hover:underline"
        >
          {adding ? <ChevronUp className="size-4" /> : <PlusCircle className="size-4" />}
          {adding ? 'Cerrar' : 'Añadir plato'}
        </button>
      </div>

      {meals.length > 0 ? (
        <ul className="mt-3 divide-y divide-[rgba(62,45,35,0.08)] border-t border-[rgba(62,45,35,0.08)]">
          {meals.map((meal) => (
            <MealRow key={meal.id} meal={meal} bookingId={bookingId} locale={locale} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 border-t border-[rgba(62,45,35,0.08)] pt-3 text-sm text-[#7A7168]">
          Sin platos aún para este día.
        </p>
      )}

      {adding && (
        <div className="mt-3 border-t border-[rgba(62,45,35,0.08)] pt-4">
          <MealForm
            journeyDayId={day.id}
            bookingId={bookingId}
            locale={locale}
            onClose={() => setAdding(false)}
          />
        </div>
      )}
    </div>
  )
}
