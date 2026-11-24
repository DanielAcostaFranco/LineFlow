<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Button from '#lib/components/Button.svelte';
  import TextField from '#lib/components/TextField.svelte';
  import { DEMO_HOST, mockHostSignIn } from '#lib/mock-host.svelte.ts';

  let email = $state('');
  let password = $state('');
  let errors = $state<{ email?: string; password?: string }>({});
  let formError = $state('');
  let pending = $state(false);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter an email address like name@example.com.';
    if (!password) next.password = 'Enter your password.';
    else if (password.length < 8) next.password = 'Passwords are at least 8 characters.';
    errors = next;
    return Object.keys(next).length === 0;
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (pending) return;
    formError = '';
    if (!validate()) {
      document.getElementById(errors.email ? 'host-email' : 'host-password')?.focus();
      return;
    }
    pending = true;
    try {
      await mockHostSignIn(email.trim(), password);
      await goto(resolve('/host/dashboard'));
    } catch (e) {
      formError = e instanceof Error && e.message === 'credentials'
        ? 'That email and password don’t match a host account.'
        : 'We couldn’t sign you in right now. Try again in a moment.';
      pending = false;
    }
  }
</script>

<svelte:head><title>Host sign-in | LineFlow</title></svelte:head>
<section class="mx-auto max-w-md rounded-control border border-line bg-white p-6 sm:p-8">
  <h1 class="text-3xl font-medium tracking-tight">Host sign-in</h1>
  <p class="mt-3 text-muted">Sign in to manage your queues.</p>
  <form novalidate class="mt-6 space-y-5" onsubmit={submit}>
    <div><TextField id="host-email" label="Email address" type="email" autocomplete="username" bind:value={email} error={errors.email} /></div>
    <div><TextField id="host-password" label="Password" type="password" autocomplete="current-password" bind:value={password} error={errors.password} /></div>
    {#if formError}<p role="alert" class="rounded-control border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</p>{/if}
    <Button type="submit" class="w-full" loading={pending} loadingLabel="Signing in…">Sign in</Button>
  </form>
  <p class="mt-5 rounded-control bg-sage p-3 text-sm">
    Demo account: <strong>{DEMO_HOST.email}</strong> / <strong>{DEMO_HOST.password}</strong>.
    Use any <strong>@error.test</strong> email to see a server error.
  </p>
  <a href={resolve('/')} class="mt-3 inline-flex min-h-11 items-center text-sm underline underline-offset-4">Back to home</a>
</section>
