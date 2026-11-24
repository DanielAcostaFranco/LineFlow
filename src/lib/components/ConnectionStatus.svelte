<script lang="ts">
  import type { Connection } from '#lib/mock-ticket-updates.ts';
  let { connection, lastUpdated }: { connection: Connection; lastUpdated: Date } = $props();
  let time = $derived(lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
</script>

<!-- Never claims "live": the online state only reports when the ticket was last updated. -->
{#if connection === 'online'}
  <p class="text-sm text-muted">Updated {time}</p>
{:else}
  <p role="status" class="rounded-control border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
    <strong>{connection === 'reconnecting' ? 'Reconnecting…' : 'You’re offline.'}</strong>
    Showing your last known place from {time}. It may have changed.
  </p>
{/if}
