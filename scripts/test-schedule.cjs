const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const mod = { exports: {} }
new Function('exports', ts.transpileModule(fs.readFileSync('src/lib/schedule.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(mod.exports)
const { zipSchedule } = mod.exports
test('shared edited time survives saving both languages', () => {
  assert.deepEqual(zipSchedule('09:30 | Breakfast', '09:30 | Desayuno'), [{ time: '09:30', title: { en: 'Breakfast', es: 'Desayuno' } }])
})
test('empty translations stay empty instead of being overwritten with English', () => {
  assert.deepEqual(zipSchedule('09:30 | Breakfast', '09:30 | '), [{ time: '09:30', title: { en: 'Breakfast', es: '' } }])
})
test('Spanish edits, extra separators and removing all rows survive saving', () => {
  assert.equal(zipSchedule('10:00 | Walk', '10:00 | Paseo | playa')[0].title.es, 'Paseo | playa')
  assert.deepEqual(zipSchedule('', ''), [])
})
