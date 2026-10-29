import{test,expect}from'@playwright/test';import{readFile}from'node:fs/promises';
import AxeBuilder from'@axe-core/playwright';
async function visit(page){
 await page.goto('./');
 await page.getByRole('button',{name:'Academia',exact:true}).click();
 await page.locator('.lesson-card').filter({hasText:'Masas, terminales y resistencia de contacto'}).getByRole('button',{name:'Estudiar'}).click();
}
test('lesson 7: misconception screen, theory and three guided causal contrasts',async({page})=>{
 await visit(page);
 const baseline=page.locator('#ground-baseline-host'),guided=page.locator('#lesson-practice-host');
 await expect(baseline.getByText('Antes de leer: un contacto con continuidad puede fallar bajo demanda')).toBeVisible();
 await baseline.locator('#ground-pre-check').click();
 await expect(baseline.locator('#ground-pre-feedback')).toContainText('Respondé las cuatro');
 for(const [id,v]of Object.entries({idle:0,location:1,current:1,safety:2}))
  await baseline.locator("input[name='ground-pre-"+id+"'][value='"+v+"']").check();
 await baseline.locator('#ground-pre-check').click();
 await expect(baseline.locator('#ground-pre-feedback')).toContainText('Concepto para revisar');
 await expect(page.getByText('Ejemplo resuelto: continuidad no es caída bajo carga')).toBeVisible();
 for(const [index,cause,probe]of [[1,'return','return'],[2,'positive','positive'],[3,'load','current']]){
  await expect(guided).toContainText('Escenario ficticio '+index+'/3');
  await guided.locator('#ground-g-hypothesis').selectOption(index===1?'unknown':cause);
  await guided.locator('#ground-g-pred').fill('0.2');
  await guided.locator('[data-ground-g="freeze"]').click();
  await expect(guided).toContainText('Hipótesis congelada');
  await guided.locator('#ground-g-cause').selectOption(cause);
  await guided.locator('#ground-g-probe').selectOption(probe);
  await guided.locator('#ground-g-explain').fill('La caída de cada tramo bajo la misma carga discrimina el mecanismo frente a las alternativas.');
  await guided.locator('[data-ground-g="check"]').click();
 }
 await expect(guided.locator('#ground-g-result')).toContainText('3/3 contrastes');
 await expect(page.locator('#lesson-practice-status')).toContainText('Banco guiado completado · caso independiente sin resolver');
});
test('lesson 7: freeze test before evidence, numeric return reasoning, export and advance to next holdout',async({page})=>{
 await visit(page);const h=page.locator('#ground-holdout-host');
 await expect(h).toContainText('Banco reservado R01');
 await h.locator('[data-ground-h="freeze"]').click();
 await expect(h.locator('#ground-h-status')).toContainText('pronóstico explícito');
 await h.locator('#ground-h-initial').selectOption('positive');
 await h.locator('#ground-h-first').selectOption('current');
 await h.locator('#ground-h-forecast').fill('0.1');
 await h.locator('[data-ground-h="freeze"]').click();
 await expect(h.locator('#ground-h-frozen')).toContainText('0,10 V');
 await h.locator('#ground-h-next').selectOption('positive');
 await h.locator('[data-ground-h="measure"]').click();
 await expect(h.locator('#ground-h-status')).toContainText('Respetá primero el contraste');
 for(const [i,probe]of ['current','positive','return','load'].entries()){
  await h.locator('#ground-h-next').selectOption(probe);
  await h.locator('[data-ground-h="measure"]').click();
  await expect(h.locator('#ground-h-observations')).toContainText((i+1)+'/4');
 }
 await expect(h.locator('#ground-h-observations')).toContainText('1,75 V');
 await h.locator('#ground-h-return').fill('1.75');
 await h.locator('#ground-h-cause').selectOption('return');
 await h.locator('#ground-h-decisive').selectOption('return');
 await h.locator('input[name="ground-h-falsifier"][value="1"]').check();
 await h.locator('#ground-h-why').fill('La corriente del banco permite comparar ΔV positiva con ΔV de retorno y reconocer cuál se aparta del patrón.');
 await h.locator('#ground-h-alt').fill('Consideré contacto positivo anómalo, pero la caída positiva permanece baja.');
 await h.locator('[data-ground-h="grade"]').click();
 await expect(h.locator('#ground-h-result')).toContainText('100/100');
 await expect(h.locator('#ground-h-result')).toContainText('pendiente de revisión humana');
 await expect(page.locator('#lesson-practice-status')).toContainText('Práctica todavía no registrada');
 await page.locator('nav.nav button[data-id="data"]').click();
 const d=page.waitForEvent('download');await page.locator('[data-action="export"]').click();
 const file=JSON.parse(await readFile(await(await d).path(),'utf8'));
 const entry=file.payload.cases.findLast(x=>x.id==='lab-ground-test-holdout-v1');
 expect(entry).toMatchObject({passed:true,score:100});
 const report=JSON.parse(entry.report);
 expect(report).toMatchObject({rubric:'lab-ground-test-holdout-v1',caseId:'R01',qualitativeReview:'pending',
  final:{returnV:1.75,cause:'return',decisiveProbe:'return',falsifier:1}});
 expect(report.observations).toHaveLength(4);
 await page.getByRole('button',{name:'Academia',exact:true}).click();
 await page.locator('.lesson-card').filter({hasText:'Masas, terminales y resistencia de contacto'}).getByRole('button',{name:'Estudiar'}).click();
 await expect(page.locator('#ground-holdout-host')).toContainText('Banco reservado R02');
});
test('lesson 7: mobile accessibility and no sideways overflow',async({page})=>{
 await page.setViewportSize({width:375,height:812});await visit(page);
 const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations;
 expect(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
});
