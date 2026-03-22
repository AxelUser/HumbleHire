# Code Style

## Component file naming

Svelte component files use **kebab-case**:

```
full-name-block.svelte   ✓
FullNameBlock.svelte     ✗
```

## Component directory naming

Each component lives in its own directory, named in kebab-case matching the component:

```
src/lib/components/ui/block-wrapper/block-wrapper.svelte
src/lib/components/blocks/full-name-block.svelte
```

## Barrel exports

Every component directory must have an `index.ts` that re-exports its components. Consumers always import from the directory, not the file directly:

```ts
// ✓
import { BlockWrapper } from '$lib/components/ui/block-wrapper';
import { FullNameBlock, PositionBlock } from '$lib/components/blocks';

// ✗
import BlockWrapper from '$lib/components/ui/block-wrapper/block-wrapper.svelte';
import FullNameBlock from '$lib/components/blocks/full-name-block.svelte';
```

Exports in `index.ts` use named exports (not default), and component names remain PascalCase:

```ts
export { default as BlockWrapper } from './block-wrapper.svelte';
export { default as FullNameBlock } from './full-name-block.svelte';
```

## TypeScript files

Plain TypeScript files use kebab-case:

```
cv.ts
utils.ts
```

## Svelte module stores

Svelte module files (`.svelte.ts`) use kebab-case:

```
cv.svelte.ts
```
