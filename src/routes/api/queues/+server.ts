import { json } from '@sveltejs/kit';
import { actorFrom, body, handleApiError } from '#lib/server/api.ts';
import { createQueue } from '#lib/server/queue-domain.ts';
import { queueRepository } from '#lib/server/queue-repository.ts';

type CreateQueueBody = {
  departmentId: string;
  name: string;
  visibility: 'public' | 'private';
  capacity: number;
  serviceSlots: number;
  averageServiceMinutes: number;
  timezone: string;
};

export async function POST(event) {
  try {
    const queue = await createQueue(queueRepository, actorFrom(event), await body<CreateQueueBody>(event));
    return json({ queue }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
