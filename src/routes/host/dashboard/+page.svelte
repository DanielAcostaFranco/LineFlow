<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Button from '#lib/components/Button.svelte';
  import HostQueueCard from '#lib/components/HostQueueCard.svelte';
  import HostShell from '#lib/components/HostShell.svelte';
  import TextField from '#lib/components/TextField.svelte';
  import {
    createHostQueue, fetchHostQueues, hostSession, validateQueueForm,
    type DashboardMode, type HostQueue
  } from '#lib/mock-host.svelte.ts';

  // Mock session only: send signed-out visitors to the mock host sign-in.
  $effect(() => { if (!hostSession.name) goto(resolve('/host/login')); });

  let mode = $state<DashboardMode>('normal');
  let view = $state<{ state: 'loading' } | { state: 'error' } | { state: 'ready'; queues: HostQueue[] }>({ state: 'loading' });
  let status = $state('');

  async function load() {
    view = { state: 'loading' };
    try { view = { state: 'ready', queues: await fetchHostQueues(mode) }; }
    catch { view = { state: 'error' }; }
  }
  $effect(() => { if (hostSession.name) load(); });

  let queues = $derived(view.state === 'ready' ? view.queues : []);
  let summary = $derived({
    open: queues.filter((q) => q.status === 'open').length,
    waiting: queues.reduce((sum, q) => sum + q.waitingCount, 0),
    serving: queues.reduce((sum, q) => sum + q.servingCount, 0)
  });

  let name = $state('');
  let capacity = $state('');
  let formErrors = $state<{ name?: string; capacity?: string }>({});
  let creating = $state(false);

  async function create(event: SubmitEvent) {
    event.preventDefault();
    if (creating) return;
    formErrors = validateQueueForm(name, capacity, queues);
    if (formErrors.name || formErrors.capacity) {
      document.getElementById(formErrors.name ? 'queue-name' : 'queue-capacity')?.focus();
      return;
    }
    creating = true;
    const queue = await createHostQueue(name.trim(), Number(capacity));
    if (view.state === 'ready') view = { state: 'ready', queues: [...view.queues, queue] };
    status = `${queue.name} created. New queues start closed.`;
    name = ''; capacity = ''; creating = false;
  }

  function signOut() { hostSession.name = null; }
</script>

<svelte:head><title>Host dashboard | LineFlow</title></svelte:head>
{#if hostSession.name}
  <HostShell hostName={hostSession.name} onsignout={signOut}>
    <section id="overview" aria-labelledby="overview-heading">
      <h1 id="overview-heading" class="text-3xl font-medium tracking-tight">Your queues</h1>
      <dl class="mt-5 grid grid-cols-3 gap-3" aria-busy={view.state === 'loading'}>
        {#each [['Open queues', summary.open], ['Waiting', summary.waiting], ['Being served', summary.serving]] as [label, value] (label)}
          <div class="rounded-control border border-line bg-white p-4">
            <dt class="text-sm text-muted">{label}</dt>
            <dd class="text-2xl font-medium tabular-nums">{view.state === 'ready' ? value : '—'}</dd>
          </div>
        {/each}
      </dl>
    </section>

    <section id="queues" aria-labelledby="queues-heading" class="mt-8">
      <h2 id="queues-heading" class="text-xl font-medium">Queues</h2>
      <div aria-live="polite" class="mt-4">
        {#if view.state === 'loading'}
          <p class="rounded-control border border-line bg-white p-6">Loading your queues…</p>
        {:else if view.state === 'error'}
          <div class="rounded-control border border-line bg-white p-6">
            <p>We couldn’t load your queues.</p>
            <Button variant="secondary" class="mt-3" onclick={() => { mode = 'normal'; load(); }}>Try again</Button>
          </div>
        {:else if view.queues.length === 0}
          <p class="rounded-control border border-dashed border-line bg-white p-6">You don’t have any queues yet. Create your first one below.</p>
        {:else}
          <div class="grid gap-4 sm:grid-cols-2">
            {#each view.queues as queue (queue.id)}
              <HostQueueCard {queue} onmanage={(q) => (status = `Queue management for ${q.name} arrives in a later card.`)} />
            {/each}
          </div>
        {/if}
      </div>
      {#if status}<p role="status" class="mt-3 text-sm text-muted">{status}</p>{/if}
    </section>

    <section id="create-queue" aria-labelledby="create-heading" class="mt-8 rounded-control border border-line bg-white p-5">
      <h2 id="create-heading" class="text-xl font-medium">New queue</h2>
      <p class="mt-1 text-sm text-muted">New queues start closed. Open them when you’re ready.</p>
      <form novalidate onsubmit={create} class="mt-4 grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-start">
        <div><TextField id="queue-name" label="Queue name" bind:value={name} error={formErrors.name} /></div>
        <div><TextField id="queue-capacity" label="Capacity" inputmode="numeric" bind:value={capacity} error={formErrors.capacity} /></div>
        <Button type="submit" class="sm:mt-7" loading={creating} loadingLabel="Creating…">Create queue</Button>
      </form>
    </section>

    <details class="mt-8 rounded-control border border-dashed border-line bg-white p-4 text-sm">
      <summary class="cursor-pointer font-medium">Demo controls (mock data)</summary>
      <label class="mt-3 block">Dashboard data
        <select bind:value={mode} onchange={load} class="mt-1 block min-h-11 w-full rounded-control border border-muted bg-white px-3">
          <option value="normal">Sample queues</option><option value="empty">No queues</option><option value="error">Load error</option>
        </select>
      </label>
    </details>
  </HostShell>
{/if}
