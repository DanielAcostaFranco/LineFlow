import { json } from '@sveltejs/kit';
import { actorFrom, handleApiError } from '#lib/server/api.ts';
import { finishEntry } from '#lib/server/queue-domain.ts';
import { queueRepository } from '#lib/server/queue-repository.ts';

export async function POST(event) {
  try {
    return json({ entry: await finishEntry(queueRepository, actorFrom(event), event.params.entryId, 'completed') });
  } catch (error) {
    return handleApiError(error);
  }
}
