<script lang="ts">
  import { resolve } from '$app/paths';
  import QueueTicket from '#lib/components/QueueTicket.svelte';
  import { activeTicket } from '#lib/active-ticket.svelte.ts';

  let { data } = $props();
</script>
<svelte:head><title>Your ticket | LineFlow</title></svelte:head>
<section class="mx-auto max-w-md space-y-4">
  <h1 class="text-3xl font-medium tracking-tight">Your ticket</h1>
  {#if activeTicket.current}
    <p class="text-muted">You’re in line, {data.user.name}. Keep this page open.</p>
    <QueueTicket queue={activeTicket.current.queue} ticket={activeTicket.current.ticket} />
  {:else}
    <p class="rounded-control border border-line bg-white p-6">You haven’t joined a queue yet.
      <a href={resolve('/join')} class="underline underline-offset-4">Find a queue</a></p>
  {/if}
</section>
