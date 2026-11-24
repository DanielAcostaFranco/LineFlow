// Mock host data and sign-in for UI 06. No real authentication, permissions or database writes.
export type HostQueueStatus = 'open' | 'paused' | 'closed';

export interface HostQueue {
  id: string;
  name: string;
  status: HostQueueStatus;
  capacity: number;
  waitingCount: number;
  servingCount: number;
}

// One fixture list feeds both the summary counts and the queue cards, so they always agree.
export const hostQueueFixtures: HostQueue[] = [
  { id: 'CAMPUS', name: 'Student services', status: 'open', capacity: 25, waitingCount: 3, servingCount: 1 },
  { id: 'ADVISE', name: 'Academic advising', status: 'open', capacity: 15, waitingCount: 9, servingCount: 2 },
  { id: 'IDCARD', name: 'ID card desk', status: 'paused', capacity: 10, waitingCount: 4, servingCount: 0 },
  { id: 'FINAID', name: 'Financial aid', status: 'closed', capacity: 20, waitingCount: 0, servingCount: 0 }
];

export const DEMO_HOST = { email: 'host@lineflow.test', password: 'lineflow123', name: 'Sam' };

export const hostSession = $state<{ name: string | null }>({ name: null });

const delay = (ms: number) => new Promise((done) => setTimeout(done, ms));

/** Mock sign-in. Use the demo account; any email at error.test simulates a server failure. */
export async function mockHostSignIn(email: string, password: string): Promise<void> {
  await delay(800);
  if (email.toLowerCase().endsWith('@error.test')) throw new Error('server');
  if (email.toLowerCase() !== DEMO_HOST.email || password !== DEMO_HOST.password) throw new Error('credentials');
  hostSession.name = DEMO_HOST.name;
}

export type DashboardMode = 'normal' | 'empty' | 'error';

let queues = hostQueueFixtures.map((q) => ({ ...q }));

export async function fetchHostQueues(mode: DashboardMode = 'normal'): Promise<HostQueue[]> {
  await delay(700);
  if (mode === 'error') throw new Error('network');
  return mode === 'empty' ? [] : queues.map((q) => ({ ...q }));
}

/** New mock queues always start closed with nobody waiting. */
export async function createHostQueue(name: string, capacity: number): Promise<HostQueue> {
  await delay(600);
  const id = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) + String(queues.length + 1);
  const queue: HostQueue = { id, name, status: 'closed', capacity, waitingCount: 0, servingCount: 0 };
  queues = [...queues, queue];
  return { ...queue };
}

export function validateQueueForm(name: string, capacity: string, existing: HostQueue[]) {
  const errors: { name?: string; capacity?: string } = {};
  const trimmed = name.trim();
  if (trimmed.length < 3) errors.name = 'Enter a queue name of at least 3 characters.';
  else if (trimmed.length > 40) errors.name = 'Keep the name to 40 characters or fewer.';
  else if (existing.some((q) => q.name.toLowerCase() === trimmed.toLowerCase())) errors.name = 'You already have a queue with this name.';
  const n = Number(capacity);
  if (capacity.trim() === '' || !Number.isInteger(n)) errors.capacity = 'Enter capacity as a whole number.';
  else if (n < 1 || n > 500) errors.capacity = 'Capacity must be between 1 and 500.';
  return errors;
}
