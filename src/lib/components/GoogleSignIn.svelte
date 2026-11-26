<script lang="ts">
  import { resolve } from '$app/paths';
  import { authClient } from '#lib/client/auth.ts';
  import Button from '#lib/components/Button.svelte';

  let { errorCallbackURL }: { errorCallbackURL: string } = $props();
  let pending = $state(false);
  let message = $state('');

  async function signIn() {
    pending = true;
    message = '';
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${resolve('/')}?auth=success`,
        errorCallbackURL
      });
      if (error) message = 'Unable to start Google sign-in. Please try again.';
    } catch {
      message = 'Unable to start Google sign-in. Please try again.';
    } finally {
      pending = false;
    }
  }
</script>

<div class="mt-6">
  <Button variant="secondary" onclick={signIn} disabled={pending}>
    {pending ? 'Connecting to Google…' : 'Continue with Google'}
  </Button>
  {#if message}<p role="alert" class="mt-2 text-sm text-red-800">{message}</p>{/if}
</div>
