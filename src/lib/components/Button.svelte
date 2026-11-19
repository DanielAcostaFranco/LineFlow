<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  let {
    variant = 'primary',
    type = 'button',
    loading = false,
    loadingLabel = 'Loading…',
    disabled = false,
    children,
    ...props
  }: HTMLButtonAttributes & {
    variant?: 'primary' | 'secondary';
    loading?: boolean;
    loadingLabel?: string;
  } = $props();
</script>

<button
  {...props}
  {type}
  disabled={disabled || loading}
  aria-busy={loading || props['aria-busy']}
  class={[
    'min-h-11 rounded-control border px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50',
    variant === 'primary' ? 'border-action bg-action text-white' : 'border-line bg-white text-ink',
    props.class
  ]}
>
  {#if loading}
    {loadingLabel}
  {:else}
    {@render children?.()}
  {/if}
</button>
