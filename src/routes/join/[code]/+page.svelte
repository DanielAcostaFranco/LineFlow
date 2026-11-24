<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import Button from '#lib/components/Button.svelte';
  import QueueSummary from '#lib/components/QueueSummary.svelte';
  import { findQueue, isFull, joinQueue } from '#lib/mock-queue-service.ts';
  import type { QueueLookup } from '#lib/queue.ts';
  import { activeTicket } from '#lib/active-ticket.svelte.ts';

  let { data } = $props();

  let lookup = $state<QueueLookup>({ state: 'loading' });
  let joining = $state(false);
  let joinError = $state('');

  async function load(code: string) {
    lookup = { state: 'loading' };
    try {
      const queue = await findQueue(code);
      lookup = queue ? { state: 'found', queue } : { state: 'not-found', code };
    } catch {
      lookup = { state: 'error', message: 'We couldn’t reach LineFlow. Check your connection and try again.' };
    }
  }
  $effect(() => { load(page.params.code ?? ''); });

  // Why a found queue can't be joined (null = joinable)
  let blocked = $derived.by(() => {
    if (lookup.state !== 'found') return null;
    const q = lookup.queue;
    if (q.status === 'closed') return 'This queue is closed for today.';
    if (q.status === 'paused') return 'The host has paused this queue. Check back in a few minutes.';
    if (isFull(q)) return 'This queue is full right now. Try again soon.';
    return null;
  });

  async function join() {
    if (joining || lookup.state !== 'found') return;   // blocks double submit
    joining = true; joinError = '';
    try {
      const ticket = await joinQueue(lookup.queue.id, data.user.id);
      activeTicket.current = { queue: lookup.queue, ticket };
      await goto(resolve('/ticket'));
    } catch (e) {
      joinError = e instanceof Error ? e.message : 'Couldn’t join. Try again.';
      joining = false;
    }
  }
</script>
<svelte:head><title>Join a queue | LineFlow</title></svelte:head>
<section class="mx-auto max-w-md space-y-5" aria-busy={lookup.state === 'loading'}>
  <a href={resolve('/join')} class="text-sm underline underline-offset-4">← Use a different code</a>
  <div aria-live="polite" class="space-y-5">
    {#if lookup.state === 'loading'}
      <p class="rounded-control border border-line bg-white p-6">Finding queue…</p>
    {:else if lookup.state === 'not-found'}
      <div class="rounded-control border border-line bg-white p-6">
        <h1 class="text-xl font-medium">No queue found</h1>
        <p class="mt-2 text-muted">Nothing matches “{lookup.code}”. Check the code and try again.</p>
      </div>
    {:else if lookup.state === 'error'}
      <div class="rounded-control border border-line bg-white p-6">
        <h1 class="text-xl font-medium">Something went wrong</h1>
        <p class="mt-2 text-muted">{lookup.message}</p>
        <Button variant="secondary" class="mt-4" onclick={() => load(page.params.code ?? '')}>Try again</Button>
      </div>
    {:else}
      <h1 class="sr-only">Join {lookup.queue.name}</h1>
      <QueueSummary queue={lookup.queue} />
      <div class="rounded-control border border-line bg-white p-5">
        <p class="text-sm">Joining as <strong>{data.user.name}</strong></p>
        {#if blocked}
          <p class="mt-3 text-sm text-muted">{blocked}</p>
        {:else}
          <Button class="mt-4 w-full" loading={joining} loadingLabel="Joining…" onclick={join}>Join queue</Button>
          {#if joinError}<p role="alert" class="mt-2 text-sm text-red-800">{joinError}</p>{/if}
        {/if}
      </div>
    {/if}
  </div>
</section>
