<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  let { variant = 'primary', type = 'button', children, ...props }:
    HTMLButtonAttributes & { variant?: 'primary' | 'secondary' } = $props();
</script>

<button {...props} {type}
  class={['min-h-11 rounded-control border px-4 py-2 font-medium disabled:opacity-50',
    variant === 'primary' ? 'border-action bg-action text-white' : 'border-line bg-white text-ink',
    props.class]}>
  {@render children?.()}
</button>
