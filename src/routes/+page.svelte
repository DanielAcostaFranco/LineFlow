<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import QueueTicket from '#lib/components/QueueTicket.svelte';
  import { ticketViews } from '#lib/fixtures.ts';
</script>
<svelte:head><title>LineFlow | Frontend foundation</title></svelte:head>
<div class="grid items-center gap-8 md:grid-cols-2">
  <section>
    {#if page.url.searchParams.get('auth') === 'success'}
      <p role="status" class="mb-4">Signed in successfully.</p>
    {/if}
    <h1 class="text-4xl font-medium tracking-tight">Frontend foundation</h1>
    <p class="mt-4 text-muted">Explore LineFlow’s shared components with a sample queue.</p>
    <a href={resolve('/preview')} class="mt-6 inline-flex min-h-11 items-center rounded-control bg-action px-4 text-white">Open component preview</a>
  </section>
  <div class="rounded-control bg-sage p-4 sm:p-6">
    <QueueTicket queue={ticketViews.success.queue} ticket={ticketViews.success.ticket} />
  </div>
</div>
