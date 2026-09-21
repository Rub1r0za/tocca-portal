# Selection fixes: deployment and verification

Apply `supabase/migrations/0014_atomic_meal_selection.sql` to the same Supabase
project used by production **before** deploying this code. The meal action calls
this function; deploying the app first would prevent meal changes from saving.
The function runs with the caller's RLS permissions, validates the approved
booking, traveler, trip, day and course, and rolls back the entire change on error.

Local checks:

```
node --test scripts/test-reservations.cjs
npx tsc --noEmit
npm run build
```

After applying the migration, verify with an authenticated test account:

- Change a meal twice, reload, and verify exactly one choice for that course/day.
- Submit concurrent changes for the same traveler; verify no duplicate course.
- Reject a meal from a different booking/trip or a traveler without meal access.
- Force an insertion failure in a test transaction and verify the old meal survives.
- Submit yoga and an activity, then resend the same request ID and verify one row.
- Verify failed requests stay in the form and do not display backend messages.

Use production logs tagged `[portal:meal.*]`, `[portal:wellness.*]`, or
`[portal:activity.*]` to distinguish database errors from action transport errors.
The intermittent production cause has not yet been reproduced locally.

## Tutorial reset

With `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` configured locally:

```
node scripts/reset-tutorial-meals.cjs
node scripts/reset-tutorial-meals.cjs --apply
```

The first command only reports the exact account, latest approved booking,
traveler and count. The second backs up the selected rows under the ignored
`.vercel/private-backups/` directory before deleting those exact IDs. It refuses
to act if Nathasha Garcia cannot be uniquely identified. Other travelers,
activities and wellness reservations are unaffected. To recover, an operator
can reinsert the `rows` from the private backup with service credentials.
