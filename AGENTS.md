# HumbleHire - Agent Context

## Project Overview

A local-first, git-inspired CV builder with versioning support built with Svelte 5, SvelteKit (static adapter), Shadcn-Svelte, TailwindCSS.

## Build & Test

- Install: `pnpm install`
- Dev: `pnpm dev`
- Test: `pnpm test`
- Lint: `pnpm lint:fix`
- Format: `pnpm format`

## Key conventions

- Each feature has a corresponding spec in `docs/features/[name]/PRD.md`
- Each feature has a corresponding implementation design in `docs/features/[name]/DESIGN.md`
- ADRs are in `docs/decisions/` - always check these before suggesting architecture changes

## Suggested Flow for Each New Feature

1. Update top-level OVERVIEW.md if the feature changes the product vision
2. Create docs/features/[name]/PRD.md - write the spec before touching code
3. Create docs/features/[name]/DESIGN.md - implementation design the feature before touching code
4. Identify decisions you already know you're making → write ADRs
5. Open a coding session with the feature PRD and DESIGN as context
6. As you build, capture unexpected decisions as new ADRs in docs/decisions/
7. Build the feature using
