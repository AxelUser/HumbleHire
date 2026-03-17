<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { db } from '$lib/db/index';
  import { CvList, NewCvButton } from '$lib/components/dashboard';
  import { Skeleton } from '$lib/components/ui/skeleton';

  import type { CV } from '$lib/types/cv';

  let cvs = $state<CV[]>([]);
  let loading = $state(true);

  onMount(async () => {
    cvs = await db.cvs.orderBy('updatedAt').reverse().toArray();
    loading = false;
  });

  async function handleDelete(id: string) {
    await db.cvs.delete(id);
    cvs = cvs.filter((cv) => cv.id !== id);
  }

  function handleCreate(id: string) {
    goto(resolve(`/cv/${id}`));
  }
</script>

<!-- Motivation header -->
<div class="border-b-2 border-foreground bg-card px-6 py-10">
  <div class="mx-auto max-w-5xl">
    <div class="mb-3 inline-flex items-center gap-1.5 border-2 border-accent px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-accent">
      ✦ Your job search, tracked
    </div>
    <h1 class="mb-2 text-4xl font-extrabold tracking-tight">
      Build CVs with <em class="not-italic text-accent">quiet</em> confidence.
    </h1>
    <p class="text-base font-medium text-muted-foreground">
      Every application is practice. Keep showing up — the right role is a revision away.
    </p>
  </div>
</div>

<!-- Dashboard content -->
<div class="mx-auto max-w-5xl px-6 py-10">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <p class="mb-1 text-xs font-bold uppercase tracking-widest text-accent">↳ Your CVs</p>
      <h2 class="text-2xl font-extrabold tracking-tight">Dashboard</h2>
    </div>
    <NewCvButton onCreate={handleCreate} />
  </div>

  {#if loading}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each { length: 3 } as _, i (i)}
        <Skeleton class="h-48 w-full rounded-none" />
      {/each}
    </div>
  {:else}
    <CvList {cvs} onDelete={handleDelete} />
  {/if}
</div>
