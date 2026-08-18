// El cronograma del viajero sale de `timeline_events` cuando el admin los carga
// a mano. Si esa tabla está vacía —que es lo normal, porque nadie la llena— se
// deriva del itinerario: cada día aporta las paradas de su `schedule`, que ya
// vienen cargadas desde las plantillas. Así el cronograma nunca sale en blanco.

import type { Booking, JourneyDay, TimelineEventType } from './types'
import type { TimelineGroup, TimelineItem } from '@/components/timeline-view'
import { pick, formatDayLabel, resolveDayDate } from './format'

const FLIGHT = /vuelo|flight|aeropuerto|airport/i
const TRANSFER = /traslad|transfer|ferry|barco|boat|check\s?-?\s?(in|out)|salida|llegada|arrival|departure/i
const MEAL = /desayun|almuerz|cena|brunch|breakfast|lunch|dinner|aperitiv|c[oó]ctel|cocktail|degustaci|tasting|wine|vino/i
const LEISURE = /libre|free time|descans|relax|piscina|playa|beach|spa/i

/** Icono del evento a partir de su texto. Solo decorativo: si falla, "experience". */
function typeFor(text: string): TimelineEventType {
  if (FLIGHT.test(text)) return 'flight'
  if (TRANSFER.test(text)) return 'transfer'
  if (MEAL.test(text)) return 'meal'
  if (LEISURE.test(text)) return 'leisure'
  return 'experience'
}

/**
 * Convierte los días del itinerario en grupos de cronograma.
 * `dayLabel` traduce "Día N" y se usa como encabezado cuando el día no tiene
 * fecha resoluble (sin `day_date` y sin `start_date` en la reserva).
 */
export function timelineFromDays(
  days: JourneyDay[],
  booking: Pick<Booking, 'start_date'>,
  locale: string,
  dayLabel: (dayNumber: number) => string,
): TimelineGroup[] {
  const groups: TimelineGroup[] = []

  for (const day of days) {
    const date = resolveDayDate(day.day_date, booking.start_date, day.day_number)
    // Sin fecha usamos "Día N": el encabezado es la clave de React, así que
    // dejarlo vacío colisionaría entre días.
    const dateText = formatDayLabel(date, locale) || dayLabel(day.day_number)
    const location = day.location ?? ''

    const items: TimelineItem[] = (day.schedule ?? [])
      .map((entry, i) => ({ entry, i, title: pick(entry.title, locale) }))
      .filter(({ title }) => title)
      .map(({ entry, i, title }) => ({
        id: `${day.id}-${i}`,
        type: typeFor(title),
        time: entry.time ?? '',
        title,
        description: '',
        location,
      }))

    // Un día sin horario cargado sigue apareciendo, con su título y descripción:
    // vale más un cronograma grueso que uno vacío.
    if (items.length === 0) {
      const title = pick(day.title, locale)
      if (!title) continue
      items.push({
        id: day.id,
        type: day.is_free_day ? 'leisure' : 'experience',
        time: '',
        title,
        description: pick(day.description, locale),
        location,
      })
    }

    groups.push({ dateText, items })
  }

  return groups
}
