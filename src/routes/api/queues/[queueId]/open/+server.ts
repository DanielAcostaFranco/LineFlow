import { json } from '@sveltejs/kit';
import { actorFrom, handleApiError } from '#lib/server/api.ts';
import { transitionQueue } from '#lib/server/queue-domain.ts';
import { queueRepository } from '#lib/server/queue-repository.ts';

export async function POST(event) {
  try {
    return json({ queue: await transitionQueue(queueRepository, actorFrom(event), event.params.queueId, 'open') });
  } catch (error) {
    return handleApiError(error);
  }
}
