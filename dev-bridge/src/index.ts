// The dev bridge contract: the seam between the running HumbleHire app and any
// out-of-process Playwright consumer (the e2e suite, the docs-asset harness).
//
// The app injects `window.__devBridge` when built with VITE_DEV_BRIDGE; this module owns
// the shape of that bridge plus the `useBridge` adapter that drives it over a
// page handle. Both the e2e suite and the docs-asset harness import from here,
// and the app's own `initDevBridge` implements against these same types — so the
// contract lives in exactly one place.

// What `useBridge` needs from a Playwright Page — only `evaluate` and
// `waitForFunction`. Typed structurally so the contract carries no dependency on
// a specific Playwright version: a Page from `@playwright/test` (e2e) and one
// from `playwright` (the harness) both satisfy it regardless of which minor each
// consumer pins.
export interface BridgePage {
	evaluate<R, A>(pageFunction: (arg: A) => R | Promise<R>, arg: A): Promise<R>;
	evaluate<R>(pageFunction: () => R | Promise<R>): Promise<R>;
	waitForFunction(
		pageFunction: () => unknown,
		arg?: unknown,
		options?: { timeout?: number }
	): Promise<unknown>;
}

// Plain JSON values for any of the nine blocks. The in-page bridge applies this
// patch on top of a `createDummyCV()` skeleton, mints object IDs, and recomputes
// block hashes — so the result is a fully valid, hash-consistent CV.
export interface MasterSeedContent {
	fullName?: string;
	position?: string;
	location?: string;
	contacts?: Array<{ label: string; value: string }>;
	highlights?: Array<{ text: string }>;
	skills?: Array<{ name: string; skills: string[] }>;
	jobHistory?: Array<{
		company: string;
		role: string;
		startDate?: string;
		endDate?: string;
		current?: boolean;
		achievements?: Array<{ text: string }>;
		skills?: string[];
	}>;
	projects?: Array<{
		name: string;
		description: string;
		stack?: string[];
		link?: string;
	}>;
	education?: Array<{
		institution: string;
		degree: string;
		startDate?: string;
		endDate?: string;
		current?: boolean;
	}>;
}

export interface DevBridge {
	reset(): Promise<void>;
	seedMaster(overrides?: { name?: string; content?: MasterSeedContent }): Promise<string>;
	seedTailored(masterId: string, opts?: { name?: string; company?: string }): Promise<string>;
	patchMaster(
		id: string,
		textPatches: { fullName?: string; position?: string; location?: string }
	): Promise<void>;
	seedOrphanedTailored(opts?: { name?: string }): Promise<string>;
	getCv(id: string): Promise<unknown>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Wait for the app to attach the bridge, then return a same-shaped object whose
// calls hop into the page. Every method is a thin `page.evaluate` round-trip so
// the seeding runs through the app's real constructors, not hand-rolled fixtures.
export async function useBridge(page: BridgePage): Promise<DevBridge> {
	await page.waitForFunction(() => !!(window as any).__devBridge, undefined, { timeout: 5000 });
	return {
		reset: () => page.evaluate(() => (window as any).__devBridge.reset()),
		seedMaster: (o) => page.evaluate((o) => (window as any).__devBridge.seedMaster(o), o),
		seedTailored: (id, o) =>
			page.evaluate(({ id, o }) => (window as any).__devBridge.seedTailored(id, o), { id, o }),
		patchMaster: (id, p) =>
			page.evaluate(({ id, p }) => (window as any).__devBridge.patchMaster(id, p), { id, p }),
		seedOrphanedTailored: (o) =>
			page.evaluate((o) => (window as any).__devBridge.seedOrphanedTailored(o), o),
		getCv: (id) => page.evaluate((id) => (window as any).__devBridge.getCv(id), id)
	};
}
/* eslint-enable @typescript-eslint/no-explicit-any */
