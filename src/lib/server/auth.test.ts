import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	const authInstance = {
		handler: vi.fn(),
		api: { getSession: vi.fn() },
		$Infer: {}
	};

	return {
		privateEnv: {
			BETTER_AUTH_SECRET: undefined,
			BETTER_AUTH_URL: undefined
		} as Record<string, string | undefined>,
		db: {},
		ensureQueueIndexes: vi.fn(async () => {}),
		betterAuth: vi.fn(() => authInstance),
		mongodbAdapter: vi.fn(() => 'mongodb-adapter'),
		sveltekitCookies: vi.fn(() => 'sveltekit-cookies')
	};
});

vi.mock('$app/env/private', () => ({
	get BETTER_AUTH_SECRET() {
		return mocks.privateEnv.BETTER_AUTH_SECRET;
	},
	get BETTER_AUTH_URL() {
		return mocks.privateEnv.BETTER_AUTH_URL;
	},
	get GOOGLE_CLIENT_ID() {
		return mocks.privateEnv.GOOGLE_CLIENT_ID;
	},
	get GOOGLE_CLIENT_SECRET() {
		return mocks.privateEnv.GOOGLE_CLIENT_SECRET;
	}
}));
vi.mock('$app/server', () => ({ getRequestEvent: () => undefined }));
vi.mock('./db', () => ({
	db: mocks.db,
	ensureQueueIndexes: mocks.ensureQueueIndexes
}));
vi.mock('better-auth', () => ({ betterAuth: mocks.betterAuth }));
vi.mock('better-auth/adapters/mongodb', () => ({ mongodbAdapter: mocks.mongodbAdapter }));
vi.mock('better-auth/svelte-kit', () => ({ sveltekitCookies: mocks.sveltekitCookies }));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	delete mocks.privateEnv.BETTER_AUTH_SECRET;
	delete mocks.privateEnv.BETTER_AUTH_URL;
	delete mocks.privateEnv.GOOGLE_CLIENT_ID;
	delete mocks.privateEnv.GOOGLE_CLIENT_SECRET;
});

describe('Better Auth configuration', () => {
	it('defers missing-secret errors until auth is requested', async () => {
		const { getAuth } = await import('./auth');

		await expect(getAuth()).rejects.toThrow(
			'Missing required environment variable: BETTER_AUTH_SECRET'
		);
	});

	it('requires the configured base URL during auth initialization', async () => {
		mocks.privateEnv.BETTER_AUTH_SECRET = 'a'.repeat(32);
		const { getAuth } = await import('./auth');

		await expect(getAuth()).rejects.toThrow(
			'Missing required environment variable: BETTER_AUTH_URL'
		);
	});

	it('initializes database indexes once and configures secure email/password auth', async () => {
		mocks.privateEnv.BETTER_AUTH_SECRET = 'a'.repeat(32);
		mocks.privateEnv.BETTER_AUTH_URL = 'https://lineflow.example';
		const { getAuth } = await import('./auth');

		await Promise.all([getAuth(), getAuth()]);

		expect(mocks.ensureQueueIndexes).toHaveBeenCalledOnce();
		expect(mocks.mongodbAdapter).toHaveBeenCalledWith(mocks.db);
		expect(mocks.betterAuth).toHaveBeenCalledWith(
			expect.objectContaining({
				baseURL: 'https://lineflow.example',
				secret: 'a'.repeat(32),
				emailAndPassword: { enabled: true },
				advanced: {
					useSecureCookies: true,
					defaultCookieAttributes: {
						httpOnly: true,
						secure: true,
						sameSite: 'lax'
					}
				}
			})
		);
	});

	it('configures Google and prevents implicit linking to existing accounts', async () => {
		mocks.privateEnv.BETTER_AUTH_SECRET = 'a'.repeat(32);
		mocks.privateEnv.BETTER_AUTH_URL = 'https://lineflow.example';
		mocks.privateEnv.GOOGLE_CLIENT_ID = 'google-client-id';
		mocks.privateEnv.GOOGLE_CLIENT_SECRET = 'google-client-secret';
		const { getAuth } = await import('./auth');

		await getAuth();

		expect(mocks.betterAuth).toHaveBeenCalledWith(
			expect.objectContaining({
				socialProviders: {
					google: { clientId: 'google-client-id', clientSecret: 'google-client-secret' }
				},
				account: { accountLinking: { disableImplicitLinking: true } },
				onAPIError: { errorURL: 'https://lineflow.example/login' }
			})
		);
	});

	it.each(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'])(
		'rejects incomplete Google configuration when only %s is set',
		async (name) => {
			mocks.privateEnv.BETTER_AUTH_SECRET = 'a'.repeat(32);
			mocks.privateEnv.BETTER_AUTH_URL = 'https://lineflow.example';
			mocks.privateEnv[name] = 'configured';
			const { getAuth } = await import('./auth');

			await expect(getAuth()).rejects.toThrow('Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
			expect(mocks.betterAuth).not.toHaveBeenCalled();
		}
	);

	it('surfaces database index initialization failures', async () => {
		mocks.privateEnv.BETTER_AUTH_SECRET = 'a'.repeat(32);
		mocks.privateEnv.BETTER_AUTH_URL = 'https://lineflow.example';
		mocks.ensureQueueIndexes.mockRejectedValueOnce(new Error('queue index unavailable'));
		const { getAuth } = await import('./auth');

		await expect(getAuth()).rejects.toThrow('queue index unavailable');
		expect(mocks.betterAuth).not.toHaveBeenCalled();
	});

	it('retries auth initialization after a transient index failure', async () => {
		mocks.privateEnv.BETTER_AUTH_SECRET = 'a'.repeat(32);
		mocks.privateEnv.BETTER_AUTH_URL = 'https://lineflow.example';
		mocks.ensureQueueIndexes.mockRejectedValueOnce(new Error('queue index unavailable'));
		const { getAuth } = await import('./auth');

		const first = getAuth();
		const concurrent = getAuth();
		await expect(first).rejects.toThrow('queue index unavailable');
		await expect(concurrent).rejects.toThrow('queue index unavailable');

		const auth = await getAuth();
		expect(await getAuth()).toBe(auth);
		expect(mocks.ensureQueueIndexes).toHaveBeenCalledTimes(2);
		expect(mocks.betterAuth).toHaveBeenCalledOnce();
	});
});
