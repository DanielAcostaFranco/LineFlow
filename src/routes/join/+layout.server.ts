import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Covers /join and /join/[code]: customers must be signed in to find or join a queue.
export const load: LayoutServerLoad = ({ locals }) => {
  if (!locals.user) redirect(303, '/login');
  return { user: { id: locals.user.id, name: locals.user.name } };
};
