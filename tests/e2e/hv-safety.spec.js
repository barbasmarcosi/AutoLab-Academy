import{test,expect}from'@playwright/test';import{readFile}from'node:fs/promises';
import AxeBuilder from'@axe-core/playwright';
async function openHv(page){
 await page.goto('./');
 await page.getByRole('button',{name:'Academia',exact:true}).click();
 await page.locator('.lesson-card').filter({hasText:'Seguridad de alta tensión: reconocer el límite'}).getByRole('button',{name:'Estudiar'}).click();
}
test('lesson 6: ungraded entry recognizes HV hazards, silence, unauthorized work and quiz limits',async({page})=>{
 await openHv(page);const baseline=page.locator('#hv-baseline-host');
 await expect(baseline.getByText('Antes de aprender: ¿qué decisiones son seguras?')).toBeVisible();
 await baseline.locator('#hv-baseline-check').click();
 await expect(baseline.locator('#hv-baseline-feedback')).toContainText('Respondé primero');
 for(const [id,value] of Object.entries({quiet:0,color:1,damage:1,exam:2}))
  await baseline.locator("input[name='hv-pre-"+id+"'][value='"+value+"']").check();
 await baseline.locator('#hv-baseline-check').click();
 await expect(baseline.locator('#hv-baseline-feedback')).toContainText('Idea para revisar');
 await expect(page.getByText('Seguridad eléctrica: reconocer, detener y derivar')).toBeVisible();
});
test('lesson 6: guided safety cannot pass unsafe choices, reserved transfer freezes decision and exports evidence',async({page})=>{
 await openHv(page);
 const guided=page.locator('#lesson-practice-host'),h=page.locator('#hv-holdout-host');
 await expect(guided.getByText('Práctica guiada: tres decisiones de seguridad')).toBeVisible();
 await guided.locator('#hv-g-decision').selectOption('unsafe');
 await guided.locator('#hv-g-risk').selectOption('thermal');
 await guided.locator('[data-hv-g="check"]').click();
 await expect(guided.locator('#hv-g-feedback')).toContainText('No es una decisión segura');
 for(const [d,r]of [['emergency','thermal'],['refer','authority'],['inform','none']]){
  await guided.locator('#hv-g-decision').selectOption(d);
  await guided.locator('#hv-g-risk').selectOption(r);
  await guided.locator('[data-hv-g="check"]').click();
 }
 await expect(guided.locator('#hv-g-result')).toContainText('3/3 decisiones conceptuales');
 await expect(page.locator('#lesson-practice-status')).toContainText('Banco guiado completado · caso independiente sin resolver');
 await expect(h).toContainText('Expediente H01');
 await h.locator('[data-hv-h="freeze"]').click();
 await expect(h.locator('#hv-h-status')).toContainText('Comprometé decisión');
 await h.locator('#hv-h-initial').selectOption('refer');
 await h.locator('#hv-h-first').selectOption('authority');
 await h.locator('[data-hv-h="freeze"]').click();
 await expect(h.locator('#hv-h-locked')).toContainText('Suspender cualquier intervención');
 await h.locator('#hv-h-probe').selectOption('incident');
 await h.locator('[data-hv-h="observe"]').click();
 await expect(h.locator('#hv-h-status')).toContainText('Respetá la fuente comprometida');
 for(const [i,probe]of ['authority','incident','documentation','limits'].entries()){
  await h.locator('#hv-h-probe').selectOption(probe);
  await h.locator('[data-hv-h="observe"]').click();
  await expect(h.locator('#hv-h-observations')).toContainText((i+1)+'/4');
 }
 await expect(h.locator('#hv-h-observations')).toContainText('emisión de vapores');
 await h.locator('#hv-h-decision').selectOption('emergency');
 await h.locator('#hv-h-risk').selectOption('thermal');
 await h.locator('#hv-h-authority').selectOption('no_authority');
 await h.locator('#hv-h-reason').fill('Los vapores y el calor son señales de peligro; alejarse y avisar a emergencias. No voy a tocar componentes.');
 await h.locator('#hv-h-alt').fill('Podría existir otra fuente, pero no es seguro acercarse para investigarla.');
 await h.locator('[data-hv-h="grade"]').click();
 await expect(h.locator('#hv-h-result')).toContainText('100/100');
 await expect(h.locator('#hv-h-result')).toContainText('NO autorización ni certificado');
 await expect(page.locator('#lesson-practice-status')).toContainText('Banco guiado y caso independiente completados');
 await page.locator('nav.nav button[data-id="data"]').click();
 const d=page.waitForEvent('download');
 await page.locator('[data-action="export"]').click();
 const file=JSON.parse(await readFile(await(await d).path(),'utf8'));
 const entry=file.payload.cases.findLast(x=>x.id==='lab-hv-safety-holdout-v1');
 expect(entry).toMatchObject({score:100,passed:true});
 expect(JSON.parse(entry.report)).toMatchObject({
  rubric:'lab-hv-safety-holdout-v1',caseId:'H01',noPhysicalCompetence:true,
  final:{decision:'emergency',risk:'thermal',authority:'no_authority'},qualitativeReview:'pending'});
});
test('lesson 6: mobile WCAG AA and no scroll overflow for safety decision lab',async({page})=>{
 await page.setViewportSize({width:375,height:812});await openHv(page);
 await expect(page.locator('#hv-holdout-host')).toBeVisible();
 const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations;
 expect(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
});
