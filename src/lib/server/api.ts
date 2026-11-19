import { json, type RequestEvent } from '@sveltejs/kit';
import { QueueError, type Actor } from './queue-domain';

export function actorFrom(event: RequestEvent): Actor {
  if (!event.locals.user) throw new QueueError(401, 'UNAUTHENTICATED', 'Authentication is required.');
  const { id, name, role, emailVerified } = event.locals.user;
  return { id, name, role, verifiedEmail: emailVerified };
}

export function handleApiError(error: unknown): Response {
  if (error instanceof QueueError) return json({ error: { code: error.code, message: error.message } }, { status: error.status });
  console.error(error);
  return json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 });
}

export async function body<T>(event: RequestEvent): Promise<T> {
  try { return await event.request.json() as T; }
  catch { throw new QueueError(400, 'INVALID_JSON', 'Request body must be valid JSON.'); }
}
