export function zipSchedule(en?: string, es?: string) {
  const parse = (raw?: string) =>
    (raw || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const sep = l.indexOf('|')
        return sep === -1
          ? { time: '', text: l }
          : { time: l.slice(0, sep).trim(), text: l.slice(sep + 1).trim() }
      })
  const enItems = parse(en)
  const esItems = parse(es)
  const len = Math.max(enItems.length, esItems.length)
  return Array.from({ length: len }, (_, i) => ({
    time: enItems[i]?.time || esItems[i]?.time || '',
    title: {
      en: enItems[i]?.text ?? '',
      es: esItems[i]?.text ?? '',
    },
  }))
}
