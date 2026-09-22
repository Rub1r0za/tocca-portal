'use client'
import { useState } from 'react'
type Entry = { time: string; title: Record<string, string> }
const field = 'w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm'
export function ScheduleFields({ items = [] }: { items?: Entry[] | null }) {
  const [rows, setRows] = useState<Entry[]>(items ?? [])
  function change(index: number, key: string, value: string) {
    setRows(rows.map((row, i) => i !== index ? row : key === 'time' ? { ...row, time: value } : { ...row, title: { ...row.title, [key]: value } }))
  }
  return <fieldset className="space-y-3" translate="no">
    <legend className="font-medium">Itinerario hora por hora</legend>
    <p className="text-xs text-mist">Una hora por actividad. Edita cada idioma por separado y pulsa Guardar al terminar.</p>
    {['en', 'es'].map(lang => <input key={lang} type="hidden" name={'schedule_' + lang} value={rows.map(row => row.time + ' | ' + (row.title[lang] ?? '')).join('\n')} />)}
    {rows.map((row, index) => <div key={index} className="grid gap-2 rounded-xl border border-hairline p-3 sm:grid-cols-3">
      <label className="text-xs">Hora<input className={field} value={row.time} onChange={e => change(index, 'time', e.target.value)} /></label>
      <label className="text-xs">Actividad ES<input lang="es" className={field} value={row.title.es ?? ''} onChange={e => change(index, 'es', e.target.value)} /></label>
      <label className="text-xs">Actividad EN<input lang="en" className={field} value={row.title.en ?? ''} onChange={e => change(index, 'en', e.target.value)} /></label>
      <button type="button" className="text-left text-xs text-red-600" onClick={() => setRows(rows.filter((_, i) => i !== index))}>Eliminar actividad</button>
    </div>)}
    <button type="button" className="rounded-xl border border-hairline px-3 py-2 text-sm" onClick={() => setRows([...rows, { time: '', title: { en: '', es: '' } }])}>Agregar horario</button>
  </fieldset>
}
