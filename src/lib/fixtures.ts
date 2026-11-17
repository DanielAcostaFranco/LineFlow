import type { Queue, TicketView, User } from './queue';

export const host: User = { id: 'demo-host', name: 'Sam', role: 'host' };
export const customer: User = { id: 'demo-customer', name: 'Alex', role: 'customer' };
export const queue: Queue = {
  id: 'CAMPUS', name: 'Student services', ownerId: host.id, status: 'open', capacity: 25
};

export const ticketViews = {
  loading: { state: 'loading' },
  empty: { state: 'empty' },
  error: { state: 'error', message: 'Couldn’t load your ticket.' },
  success: {
    state: 'success', queue,
    ticket: {
      number: 'A–028', queueId: queue.id, customerId: customer.id,
      status: 'waiting', position: 4, estimatedMinutes: 15
    }
  }
} satisfies Record<TicketView['state'], TicketView>;
