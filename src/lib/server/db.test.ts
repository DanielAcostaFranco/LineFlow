import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { privateEnv } = vi.hoisted(() => ({
	privateEnv: {} as Record<string, string | undefined>
}));

vi.mock('$app/env/private', () => privateEnv);

beforeEach(() => {
	vi.resetModules();
	privateEnv.MONGODB_URI = ' mongodb://127.0.0.1:27018 ';
	privateEnv.MONGODB_DB = ' private_db ';
	vi.stubEnv('MONGODB_URI', 'mongodb://127.0.0.1:27019');
	vi.stubEnv('MONGODB_DB', 'process_db');
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('MongoDB configuration', () => {
	it('uses and trims SvelteKit private environment values rather than process values', async () => {
		const { client, db } = await import('./db');

		expect(db.databaseName).toBe('private_db');
		expect(client.options.hosts.map(String)).toEqual(['127.0.0.1:27018']);
	});

	it.each([
		['MONGODB_URI', undefined],
		['MONGODB_URI', '   '],
		['MONGODB_DB', undefined],
		['MONGODB_DB', '   ']
	] as const)('rejects missing or blank private %s without using process values', async (name, value) => {
		privateEnv[name] = value;

		await expect(import('./db')).rejects.toThrow(`Missing required environment variable: ${name}`);
	});
});
