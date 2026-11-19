import { z } from 'zod';

export const QueueEntrySchema = z.object({
	queueId: z.string().min(1),
	customerId: z.string().min(1),
	number: z.number().int().positive(),
	status: z.enum(['waiting', 'called', 'completed', 'skipped', 'left']),
	joinedAt: z.date(),
	calledAt: z.date().optional(),
	completedAt: z.date().optional(),
	skippedAt: z.date().optional(),
	leftAt: z.date().optional()
});

export type QueueEntry = z.infer<typeof QueueEntrySchema>;
