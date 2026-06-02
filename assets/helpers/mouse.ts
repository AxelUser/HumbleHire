import type { BrowserContext, Locator, Page } from '@playwright/test';

// Injected as an init script on every page load.  Uses position:fixed +
// clientX/clientY so it stays in the correct viewport spot even on scrolled
// pages, and works before document.body exists (defers to DOMContentLoaded).
const CURSOR_SCRIPT = `(function(){
  function install(){
    if(document.getElementById('__hh_cursor'))return;
    var c=document.createElement('div');
    c.id='__hh_cursor';
    c.style.cssText='position:fixed;pointer-events:none;z-index:2147483647;width:22px;height:22px;background:rgba(255,214,0,0.92);border:2.5px solid #000;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 2.5px rgba(255,255,255,0.75);display:none;transition:width 80ms,height 80ms';
    document.body.appendChild(c);
    var r=document.createElement('div');
    r.id='__hh_ripple';
    r.style.cssText='position:fixed;pointer-events:none;z-index:2147483646;width:22px;height:22px;border:2.5px solid rgba(220,40,40,0.9);border-radius:50%;transform:translate(-50%,-50%) scale(1);opacity:0;display:none';
    document.body.appendChild(r);
    document.addEventListener('mousemove',function(e){
      c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';
      r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';
      if(c.style.display!=='block')c.style.display='block';
    },{passive:true});
    document.addEventListener('mousedown',function(){
      c.style.width='14px';c.style.height='14px';
      r.style.display='block';r.style.transition='none';
      r.style.opacity='0.85';r.style.transform='translate(-50%,-50%) scale(1)';
      requestAnimationFrame(function(){
        r.style.transition='transform 350ms ease-out,opacity 350ms ease-out';
        r.style.transform='translate(-50%,-50%) scale(3)';r.style.opacity='0';
      });
    },{passive:true});
    document.addEventListener('mouseup',function(){
      c.style.width='22px';c.style.height='22px';
      setTimeout(function(){if(r.style.display!=='none')r.style.display='none';},380);
    },{passive:true});
  }
  if(document.readyState!=='loading'){install();}
  else{document.addEventListener('DOMContentLoaded',install);}
})();`;

export async function injectCursor(context: BrowserContext): Promise<void> {
	await context.addInitScript({ content: CURSOR_SCRIPT });
}

// Park the cursor at a neutral corner so it becomes visible before the first
// real interaction and subsequent moves start from a consistent position.
export async function activateCursor(page: Page): Promise<void> {
	await page.mouse.move(80, 80, { steps: 3 });
}

export async function moveTo(page: Page, locator: Locator, steps = 40): Promise<void> {
	const box = await locator.boundingBox();
	if (!box) return;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps });
}

export async function hoverAndClick(page: Page, locator: Locator): Promise<void> {
	await moveTo(page, locator);
	await page.waitForTimeout(450);
	await locator.click();
}
