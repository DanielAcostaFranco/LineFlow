import { describe, expect, it } from 'vitest';
import { oauthErrorMessage } from './oauth';

describe('Google authentication errors', () => {
	it('explains how to link an existing account', () => {
		expect(oauthErrorMessage('account_not_linked')).toContain('sign in with your existing');
	});

	it('explains a different email during explicit linking', () => {
		expect(oauthErrorMessage('email_does_not_match')).toContain('same email');
	});

	it('handles cancellation and unknown failures without displaying provider details', () => {
		expect(oauthErrorMessage('access_denied')).toContain('cancelled');
		expect(oauthErrorMessage('sensitive-provider-detail')).toContain('Unable');
		expect(oauthErrorMessage(null)).toBe('');
	});
});
