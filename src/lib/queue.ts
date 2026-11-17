export interface User {
  id: string;
  name: string;
  role: 'host' | 'customer';
}

export interface Queue {
  id: string;
  name: string;
  ownerId: string;
  status: 'open' | 'paused' | 'closed';
  capacity: number;
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
