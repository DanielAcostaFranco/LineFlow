<script lang="ts">
  let { label }: { label: string } = $props();
</script>
<span class="inline-flex items-center gap-2 rounded-full bg-sage px-3 py-1 text-sm text-action">
  <span aria-hidden="true" class="size-1.5 rounded-full bg-current"></span>{label}
</span>
