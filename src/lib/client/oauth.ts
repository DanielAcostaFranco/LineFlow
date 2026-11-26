export function oauthErrorMessage(error: string | null): string {
	switch (error) {
		case null:
			return '';
		case 'account_not_linked':
			return 'An account already exists for this email. Please sign in with your existing method and connect Google from your account page.';
		case 'email_does_not_match':
			return 'Choose a Google account with the same email as your LineFlow account.';
		case 'account_already_linked_to_different_user':
			return 'This Google account is already connected to another LineFlow account.';
		case 'access_denied':
			return 'Google authentication was cancelled. Please try again.';
		default:
			return 'Unable to authenticate with Google. Please try again.';
	}
}
