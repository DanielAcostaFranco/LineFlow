import { isGoogleAuthEnabled } from '../lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load = (({ locals }) => ({
	user: locals.user ? { email: locals.user.email } : null,
	googleAuthEnabled: isGoogleAuthEnabled()
})) satisfies LayoutServerLoad;
