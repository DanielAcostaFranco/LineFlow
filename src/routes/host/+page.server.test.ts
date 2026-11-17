import { describe, expect, it } from 'vitest';
import { load } from './+page.server';

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

function loadHostPage(role: 'host' | 'customer' | null) {
	return load({ locals: localsFor(role) } as Parameters<typeof load>[0]);
}

describe('host page server load', () => {
	it('requires authentication', () => {
		expectHttpError(() => loadHostPage(null), 401);
	});

	it('denies customers', () => {
		expectHttpError(() => loadHostPage('customer'), 403);
	});

	it('allows hosts', () => {
		expect(loadHostPage('host')).toEqual({});
	});
});
