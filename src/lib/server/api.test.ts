import { describe, expect, it } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { actorFrom } from './api';

describe('actorFrom', () => {
	it('maps the session email verification status to the queue actor', () => {
		const user = { id: 'user-id', name: 'Customer', role: 'customer', emailVerified: true };
		const event = { locals: { user } } as RequestEvent;

		expect(actorFrom(event)).toEqual({
			id: 'user-id',
			name: 'Customer',
			role: 'customer',
			verifiedEmail: true
		});
	});

	it('preserves an unverified email status', () => {
		const user = { id: 'user-id', name: 'Customer', role: 'customer', emailVerified: false };
		const event = { locals: { user } } as RequestEvent;

		expect(actorFrom(event).verifiedEmail).toBe(false);
	});
});
