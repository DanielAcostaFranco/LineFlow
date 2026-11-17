import { error } from '@sveltejs/kit';

export function requireAuthenticatedUser(locals: App.Locals) {
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	return locals.user;
}

export function requireRole(locals: App.Locals, role: NonNullable<App.Locals['user']>['role']) {
	const user = requireAuthenticatedUser(locals);

	if (user.role !== role) {
		error(403, 'Forbidden');
	}

	return user;
}
