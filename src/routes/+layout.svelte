<script lang="ts">
  import '../app.css';
  import Navigation from '#lib/components/Navigation.svelte';
  let { children } = $props();
</script>

<a href="#main" class="sr-only bg-white p-2 focus:not-sr-only">Skip to content</a>
<Navigation />
<main id="main" tabindex="-1" class="mx-auto max-w-5xl px-5 py-10 sm:py-16">
  {@render children()}
</main>
