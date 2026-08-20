// Consolidado del viaje completo. Los resúmenes de cada reserva sirven para
// revisar un grupo suelto, pero un viaje Tocca son varias reservas (una por
// familia) compartiendo los mismos días: para ordenar al restaurante o cuadrar
// una actividad hace falta verlo todo junto, por día y por persona.

import { COURSE_LABEL } from './meals-summary'

export type Person = {
  id: string
  name: string
  bookingId: string
  /** Nombre de la reserva a la que pertenece, para desempatar homónimos. */
  bookingName: string
}

export type DayMealRow = {
  person: Person
  chosen: { course: string; dish: string }[]
  missingCourses: string[]
}

export type MealDaySummary = {
  dayNumber: number
  title: string
  /** Fecha si todas las reservas coinciden; vacío si difieren o no hay. */
  date: string
  rows: DayMealRow[]
  /** Recuento por plato para pasarle al restaurante. */
  tally: { course: string; dish: string; count: number; names: string[] }[]
}

type DayRow = {
  id: string
  booking_id: string
  day_number: number
  day_date: string | null
  title: Record<string, string> | null
  meals: { id: string; course: string; name: Record<string, string> | null }[] | null
}

const label = (v: Record<string, string> | null | undefined) => v?.es || v?.en || ''

/** Consolida las comidas de todas las reservas, agrupadas por número de día. */
export function mealsByDay(
  days: DayRow[],
  people: Map<string, Person>,
  selections: { meal_id: string; traveler_id: string }[],
): MealDaySummary[] {
  const pickedByPerson = new Map<string, Set<string>>()
  for (const s of selections) {
    const set = pickedByPerson.get(s.traveler_id) ?? new Set<string>()
    set.add(s.meal_id)
    pickedByPerson.set(s.traveler_id, set)
  }

  // Los viajeros de una reserva solo pueden elegir platos de SUS días, así que
  // el agrupado por número de día tiene que recordar de qué reserva viene cada uno.
  const byNumber = new Map<number, DayRow[]>()
  for (const day of days) {
    if ((day.meals ?? []).length === 0) continue
    byNumber.set(day.day_number, [...(byNumber.get(day.day_number) ?? []), day])
  }

  return [...byNumber.entries()]
    .sort(([a], [b]) => a - b)
    .map(([dayNumber, dayRows]) => {
      const dates = [...new Set(dayRows.map((d) => d.day_date).filter(Boolean))]
      const rows: DayMealRow[] = []
      const tallyMap = new Map<string, { course: string; dish: string; count: number; names: string[] }>()

      for (const day of dayRows) {
        const mealsByCourse = new Map<string, typeof day.meals>()
        for (const meal of day.meals ?? []) {
          mealsByCourse.set(meal.course, [...(mealsByCourse.get(meal.course) ?? []), meal])
        }
        const courses = [...mealsByCourse.keys()].sort(
          (a, b) => courseRank(a) - courseRank(b),
        )

        for (const person of people.values()) {
          // Cada persona solo aparece en el día de su propia reserva.
          if (person.bookingId !== day.booking_id) continue
          const picked = pickedByPerson.get(person.id) ?? new Set<string>()
          const chosen: { course: string; dish: string }[] = []
          const missingCourses: string[] = []

          for (const course of courses) {
            const meal = (mealsByCourse.get(course) ?? []).find((m) => picked.has(m.id))
            if (!meal) {
              missingCourses.push(course)
              continue
            }
            const dish = label(meal.name) || 'Sin nombre'
            chosen.push({ course, dish })
            const key = `${course}::${dish}`
            const entry = tallyMap.get(key) ?? { course, dish, count: 0, names: [] }
            entry.count += 1
            entry.names.push(person.name)
            tallyMap.set(key, entry)
          }
          rows.push({ person, chosen, missingCourses })
        }
      }

      rows.sort((a, b) => a.person.name.localeCompare(b.person.name))
      const tally = [...tallyMap.values()].sort(
        (a, b) => courseRank(a.course) - courseRank(b.course) || b.count - a.count,
      )

      return {
        dayNumber,
        title: label(dayRows[0].title),
        date: dates.length === 1 ? (dates[0] as string) : '',
        rows,
        tally,
      }
    })
}

const COURSE_RANK: Record<string, number> = { starter: 0, main: 1, dessert: 2 }
function courseRank(course: string): number {
  return COURSE_RANK[course] ?? 99
}

export { COURSE_LABEL }

// ── Actividades y wellness ──────────────────────────────────────────────────

export type RequestRow = {
  id: string
  kind: 'activity' | 'wellness'
  itemName: string
  status: string
  requestedDate: string | null
  travelerIds: string[]
  numGuests: number
  bookingName: string
}

export type RequestDaySummary = {
  date: string
  items: {
    request: RequestRow
    /** Vacío en solicitudes anteriores a que se guardara quién iba. */
    people: Person[]
  }[]
}

/** Agrupa las solicitudes vivas por fecha, resolviendo quién va a cada una. */
export function requestsByDay(
  requests: RequestRow[],
  people: Map<string, Person>,
): RequestDaySummary[] {
  const byDate = new Map<string, RequestDaySummary['items']>()

  for (const request of requests) {
    if (request.status !== 'pending' && request.status !== 'confirmed') continue
    const key = request.requestedDate ?? ''
    const resolved = request.travelerIds
      .map((id) => people.get(id))
      .filter((p): p is Person => Boolean(p))
    byDate.set(key, [...(byDate.get(key) ?? []), { request, people: resolved }])
  }

  return [...byDate.entries()]
    // Sin fecha al final: '' ordena antes que cualquier fecha real.
    .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)))
    .map(([date, items]) => ({ date, items }))
}
