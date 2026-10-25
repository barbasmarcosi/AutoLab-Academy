import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// WCAG 1.4.10 reflow: 320 CSS pixels approximates 400% zoom at
// 1280 CSS pixels. This is browser viewport emulation, not a native
// pinch-zoom or accessibility zoom validation on a physical iPhone.
for(const width of [320,640]){
 test('reflow sin scroll horizontal del documento a '+width+' px',async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto('./');
  for(const view of ['home','exams','diagtransfer','labs','portfolio','data']){
   if(view!=='home')await page.locator('nav.nav button[data-id="'+view+'"]').click();
   await expect(page.locator('#main-content')).toBeVisible();
   const metrics=await page.evaluate(()=>({
    documentWidth:document.documentElement.scrollWidth,
    viewportWidth:document.documentElement.clientWidth
   }));
   expect(metrics.documentWidth,view+' causes horizontal document scroll').toBeLessThanOrEqual(metrics.viewportWidth+1);
   if(view==='home'){
    const nav=await page.locator('.nav').evaluate(el=>({clientWidth:el.clientWidth,scrollWidth:el.scrollWidth}));
    expect(nav.clientWidth).toBeLessThanOrEqual(width);
    expect(nav.scrollWidth).toBeGreaterThan(nav.clientWidth);
   }
  }
  await page.locator('nav.nav button[data-id="labs"]').click();
  await page.locator('[data-action="lab-mode"][data-id="bms"]').click();
  const metrics=await page.evaluate(()=>({outer:document.documentElement.scrollWidth,inner:document.documentElement.clientWidth}));
  expect(metrics.outer).toBeLessThanOrEqual(metrics.inner+1);
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(audit.violations.map(v=>v.id)).toEqual([]);
 });
}
