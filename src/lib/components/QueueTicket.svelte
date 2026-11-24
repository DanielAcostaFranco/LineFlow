<script lang="ts">
  import type { Queue, QueueTicket } from '#lib/queue.ts';
  import StatusBadge from './StatusBadge.svelte';
  let { queue, ticket, stale = false }: { queue: Queue; ticket: QueueTicket; stale?: boolean } = $props();
  const labels = { waiting: 'In line', called: 'Your turn', completed: 'Completed', skipped: 'Skipped', left: 'Left queue' };
  const messages = {
    called: { title: 'It’s your turn', body: 'Head to the counter now and show this ticket.' },
    completed: { title: 'You’ve been served', body: 'Thanks for using LineFlow.' },
    skipped: { title: 'You were skipped', body: 'You missed your call. Ask a staff member or join the queue again.' },
    left: { title: 'You left the queue', body: 'Your place has been released.' }
  };
  let ahead = $derived(ticket.position === null ? null : Math.max(ticket.position - 1, 0));
</script>

<article aria-label={queue.name + ' ticket'}
  class={['rounded-control border bg-white p-6', ticket.status === 'called' ? 'border-action border-2' : 'border-line']}>
  <header class="flex flex-wrap items-center justify-between gap-2">
    <h2 class="font-medium">{queue.name}</h2><StatusBadge label={labels[ticket.status]} />
  </header>
  {#if ticket.status === 'waiting'}
    <div class="py-7 text-center">
      <strong class="block text-6xl font-medium tabular-nums">{ticket.position ?? '—'}</strong>
      <span>Your place in line</span>
      {#if ahead !== null}
        <p class="mt-2 text-sm text-muted">
          {ahead === 0 ? 'You’re next' : `${ahead} ${ahead === 1 ? 'person' : 'people'} ahead of you`}
        </p>
      {/if}
    </div>
  {:else}
    <div class="py-7 text-center">
      <strong class={['block font-medium', ticket.status === 'called' ? 'text-4xl' : 'text-2xl']}>{messages[ticket.status].title}</strong>
      <p class="mt-2 text-muted">{messages[ticket.status].body}</p>
    </div>
  {/if}
  <footer class="mt-3 flex flex-wrap justify-between gap-3 border-t border-dashed border-line pt-4 text-sm text-muted">
    {#if ticket.status === 'waiting' && ticket.estimatedMinutes !== null}
      <span>{stale ? 'Last known wait' : 'Estimated wait'} <strong class="text-ink">~{ticket.estimatedMinutes} min</strong></span>
    {/if}
    <span>Ticket <strong class={ticket.status === 'called' ? 'text-lg text-ink' : 'text-ink'}>{ticket.number}</strong></span>
  </footer>
</article>
