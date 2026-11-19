<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Button from '#lib/components/Button.svelte';
  import TextField from '#lib/components/TextField.svelte';
  import { authClient } from '#lib/client/auth.ts';

  let email = $state('');
  let password = $state('');
  let message = $state('');
  let pending = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    message = '';
    pending = true;
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        message = error.message || 'Unable to log in.';
        return;
      }
      await goto(`${resolve('/')}?auth=success`);
    } catch {
      message = 'Unable to log in. Please try again.';
    } finally {
      pending = false;
    }
  }
</script>

<svelte:head><title>Log in | LineFlow</title></svelte:head>
<section class="mx-auto max-w-md">
  <h1 class="text-3xl font-medium">Log in</h1>
  <form class="mt-6 space-y-4" onsubmit={submit}>
    <div><TextField id="email" label="Email" type="email" bind:value={email} autocomplete="email" required /></div>
    <div><TextField id="password" label="Password" type="password" bind:value={password} autocomplete="current-password" required /></div>
    {#if message}<p role="alert" class="text-sm text-red-800">{message}</p>{/if}
    <Button type="submit" disabled={pending}>{pending ? 'Logging in…' : 'Log in'}</Button>
  </form>
  <p class="mt-6">Need an account? <a class="underline" href={resolve('/signup')}>Sign up</a></p>
</section>
