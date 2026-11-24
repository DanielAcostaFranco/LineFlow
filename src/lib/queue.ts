export interface User {
  id: string;
  name: string;
  role: 'host' | 'customer';
}

export interface Queue {
  id: string;
  organization: string;
  name: string;
  ownerId: string;
  status: 'open' | 'paused' | 'closed';
  capacity: number;
  waitingCount: number;
  avgServiceMinutes: number;
}

export interface QueueTicket {
  number: string;
  queueId: string;
  customerId: string;
  status: 'waiting' | 'called' | 'completed' | 'skipped' | 'left';
  position: number | null;
  estimatedMinutes: number | null;
}

export type TicketView =
  | { state: 'loading' | 'empty' }
  | { state: 'error'; message: string }
  | { state: 'success'; queue: Queue; ticket: QueueTicket };

export type QueueLookup =
  | { state: 'loading' }
  | { state: 'not-found'; code: string }
  | { state: 'error'; message: string }
  | { state: 'found'; queue: Queue };
