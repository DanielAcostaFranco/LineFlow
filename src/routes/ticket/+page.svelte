<script lang="ts">
  import { resolve } from '$app/paths';
  import Button from '#lib/components/Button.svelte';
  import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
  import ConnectionStatus from '#lib/components/ConnectionStatus.svelte';
  import QueueTicket from '#lib/components/QueueTicket.svelte';
  import { activeTicket } from '#lib/active-ticket.svelte.ts';
  import { advance, announcements, withStatus, type Connection } from '#lib/mock-ticket-updates.ts';
  import type { QueueTicket as Ticket } from '#lib/queue.ts';

  let { data } = $props();

  let connection = $state<Connection>('online');
  let lastUpdated = $state(new Date());
  let announcement = $state('');
  let shareMessage = $state('');
  let leaveDialog: ConfirmDialog;
  let heading: HTMLHeadingElement;

  let active = $derived(activeTicket.current);
  let canLeave = $derived(active?.ticket.status === 'waiting' || active?.ticket.status === 'called');

  // Every ticket change goes through here so screen readers hear meaningful changes.
  function update(next: Ticket) {
    if (!activeTicket.current) return;
    const before = activeTicket.current.ticket;
    activeTicket.current = { ...activeTicket.current, ticket: next };
    lastUpdated = new Date();
    if (next.status !== before.status) announcement = announcements[next.status];
    else if (next.position !== before.position) announcement = `You are now number ${next.position} in line.`;
  }

  function leave() {
    if (!active) return;
    update(withStatus(active.ticket, 'left'));
    heading.focus();
  }

  async function share() {
    if (!active) return;
    // Entry point only: the full sharing UI belongs to the sharing feature card.
    const url = new URL(resolve('/join/[code]', { code: active.queue.id }), location.origin).href;
    try {
      if (navigator.share) await navigator.share({ title: active.queue.name, url });
      else { await navigator.clipboard.writeText(url); shareMessage = 'Queue link copied.'; }
    } catch {
      shareMessage = 'Couldn’t share. Copy this link: ' + url;
    }
  }
</script>
<svelte:head><title>Your ticket | LineFlow</title></svelte:head>
<section class="mx-auto max-w-md space-y-4">
  <h1 bind:this={heading} tabindex="-1" class="text-3xl font-medium tracking-tight">Your ticket</h1>
  <p class="sr-only" aria-live="polite">{announcement}</p>

  {#if active}
    <ConnectionStatus {connection} {lastUpdated} />
    <QueueTicket queue={active.queue} ticket={active.ticket} stale={connection !== 'online'} />

    <div class="flex flex-wrap gap-2">
      {#if canLeave}
        <Button variant="secondary" onclick={() => leaveDialog.open()}>Leave queue</Button>
      {:else}
        <a href={resolve('/join/[code]', { code: active.queue.id })}
          class="inline-flex min-h-11 items-center rounded-control bg-action px-4 font-medium text-white">Join again</a>
      {/if}
      <Button variant="secondary" onclick={share}>Share queue</Button>
    </div>
    {#if shareMessage}<p role="status" class="text-sm text-muted">{shareMessage}</p>{/if}

    <details class="rounded-control border border-dashed border-line bg-white p-4 text-sm">
      <summary class="cursor-pointer font-medium">Demo controls (mock data)</summary>
      <div class="mt-3 space-y-3">
        <Button variant="secondary" disabled={active.ticket.status !== 'waiting'} onclick={() => update(advance(active.ticket))}>
          Serve the person ahead
        </Button>
        <label class="block">Ticket status
          <select value={active.ticket.status} onchange={(e) => update(withStatus(active.ticket, e.currentTarget.value as Ticket['status']))}
            class="mt-1 block min-h-11 w-full rounded-control border border-muted bg-white px-3">
            <option value="waiting">Waiting</option><option value="called">Called</option>
            <option value="completed">Completed</option><option value="skipped">Skipped</option><option value="left">Left</option>
          </select>
        </label>
        <label class="block">Connection
          <select bind:value={connection} class="mt-1 block min-h-11 w-full rounded-control border border-muted bg-white px-3">
            <option value="online">Online</option><option value="reconnecting">Reconnecting</option><option value="offline">Offline</option>
          </select>
        </label>
      </div>
    </details>
  {:else}
    <p class="rounded-control border border-line bg-white p-6">You haven’t joined a queue yet.
      <a href={resolve('/join')} class="underline underline-offset-4">Find a queue</a></p>
  {/if}
</section>

<ConfirmDialog bind:this={leaveDialog} title="Leave the queue?"
  message="You’ll lose your place in line. Cancel keeps your ticket." confirmLabel="Leave queue" onconfirm={leave} />
