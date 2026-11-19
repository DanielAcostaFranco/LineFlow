<script lang="ts">
  import { resolve } from '$app/paths';
  import Button from './Button.svelte';
  import TextField from './TextField.svelte';

  let { role }: { role: 'customer' | 'host' } = $props();
  let submitted = $state(false);
</script>

<section class="mx-auto max-w-md rounded-control border border-line bg-white p-6 sm:p-8">
  <h1 class="text-3xl font-medium tracking-tight">{role === 'customer' ? 'Customer login' : 'Host sign-in'}</h1>
  <p class="mt-3 text-muted">{role === 'customer' ? 'Log in to join the queue.' : 'Sign in to manage your queues.'}</p>
  <form class="mt-6 space-y-5" onsubmit={(event) => { event.preventDefault(); submitted = true; }}>
    <div>
      <TextField id="email" label="Email address" type="email" autocomplete="username" required />
    </div>
    <div>
      <TextField id="password" label="Password" type="password" autocomplete="current-password" required />
    </div>
    <Button type="submit" class="w-full">{role === 'customer' ? 'Log in' : 'Sign in'}</Button>
    <p class="text-sm text-muted" role="status">
      {submitted ? 'Sign-in is not connected yet. Please return once account access is available.' : 'Account access is being prepared.'}
    </p>
  </form>
  <a href={resolve('/')} class="mt-5 inline-flex min-h-11 items-center text-sm underline underline-offset-4">Back to home</a>
</section>
