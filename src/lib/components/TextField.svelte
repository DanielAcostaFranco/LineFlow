<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  let {
    label,
    id,
    value = $bindable(''),
    error,
    ...props
  }: Omit<HTMLInputAttributes, 'value' | 'id' | 'type'> & {
    id: string;
    label: string;
    value?: string;
    error?: string;
    type?: 'text' | 'email' | 'password';
  } = $props();

  let describedBy = $derived(
    [props['aria-describedby'], error ? id + '-error' : undefined].filter(Boolean).join(' ') || undefined
  );
</script>

<label for={id} class="block text-sm font-medium">{label}</label>
<input
  {...props}
  {id}
  bind:value
  aria-invalid={error ? true : props['aria-invalid']}
  aria-describedby={describedBy}
  class={['mt-2 block min-h-11 w-full rounded-control border border-muted bg-white px-3 py-2', props.class]}
/>
{#if error}
  <p id={id + '-error'} class="mt-1 text-sm text-red-800">{error}</p>
{/if}
