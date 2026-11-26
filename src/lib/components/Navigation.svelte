<script lang="ts">
  import { resolve } from '$app/paths';
  import { goto } from '$app/navigation';
  import { authClient } from '#lib/client/auth.ts';

  let { user }: { user: { email: string } | null } = $props();
  let pending = $state(false);
  let message = $state('');

  async function signOut() {
    pending = true;
    message = '';
    try {
      const { error } = await authClient.signOut();
      if (error) {
        message = 'Unable to log out. Please try again.';
        return;
      }
      await goto(resolve('/'), { invalidateAll: true });
    } catch {
      message = 'Unable to log out. Please try again.';
    } finally {
      pending = false;
    }
  }
</script>

<nav aria-label="Main" class="border-b border-line bg-white">
  <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
    <a class="inline-flex min-h-11 items-center gap-2 text-xl font-semibold" href={resolve('/')}>
      <span aria-hidden="true" class="grid size-8 place-content-center justify-items-center gap-1 rounded-control bg-action">
        <i class="h-px w-4 bg-white"></i><i class="h-px w-3 bg-white"></i><i class="h-px w-1.5 bg-white"></i>
      </span>LineFlow
    </a>
    <div class="flex flex-wrap items-center gap-4">
      <a href={resolve('/preview')} class="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Component preview</a>
      {#if user}
        <a href={resolve('/account')} class="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Account</a>
        <button type="button" class="min-h-11 text-sm underline underline-offset-4 disabled:opacity-50" onclick={signOut} disabled={pending}>
          {pending ? 'Logging out…' : 'Log out'}
        </button>
      {:else}
        <a href={resolve('/login')} class="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Log in</a>
        <a href={resolve('/signup')} class="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Sign up</a>
      {/if}
    </div>
  </div>
  {#if message}<p role="alert" class="mx-auto max-w-5xl px-5 pb-3 text-sm text-red-800">{message}</p>{/if}
</nav>
