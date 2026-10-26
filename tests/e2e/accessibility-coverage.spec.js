import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function audit(page,label){
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(results.violations.map(v=>({
  id:v.id,impact:v.impact,
  nodes:v.nodes.slice(0,12).map(n=>n.target.join(' '))
 })),label).toEqual([]);
}

// The three initial sections remain in accessibility.spec.js.
const views=[
 'learn','path','coach','exams','analytics','challenges','transfer',
 'cases','ecu','differential','temporal','fuel','misfire','integrative',
 'portfolio','resources','labs'
];
for(const view of views){
 test('WCAG 2.1 A/AA section '+view,async({page})=>{
  await page.goto('./');
  await page.locator('nav.nav button[data-action="nav"][data-id="'+view+'"]').click();
  await expect(page.locator('#main-content > h1')).toBeVisible();
  await audit(page,'section '+view);
 });
}
for(const mode of ['can','wave','components','bms','circuit']){
 test('WCAG 2.1 A/AA lab '+mode,async({page})=>{
  await page.goto('./');
  await page.locator('nav.nav button[data-id="labs"]').click();
  await page.locator('[data-action="lab-mode"][data-id="'+mode+'"]').click();
  await expect(page.getByRole('heading',{name:'Instrumentación y simulación'})).toBeVisible();
  await audit(page,'lab '+mode);
 });
}
test('WCAG 2.1 A/AA investigación en curso con formularios',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="diagtransfer"]').click();
 await page.locator('[data-action="diagtransfer-start"]').click();
 await audit(page,'diagnóstico inicial');
 await page.locator('#diagtransfer-initial').selectOption({index:1});
 await page.locator('[data-action="diagtransfer-lock"]').click();
 await audit(page,'diagnóstico con instrumentos y campos de texto');
});
test('WCAG 2.1 A/AA examen con radios y confianza',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="exams"]').click();
 const button=page.locator('[data-action="start-exam"]:not([disabled])').first();
 await expect(button).toBeVisible();
 await button.click();
 await expect(page.locator('fieldset')).toHaveCount(2);
 await audit(page,'examen de conocimiento');
});

test('WCAG 2.1 A/AA Rotary Geometry Explorer y laboratorio A/B',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="rotary"]').click();
 await expect(page.getByRole('heading',{name:'Rotary Geometry Explorer'})).toBeVisible();
 await audit(page,'RW0/RW1 experimental, diagramas SVG y formularios de predicción');
});
