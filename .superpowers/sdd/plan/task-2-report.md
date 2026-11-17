# Task 2 Report: MongoDB Connection and Document Schemas

## Status

Implemented Task 2 on `feature/mongodb-auth-foundation`.

## Changes

- Added `mongodb` and `zod` runtime dependencies, `vitest` as a development dependency, and the `npm test` script; updated `package-lock.json`.
- Added `src/lib/server/db.ts` with one shared MongoDB `client` and selected `db`. It fails explicitly when `MONGODB_URI` or `MONGODB_DB` is missing.
- Added runtime Zod schemas and inferred TypeScript types for `Queue` and `QueueEntry`.
- Added the compound queue-owner/status and queue-entry queue/status/join-time index creation helper. It runs only when explicitly called; importing the module does not connect to MongoDB or provision cloud resources.
- Added `.env.example` with local, credential-free values. Existing `.gitignore` rules already ignore `.env` and `.env.*` while allowing `.env.example`; this was verified.
- Added focused schema tests. No auth, User schema, queue operations, capacity enforcement, realtime code, or cloud provisioning was added.

## Verification

- TDD red: ran `npm test` with schema tests in place and production schemas absent; Vitest failed to resolve the expected `./queue` and `./queue-entry` modules.
- TDD green and final focused tests: `npm test` - 2 test files passed, 7 tests passed.
- `npm run check` - passed with 0 errors and 0 warnings.
- `npm run build` - passed.
- Runtime import probes confirmed missing `MONGODB_URI` and missing `MONGODB_DB` each produce the explicit configuration error.
- `npm audit --omit=dev` - no production dependency vulnerabilities reported.
- Full `npm audit` reports high-severity advisories in development tooling dependencies; no unrelated dependency remediation was included.
- `git diff --check` - passed.

## Review Notes

- The schemas store only the specified queue and entry data; current position and estimated wait are not persisted.
- `QueueEntry` lifecycle timestamps use JavaScript `Date`, matching BSON date storage.
- `ensureQueueIndexes()` must be called by application initialization when database indexes are to be created. It does not claim to enforce queue capacity or concurrency safety.
- The MongoDB module uses Node's server environment directly. MongoDB access is kept under SvelteKit's `src/lib/server` boundary.
- `.gitignore` required no change because its existing patterns already protect local environment files.

## Commit

Subject: `feat(db): add MongoDB connection and document schemas`

## Important Review Fix: SvelteKit Environment Configuration

`db.ts` now reads the SvelteKit 3 private environment API rather than Node's
`process.env`. `src/env.ts` declares both variables as private, dynamic, and
optional at framework initialization; the database module retains its existing
explicit missing/blank errors when imported. This permits builds without MongoDB
configuration and does not provide a fallback database. The earlier note about
using Node's server environment directly is superseded.

Changed files: `src/env.ts`, `src/lib/server/db.ts`,
`src/lib/server/db.test.ts`, `README.md`, and this report. The focused tests
use different private and process values to check the selected URI and database,
and verify missing or whitespace-only private values are rejected even when
process values exist. No connection is opened. Index initialization remains
Task 3's responsibility.

### RED — `npm test -- src/lib/server/db.test.ts -t 'uses and trims' --reporter=dot --no-color` (exit 1)

```text
> lineflow@0.1.0 test
> vitest run src/lib/server/db.test.ts -t uses and trims --reporter=dot --no-color


 RUN  v4.1.12 C:/Users/jefek/OneDrive/Documents/wdd360/LineFlow

x----

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/lib/server/db.test.ts > MongoDB configuration > uses and trims SvelteKit private environment values rather than process values
AssertionError: expected 'process_db' to be 'private_db' // Object.is equality

Expected: "private_db"
Received: "process_db"

 ❯ src/lib/server/db.test.ts:25:27
     23|   const { client, db } = await import('./db');
     24|
     25|   expect(db.databaseName).toBe('private_db');
       |                           ^
     26|   expect(client.options.hosts.map(String)).toEqual(['127.0.0.1:27018']…
     27|  });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 4 skipped (5)
   Start at  13:17:10
   Duration  950ms (transform 60ms, setup 0ms, import 99ms, tests 422ms, environment 0ms)
```

### GREEN — `npm test -- --reporter=dot --no-color` (exit 0)

```text
> lineflow@0.1.0 test
> vitest run --reporter=dot --no-color


 RUN  v4.1.12 C:/Users/jefek/OneDrive/Documents/wdd360/LineFlow

············

 Test Files  3 passed (3)
      Tests  12 passed (12)
   Start at  13:19:57
   Duration  1.07s (transform 144ms, setup 0ms, import 648ms, tests 608ms, environment 2ms)
```

### Other verification

- `npm run check` (exit 0):

  ```text
  > lineflow@0.1.0 check
  > svelte-kit sync && svelte-check --tsconfig ./tsconfig.json

  Loading svelte-check in workspace: c:\Users\jefek\OneDrive\Documents\wdd360\LineFlow
  Getting Svelte diagnostics...

  svelte-check found 0 errors and 0 warnings
  ```

- `npm run build` exited 0; adapter-auto reported that no supported production
  environment was detected.
- An isolated Vite/SvelteKit dev-server module-loading probe used a temporary
  project-local `.env` fixture with credential-free values and no inherited
  MongoDB process settings. Exact output:

  ```text
  PASS: Vite .env values selected without process.env MongoDB values
  ```

  The fixture was removed. An initial probe incorrectly set Vite's `envDir`
  rather than SvelteKit's `env.dir` and failed with the expected missing-variable
  error; the corrected probe above uses SvelteKit's actual configuration.
- An intermediate `npm run check` failed because this SvelteKit 3 project does
  not declare the legacy `$env/dynamic/private` types. The final implementation
  uses the supported `$app/env/private` API and the check passes as shown.
