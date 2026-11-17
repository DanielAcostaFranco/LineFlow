<script lang="ts">
  import Button from './Button.svelte';
  let { title, message, confirmLabel, onconfirm }: {
    title: string; message: string; confirmLabel: string; onconfirm: () => void;
  } = $props();
  let dialog: HTMLDialogElement;
  const titleId = $props.id();
  export function open() { dialog.showModal(); }
  function confirm() { dialog.close(); onconfirm(); }
</script>

<dialog bind:this={dialog} aria-labelledby={titleId} class="m-auto w-[min(24rem,90vw)] rounded-control bg-white p-6 text-ink backdrop:bg-black/40">
  <h2 id={titleId} class="text-xl font-semibold">{title}</h2>
  <p class="mt-2 text-muted">{message}</p>
  <div class="mt-5 flex flex-wrap gap-2">
    <Button variant="secondary" onclick={() => dialog.close()}>Cancel</Button>
    <Button onclick={confirm}>{confirmLabel}</Button>
  </div>
</dialog>
