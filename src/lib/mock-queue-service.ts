// Mock queue service for UI 04. Replace with real API calls once the backend exists.
import { queue as campus } from './fixtures';
import type { Queue, QueueTicket } from './queue';

const queues: Record<string, Queue> = {
  CAMPUS: campus,
  FULL: { ...campus, id: 'FULL', organization: 'City Library', name: 'Passport photos', capacity: 10, waitingCount: 10 },
  PAUSED: { ...campus, id: 'PAUSED', organization: 'Tech Hub', name: 'Laptop repair', status: 'paused' },
  CLOSED: { ...campus, id: 'CLOSED', organization: 'Campus Center', name: 'Financial aid', status: 'closed', waitingCount: 0 }
};

const delay = (ms = 600) => new Promise((done) => setTimeout(done, ms));
let nextNumber = 29;

export const normalizeCode = (code: string) => code.trim().toUpperCase();
export const isFull = (q: Queue) => q.waitingCount >= q.capacity;
export const estimateMinutes = (q: Queue) => q.waitingCount * q.avgServiceMinutes;

/** Returns null when no queue has this code. Code ERROR simulates a network failure. */
export async function findQueue(code: string): Promise<Queue | null> {
  await delay();
  const key = normalizeCode(code);
  if (key === 'ERROR') throw new Error('network');
  return queues[key] ?? null;
}

export async function joinQueue(code: string, userId: string): Promise<QueueTicket> {
  await delay(900);
  const q = queues[normalizeCode(code)];
  if (!q || q.status !== 'open' || isFull(q)) throw new Error('This queue isn’t accepting people right now.');
  const position = q.waitingCount + 1;
  const ticket: QueueTicket = {
    number: `A–${String(nextNumber++).padStart(3, '0')}`, queueId: q.id, customerId: userId,
    status: 'waiting', position, estimatedMinutes: estimateMinutes(q)
  };
  q.waitingCount = position;
  return ticket;
}
