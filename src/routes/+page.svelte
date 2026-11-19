<script lang="ts">
  import { resolve } from '$app/paths';
  import QueueTicket from '#lib/components/QueueTicket.svelte';
  import { ticketViews } from '#lib/fixtures.ts';
</script>

<svelte:head>
  <title>LineFlow | Your place in line</title>
  <meta name="description" content="Join a queue, track your place, and get your time back with LineFlow." />
</svelte:head>

<div class="grid items-center gap-9 md:grid-cols-2 md:gap-12">
  <section aria-labelledby="home-heading">
    <h1 id="home-heading" class="text-4xl leading-tight font-medium tracking-tight sm:text-5xl lg:text-6xl">
      Your place in line.<br />Your time back.
    </h1>
    <p class="mt-5 text-lg text-muted">Join. Track your place. Arrive on time.</p>
    <div class="mt-7 flex flex-wrap gap-3">
      <a href={resolve('/login')}
        class="inline-flex min-h-11 items-center justify-center gap-3 rounded-control bg-action px-5 py-3 font-medium text-white hover:bg-ink">
        Join the queue <span aria-hidden="true">→</span>
      </a>
      <a href={resolve('/host/login')}
        class="inline-flex min-h-11 items-center justify-center rounded-control border border-line bg-white px-5 py-3 font-medium hover:bg-sage">
        I’m a host
      </a>
    </div>
  </section>
  <figure class="min-w-0 rounded-control bg-sage p-4 sm:p-6">
    <QueueTicket queue={ticketViews.success.queue} ticket={ticketViews.success.ticket} />
    <figcaption class="mt-3 text-center text-sm text-muted">Sample queue</figcaption>
  </figure>
</div>
<footer class="mt-10 flex flex-wrap justify-between gap-3 border-t border-line pt-5 text-sm text-muted sm:mt-16">
  <span>LineFlow</span>
  <span>Less waiting. More living.</span>
</footer>
