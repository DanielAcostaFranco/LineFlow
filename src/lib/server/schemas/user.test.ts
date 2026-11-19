import { describe, expect, it } from 'vitest';
import { UserSchema, userAdditionalFields } from './user';

describe('UserSchema', () => {
	const storedUser = {
		id: 'user-id',
		name: 'LineFlow User',
		email: 'user@example.com',
		emailVerified: false,
		createdAt: new Date('2026-01-01T00:00:00.000Z'),
		updatedAt: new Date('2026-01-01T00:00:00.000Z')
	};

	it.each(['host', 'customer'] as const)('accepts the %s role', (role) => {
		const user = UserSchema.parse({ ...storedUser, role });

		expect(user.role).toBe(role);
	});

	it('defaults the role to customer', () => {
		expect(UserSchema.parse(storedUser).role).toBe('customer');
	});

	it('rejects roles outside the application role set', () => {
		expect(() => UserSchema.parse({ ...storedUser, role: 'admin' })).toThrow();
	});

	it('keeps the role additional field out of client input', () => {
		expect(userAdditionalFields.role.input).toBe(false);
		expect(userAdditionalFields.role.type).toEqual(['host', 'customer']);
		expect(userAdditionalFields.role.defaultValue).toBe('customer');
	});
});
