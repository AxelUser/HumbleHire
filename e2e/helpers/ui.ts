import type { Locator, Page } from '@playwright/test';

// AUTOSAVE_DEBOUNCE_MS = 1000 — wait a bit longer to be safe
export async function waitForAutosave(page: Page): Promise<void> {
	await page.waitForTimeout(1500);
}

// Use instead of bare page.goto('/') — waits for networkidle so xxhash-wasm and Svelte
// hydration complete before any click events are dispatched.
export async function gotoHome(page: Page): Promise<void> {
	await page.goto('/', { waitUntil: 'networkidle' });
}

// InlineField shows a role=button span when idle; click it to activate the input, then fill.
export async function fillInlineField(
	page: Page,
	placeholder: string,
	value: string
): Promise<void> {
	await page.getByRole('button', { name: placeholder }).click();
	await page.getByPlaceholder(placeholder).fill(value);
}

// Drags a sortable drag handle to a target element.
// TODO: dnd-kit's PointerSensor requires specific pointer event sequences that Playwright's
// dragTo doesn't reliably produce. This needs further investigation.
export async function reorder(page: Page, handle: Locator, target: Locator): Promise<void> {
	await handle.dragTo(target);
	await page.waitForTimeout(500);
}
