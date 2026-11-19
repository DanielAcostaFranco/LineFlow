import { describe, expect, it } from 'vitest';
import { QueueSchema } from './queue';

const validQueue = {
	name: 'Front desk',
	ownerId: 'owner-1',
	status: 'open',
	capacity: 12,
	averageServiceMinutes: 5
};

describe('QueueSchema', () => {
	it('accepts a valid queue', () => {
		expect(QueueSchema.parse(validQueue)).toEqual(validQueue);
	});

	it('rejects statuses outside the queue lifecycle', () => {
		expect(() => QueueSchema.parse({ ...validQueue, status: 'waiting' })).toThrow();
	});

	it('rejects non-positive capacity', () => {
		expect(() => QueueSchema.parse({ ...validQueue, capacity: 0 })).toThrow();
	});

	it('rejects non-positive service duration', () => {
		expect(() =>
			QueueSchema.parse({ ...validQueue, averageServiceMinutes: -1 })
		).toThrow();
	});
});
