import { z } from 'zod';

export const QueueSchema = z.object({
	name: z.string().min(1),
	ownerId: z.string().min(1),
	status: z.enum(['open', 'paused', 'closed']),
	capacity: z.number().int().positive(),
	averageServiceMinutes: z.number().positive()
});

export type Queue = z.infer<typeof QueueSchema>;
