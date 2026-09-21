import type { MealPeriod, TemplateMeal } from './types'

const COURSES: Record<string, 'starter' | 'main' | 'dessert'> = {
  entrada: 'starter', entrante: 'starter', primero: 'starter', starter: 'starter',
  principal: 'main', main: 'main', postre: 'dessert', dessert: 'dessert',
}
const LABELS = { breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena' }

export function parseMenu(raw: string | undefined, period: MealPeriod): TemplateMeal[] {
  return (raw ?? '').split('\n').flatMap((line, index) => {
    if (!line.trim()) return []
    const parts = line.split('|').map((part) => part.trim())
    const [courseText, en, es, descEn, descEs] = parts
    const course = COURSES[courseText.toLowerCase()]
    if (!course || parts.length < 3 || parts.length > 5 || (!en && !es)) {
      throw new Error(`${LABELS[period]}, línea ${index + 1}: usa entrada, principal o postre | nombre EN | nombre ES. Las descripciones son opcionales.`)
    }
    return [{
      meal_period: period,
      course,
      name: { en: en || es, es: es || en },
      description: { en: descEn || descEs || '', es: descEs || descEn || '' },
    }]
  })
}
