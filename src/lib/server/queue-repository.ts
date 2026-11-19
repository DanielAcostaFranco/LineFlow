import type { QueueEntry, QueueRecord, QueueRepository } from './queue-domain';

const queues = new Map<string, QueueRecord>();
const entries = new Map<string, QueueEntry>();

export const queueRepository: QueueRepository = {
  async createQueue(queue) { queues.set(queue.id, queue); },
  async getQueue(id) { return queues.get(id) ?? null; },
  async updateQueue(queue) { queues.set(queue.id, queue); },
  async listEntries(queueId) { return [...entries.values()].filter((entry) => entry.queueId === queueId); },
  async getEntry(id) { return entries.get(id) ?? null; },
  async createEntry(entry) { entries.set(entry.id, entry); },
  async updateEntry(entry) { entries.set(entry.id, entry); },
  async hasActiveEntry(queueId, customerId) {
    return [...entries.values()].some((entry) => entry.queueId === queueId && entry.customerId === customerId && (entry.status === 'waiting' || entry.status === 'called'));
  }
};
