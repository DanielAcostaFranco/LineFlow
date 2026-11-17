# LineFlow

The frontend uses SvelteKit, TypeScript, Tailwind CSS and Vite. See [PLAN.md](./PLAN.md) for the project blueprint.

With Node.js 22.17 or newer, run `npm ci` and `npm run dev`. Open the local URL printed by Vite. The component preview at `/preview` exercises the shared controls and sample queue states using the code `CAMPUS`.

Run `npm run check` for Svelte and TypeScript diagnostics and `npm run build` for a production build.

## Backend queue API

The queue domain and SvelteKit API handlers are in `src/lib/server/` and `src/routes/api/`.
Authentication is intentionally provided by the application session layer through
`event.locals.user`; requests without an authenticated, verified user return `401` or `403`.

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
