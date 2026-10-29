import{test,expect}from'@playwright/test';import{readFile}from'node:fs/promises';
import AxeBuilder from'@axe-core/playwright';
async function openBms(page){
 await page.goto('./');
 await page.getByRole('button',{name:'Academia',exact:true}).click();
 await page.locator('.lesson-card').filter({hasText:'BMS: estimar no es medir directamente'}).getByRole('button',{name:'Estudiar'}).click();
}
test('lesson 5: baseline teaches SOC, SOH, current bias and not to trust voltage alone',async({page})=>{
 await openBms(page);const p=page.locator('#bms-baseline-host');
 await expect(p.getByText('Antes de leer: SOC, SOH y sesgo')).toBeVisible();
 await p.locator('#bms-baseline-check').click();
 await expect(p.locator('#bms-baseline-feedback')).toContainText('Completá las cuatro ideas');
 for(const [id,v] of Object.entries({soc:0,count:2,bias:0,soh:1}))
  await p.locator("input[name='bms-pre-"+id+"'][value='"+v+"']").check();
 await p.locator('#bms-baseline-check').click();
 await expect(p.locator('#bms-baseline-feedback')).toContainText('Idea por revisar');
 await expect(page.getByText('Ejemplo resuelto: estimación, no medida directa')).toBeVisible();
});
test('lesson 5: integrated existing BMS analyzer with guided freeze and separate heldout evidence',async({page})=>{
 await openBms(page);
 const g=page.locator('#lesson-practice-host'),h=page.locator('#bms-holdout-host');
 await expect(g.getByText('Banco BMS: referencia, sesgo y capacidad')).toBeVisible();
 await g.locator('#bms-g-scenario').selectOption('bias');
 await g.locator('[data-bms-g="freeze"]').click();
 await expect(g.locator('#bms-g-status')).toContainText('Indicá la predicción numérica');
 await g.locator('#bms-g-pred').fill('-1');
 await g.locator('[data-bms-g="freeze"]').click();
 await expect(g.locator('#bms-g-locked')).toContainText('-1,00');
 await g.locator('[data-bms-g="reveal"]').click();
 await expect(g.locator('#bms-g-observed')).toContainText('79,00%');
 await g.locator('#bms-g-cause').selectOption('bias');
 await g.locator('#bms-g-reason').fill('El modelo integra 12,6 A durante una hora frente a 12 A reales.');
 await g.locator('#bms-g-alternative').fill('Consideré una capacidad inferior, sin patrón que la justifique.');
 await g.locator('[data-bms-g="save"]').click();
 await expect(g.locator('#bms-g-result')).toContainText('100/100');
 await expect(page.locator('#lesson-practice-status')).toContainText('Banco guiado completado · caso independiente sin resolver');
 await expect(h).toContainText('Banco B01');
 await h.locator('[data-bms-h="freeze"]').click();
 await expect(h.locator('#bms-h-status')).toContainText('Pronosticá un error');
 await h.locator('#bms-h-prior').selectOption('capacity');
 await h.locator('#bms-h-first').selectOption('sensor');
 await h.locator('#bms-h-forecast').fill('5');
 await h.locator('[data-bms-h="freeze"]').click();
 await expect(h.locator('#bms-h-locked')).toContainText('5,00');
 await h.locator('#bms-h-next').selectOption('capacity');
 await h.locator('[data-bms-h="measure"]').click();
 await expect(h.locator('#bms-h-status')).toContainText('Respetá primero');
 for(const [i,t] of ['sensor','capacity','initial','trajectory'].entries()){
  await h.locator('#bms-h-next').selectOption(t);
  await h.locator('[data-bms-h="measure"]').click();
  await expect(h.locator('#bms-h-observations')).toContainText((i+1)+'/4');
 }
 await expect(h.locator('#bms-h-observations')).toContainText('79,00%');
 await h.locator('#bms-h-gap').fill('-1');
 await h.locator('#bms-h-cause').selectOption('bias');
 await h.locator('#bms-h-decisive').selectOption('sensor');
 await h.locator('input[name="bms-h-falsifier"][value="1"]').check();
 await h.locator('#bms-h-why').fill('La diferencia de 0,6 A contra patrón durante una hora explica una discrepancia de -1 punto porcentual.');
 await h.locator('#bms-h-alt').fill('La capacidad completa sigue en 60 Ah, y el SOC inicial está contrastado.');
 await h.locator('[data-bms-h="grade"]').click();
 await expect(h.locator('#bms-h-result')).toContainText('100/100');
 await expect(page.locator('#lesson-practice-status')).toContainText('Banco guiado y caso independiente completados');
 await page.locator('nav.nav button[data-id="data"]').click();
 const dl=page.waitForEvent('download');
 await page.locator('[data-action="export"]').click();
 const file=JSON.parse(await readFile(await(await dl).path(),'utf8'));
 const guided=file.payload.cases.findLast(x=>x.id==='lab-bms-guided-v1');
 const reserved=file.payload.cases.findLast(x=>x.id==='lab-bms-holdout-v1');
 expect(guided).toMatchObject({score:100,passed:true});
 expect(reserved).toMatchObject({score:100,passed:true});
 const report=JSON.parse(reserved.report);
 expect(report).toMatchObject({rubric:'lab-bms-holdout-v1',caseId:'B01',qualitativeReview:'pending',
  final:{gapPp:-1,diagnosis:'bias',decisiveTest:'sensor',falsifier:1}});
 expect(report.measurementsInOrder).toEqual(['sensor','capacity','initial','trajectory']);
 await openBms(page);
 await expect(page.locator('#bms-holdout-host')).toContainText('Banco B02');
});
test('lesson 5: baseline and reserved BMS accessible at mobile width',async({page})=>{
 await page.setViewportSize({width:375,height:812});await openBms(page);
 const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations;
 expect(violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
});
