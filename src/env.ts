import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	MONGODB_URI: { schema: (value) => value },
	MONGODB_DB: { schema: (value) => value }
});
