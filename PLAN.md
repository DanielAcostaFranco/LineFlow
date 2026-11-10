# LineFlow project blueprint

## Goal

Turn the current project stub into an actionable MVP blueprint for a web-first digital queue pilot serving one organization at a time. This is planning/documentation work, not implementation of the application.

## Recommended stack

- **Web app:** SvelteKit + TypeScript. It fits the preference for Svelte and supports server-rendered pages, form actions, and server-side authorization in one codebase. Next.js is a sound alternative if the team has stronger React experience; avoid building both.
- **Database:** MongoDB Atlas, using the official Node.js driver or Mongoose. Keep MongoDB as the system of record; use unique indexes and atomic updates for queue operations.
- **Live updates:** Pusher Channels, with private channels for host views and appropriately scoped customer updates. Persist a change before publishing an event; provide a refresh/reconnect path so clients recover from missed events.
- **Authentication and authorization:** A maintained SvelteKit-compatible auth solution with server-side sessions. Add `host` and `customer` roles and check permissions on every protected server action/API call; hiding UI is not authorization.
- **UI and validation:** Tailwind CSS (optional) and a shared schema validator such as Zod for server inputs. Keep the UI accessible and usable on mobile.
- **Hosting:** SvelteKit-compatible hosting plus MongoDB Atlas and Pusher. Keep credentials in environment secrets and define dev/staging/production environments.

## MVP scope

1. A host creates, opens, pauses, and closes a queue and sets a per-queue capacity.
2. A customer joins an open queue, sees their place and estimated wait, and can leave.
3. A host advances the line (call next / complete / skip) and can view the current queue.
4. Queue and wait updates are pushed live, with a way to recover after disconnect.
5. Authentication and role-based host/customer access.
6. **Defer data analysis** beyond operational queue status to a later milestone.

Explicitly defer SMS/email notifications, payments, multiple organizations/locations, scheduling, and advanced analytics unless pilot feedback makes one essential.

## Core product and technical decisions

- Model a queue as a host-managed service window; customers join a queue, not a physical location account.
- Suggested entities: `User` (role), `Queue` (owner, name, status, capacity, wait estimate settings), and `QueueEntry` (queue, customer/session, state, timestamps).
- Define entry states and transitions (`waiting -> called -> completed`, with `skipped` and `left` terminal alternatives). Record timestamps for auditability and later analytics.
- Derive a person's place from active waiting entries rather than trusting a client-supplied position. Calculate an initial wait estimate from a host-configured average service duration and number of people ahead; refine it using recent completion times only after validating pilot data.
- Enforce capacity and serialize/atomically coordinate concurrent joins so two customers cannot take the last place. Establish the MongoDB deployment/transaction requirements before relying on transactions.
- Scope customer access to their own entry and host access to queues they own. Avoid exposing customer identity in public queue views.
- Treat Pusher events as notifications, not the source of truth. Re-fetch authoritative state on reconnect and handle duplicate/out-of-order events safely.
- Decide retention and privacy rules before collecting personal data; collect only what the queue needs.

## Delivery sequence

1. Confirm domain rules: queue lifecycle, capacity behavior, customer identity, wait estimate, and host actions.
2. Scaffold SvelteKit/TypeScript, environments, lint/type checks, and deployment pipeline.
3. Implement MongoDB schemas/indexes and server-side queue operations with validation and authorization.
4. Build customer and host flows, including empty/full/closed/error states and mobile/accessibility behavior.
5. Add Pusher updates, reconnect/reconciliation, and tests for concurrent queue operations.
6. Pilot, measure operational reliability and wait-estimate accuracy, then prioritize analytics/notifications from feedback.

## Verification criteria

- Unauthorized users cannot perform host operations or view another customer's private entry.
- A queue never exceeds capacity under concurrent joins; each active entry has one valid place.
- Queue state remains correct after leaving, skipping, completing, reconnecting, or receiving a repeated event.
- Wait estimates update consistently when people ahead leave or are served.
- Core customer and host flows work on mobile and have empty, full, closed, and transient-failure states.
- Automated tests cover role checks, state transitions, capacity/concurrency, and realtime recovery.

## Planned repository update

- Add the project blueprint as a repository-level `plan.md`, including the stack recommendation, MVP boundaries, core data/state model, architecture notes, delivery sequence, and acceptance criteria.
- Update `README.md` with a concise project overview, the selected MVP scope, and a link to `plan.md`.
- Keep implementation-specific setup instructions for when the codebase is scaffolded.
