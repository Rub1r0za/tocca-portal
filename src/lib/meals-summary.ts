// Cálculos compartidos sobre las selecciones de comida de una reserva:
// - la alerta de "faltan comidas por elegir" del panel admin
// - el resumen por plato para que Jess ordene en el restaurante
//
// Semántica: cada viajero elige un plato por curso ofrecido cada día.
// Un "slot" pendiente es (viajero × día × curso) sin selección.

export type SummaryMeal = {
  id: string
  course: string
  name: Record<string, string> | null
}

export type SummaryDay = {
  id: string
  day_number: number
  title: Record<string, string> | null
  meals: SummaryMeal[] | null
  trip_number?: 1 | 2
}

export type SummaryTraveler = {
  id: string
  first_name: string
  last_name: string
  trip_number?: 1 | 2
}

const travelersForDay = (day: SummaryDay, travelers: SummaryTraveler[]) =>
  travelers.filter((traveler) => (traveler.trip_number ?? 1) === (day.trip_number ?? 1))

export type MealSelection = { meal_id: string; traveler_id: string }

const COURSE_ORDER: string[] = ['starter', 'main', 'dessert']

/** Cuántas selecciones faltan y qué viajeros las tienen pendientes. */
export function mealPending(
  days: SummaryDay[],
  travelers: SummaryTraveler[],
  selections: MealSelection[],
): {
  pendingSlots: number
  expectedSlots: number
  pendingTravelers: { traveler: SummaryTraveler; missing: number }[]
} {
  const selectedByTraveler = new Map<string, Set<string>>() // travelerId → set(mealId)
  for (const s of selections) {
    const set = selectedByTraveler.get(s.traveler_id) ?? new Set<string>()
    set.add(s.meal_id)
    selectedByTraveler.set(s.traveler_id, set)
  }

  let pendingSlots = 0
  let expectedSlots = 0
  const missingByTraveler = new Map<string, number>()

  for (const day of days) {
    const meals = day.meals ?? []
    if (meals.length === 0) continue
    // cursos ofrecidos ese día → sus meal ids
    const mealsByCourse = new Map<string, string[]>()
    for (const m of meals) {
      const arr = mealsByCourse.get(m.course) ?? []
      arr.push(m.id)
      mealsByCourse.set(m.course, arr)
    }

    for (const traveler of travelersForDay(day, travelers)) {
      const chosen = selectedByTraveler.get(traveler.id) ?? new Set<string>()
      for (const [, mealIds] of mealsByCourse) {
        expectedSlots += 1
        const hasOne = mealIds.some((mid) => chosen.has(mid))
        if (!hasOne) {
          pendingSlots += 1
          missingByTraveler.set(traveler.id, (missingByTraveler.get(traveler.id) ?? 0) + 1)
        }
      }
    }
  }

  const pendingTravelers = travelers
    .map((traveler) => ({ traveler, missing: missingByTraveler.get(traveler.id) ?? 0 }))
    .filter((r) => r.missing > 0)
    .sort((a, b) => b.missing - a.missing)

  return { pendingSlots, expectedSlots, pendingTravelers }
}

/** Recuento por plato: cuántos viajeros eligieron cada plato, por día y curso. */
export function mealTally(
  days: SummaryDay[],
  travelers: SummaryTraveler[],
  selections: MealSelection[],
): {
  day: SummaryDay
  courses: { course: string; meals: { meal: SummaryMeal; eaters: SummaryTraveler[] }[] }[]
}[] {
  const travelersByMeal = new Map<string, SummaryTraveler[]>()
  const travelerById = new Map(travelers.map((t) => [t.id, t]))
  for (const s of selections) {
    const t = travelerById.get(s.traveler_id)
    if (!t) continue
    const arr = travelersByMeal.get(s.meal_id) ?? []
    arr.push(t)
    travelersByMeal.set(s.meal_id, arr)
  }

  return days
    .filter((d) => (d.meals ?? []).length > 0)
    .map((day) => {
      const byCourse = new Map<string, { meal: SummaryMeal; eaters: SummaryTraveler[] }[]>()
      for (const meal of day.meals ?? []) {
        const arr = byCourse.get(meal.course) ?? []
        arr.push({ meal, eaters: travelersByMeal.get(meal.id) ?? [] })
        byCourse.set(meal.course, arr)
      }
      // cursos conocidos primero, luego cualquier otro
      const orderedCourses = [
        ...COURSE_ORDER.filter((c) => byCourse.has(c)),
        ...[...byCourse.keys()].filter((c) => !COURSE_ORDER.includes(c)),
      ]
      const courses = orderedCourses.map((course) => ({
        course,
        meals: byCourse.get(course)!,
      }))
      return { day, courses }
    })
}

export const COURSE_LABEL: Record<string, string> = {
  starter: 'Entrada',
  main: 'Principal',
  dessert: 'Postre',
}

/**
 * La otra mitad del resumen: qué eligió cada viajero, día por día. El recuento
 * por plato sirve para ordenar al restaurante; esto sirve para saber a quién
 * hay que perseguir y qué se le pone delante en la mesa.
 */
export function mealByTraveler(
  days: SummaryDay[],
  travelers: SummaryTraveler[],
  selections: MealSelection[],
): {
  day: SummaryDay
  rows: {
    traveler: SummaryTraveler
    chosen: { course: string; meal: SummaryMeal }[]
    missingCourses: string[]
  }[]
}[] {
  const selectedByTraveler = new Map<string, Set<string>>()
  for (const s of selections) {
    const set = selectedByTraveler.get(s.traveler_id) ?? new Set<string>()
    set.add(s.meal_id)
    selectedByTraveler.set(s.traveler_id, set)
  }

  return days
    .filter((d) => (d.meals ?? []).length > 0)
    .map((day) => {
      const mealsByCourse = new Map<string, SummaryMeal[]>()
      for (const meal of day.meals ?? []) {
        const arr = mealsByCourse.get(meal.course) ?? []
        arr.push(meal)
        mealsByCourse.set(meal.course, arr)
      }
      const orderedCourses = [
        ...COURSE_ORDER.filter((c) => mealsByCourse.has(c)),
        ...[...mealsByCourse.keys()].filter((c) => !COURSE_ORDER.includes(c)),
      ]

      const rows = travelersForDay(day, travelers).map((traveler) => {
        const picked = selectedByTraveler.get(traveler.id) ?? new Set<string>()
        const chosen: { course: string; meal: SummaryMeal }[] = []
        const missingCourses: string[] = []
        for (const course of orderedCourses) {
          const meal = (mealsByCourse.get(course) ?? []).find((m) => picked.has(m.id))
          if (meal) chosen.push({ course, meal })
          else missingCourses.push(course)
        }
        return { traveler, chosen, missingCourses }
      })

      return { day, rows }
    })
}
