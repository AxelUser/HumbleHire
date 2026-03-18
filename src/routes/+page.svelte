<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { db } from '$lib/db/index';
  import { CvList, NewCvButton } from '$lib/components/dashboard';
  import { Skeleton } from '$lib/components/ui/skeleton';

  import type { CV } from '$lib/types/cv';
  import { mode } from 'mode-watcher';

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

<!-- Hero -->
<div class="border-b-2 border-foreground bg-card px-6 py-10">
  <div class="mx-auto max-w-5xl">
    <div class="flex flex-col gap-10 md:flex-row md:items-center">
      <!-- Left: text -->
      <div class="flex-1">
        <div class="mb-5">
          <img src={mode.current === 'dark' ? '/logo/humblehire_logo_dark.avif' : '/logo/humblehire_logo_light.avif'} alt="HumbleHire" class="h-20 w-auto" />
        </div>
        <div
          class="mb-3 inline-flex items-center gap-1.5 border-2 border-accent px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-accent"
        >
          ✦ Version controlled
        </div>
        <h1 class="mb-2 text-4xl font-extrabold tracking-tight">
          One CV. <em class="not-italic text-accent">Many targets.</em>
        </h1>
        <p class="text-base font-medium text-muted-foreground">
          Fork your master, tweak it per job, and always know which version went where.
        </p>
      </div>

      <!-- Right: feature panel grid -->
      <div class="w-full md:w-[420px] shrink-0">
        <div class="grid grid-cols-2 gap-3" style="grid-template-rows: auto auto;">
          <!-- Panel A: Branch (full width) -->
          <div
            class="col-span-2 border-2 border-foreground bg-background shadow-brutal p-4 overflow-hidden"
          >
            <p class="mb-1 text-xs font-bold uppercase tracking-widest text-accent">↳ Branch</p>
            <p class="mb-3 text-sm font-extrabold">One master. Many variants.</p>
            <div class="branch-diagram relative flex flex-col gap-2 text-xs font-mono">
              <div class="branch-node node-master flex items-center gap-2">
                <span class="node-dot h-3 w-3 rounded-full border-2 border-foreground bg-accent shrink-0"></span>
                <span class="font-bold">Master CV</span>
              </div>
              <div class="branch-children ml-1.5 flex flex-col gap-2 border-l-2 border-foreground pl-3">
                <div class="branch-node node-child1 flex items-center gap-2">
                  <span class="node-dot h-2.5 w-2.5 rounded-full border-2 border-foreground bg-card shrink-0"></span>
                  <span>Google SWE ↗</span>
                </div>
                <div class="branch-node node-child2 flex items-center gap-2">
                  <span class="node-dot h-2.5 w-2.5 rounded-full border-2 border-foreground bg-card shrink-0"></span>
                  <span>Amazon IC5 ↗</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel B: History -->
          <div class="border-2 border-foreground bg-background shadow-brutal p-4 overflow-hidden">
            <p class="mb-1 text-xs font-bold uppercase tracking-widest text-accent">↳ History</p>
            <p class="mb-3 text-sm font-extrabold">Every save, tracked.</p>
            <div class="flex flex-col text-xs font-mono">
              <div class="history-entry entry-1 flex items-start gap-2">
                <div class="flex flex-col items-center">
                  <span class="h-2.5 w-2.5 rounded-full border-2 border-foreground bg-accent shrink-0"></span>
                  <span class="h-4 w-0.5 bg-foreground/30"></span>
                </div>
                <span class="leading-tight">v3 · just now</span>
              </div>
              <div class="history-entry entry-2 flex items-start gap-2">
                <div class="flex flex-col items-center">
                  <span class="h-2.5 w-2.5 rounded-full border-2 border-foreground bg-card shrink-0"></span>
                  <span class="h-4 w-0.5 bg-foreground/30"></span>
                </div>
                <span class="leading-tight">v2 · 1h ago</span>
              </div>
              <div class="history-entry entry-3 flex items-start gap-2">
                <div class="flex flex-col items-center">
                  <span class="h-2.5 w-2.5 rounded-full border-2 border-foreground bg-card shrink-0"></span>
                </div>
                <span class="leading-tight">v1 · yesterday</span>
              </div>
            </div>
          </div>

          <!-- Panel C: Local-first -->
          <div class="border-2 border-foreground bg-background shadow-brutal p-4 overflow-hidden flex flex-col">
            <p class="mb-1 text-xs font-bold uppercase tracking-widest text-accent">↳ Local-first</p>
            <p class="mb-3 text-sm font-extrabold">Your data. Your machine.</p>
            <div class="flex flex-1 flex-col items-center justify-center gap-2">
              <div class="local-icon relative flex h-12 w-12 items-center justify-center border-2 border-foreground bg-card">
                <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="0" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                <div class="check-badge absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center border-2 border-foreground bg-accent text-background">
                  <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>
              <p class="text-center text-xs font-bold">No account. No cloud.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Dashboard content -->
<div class="px-6 py-10">
  <div class="mx-auto max-w-5xl flex flex-col gap-6">
    <!-- Toolbar bar -->
    <div
      class="flex items-center justify-between border-2 border-foreground bg-card shadow-brutal px-6 py-4"
    >
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-accent">↳ Your CVs</p>
        <h2 class="text-2xl font-extrabold tracking-tight">Dashboard</h2>
      </div>
      <NewCvButton onCreate={handleCreate} />
    </div>

    <!-- CV grid -->
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
</div>

<style>
  /* Branch diagram staggered fade-in */
  .branch-node {
    opacity: 0;
    animation: fadeSlideUp 0.4s ease forwards;
  }
  .node-master { animation-delay: 0.1s; }
  .node-child1 { animation-delay: 0.3s; }
  .node-child2 { animation-delay: 0.5s; }

  /* History entries staggered */
  .history-entry {
    opacity: 0;
    animation: fadeSlideUp 0.4s ease forwards;
  }
  .entry-1 { animation-delay: 0.1s; }
  .entry-2 { animation-delay: 0.25s; }
  .entry-3 { animation-delay: 0.4s; }

  /* Local-first check pulse */
  .check-badge {
    animation: pulse 2s ease-in-out infinite;
    animation-delay: 0.8s;
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.15); }
  }
</style>
