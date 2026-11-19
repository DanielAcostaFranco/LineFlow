import { describe, expect, it } from 'vitest';
import { requireRole } from './guards';

function expectHttpError(callback: () => unknown, status: number) {
	let thrown: unknown;

	try {
		callback();
	} catch (error) {
		thrown = error;
	}

	expect(thrown).toMatchObject({ status });
}

function localsFor(role: 'host' | 'customer' | null): App.Locals {
	return {
		user:
			role === null
				? null
				: {
						id: `${role}-id`,
						name: `${role} user`,
						email: `${role}@example.com`,
						emailVerified: true,
						createdAt: new Date(),
						updatedAt: new Date(),
						role
					},
		session: null
	};
}

describe('requireRole', () => {
	it('rejects signed-out users with 401', () => {
		expectHttpError(() => requireRole(localsFor(null), 'host'), 401);
	});

	it('rejects customers from host-only access with 403', () => {
		expectHttpError(() => requireRole(localsFor('customer'), 'host'), 403);
	});

	it('returns the authenticated host', () => {
		const locals = localsFor('host');

		expect(requireRole(locals, 'host')).toBe(locals.user);
	});
});
