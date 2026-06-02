# AGENTS.md

## Project Overview

HumbleHire is a local-first CV builder built with Svelte 5, SvelteKit (static adapter), Shadcn-Svelte, TailwindCSS.

See `docs/OVERVIEW.md` for the project overview (Explanation), `docs/SCOPE.md` for what's in and out of scope (Reference), and `docs/features/<name>/OVERVIEW.md` for per-feature explanations.
See `docs/CODESTYLE.md` for the full coding style guide and conventions that should be followed when writing code.
See `docs/WEB_DESIGN.md` for the web design principles and conventions that should be followed when designing the web interface.

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

- Each feature has a corresponding user-facing explanation in `docs/features/[name]/OVERVIEW.md`
- Each feature has a corresponding implementation design in `docs/features/[name]/DESIGN.md`
- ADRs are in `docs/decisions/` — always check these before suggesting architecture changes

## Suggested Flow for Each New Feature

1. Update top-level `docs/OVERVIEW.md` if the feature changes the product shape
2. Create `docs/features/[name]/OVERVIEW.md` — write the user-facing explanation before touching code
3. Create `docs/features/[name]/DESIGN.md` — implementation design before touching code
4. Identify decisions you already know you're making → write ADRs
5. Open a coding session with the feature OVERVIEW and DESIGN as context
6. As you build, capture unexpected decisions as new ADRs in `docs/decisions/`
7. Build the feature

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`github.com/AxelUser/HumbleHire`). See `docs/agents/issue-tracker.md`.

### Triage labels

Using the five canonical label strings (no custom mapping). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. `CONTEXT.md` lives at the repo root and holds the shared vocabulary. ADRs live in `docs/decisions/`. See `docs/agents/domain.md`.
