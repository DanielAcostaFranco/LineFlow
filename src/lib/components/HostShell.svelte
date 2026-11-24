<script lang="ts">
  import type { Snippet } from 'svelte';
  let { hostName, onsignout, children }: { hostName: string; onsignout: () => void; children: Snippet } = $props();
  const links = [
    { href: '#overview', label: 'Overview' },
    { href: '#queues', label: 'Queues' },
    { href: '#create-queue', label: 'New queue' }
  ];
</script>

<div class="md:grid md:grid-cols-[13rem_1fr] md:gap-8">
  <!-- Desktop: sidebar. Mobile: compact horizontal bar at the top. -->
  <nav aria-label="Host" class="mb-6 rounded-control border border-line bg-white p-2 md:sticky md:top-4 md:mb-0 md:self-start md:p-4">
    <p class="hidden px-2 text-sm text-muted md:block">Signed in as <strong class="text-ink">{hostName}</strong></p>
    <ul class="flex flex-wrap gap-1 md:mt-4 md:flex-col">
      {#each links as link (link.href)}
        <li><a href={link.href} class="inline-flex min-h-11 items-center whitespace-nowrap rounded-control px-3 text-sm hover:bg-sage md:w-full">{link.label}</a></li>
      {/each}
      <li class="ml-auto md:ml-0 md:mt-4 md:border-t md:border-line md:pt-4">
        <button type="button" onclick={onsignout} class="inline-flex min-h-11 items-center whitespace-nowrap rounded-control px-3 text-sm underline underline-offset-4 md:w-full">Sign out</button>
      </li>
    </ul>
  </nav>
  <div class="min-w-0">{@render children()}</div>
</div>
