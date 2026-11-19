<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Button from '#lib/components/Button.svelte';
  import TextField from '#lib/components/TextField.svelte';
  import { authClient } from '#lib/client/auth.ts';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let message = $state('');
  let pending = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    message = '';
    pending = true;
    try {
      const { error } = await authClient.signUp.email({ name, email, password });
      if (error) {
        message = error.message || 'Unable to create your account.';
        return;
      }
      await goto(`${resolve('/')}?auth=success`);
    } catch {
      message = 'Unable to create your account. Please try again.';
    } finally {
      pending = false;
    }
  }
</script>

<svelte:head><title>Sign up | LineFlow</title></svelte:head>
<section class="mx-auto max-w-md">
  <h1 class="text-3xl font-medium">Create an account</h1>
  <form class="mt-6 space-y-4" onsubmit={submit}>
    <div><TextField id="name" label="Name" bind:value={name} autocomplete="name" required /></div>
    <div><TextField id="email" label="Email" type="email" bind:value={email} autocomplete="email" required /></div>
    <div><TextField id="password" label="Password" type="password" bind:value={password} autocomplete="new-password" minlength={8} required /></div>
    {#if message}<p role="alert" class="text-sm text-red-800">{message}</p>{/if}
    <Button type="submit" disabled={pending}>{pending ? 'Creating account…' : 'Sign up'}</Button>
  </form>
  <p class="mt-6">Already have an account? <a class="underline" href={resolve('/login')}>Log in</a></p>
</section>
