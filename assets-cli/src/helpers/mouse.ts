import type { BrowserContext, Locator, Page } from 'playwright';

// A bespoke Neo-Brutalism cursor for the documentation captures: a chunky
// yellow pointer arrow with a thick black outline and a hard offset shadow,
// matching the app's `--shadow-brutal` treatment. It bounce-scales from its
// own tip on click and is driven by eased, time-based motion so the recordings
// feel deliberate rather than robotic. We render and animate it ourselves
// instead of leaning on `mouse-helper` so styling and timing are fully ours.

// The pointer geometry has its tip at (0,0) so the cursor div can sit exactly
// at clientX/clientY with transform-origin at the corner — the tip stays pinned
// while the arrow scales during the click bounce.
const CURSOR_FILL = '#FFD400';
const CURSOR_SVG = `<svg width="26" height="38" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(2.5px 2.5px 0 rgba(0,0,0,0.92))">
  <path d="M0 0 L0 19 L4.6 14.6 L7.8 21.6 L11.1 20 L7.9 13.2 L14 13.2 Z" fill="${CURSOR_FILL}" stroke="#000" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

// Injected as an init script on every page load. The cursor is appended to
// <html> (not <body>) on purpose: the zoom helper scales <body>, and a
// position:fixed element keeps viewport coordinates only while none of its
// ancestors are transformed. Living on <html> keeps the cursor aligned with
// where Playwright actually clicks even while the page is zoomed.
const CURSOR_SCRIPT = `(function(){
  function install(){
    if(document.getElementById('__hh_cursor'))return;
    var root=document.documentElement;
    var c=document.createElement('div');
    c.id='__hh_cursor';
    c.style.cssText='position:fixed;left:0;top:0;pointer-events:none;z-index:2147483647;transform-origin:0 0;transform:scale(1);display:none';
    c.innerHTML=${JSON.stringify(CURSOR_SVG)};
    root.appendChild(c);
    document.addEventListener('mousemove',function(e){
      c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';
      if(c.style.display!=='block')c.style.display='block';
    },{passive:true});
    document.addEventListener('mousedown',function(){
      c.style.transition='transform 90ms cubic-bezier(0.4,0,1,1)';
      c.style.transform='scale(0.78)';
    },{passive:true});
    document.addEventListener('mouseup',function(){
      c.style.transition='transform 300ms cubic-bezier(0.34,1.56,0.64,1)';
      c.style.transform='scale(1)';
    },{passive:true});
  }
  if(document.readyState!=='loading'){install();}
  else{document.addEventListener('DOMContentLoaded',install);}
})();`;

export async function injectCursor(context: BrowserContext): Promise<void> {
	await context.addInitScript({ content: CURSOR_SCRIPT });
}

// Playwright exposes no "current mouse position", so we remember where each page
// left its cursor to drive eased moves from the real starting point.
const lastPos = new WeakMap<Page, { x: number; y: number }>();

const PARK_POS = { x: 80, y: 80 };

const easeInOutCubic = (t: number): number =>
	t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export interface MoveOptions {
	// Total wall-clock time the move should take. Longer reads as calmer.
	durationMs?: number;
	// Number of intermediate samples along the eased path.
	steps?: number;
	easing?: (t: number) => number;
}

// Park the cursor at a neutral corner so it becomes visible before the first
// real interaction and subsequent moves start from a consistent position.
export async function activateCursor(page: Page): Promise<void> {
	await page.mouse.move(PARK_POS.x, PARK_POS.y, { steps: 3 });
	lastPos.set(page, { ...PARK_POS });
}

// Move the cursor to an absolute viewport point along an eased, timed path so
// the recording shows natural acceleration and settling.
export async function moveCursor(
	page: Page,
	x: number,
	y: number,
	{ durationMs = 650, steps = 36, easing = easeInOutCubic }: MoveOptions = {}
): Promise<void> {
	const from = lastPos.get(page) ?? { ...PARK_POS };
	const frameDelay = Math.max(0, Math.round(durationMs / steps));

	for (let i = 1; i <= steps; i++) {
		const t = easing(i / steps);
		const nx = from.x + (x - from.x) * t;
		const ny = from.y + (y - from.y) * t;
		await page.mouse.move(nx, ny);
		if (frameDelay) await page.waitForTimeout(frameDelay);
	}

	lastPos.set(page, { x, y });
}

export async function moveTo(page: Page, locator: Locator, opts: MoveOptions = {}): Promise<void> {
	await locator.scrollIntoViewIfNeeded();
	const box = await locator.boundingBox();
	if (!box) return;
	await moveCursor(page, box.x + box.width / 2, box.y + box.height / 2, opts);
}

export interface ClickOptions extends MoveOptions {
	// Pause after arriving, before the click fires — lets the viewer register the target.
	settleMs?: number;
}

export async function hoverAndClick(
	page: Page,
	locator: Locator,
	{ settleMs = 450, ...move }: ClickOptions = {}
): Promise<void> {
	await moveTo(page, locator, move);
	if (settleMs) await page.waitForTimeout(settleMs);
	await locator.click();
	// `moveTo` already left our tracked position on the element's centre; we don't
	// re-query here because a click often mutates or removes the element (e.g. a
	// placeholder button turning into a textarea), which would throw.
}
