import * as env from '$app/env/private';
import { MongoClient, type Db } from 'mongodb';

function requiredEnvironmentValue(name: 'MONGODB_URI' | 'MONGODB_DB'): string {
	const value = env[name]?.trim();

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
}

const mongoUri = requiredEnvironmentValue('MONGODB_URI');
const databaseName = requiredEnvironmentValue('MONGODB_DB');

export const client = new MongoClient(mongoUri);
export const db = client.db(databaseName);

export async function ensureQueueIndexes(database: Db = db): Promise<void> {
	await Promise.all([
		database.collection('queues').createIndex(
			{ ownerId: 1, status: 1 },
			{ name: 'queues_owner_status' }
		),
		database.collection('queueEntries').createIndex(
			{ queueId: 1, status: 1, joinedAt: 1 },
			{ name: 'queue_entries_queue_status_joined_at' }
		)
	]);
}
