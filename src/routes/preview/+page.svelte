<script lang="ts">
  import Button from '#lib/components/Button.svelte';
  import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
  import QueueTicket from '#lib/components/QueueTicket.svelte';
  import TextField from '#lib/components/TextField.svelte';
  import { queue, ticketViews } from '#lib/fixtures.ts';
  import type { TicketView } from '#lib/queue.ts';

  let previewState = $state<TicketView['state']>('success');
  let view = $derived(ticketViews[previewState]);
  let code = $state(queue.id);
  let feedback = $state('');
  let dialog: ConfirmDialog;

  function findTicket() {
    feedback = code.trim().toUpperCase() === queue.id ? '' : 'Use CAMPUS to preview a ticket.';
    previewState = feedback ? 'error' : 'success';
  }
</script>
<svelte:head><title>Component preview | LineFlow</title></svelte:head>
<h1 class="text-3xl font-medium tracking-tight">Component preview</h1>
<div class="mt-6 grid items-start gap-6 md:grid-cols-2">
  <section class="space-y-5 rounded-control border border-line bg-white p-5">
    <form onsubmit={(event) => { event.preventDefault(); findTicket(); }}>
      <TextField id="code" label="Sample queue code" bind:value={code} error={feedback} />
      <Button type="submit" class="mt-3">Find sample ticket</Button>
    </form>
    <label class="block text-sm font-medium">Preview state
      <select bind:value={previewState} onchange={() => feedback = ''} class="mt-2 block min-h-11 w-full rounded-control border border-muted bg-white px-3">
        <option value="success">Success</option><option value="loading">Loading</option>
        <option value="empty">Empty</option><option value="error">Error</option>
      </select>
    </label>
  </section>
  <section aria-label="Ticket preview" class="space-y-4">
    <div aria-live="polite">
      {#if view.state === 'success'}
        <QueueTicket queue={view.queue} ticket={view.ticket} />
      {:else}
        <p class="rounded-control border border-line bg-white p-6">
          {view.state === 'error' ? view.message : view.state === 'loading' ? 'Loading ticket…' : 'No active ticket.'}
        </p>
      {/if}
    </div>
    {#if previewState === 'success'}
      <Button variant="secondary" onclick={() => dialog.open()}>Leave sample queue</Button>
    {:else if previewState === 'error'}
      <Button variant="secondary" onclick={() => { code = queue.id; findTicket(); }}>Retry sample queue</Button>
    {/if}
  </section>
</div>
<ConfirmDialog bind:this={dialog} title="Leave the queue?" message="Leaving gives up your place in this sample queue."
  confirmLabel="Leave queue" onconfirm={() => previewState = 'empty'} />
