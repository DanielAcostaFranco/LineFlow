import { requireRole } from '../../lib/server/auth/guards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireRole(locals, 'host');
	return {};
};
