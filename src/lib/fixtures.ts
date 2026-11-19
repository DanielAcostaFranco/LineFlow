import type { Queue, QueueTicket, TicketView, User } from './queue';

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

// Each fixture is independent so previews can change status without mutating the waiting ticket.
export const ticketsByStatus = {
  waiting: { ...ticketViews.success.ticket },
  called: { ...ticketViews.success.ticket, status: 'called', position: null, estimatedMinutes: null },
  completed: { ...ticketViews.success.ticket, status: 'completed', position: null, estimatedMinutes: null },
  skipped: { ...ticketViews.success.ticket, status: 'skipped', position: null, estimatedMinutes: null },
  left: { ...ticketViews.success.ticket, status: 'left', position: null, estimatedMinutes: null }
} satisfies Record<QueueTicket['status'], QueueTicket>;
