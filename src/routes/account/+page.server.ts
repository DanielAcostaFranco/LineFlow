import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { PageServerLoad } from './$types';

export const load = (({ locals }) => {
	if (!locals.user) redirect(303, resolve('/login'));
	return {};
}) satisfies PageServerLoad;
