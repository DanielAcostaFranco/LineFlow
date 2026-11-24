<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Button from '#lib/components/Button.svelte';
  import TextField from '#lib/components/TextField.svelte';
  import { normalizeCode } from '#lib/mock-queue-service.ts';

  let code = $state('');
  let error = $state('');

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const key = normalizeCode(code);
    if (!/^[A-Z0-9]{3,12}$/.test(key)) { error = 'Enter the 3–12 letter or number code shown at the counter.'; return; }
    error = '';
    goto(resolve('/join/[code]', { code: key }));
  }
</script>
<svelte:head><title>Find a queue | LineFlow</title></svelte:head>
<section class="mx-auto max-w-md">
  <h1 class="text-3xl font-medium tracking-tight">Find a queue</h1>
  <p class="mt-2 text-muted">Enter the code posted at the business, or open the link they shared.</p>
  <form novalidate onsubmit={submit} class="mt-6 rounded-control border border-line bg-white p-5">
    <TextField id="queue-code" label="Queue code" bind:value={code} {error}
      autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="e.g. CAMPUS" />
    <Button type="submit" class="mt-4 w-full">Find queue</Button>
  </form>
  <p class="mt-4 text-sm text-muted">Demo codes: CAMPUS, FULL, PAUSED, CLOSED, ERROR</p>
</section>
