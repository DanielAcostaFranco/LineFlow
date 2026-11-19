# LineFlow

The frontend uses SvelteKit, TypeScript, Tailwind CSS and Vite. See [PLAN.md](./PLAN.md) for the project blueprint. The component preview at `/preview` uses sample data and code `CAMPUS`; signup and login use Better Auth and MongoDB.

## Local setup

1. Install Node.js 22.17 or newer and run `npm ci`.
2. In MongoDB Atlas, create or use a project and cluster. Create a database user with only the permissions needed for the LineFlow database, including creating collections and indexes. Add only your current trusted IP address (or an appropriately restricted private network) to the project's network access list. Do not allow access from everywhere.
3. Obtain the cluster's driver connection string from Atlas. Choose a database name, such as `lineflow`; MongoDB creates the database and collections when first written. URL-encode special characters in the database user's username and password in the URI.
4. Copy `.env.example` to `.env` in the project root. `.env` is ignored by Git; never commit or share it. Set:
   - `MONGODB_URI`: the Atlas driver URI, including your database user's credentials.
   - `MONGODB_DB`: the database name chosen above.
   - `BETTER_AUTH_SECRET`: your own cryptographically random secret, at least 32 characters. Generate one locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and paste it into `.env`.
   - `BETTER_AUTH_URL`: the app's origin, for example `http://localhost:5173` for local development. Use the actual HTTPS origin for deployed environments.
5. Run `npm run dev` and open the URL printed by Vite. Keep the configured auth URL consistent with the URL used in the browser. The app uses secure session cookies; use localhost for local development or HTTPS elsewhere.

Use separate credentials and secrets for separate environments. All instances serving the same deployment must use that deployment's same secret. Never put real secrets or Atlas credentials in `.env.example`.

## Accounts and host access

Use `/signup` to create an account or `/login` to sign in. Public signup creates a customer and cannot choose a role. `/host` requires the host role; customers receive HTTP 403.

Only a trusted operator with authorized database access may designate a host. Verify the account identity and authorization out of band, locate the exact account by its unique `_id` in the Better Auth `user` collection of the configured database, and update only that record's `role` field to `host` using Atlas Data Explorer or an authenticated `mongosh` session. Confirm exactly one intended record was updated and audit the change through the team's normal process. Do not expose this operation through public UI or give ordinary users database write access. Have the user log in again and verify `/host` access; revoke access by changing the role back to `customer` through the same controlled process.

## Verification

Run `npm test`, `npm run check`, and `npm run build`. With a configured database, manually create an account, log in, and verify that a customer is denied access to `/host`.

## Backend queue API

The queue domain and SvelteKit API handlers are in `src/lib/server/` and `src/routes/api/`.
Authentication is intentionally provided by the application session layer through
`event.locals.user`; requests without an authenticated, verified user return `401` or `403`.
Email verification delivery is not configured yet, so newly registered accounts cannot
use these endpoints until a verification flow is implemented.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/queues` | Create an open queue |
| `POST` | `/api/queues/:queueId/open` | Reopen a paused queue |
| `POST` | `/api/queues/:queueId/pause` | Pause a queue |
| `POST` | `/api/queues/:queueId/close` | Permanently close a queue and active entries |
| `PATCH` | `/api/queues/:queueId/settings` | Update queue settings |
| `POST` | `/api/queues/:queueId/join` | Atomically join an open queue |
| `DELETE` | `/api/entries/:entryId` | Leave the authenticated customer's entry |
| `POST` | `/api/queues/:queueId/next` | Call the next FIFO customer |
| `POST` | `/api/entries/:entryId/complete` | Complete a called entry |
| `POST` | `/api/entries/:entryId/skip` | Skip a waiting or called entry |

The current `queueRepository` is an in-memory adapter so the domain can be exercised
before the database work is complete. Replace it with the database adapter without
changing the route handlers or domain functions. The production adapter must enforce
the capacity check, one active entry per customer, ticket sequencing, and `next`
operation atomically (using a transaction or conditional updates).
