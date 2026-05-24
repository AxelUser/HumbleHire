# AGENTS.md

## Project Overview

HumbleHire is a local-first, git-inspired CV builder with versioning support built with Svelte 5, SvelteKit (static adapter), Shadcn-Svelte, TailwindCSS.

See docs/OVERVIEW.md for the project overview to understand the main ideas and goals.
See docs/CODESTYLE.md for the full coding style guide and conventions that should be followed when writing code.
See docs/WEB_DESIGN.md for the web design principles and conventions that should be followed when designing the web interface.

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build (static)
pnpm check        # svelte-check (type errors)
pnpm lint         # prettier + eslint
pnpm format       # auto-format
pnpm test:unit    # vitest (watch mode)
pnpm test:e2e     # playwright
pnpm dlx shadcn-svelte@next add <component> # add a shadcn-svelte component
```

Always use `pnpm`, never `npm`.

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

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`github.com/AxelUser/HumbleHire`). See `docs/agents/issue-tracker.md`.

### Triage labels

Using the five canonical label strings (no custom mapping). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. No `CONTEXT.md` yet — create it at the root when ready. ADRs live in `docs/decisions/`. See `docs/agents/domain.md`.
