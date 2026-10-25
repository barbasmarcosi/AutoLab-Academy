import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Automated audits cover the shared shell and critical workflows, not a claim
// that every lesson or the physical training environment is accessible.
for(const view of ['home','diagtransfer','data']){
 test('axe WCAG 2.1 A/AA - '+view,async({page})=>{
  await page.goto('./');
  if(view!=='home')await page.locator('nav.nav button[data-id="'+view+'"]').click();
  await expect(page.locator('#main-content')).toBeVisible();
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 });
}
test('keyboard skip link leads into main content',async({page})=>{
 await page.goto('./');
 await expect(page.locator('#main-content')).toBeVisible();
 // Start keyboard traversal at the document, not an incidental browser focus.
 await page.evaluate(()=>{document.body.tabIndex=-1;document.body.focus();});
 await page.keyboard.press('Tab');
 const skip=page.getByRole('link',{name:'Saltar al contenido principal'});
 await expect(skip).toBeFocused();
 await expect(skip).toBeVisible();
 await page.keyboard.press('Enter');
 await expect(page.locator('#main-content')).toBeFocused();
});
test('change of diagnostic hypothesis retains keyboard focus',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="diagtransfer"]').click();
 await page.locator('[data-action="diagtransfer-start"]').click();
 await page.locator('#diagtransfer-initial').focus();
 const values=await page.locator('#diagtransfer-initial option').evaluateAll(options=>options.map(o=>o.value).filter(Boolean));
 await page.locator('#diagtransfer-initial').selectOption(values[0]);
 await expect(page.locator('#diagtransfer-initial')).toBeFocused();
 await page.locator('[data-action="diagtransfer-lock"]').click();
 await page.locator('#diagtransfer-final').focus();
 await page.locator('#diagtransfer-final').selectOption(values[0]);
 await expect(page.locator('#diagtransfer-final')).toBeFocused();
});
test('navigating sections moves screen reader target into main landmark',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="data"]').click();
 await expect(page.locator('#main-content')).toBeFocused();
 await expect(page.getByRole('heading',{name:'Tu progreso te pertenece'})).toBeVisible();
});
