import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	MONGODB_URI: { schema: (value) => value },
	MONGODB_DB: { schema: (value) => value },
	BETTER_AUTH_SECRET: { schema: (value) => value },
	BETTER_AUTH_URL: { schema: (value) => value },
	GOOGLE_CLIENT_ID: { schema: (value) => value },
	GOOGLE_CLIENT_SECRET: { schema: (value) => value }
});
