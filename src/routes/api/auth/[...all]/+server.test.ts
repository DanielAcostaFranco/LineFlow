import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getAuth: vi.fn()
}));

vi.mock('../../../../lib/server/auth', () => ({ getAuth: mocks.getAuth }));

import { GET, POST } from './+server';

beforeEach(() => {
	mocks.getAuth.mockReset();
});

describe('auth API endpoint', () => {
	it.each([GET, POST])('forwards requests to Better Auth', async (method) => {
		const request = new Request('https://lineflow.example/api/auth', { method: 'POST' });
		const response = new Response('auth response');
		const authHandler = vi.fn(async () => response);
		mocks.getAuth.mockResolvedValue({ handler: authHandler });

		await expect(method({ request } as Parameters<typeof method>[0])).resolves.toBe(response);

		expect(authHandler).toHaveBeenCalledWith(request);
	});
});
