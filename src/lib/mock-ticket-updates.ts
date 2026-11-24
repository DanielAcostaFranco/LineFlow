// Mock ticket updates for UI 05. No realtime service: the demo controls on /ticket call these.
import type { QueueTicket } from './queue';

export type Connection = 'online' | 'reconnecting' | 'offline';

const AVG_SERVICE_MINUTES = 5;

/** Someone ahead was served: move up one place, or get called when you're first. */
export function advance(ticket: QueueTicket): QueueTicket {
  if (ticket.status !== 'waiting' || ticket.position === null) return ticket;
  if (ticket.position <= 1) return withStatus(ticket, 'called');
  const position = ticket.position - 1;
  return { ...ticket, position, estimatedMinutes: (position - 1) * AVG_SERVICE_MINUTES };
}

export function withStatus(ticket: QueueTicket, status: QueueTicket['status']): QueueTicket {
  if (status === 'waiting') {
    const position = ticket.position ?? 3;
    return { ...ticket, status, position, estimatedMinutes: (position - 1) * AVG_SERVICE_MINUTES };
  }
  return { ...ticket, status, position: null, estimatedMinutes: null };
}

export const announcements: Record<QueueTicket['status'], string> = {
  waiting: 'You are in line.',
  called: 'It’s your turn. Head to the counter now.',
  completed: 'You have been served.',
  skipped: 'You were skipped.',
  left: 'You left the queue.'
};
