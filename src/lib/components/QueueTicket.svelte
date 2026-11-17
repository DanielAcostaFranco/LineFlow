<script lang="ts">
  import type { Queue, QueueTicket } from '#lib/queue.ts';
  import StatusBadge from './StatusBadge.svelte';
  let { queue, ticket }: { queue: Queue; ticket: QueueTicket } = $props();
  const labels = { waiting: 'In line', called: 'Your turn', completed: 'Completed', skipped: 'Skipped', left: 'Left queue' };
</script>

<article aria-label={queue.name + ' ticket'} class="rounded-control border border-line bg-white p-6">
  <header class="flex flex-wrap items-center justify-between gap-2">
    <h2 class="font-medium">{queue.name}</h2><StatusBadge label={labels[ticket.status]} />
  </header>
  {#if ticket.status === 'waiting'}
    <div class="py-7 text-center">
      <strong class="block text-6xl font-medium tabular-nums">{ticket.position ?? '—'}</strong>
      <span>Your place in line</span>
    </div>
  {/if}
  <footer class="mt-3 flex flex-wrap justify-between gap-3 border-t border-dashed border-line pt-4 text-sm text-muted">
    {#if ticket.status === 'waiting' && ticket.estimatedMinutes !== null}
      <span>Estimated wait <strong class="text-ink">~{ticket.estimatedMinutes} min</strong></span>
    {/if}
    <span>Ticket {ticket.number}</span>
  </footer>
</article>
