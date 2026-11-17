# LineFlow

The frontend uses SvelteKit, TypeScript, Tailwind CSS and Vite. See [PLAN.md](./PLAN.md) for the project blueprint.

With Node.js 22.17 or newer, run `npm ci` and `npm run dev`. Open the local URL printed by Vite. The component preview at `/preview` exercises the shared controls and sample queue states using the code `CAMPUS`.

For MongoDB-backed server features, copy `.env.example` to `.env` and set `MONGODB_URI` and `MONGODB_DB`. The local `.env` file is ignored by Git.

Run `npm run check` for Svelte and TypeScript diagnostics and `npm run build` for a production build.
