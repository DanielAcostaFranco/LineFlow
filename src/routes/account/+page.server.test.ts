import { describe, expect, it } from 'vitest';
import { load } from './+page.server';

describe('account page', () => {
	it('redirects anonymous visitors to login', () => {
		expect(() => load({ locals: { user: null } } as Parameters<typeof load>[0])).toThrow(
			expect.objectContaining({ status: 303, location: '/login' })
		);
	});

	it('allows signed-in visitors', () => {
		expect(load({ locals: { user: { id: 'user-id' } } } as Parameters<typeof load>[0])).toEqual({});
	});
});
