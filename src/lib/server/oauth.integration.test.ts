import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	database: { user: [], session: [], account: [], verification: [] }
}));

vi.mock('$app/env/private', () => ({
	BETTER_AUTH_SECRET: 'test-secret-that-is-long-enough-for-auth',
	BETTER_AUTH_URL: 'https://lineflow.example',
	GOOGLE_CLIENT_ID: 'test-client-id',
	GOOGLE_CLIENT_SECRET: 'test-client-secret'
}));
vi.mock('$app/server', () => ({ getRequestEvent: () => undefined }));
vi.mock('./db', () => ({ db: {}, ensureQueueIndexes: async () => {} }));
vi.mock('better-auth/adapters/mongodb', async () => {
	const { memoryAdapter } = await import('better-auth/adapters/memory');
	return { mongodbAdapter: () => memoryAdapter(mocks.database) };
});

beforeEach(() => {
	vi.resetModules();
	for (const rows of Object.values(mocks.database)) rows.length = 0;
});

async function setup(email: string) {
	const { getAuth } = await import('./auth');
	const auth = await getAuth();
	const context = await auth.$context;
	const google = context.socialProviders.find((provider) => provider.id === 'google');
	if (!google) throw new Error('Google provider is missing');
	vi.spyOn(google, 'validateAuthorizationCode').mockResolvedValue({ accessToken: 'test-token' });
	vi.spyOn(google, 'getUserInfo').mockResolvedValue({
		user: { name: 'Test User', email, emailVerified: true },
		data: { sub: 'google-subject', email, email_verified: true }
	});

	const request = (path: string, options: RequestInit = {}) =>
		auth.handler(new Request(`https://lineflow.example${path}`, options));
	const post = (path: string, body: object, cookie = '') =>
		request(path, {
			method: 'POST',
			headers: { 'content-type': 'application/json', origin: 'https://lineflow.example', cookie },
			body: JSON.stringify(body)
		});
	const cookie = (response: Response) =>
		response.headers.getSetCookie().map((value) => value.split(';', 1)[0]).join('; ');

	async function signUp(email: string) {
		const response = await post('/api/auth/sign-up/email', {
			name: 'Existing User', email, password: 'strong-password'
		});
		expect(response.status).toBe(200);
		return cookie(response);
	}

	async function oauth(path: '/api/auth/sign-in/social' | '/api/auth/link-social', session = '') {
		const start = await post(path, {
			provider: 'google',
			callbackURL: '/',
			errorCallbackURL: '/login',
			disableRedirect: true
		}, session);
		expect(start.status).toBe(200);
		const data: { url: string } = await start.json();
		const url = new URL(data.url);
		expect(url.origin).toBe('https://accounts.google.com');
		expect(url.searchParams.get('redirect_uri')).toBe('https://lineflow.example/api/auth/callback/google');
		const state = url.searchParams.get('state');
		expect(state).toBeTruthy();
		return request(`/api/auth/callback/google?code=test-code&state=${encodeURIComponent(state!)}`, {
			headers: { cookie: [session, cookie(start)].filter(Boolean).join('; ') }
		});
	}

	return { post, signUp, oauth };
}

describe('Google OAuth integration', () => {
	it('creates a customer session for a new Google user', async () => {
		const { oauth } = await setup('new@example.com');
		const response = await oauth('/api/auth/sign-in/social');

		expect(response.status).toBe(302);
		expect(response.headers.get('location')).toBe('/');
		expect(response.headers.getSetCookie().some((value) => value.includes('session_token'))).toBe(true);
		expect(mocks.database.user).toEqual([
			expect.objectContaining({ email: 'new@example.com', role: 'customer', emailVerified: true })
		]);
	});

	it('rejects implicit linking, then allows a signed-in user to explicitly link Google', async () => {
		const { signUp, oauth } = await setup('existing@example.com');
		const session = await signUp('existing@example.com');

		const rejected = await oauth('/api/auth/sign-in/social');
		expect(new URL(rejected.headers.get('location')!, 'https://lineflow.example').searchParams.get('error'))
			.toBe('account_not_linked');
		expect(mocks.database.account).toHaveLength(1);

		const linked = await oauth('/api/auth/link-social', session);
		expect(linked.headers.get('location')).toBe('/');
		expect(mocks.database.account).toHaveLength(2);
		expect(mocks.database.user).toEqual([
			expect.objectContaining({ role: 'customer', emailVerified: false })
		]);

		const signedIn = await oauth('/api/auth/sign-in/social');
		expect(signedIn.headers.get('location')).toBe('/');
		expect(signedIn.headers.getSetCookie().some((value) => value.includes('session_token'))).toBe(true);
	});

	it('requires authentication and matching emails when connecting Google', async () => {
		const { post, signUp, oauth } = await setup('google@example.com');
		const unauthorized = await post('/api/auth/link-social', { provider: 'google' });
		expect(unauthorized.status).toBe(401);

		const session = await signUp('existing@example.com');
		const rejected = await oauth('/api/auth/link-social', session);

		expect(new URL(rejected.headers.get('location')!, 'https://lineflow.example').searchParams.get('error'))
			.toBe('email_does_not_match');
		expect(mocks.database.account).toHaveLength(1);
	});
});
