import { json } from '@sveltejs/kit';
import { actorFrom, body, handleApiError } from '#lib/server/api.ts';
import { updateQueue } from '#lib/server/queue-domain.ts';
import { queueRepository } from '#lib/server/queue-repository.ts';

export async function PATCH(event) {
  try {
    return json({ queue: await updateQueue(queueRepository, actorFrom(event), event.params.queueId, await body(event)) });
  } catch (error) {
    return handleApiError(error);
  }
}
