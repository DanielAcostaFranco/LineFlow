<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<nav aria-label="Main" class="border-b border-line bg-white">
  <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
    <a class="inline-flex min-h-11 items-center gap-2 text-xl font-semibold" href={resolve('/')}>
      <span aria-hidden="true" class="grid size-8 place-content-center justify-items-center gap-1 rounded-control bg-action">
        <i class="h-px w-4 bg-white"></i><i class="h-px w-3 bg-white"></i><i class="h-px w-1.5 bg-white"></i>
      </span>LineFlow
    </a>
    <a href={resolve('/preview')} class="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Component preview</a>
  </div>
</nav>
