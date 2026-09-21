const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

const bookingId = '11111111-1111-4111-8111-111111111111'
const targetId = '22222222-2222-4222-8222-222222222222'
const travelerId = '33333333-3333-4333-8333-333333333333'
const input = { requestId: '44444444-4444-4444-8444-444444444444', bookingId, targetId, travelerIds: [travelerId], requestedDate: '2026-10-15', notes: null }

function fixture(overrides = {}) {
  const inserts = []
  const responses = {
    bookings: { data: { id: bookingId }, error: null },
    wellness_options: { data: { trip_number: 1 }, error: null },
    activities: { data: { trip_number: 1, capacity: 2 }, error: null },
    travelers: { data: [{ id: travelerId, trip_number: 1 }], error: null },
    ...overrides,
  }
  const client = {
    auth: { getUser: async () => overrides.auth ?? { data: { user: { id: 'owner' } }, error: null } },
    from(table) {
      let inserting = false
      const query = {
        select() { return this }, eq() { return this }, in() { return this }, maybeSingle() { return this },
        insert(row) { inserts.push({ table, row }); inserting = true; return this },
        then(resolve, reject) { return Promise.resolve(inserting ? overrides.insert ?? { error: null } : responses[table]).then(resolve, reject) },
      }
      return query
    },
  }
  const exports = {}
  const source = ts.transpileModule(fs.readFileSync('src/lib/reservation-request.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === 'zod') return require('zod')
      if (name.endsWith('/supabase/server')) return { createClient: async () => client }
      if (name.endsWith('/portal-mutation')) return { mutationFailure: () => ({ ok: false, error: 'save_failed' }) }
      throw new Error(name)
    },
  })
  return { save: exports.saveReservation, inserts }
}

for (const kind of ['activity', 'wellness']) {
  test(`${kind}: valid request persists the same id`, async () => {
    const f = fixture()
    assert.equal((await f.save(kind, input)).ok, true)
    assert.equal(f.inserts[0].row.id, input.requestId)
  })
  test(`${kind}: database lookup failure never inserts`, async () => {
    const f = fixture({ travelers: { data: null, error: { code: '57014' } } })
    assert.equal((await f.save(kind, input)).error, 'save_failed')
    assert.equal(f.inserts.length, 0)
  })
  test(`${kind}: wrong trip or non-owner cannot reserve`, async () => {
    for (const override of [{ travelers: { data: [{ id: travelerId, trip_number: 2 }], error: null } }, { bookings: { data: null, error: null } }]) {
      const f = fixture(override)
      assert.equal((await f.save(kind, input)).ok, false)
      assert.equal(f.inserts.length, 0)
    }
  })
  test(`${kind}: lost-response retry succeeds only for identical stored data`, async () => {
    const table = kind === 'activity' ? 'activity_requests' : 'wellness_requests'
    const column = kind === 'activity' ? 'activity_id' : 'wellness_option_id'
    for (const same of [true, false]) {
      const f = fixture({ insert: { error: { code: '23505' } }, [table]: { data: { [column]: targetId, traveler_ids: [travelerId], requested_date: same ? input.requestedDate : '2026-10-16', notes: null }, error: null } })
      assert.equal((await f.save(kind, input)).ok, same)
    }
  })
}
test('invalid dates, empty guests, expired sessions and capacity are rejected', async () => {
  for (const bad of [{ ...input, requestedDate: '2026-02-30' }, { ...input, travelerIds: [] }]) {
    const f = fixture()
    assert.equal((await f.save('wellness', bad)).ok, false)
    assert.equal(f.inserts.length, 0)
  }
  const expired = fixture({ auth: { data: { user: null }, error: null } })
  assert.equal((await expired.save('wellness', input)).error, 'unauthorized')
  const full = fixture({ activities: { data: { trip_number: 1, capacity: 0 }, error: null } })
  assert.equal((await full.save('activity', input)).ok, false)
  assert.equal(full.inserts.length, 0)
})
