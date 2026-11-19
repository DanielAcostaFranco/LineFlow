import { describe, expect, it } from 'vitest';
import { QueueEntrySchema } from './queue-entry';

const validEntry = {
	queueId: 'queue-1',
	customerId: 'customer-1',
	number: 1,
	status: 'waiting',
	joinedAt: new Date('2026-01-01T10:00:00.000Z')
};

describe('QueueEntrySchema', () => {
	it('accepts a valid entry without optional lifecycle timestamps', () => {
		expect(QueueEntrySchema.parse(validEntry)).toEqual(validEntry);
	});

	it('accepts optional lifecycle timestamps', () => {
		const calledAt = new Date('2026-01-01T10:05:00.000Z');

		expect(QueueEntrySchema.parse({ ...validEntry, status: 'called', calledAt })).toEqual({
			...validEntry,
			status: 'called',
			calledAt
		});
	});

	it('rejects statuses outside the entry lifecycle', () => {
		expect(() => QueueEntrySchema.parse({ ...validEntry, status: 'paused' })).toThrow();
	});
});
