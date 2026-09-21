const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(path) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  new Function('exports', 'module', 'require', code)(module.exports, module, require)
  return module.exports
}
const { parseMenu } = load('src/lib/template-menus.ts')
const { mealPending, mealTally, mealByTraveler, COURSE_LABEL } = load('src/lib/meals-summary.ts')
const menu = 'entrada | Salad | Ensalada\nprincipal | Fish | Pescado | Grilled | A la parrilla\npostre | Cake | Tarta'
const meals = ['lunch', 'dinner'].flatMap((period) =>
  parseMenu(menu, period).map((meal, i) => ({ ...meal, id: `${period}-${i}` })))
const days = [{ id: 'day', day_number: 30, trip_number: 1, title: {}, meals }]
const travelers = [{ id: 'person', first_name: 'Ana', last_name: 'Test', trip_number: 1 }]

test('one day holds two complete menus without confusing period and course', () => {
  assert.equal(meals.length, 6)
  assert.deepEqual(meals.map((m) => m.course), ['starter', 'main', 'dessert', 'starter', 'main', 'dessert'])
  assert.equal(meals[4].meal_period, 'dinner')
  assert.equal(meals[4].description.es, 'A la parrilla')
})
test('empty menus and localized fallback are supported', () => {
  assert.deepEqual(parseMenu('', 'breakfast'), [])
  assert.deepEqual(parseMenu('principal | | Huevos', 'breakfast')[0].name, { en: 'Huevos', es: 'Huevos' })
})
test('invalid lines are rejected instead of silently losing dishes', () => {
  for (const line of ['almuerzo | Fish | Pescado', 'unknown | Fish | Pescado', 'principal | |', 'Fish']) {
    assert.throws(() => parseMenu(line, 'lunch'), /Almuerzo, línea 1/)
  }
})
test('choosing the lunch main leaves the dinner main pending', () => {
  const selections = [{ traveler_id: 'person', meal_id: 'lunch-1' }]
  assert.equal(mealPending(days, travelers, selections).pendingSlots, 5)
  const row = mealByTraveler(days, travelers, selections)[0].rows[0]
  assert.equal(row.chosen[0].course, 'lunch:main')
  assert.ok(row.missingCourses.includes('dinner:main'))
  assert.equal(COURSE_LABEL['dinner:main'], 'Cena · Principal')
})
test('all six choices are counted separately in restaurant totals', () => {
  const selections = meals.map((m) => ({ meal_id: m.id, traveler_id: 'person' }))
  assert.equal(mealPending(days, travelers, selections).pendingSlots, 0)
  const tally = mealTally(days, travelers, selections)[0]
  assert.equal(tally.courses.length, 6)
  assert.ok(tally.courses.every((group) => group.meals[0].eaters.length === 1))
})
test('legacy unassigned courses still work', () => {
  const legacy = [{ ...days[0], meals: [{ id: 'old', course: 'main', name: {} }] }]
  assert.equal(mealPending(legacy, travelers, []).expectedSlots, 1)
  assert.equal(mealTally(legacy, travelers, [])[0].courses[0].course, 'main')
})
