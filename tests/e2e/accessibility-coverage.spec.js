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

test('WCAG 2.1 AA RW4 differential investigation',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="rotary-seals"]').click();
 await expect(page.getByRole('heading',{name:'Rotary Diagnostic Research'})).toBeVisible();
 await audit(page,'RW4 research');
 await page.getByRole('button',{name:'Crear caso reproducible'}).click();
 await page.locator('#rw4-initial').selectOption('sealing');await page.getByRole('button',{name:'Congelar hipótesis inicial'}).click();
 await audit(page,'RW4 probes and hypothesis');
});

test('WCAG 2.1 AA MC01 metrology initial and measurements',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="metrology"]').click();
 await expect(page.getByRole('heading',{name:'Metrology Research Bench'})).toBeVisible();
 await audit(page,'MC01 metrology initial');
 await page.getByRole('button',{name:'Nuevo expediente reproducible'}).click();
 await page.locator('#mc-prediction').selectOption('resolvable');
 await page.getByRole('button',{name:'Congelar pronóstico y medir'}).click();
 await audit(page,'MC01 metrology data with table and conclusion form');
});

test('WCAG 2.1 AA RW4 instrument adversarial case',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="rotary-instruments"]').click();
 await expect(page.getByRole('heading',{name:'Instrument Verification Lab'})).toBeVisible();
 await audit(page,'RW4 adversarial initial');
 await page.getByRole('button',{name:'Crear desafío adversarial'}).click();
 await page.locator('#ri-initial').selectOption('sealing');
 await page.getByRole('button',{name:'Congelar hipótesis provisional'}).click();
 await audit(page,'RW4 adversarial checks');
});

test('WCAG 2.1 AA MC08 ideal braking and prediction form',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="brakes"]').click();
 await expect(page.getByRole('heading',{name:'Brake Energy Research Lab'})).toBeVisible();
 await audit(page,'MC08 brake initial');
 await page.locator('#br-energy').selectOption('quadruple');
 await page.locator('#br-distance').selectOption('quadruple');
 await page.locator('#br-mass-effect').selectOption('same');
 await page.getByRole('button',{name:'Congelar hipótesis y simular'}).click();
 await audit(page,'MC08 brake physical comparison');
});

test('WCAG 2.1 AA RW2/RW3 thermodynamics hypotheses and outcome tables',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="rotary-thermal"]').click();
 await expect(page.getByRole('heading',{name:'Thermodynamics Research Bench'})).toBeVisible();
 await audit(page,'RW2/RW3 initial');
 await page.locator('#rt-ideal').selectOption('aumenta');
 await page.locator('#rt-residual').selectOption('resto');
 await page.locator('#rt-real').selectOption('no');
 await page.getByRole('button',{name:'Congelar hipótesis y contrastar'}).click();
 await audit(page,'RW2/RW3 outcome and reasoning');
});

test('WCAG 2.1 AA RW5 heat-transfer physics, predictions and result',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="rotary-heat"]').click();
 await expect(page.getByRole('heading',{name:'Rotary Heat Transfer Lab'})).toBeVisible();
 await audit(page,'RW5 heat-transfer initial');
 await page.locator('#rh-h').selectOption('400');
 await page.locator('#rh-prediction').selectOption('aumenta');
 await page.locator('#rh-real').selectOption('no');
 await page.getByRole('button',{name:'Congelar hipótesis y revelar'}).click();
 await audit(page,'RW5 heat-transfer result');
});
