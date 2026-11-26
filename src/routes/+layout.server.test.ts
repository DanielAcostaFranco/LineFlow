import { describe, expect, it, vi } from 'vitest';

vi.mock('../lib/server/auth', () => ({ isGoogleAuthEnabled: () => true }));

import { load } from './+layout.server';

describe('layout authentication data', () => {
	it('exposes only the user profile needed by the UI and Google availability', () => {
		const user = {
			id: 'user-id',
			name: 'Taylor',
			email: 'taylor@example.com',
			role: 'customer',
			emailVerified: false
		};

		expect(load({ locals: { user } } as Parameters<typeof load>[0])).toEqual({
			user: { email: 'taylor@example.com' },
			googleAuthEnabled: true
		});
	});

	it('exposes no user for an anonymous visitor', () => {
		expect(load({ locals: { user: null } } as Parameters<typeof load>[0])).toEqual({
			user: null,
			googleAuthEnabled: true
		});
	});
});
