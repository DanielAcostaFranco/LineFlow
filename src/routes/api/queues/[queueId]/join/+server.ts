import { json } from '@sveltejs/kit';
import { actorFrom, handleApiError } from '#lib/server/api.ts';
import { joinQueue } from '#lib/server/queue-domain.ts';
import { queueRepository } from '#lib/server/queue-repository.ts';

export async function POST(event) {
  try {
    return json(await joinQueue(queueRepository, actorFrom(event), event.params.queueId), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
