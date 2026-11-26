<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { authClient } from '#lib/client/auth.ts';
  import { oauthErrorMessage } from '#lib/client/oauth.ts';
  import Button from '#lib/components/Button.svelte';

  let { data } = $props();
  let pending = $state(false);
  let message = $state('');
  let oauthError = $derived(oauthErrorMessage(page.url.searchParams.get('error')));

  async function connectGoogle() {
    pending = true;
    message = '';
    try {
      const { error } = await authClient.linkSocial({
        provider: 'google',
        callbackURL: `${resolve('/account')}?linked=google`,
        errorCallbackURL: resolve('/account')
      });
      if (error) message = 'Unable to connect Google. Please try again.';
    } catch {
      message = 'Unable to connect Google. Please try again.';
    } finally {
      pending = false;
    }
  }
</script>

<svelte:head><title>Account | LineFlow</title></svelte:head>
<section class="mx-auto max-w-md">
  <h1 class="text-3xl font-medium">Account</h1>
  <p class="mt-4">Signed in as {data.user?.email}.</p>
  {#if page.url.searchParams.get('linked') === 'google'}
    <p role="status" class="mt-4">Google account connected.</p>
  {/if}
  {#if oauthError}<p role="alert" class="mt-4 text-sm text-red-800">{oauthError}</p>{/if}
  {#if message}<p role="alert" class="mt-4 text-sm text-red-800">{message}</p>{/if}
  {#if data.googleAuthEnabled}
    <p class="mt-6 text-sm text-muted">Connect a Google account with the same email to use it for sign-in.</p>
    <div class="mt-4">
      <Button variant="secondary" onclick={connectGoogle} disabled={pending}>
        {pending ? 'Connecting to Google…' : 'Connect Google'}
      </Button>
    </div>
  {/if}
</section>
