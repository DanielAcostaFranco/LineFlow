import { randomUUID } from 'node:crypto';

export type QueueStatus = 'open' | 'paused' | 'closed';
export type EntryStatus = 'waiting' | 'called' | 'completed' | 'skipped' | 'left' | 'closed';
export type Visibility = 'public' | 'private';
export type ClosedReason = 'queue_closed' | 'access_revoked' | 'organization_deactivated';

export interface Actor {
  id: string;
  name?: string;
  role: 'admin' | 'host' | 'customer';
  verifiedEmail: boolean;
}

export interface QueueRecord {
  id: string;
  departmentId: string;
  ownerId: string;
  name: string;
  visibility: Visibility;
  status: QueueStatus;
  capacity: number;
  serviceSlots: number;
  averageServiceMinutes: number;
  timezone: string;
  ticketDay: string;
  nextTicketNumber: number;
  privateLinkVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueueEntry {
  id: string;
  queueId: string;
  customerId: string;
  customerName: string;
  ticketCode: string;
  status: EntryStatus;
  joinedAt: string;
  calledAt?: string;
  completedAt?: string;
  skippedAt?: string;
  leftAt?: string;
  closedAt?: string;
  closedReason?: ClosedReason;
}

export interface QueueRepository {
  createQueue(queue: QueueRecord): Promise<void>;
  getQueue(queueId: string): Promise<QueueRecord | null>;
  updateQueue(queue: QueueRecord): Promise<void>;
  listEntries(queueId: string): Promise<QueueEntry[]>;
  getEntry(entryId: string): Promise<QueueEntry | null>;
  createEntry(entry: QueueEntry): Promise<void>;
  updateEntry(entry: QueueEntry): Promise<void>;
  hasActiveEntry(queueId: string, customerId: string): Promise<boolean>;
}

export class QueueError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const activeStatuses = new Set<EntryStatus>(['waiting', 'called']);
const now = () => new Date().toISOString();

export function activeEntries(entries: QueueEntry): boolean {
  return activeStatuses.has(entries.status);
}

function assertVerified(actor: Actor): void {
  if (!actor.verifiedEmail) throw new QueueError(403, 'EMAIL_NOT_VERIFIED', 'A verified email is required.');
}

function assertHost(actor: Actor): void {
  assertVerified(actor);
  if (actor.role !== 'host' && actor.role !== 'admin') {
    throw new QueueError(403, 'FORBIDDEN', 'Host permissions are required.');
  }
}

function assertOwner(actor: Actor, queue: QueueRecord): void {
  assertHost(actor);
  if (actor.role !== 'admin' && queue.ownerId !== actor.id) {
    throw new QueueError(403, 'FORBIDDEN', 'You do not manage this queue.');
  }
}

function requireQueue(queue: QueueRecord | null): QueueRecord {
  if (!queue) throw new QueueError(404, 'QUEUE_NOT_FOUND', 'Queue not found.');
  return queue;
}

function requireEntry(entry: QueueEntry | null): QueueEntry {
  if (!entry) throw new QueueError(404, 'ENTRY_NOT_FOUND', 'Queue entry not found.');
  return entry;
}

function dayKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date);
}

function dayPrefix(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' })
    .format(date)
    .slice(0, 2)
    .replace('Th', 'Th');
}

function ticketCode(queue: QueueRecord, date: Date): string {
  return `${dayPrefix(date, queue.timezone)}-${String(queue.nextTicketNumber).padStart(5, '0')}`;
}

export function positionFor(entries: QueueEntry[], entryId: string): number | null {
  const waiting = entries
    .filter((entry) => entry.status === 'waiting')
    .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  const index = waiting.findIndex((entry) => entry.id === entryId);
  return index === -1 ? null : index + 1;
}

export async function createQueue(
  repo: QueueRepository,
  actor: Actor,
  input: Pick<QueueRecord, 'departmentId' | 'name' | 'visibility' | 'capacity' | 'serviceSlots' | 'averageServiceMinutes' | 'timezone'>
): Promise<QueueRecord> {
  assertHost(actor);
  if (!input.name.trim() || input.capacity < 1 || input.serviceSlots < 1 || input.averageServiceMinutes < 0) {
    throw new QueueError(400, 'INVALID_QUEUE', 'Queue name and positive capacity/service slots are required.');
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format();
  } catch {
    throw new QueueError(400, 'INVALID_TIMEZONE', 'A valid IANA timezone is required.');
  }
  const timestamp = now();
  const queue: QueueRecord = {
    id: randomUUID(), ...input, ownerId: actor.id, status: 'open',
    ticketDay: dayKey(new Date(), input.timezone), nextTicketNumber: 1,
    privateLinkVersion: 1, createdAt: timestamp, updatedAt: timestamp
  };
  await repo.createQueue(queue);
  return queue;
}

export async function transitionQueue(
  repo: QueueRepository, actor: Actor, queueId: string, status: Exclude<QueueStatus, 'closed'> | 'closed'
): Promise<QueueRecord> {
  const queue = requireQueue(await repo.getQueue(queueId));
  assertOwner(actor, queue);
  if (queue.status === 'closed') throw new QueueError(409, 'QUEUE_CLOSED', 'A closed queue cannot be changed.');
  if (status === queue.status) return queue;
  if (status === 'open' && queue.status !== 'paused') throw new QueueError(409, 'INVALID_TRANSITION', 'Only paused queues can be opened.');
  if (status === 'paused' && queue.status !== 'open') throw new QueueError(409, 'INVALID_TRANSITION', 'Only open queues can be paused.');
  const timestamp = now();
  const next = { ...queue, status, updatedAt: timestamp };
  if (status === 'closed') {
    const entries = await repo.listEntries(queueId);
    for (const entry of entries) {
      if (activeEntries(entry)) await repo.updateEntry({ ...entry, status: 'closed', closedAt: timestamp, closedReason: 'queue_closed' });
    }
  }
  await repo.updateQueue(next);
  return next;
}

export async function updateQueue(
  repo: QueueRepository, actor: Actor, queueId: string,
  changes: Partial<Pick<QueueRecord, 'name' | 'visibility' | 'capacity' | 'serviceSlots' | 'averageServiceMinutes'>>
): Promise<QueueRecord> {
  const queue = requireQueue(await repo.getQueue(queueId));
  assertOwner(actor, queue);
  const entries = await repo.listEntries(queueId);
  const active = entries.filter(activeEntries).length;
  const called = entries.filter((entry) => entry.status === 'called').length;
  if (changes.capacity !== undefined && (changes.capacity < active || changes.capacity < 1)) {
    throw new QueueError(409, 'CAPACITY_TOO_SMALL', 'Capacity cannot be below active entries.');
  }
  if (changes.serviceSlots !== undefined && (changes.serviceSlots < called || changes.serviceSlots < 1)) {
    throw new QueueError(409, 'SERVICE_SLOTS_TOO_SMALL', 'Service slots cannot be below called entries.');
  }
  if (changes.averageServiceMinutes !== undefined && changes.averageServiceMinutes < 0) {
    throw new QueueError(400, 'INVALID_DURATION', 'Average service minutes cannot be negative.');
  }
  const next = { ...queue, ...changes, updatedAt: now() };
  await repo.updateQueue(next);
  return next;
}

export async function joinQueue(repo: QueueRepository, actor: Actor, queueId: string): Promise<{ entry: QueueEntry; position: number }> {
  assertVerified(actor);
  const queue = requireQueue(await repo.getQueue(queueId));
  if (queue.status !== 'open') throw new QueueError(409, 'QUEUE_NOT_OPEN', 'This queue is not accepting customers.');
  if (await repo.hasActiveEntry(queueId, actor.id)) throw new QueueError(409, 'ALREADY_JOINED', 'You already have an active ticket in this queue.');
  const entries = await repo.listEntries(queueId);
  if (entries.filter(activeEntries).length >= queue.capacity) throw new QueueError(409, 'QUEUE_FULL', 'This queue is at capacity.');
  const date = new Date();
  const today = dayKey(date, queue.timezone);
  const sequence = today === queue.ticketDay ? queue.nextTicketNumber : 1;
  const nextQueue = { ...queue, ticketDay: today, nextTicketNumber: sequence + 1, updatedAt: now() };
  const entry: QueueEntry = {
    id: randomUUID(), queueId, customerId: actor.id, customerName: actor.name ?? actor.id,
    ticketCode: `${dayPrefix(date, queue.timezone)}-${String(sequence).padStart(5, '0')}`,
    status: 'waiting', joinedAt: now()
  };
  await repo.updateQueue(nextQueue);
  await repo.createEntry(entry);
  return { entry, position: positionFor([...entries, entry], entry.id) ?? 1 };
}

export async function leaveQueue(repo: QueueRepository, actor: Actor, entryId: string): Promise<QueueEntry> {
  assertVerified(actor);
  const entry = requireEntry(await repo.getEntry(entryId));
  if (entry.customerId !== actor.id) throw new QueueError(403, 'FORBIDDEN', 'You can only leave your own ticket.');
  if (!activeEntries(entry)) return entry;
  const next = { ...entry, status: 'left' as const, leftAt: now() };
  await repo.updateEntry(next);
  return next;
}

export async function advanceNext(repo: QueueRepository, actor: Actor, queueId: string): Promise<QueueEntry> {
  const queue = requireQueue(await repo.getQueue(queueId));
  assertOwner(actor, queue);
  if (queue.status !== 'open') throw new QueueError(409, 'QUEUE_NOT_OPEN', 'Only open queues can advance.');
  const entries = await repo.listEntries(queueId);
  if (entries.filter((entry) => entry.status === 'called').length >= queue.serviceSlots) {
    throw new QueueError(409, 'SERVICE_SLOTS_FULL', 'Complete or skip a called entry, or add a service slot.');
  }
  const next = entries.filter((entry) => entry.status === 'waiting').sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
  if (!next) throw new QueueError(409, 'QUEUE_EMPTY', 'There are no waiting customers.');
  const updated = { ...next, status: 'called' as const, calledAt: now() };
  await repo.updateEntry(updated);
  return updated;
}

export async function finishEntry(repo: QueueRepository, actor: Actor, entryId: string, status: 'completed' | 'skipped'): Promise<QueueEntry> {
  const entry = requireEntry(await repo.getEntry(entryId));
  const queue = requireQueue(await repo.getQueue(entry.queueId));
  assertOwner(actor, queue);
  if (entry.status !== 'called' && !(status === 'skipped' && entry.status === 'waiting')) {
    throw new QueueError(409, 'INVALID_ENTRY_TRANSITION', 'Only waiting or called entries can be finished.');
  }
  const timestamp = now();
  const updated = status === 'completed'
    ? { ...entry, status, completedAt: timestamp }
    : { ...entry, status, skippedAt: timestamp };
  await repo.updateEntry(updated);
  return updated;
}

export function publicEntry(entry: QueueEntry, entries: QueueEntry[]): QueueEntry & { position: number | null } {
  return { ...entry, position: positionFor(entries, entry.id) };
}
