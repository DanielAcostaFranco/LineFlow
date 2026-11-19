import { z } from 'zod';

export const UserRoleSchema = z.enum(['host', 'customer']);

export const userAdditionalFields = {
	role: {
		type: ['host', 'customer'] as ['host', 'customer'],
		required: false,
		defaultValue: 'customer',
		input: false
	}
};

export const UserSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.email(),
	emailVerified: z.boolean(),
	image: z.string().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
	role: UserRoleSchema.default('customer')
});

export type User = z.infer<typeof UserSchema>;
