import { json } from '@sveltejs/kit';
import { actorFrom, handleApiError } from '#lib/server/api.ts';
import { leaveQueue } from '#lib/server/queue-domain.ts';
import { queueRepository } from '#lib/server/queue-repository.ts';

export async function DELETE(event) {
  try {
    return json({ entry: await leaveQueue(queueRepository, actorFrom(event), event.params.entryId) });
  } catch (error) {
    return handleApiError(error);
  }
}
