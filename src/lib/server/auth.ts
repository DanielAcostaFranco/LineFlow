import { getRequestEvent } from '$app/server';
import * as env from '$app/env/private';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { userAdditionalFields } from './schemas/user';

function requiredEnvironmentValue(name: 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL'): string {
	const value = env[name]?.trim();

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	if (name === 'BETTER_AUTH_SECRET' && value.length < 32) {
		throw new Error('BETTER_AUTH_SECRET must be at least 32 characters long');
	}

	return value;
}

async function initializeAuth() {
	const secret = requiredEnvironmentValue('BETTER_AUTH_SECRET');
	const baseURL = requiredEnvironmentValue('BETTER_AUTH_URL');
	const { db, ensureQueueIndexes } = await import('./db');

	await ensureQueueIndexes(db);

	return betterAuth({
		database: mongodbAdapter(db),
		baseURL,
		secret,
		emailAndPassword: {
			enabled: true
		},
		user: {
			additionalFields: userAdditionalFields
		},
		advanced: {
			useSecureCookies: true,
			defaultCookieAttributes: {
				httpOnly: true,
				secure: true,
				sameSite: 'lax'
			}
		},
		plugins: [sveltekitCookies(getRequestEvent)]
	});
}

let authPromise: ReturnType<typeof initializeAuth> | undefined;

export function getAuth() {
	authPromise ??= initializeAuth();
	return authPromise;
}
