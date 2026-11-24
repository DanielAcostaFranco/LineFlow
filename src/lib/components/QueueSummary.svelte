<script lang="ts">
  import type { Queue } from '#lib/queue.ts';
  import { estimateMinutes, isFull } from '#lib/mock-queue-service.ts';
  import StatusBadge from './StatusBadge.svelte';
  let { queue }: { queue: Queue } = $props();
  const labels = { open: 'Open', paused: 'Paused', closed: 'Closed' };
  let label = $derived(queue.status === 'open' && isFull(queue) ? 'Full' : labels[queue.status]);
</script>

<article aria-labelledby="queue-name" class="rounded-control border border-line bg-white p-6">
  <p class="text-sm text-muted">{queue.organization}</p>
  <header class="mt-1 flex flex-wrap items-center justify-between gap-2">
    <h2 id="queue-name" class="text-2xl font-medium">{queue.name}</h2>
    <StatusBadge {label} />
  </header>
  <dl class="mt-5 grid grid-cols-2 gap-4 border-t border-dashed border-line pt-4 text-sm">
    <div><dt class="text-muted">In line</dt><dd class="text-lg font-medium tabular-nums">{queue.waitingCount} / {queue.capacity}</dd></div>
    <div><dt class="text-muted">Estimated wait</dt><dd class="text-lg font-medium tabular-nums">~{estimateMinutes(queue)} min</dd></div>
  </dl>
</article>
