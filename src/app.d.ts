import type { getAuth } from './lib/server/auth';

type AuthSession = Awaited<ReturnType<typeof getAuth>>['$Infer']['Session'];

declare global {
	namespace App {
		interface Locals {
			user: AuthSession['user'] | null;
			session: AuthSession['session'] | null;
		}
	}
}

export {};
