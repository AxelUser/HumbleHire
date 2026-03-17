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

<div class="mx-auto max-w-5xl px-6 py-10">
  <div class="mb-8 flex items-center justify-between">
    <h1 class="text-3xl font-bold">My CVs</h1>
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
