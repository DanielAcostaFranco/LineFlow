import type { RequestHandler } from './$types';
import { getAuth } from '../../../../lib/server/auth';

const handler: RequestHandler = async ({ request }) => (await getAuth()).handler(request);

export { handler as GET, handler as POST };
