import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getAuth: vi.fn()
}));

vi.mock('$app/env', () => ({ building: false }));
vi.mock('./lib/server/auth', () => ({ getAuth: mocks.getAuth }));

import { handle } from './hooks.server';

beforeEach(() => {
	mocks.getAuth.mockReset();
});

describe('server session hook', () => {
	it('populates locals from the request session', async () => {
		const user = { id: 'user-id' };
		const session = { id: 'session-id', userId: user.id };
		const getSession = vi.fn(async () => ({ user, session }));
		const response = new Response('ok');
		const resolve = vi.fn(async () => response);
		const event = {
			request: new Request('https://lineflow.example'),
			locals: {}
		} as Parameters<typeof handle>[0]['event'];

		mocks.getAuth.mockResolvedValue({ api: { getSession } });

		await expect(handle({ event, resolve })).resolves.toBe(response);

		expect(getSession).toHaveBeenCalledWith({ headers: event.request.headers });
		expect(event.locals.user).toBe(user);
		expect(event.locals.session).toBe(session);
	});

	it('sets both locals to null when no session exists', async () => {
		const getSession = vi.fn(async () => null);
		const resolve = vi.fn(async () => new Response('ok'));
		const event = {
			request: new Request('https://lineflow.example'),
			locals: {}
		} as Parameters<typeof handle>[0]['event'];

		mocks.getAuth.mockResolvedValue({ api: { getSession } });

		await handle({ event, resolve });

		expect(event.locals.user).toBeNull();
		expect(event.locals.session).toBeNull();
	});
});
