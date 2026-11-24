<script lang="ts">
  import type { HostQueue } from '#lib/mock-host.svelte.ts';
  import Button from './Button.svelte';
  import StatusBadge from './StatusBadge.svelte';
  let { queue, onmanage }: { queue: HostQueue; onmanage: (queue: HostQueue) => void } = $props();
  const labels = { open: 'Open', paused: 'Paused', closed: 'Closed' };
  let percent = $derived(Math.min(100, Math.round((queue.waitingCount / queue.capacity) * 100)));
</script>

<article aria-labelledby={'queue-' + queue.id} class="flex flex-col rounded-control border border-line bg-white p-5">
  <header class="flex flex-wrap items-start justify-between gap-2">
    <div>
      <h3 id={'queue-' + queue.id} class="font-medium">{queue.name}</h3>
      <p class="text-sm text-muted">Code {queue.id}</p>
    </div>
    <StatusBadge label={labels[queue.status]} />
  </header>
  <p class="mt-4 text-sm"><strong class="text-2xl font-medium tabular-nums">{queue.waitingCount}</strong> / {queue.capacity} waiting</p>
  <div class="mt-2 h-2 rounded-full bg-sage" role="presentation"><div class="h-2 rounded-full bg-action" style={`width:${percent}%`}></div></div>
  <p class="mt-2 text-sm text-muted">{queue.servingCount} being served</p>
  <Button variant="secondary" class="mt-4 self-start" aria-label={'Manage queue ' + queue.name} onclick={() => onmanage(queue)}>Manage queue</Button>
</article>
