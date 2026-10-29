import{test,expect}from'@playwright/test';import{readFile}from'node:fs/promises';
import AxeBuilder from'@axe-core/playwright';
async function openCan(page){
 await page.goto('./');
 await page.getByRole('button',{name:'Academia',exact:true}).click();
 await page.locator('.lesson-card').filter({hasText:'CAN: más allá de los dos cables'}).getByRole('button',{name:'Estudiar'}).click();
}
test('lesson 4: CAN misconceptions, isolated parallel terminations and nondestructive arbitration',async({page})=>{
 await openCan(page);
 const baseline=page.locator('#can-baseline-host'),lab=page.locator('#can-concepts-host');
 await expect(baseline.getByText('Antes de empezar: ¿qué suponés sobre CAN?')).toBeVisible();
 await baseline.locator('#can-baseline-check').click();
 await expect(baseline.locator('#can-baseline-feedback')).toContainText('Completá las cuatro');
 for(const [id,v] of Object.entries({dominant:1,termination:1,voltage:2,dtc:0}))
  await baseline.locator("input[name='can-pre-"+id+"'][value='"+v+"']").check();
 await baseline.locator('#can-baseline-check').click();
 await expect(baseline.locator('#can-baseline-feedback')).toContainText('Idea para revisar');
 await expect(page.getByText('CAN paso a paso: señal, terminación y arbitraje')).toBeVisible();
 await expect(lab.locator('#can-concept-readings')).toContainText('60.0 Ω');
 await expect(lab.locator('#can-concept-readings')).toContainText('gana nodo A');
 await lab.locator('#can-ends').selectOption('1');
 await expect(lab.locator('#can-concept-readings')).toContainText('120.0 Ω');
 await lab.locator('#can-ends').selectOption('0');
 await expect(lab.locator('#can-concept-readings')).toContainText('circuito abierto');
 await lab.locator('#can-ends').selectOption('3');
 await expect(lab.locator('#can-concept-readings')).toContainText('40.0 Ω');
 await lab.locator('#can-id-a').selectOption('512');
 await lab.locator('#can-id-b').selectOption('288');
 await expect(lab.locator('#can-concept-readings')).toContainText('gana nodo B');
 await expect(lab.locator('#can-concept-readings')).toContainText('H−L 2 V');
});
test('lesson 4: reserved CAN case freezes plan, tests alternatives, saves and exports independent evidence',async({page})=>{
 await openCan(page);
 const h=page.locator('#can-holdout-host');
 await expect(h.getByText('CASO RESERVADO: ¿defecto o arbitraje normal?')).toBeVisible();
 await expect(h).toContainText('Banco N01');
 await h.locator('[data-can-h="freeze"]').click();
 await expect(h.locator('#can-h-status')).toContainText('Elegí una predicción explícita');
 await h.locator('#can-h-prior').selectOption('supply');
 await h.locator('#can-h-first').selectOption('supply');
 await h.locator('#can-h-prediction').selectOption('2');
 await h.locator('[data-can-h="freeze"]').click();
 await expect(h.locator('#can-h-locked')).toContainText('Alimentación ausente');
 await h.locator('#can-h-probe').selectOption('termination');
 await h.locator('[data-can-h="measure"]').click();
 await expect(h.locator('#can-h-status')).toContainText('Medí primero la prueba comprometida');
 await expect(h.locator('#can-h-observations')).toContainText('0/4');
 for(const [i,probe] of ['supply','termination','differential','traffic'].entries()){
  await h.locator('#can-h-probe').selectOption(probe);
  await h.locator('[data-can-h="measure"]').click();
  await expect(h.locator('#can-h-observations')).toContainText((i+1)+'/4');
 }
 await expect(h.locator('#can-h-observations')).toContainText('120 Ω');
 await h.locator('#can-h-count').selectOption('1');
 await h.locator('#can-h-cause').selectOption('termination');
 await h.locator('#can-h-discriminate').selectOption('termination');
 await h.locator('input[name="can-h-falsifier"][value="1"]').check();
 await h.locator('[data-can-h="grade"]').click();
 await expect(h.locator('#can-h-status')).toContainText('Explicá el razonamiento');
 await h.locator('#can-h-why').fill('120 Ω con una sola resistencia del extremo favorece terminación ausente en este modelo.');
 await h.locator('#can-h-alt').fill('Comparé alimentación del nodo, que permanece en referencia; también consideré arbitraje.');
 await h.locator('[data-can-h="grade"]').click();
 await expect(h.locator('#can-h-result')).toContainText('100/100');
 await expect(h.locator('#can-h-result')).toContainText('pendiente de revisión humana');
 await expect(page.locator('#lesson-theory-practice-status')).toContainText('Práctica todavía no registrada');
 await page.locator('nav.nav button[data-id="data"]').click();
 const download=page.waitForEvent('download');
 await page.locator('[data-action="export"]').click();
 const payload=JSON.parse(await readFile(await(await download).path(),'utf8'));
 const entry=payload.payload.cases.findLast(x=>x.id==='lab-can-holdout-v1');
 expect(entry).toMatchObject({passed:true,score:100});
 const report=JSON.parse(entry.report);
 expect(report).toMatchObject({rubric:'lab-can-holdout-v1',caseId:'N01',qualitativeReview:'pending',
  final:{equivalentEnds:1,diagnosis:'termination',decisiveTest:'termination',falsifier:1}});
 expect(report.prior).toMatchObject({hypothesis:'supply',firstTest:'supply',predictedEnds:2});
 expect(report.measurementsInOrder).toEqual(['supply','termination','differential','traffic']);
 await page.getByRole('button',{name:'Academia',exact:true}).click();
 await page.locator('.lesson-card').filter({hasText:'CAN: más allá de los dos cables'}).getByRole('button',{name:'Estudiar'}).click();
 await expect(page.locator('#can-holdout-host')).toContainText('Banco N02');
});
test('lesson 4: CAN lesson is mobile WCAG AA with no sideways overflow',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await openCan(page);
 await expect(page.locator('#can-holdout-host')).toBeVisible();
 const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations;
 expect(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
 expect(overflow).toBe(false);
});
