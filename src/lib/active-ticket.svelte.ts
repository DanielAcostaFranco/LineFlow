// Holds the ticket from the last join so /ticket can show it. Browser-only mock state;
// replace with a fetch of the user's active entry once the join API is wired up.
import type { Queue, QueueTicket } from './queue';

export const activeTicket = $state<{ current: { queue: Queue; ticket: QueueTicket } | null }>({ current: null });
