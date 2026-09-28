const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
function load(file, dependencies = {}) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  new Function('exports', 'module', 'require', code)(module.exports, module, name => dependencies[name] ?? require(name))
  return module.exports
}
const { readAllRows } = load('src/lib/read-all-rows.ts')
const { mealsByDay } = load('src/lib/trip-summary.ts', { './meals-summary': load('src/lib/meals-summary.ts') })

test('saved choices beyond the first 1000 rows appear in the summary and restaurant tally', async () => {
  const rows = Array.from({ length: 1000 }, (_, i) => ({ meal_id: `other-${i}`, traveler_id: `other-${i}` }))
  const people = new Map(['Megan DiMeo', 'Jessica Petersen'].map(name => [name, {
    id: name, name, bookingId: name, bookingName: name, tripNumber: 1,
  }]))
  const days = [...people.values()].map(person => ({
    id: person.id, booking_id: person.bookingId, day_number: 1, trip_number: 1,
    day_date: null, title: {}, meals: ['starter', 'main', 'dessert'].map(course => ({
      id: `${person.id}-${course}`, course, meal_period: 'dinner', name: { es: course },
    })),
  }))
  for (const day of days) for (const meal of day.meals) rows.push({ meal_id: meal.id, traveler_id: day.id })
  const before = mealsByDay(days, people, rows.slice(0, 1000))[0]
  assert.ok(before.rows.every(row => row.missingCourses.length === 3))
  const complete = await readAllRows(async (from, to) => ({ data: rows.slice(from, to + 1), error: null }))
  const after = mealsByDay(days, people, complete)[0]
  assert.ok(after.rows.every(row => row.chosen.length === 3 && row.missingCourses.length === 0))
  assert.ok(after.tally.every(row => row.count === 2))
  assert.equal(complete.length, 1006)
})

test('continues when the server imposes a smaller page size', async () => {
  const rows = Array.from({ length: 225 }, (_, id) => ({ id }))
  assert.deepEqual(await readAllRows(async from => ({ data: rows.slice(from, from + 100), error: null })), rows)
})

test('failed later pages cannot become a partial summary', async () => {
  await assert.rejects(readAllRows(async from => from === 0
    ? { data: [{ id: 1 }], error: null }
    : { data: null, error: { message: 'unavailable' } }), /Could not load complete summary/)
  await assert.rejects(readAllRows(async () => ({ data: null, error: null })), /missing response/)
})
