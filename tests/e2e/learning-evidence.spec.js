import{test,expect}from'@playwright/test';
async function itinerary(page){
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByRole('heading',{name:'Aprendizaje por niveles'})).toBeVisible();
}
test('path makes reading and v3 transfer independent and recommends evidence rather than next passive reading',async({page})=>{
 await page.goto('./');await itinerary(page);
 await expect(page.getByText('Transferencias contrafactuales aprobadas')).toBeVisible();
 await expect(page.getByText('Laboratorios embebidos aprobados')).toBeVisible();
 await expect(page.locator('#next-evidence-reason')).toContainText('Estudiar la teoría');
 await page.getByRole('button',{name:'Abrir siguiente actividad'}).click();
 await expect(page.getByRole('heading',{name:'La caída de tensión cuenta la historia'})).toBeVisible();
 await expect(page.getByText('Sin ejercicio de razonamiento asociado')).toHaveCount(0);
 await page.getByRole('button',{name:'Registrar lectura y volver'}).click();
 await itinerary(page);
 await expect(page.locator('#next-evidence-reason')).toContainText('Experimentar con voltímetro virtual');
 const result=await page.evaluate(async()=>{
  const {loadProgress,saveProgress}=await import('./src/core.js');
  const p=await loadProgress();
  p.cases.push({id:'lab-reasoning-volt-drop-v1',at:new Date().toISOString(),score:100,passed:true,
   reasoning:'Antigua evidencia, no transfiere a datos nuevos'});
  p.attempts.push({id:'test-exam',topic:'electricidad',percentage:100,at:new Date().toISOString()});
  await saveProgress(p);
  return p.notes['lesson-volt-drop'];
 });
 expect(result).toBeTruthy();
 await page.reload();await itinerary(page);
 await expect(page.locator('#next-evidence-reason')).toContainText('Experimentar con voltímetro virtual');
 await page.evaluate(async()=>{
  const {loadProgress,saveProgress}=await import('./src/core.js');
  const p=await loadProgress();
  p.cases.push({id:'lab-reasoning-volt-drop-v2',at:new Date().toISOString(),score:100,passed:true,
   reasoning:'Transferencia nueva, no acredita trabajo en vehículos reales'});
  await saveProgress(p);
 });
 await page.reload();await itinerary(page);
 await expect(page.locator('#next-evidence-reason')).toContainText('Experimentar con voltímetro virtual');
 await expect(page.getByRole('button',{name:'Abrir siguiente actividad'})).toBeVisible();
});
test('MC06 recommendation requires genuine v3 transfer then its own embedded lab',async({page})=>{
 await page.goto('./');
 await page.evaluate(async()=>{
  const {loadProgress,saveProgress}=await import('./src/core.js');
  const {learningStages}=await import('./src/learning-path.js');
  const {transferCase}=await import('./src/lesson-transfer.js');
  const {lessonPractice}=await import('./src/lesson-practice.js');
  const p=await loadProgress();
  const ids=learningStages.flatMap(s=>s.lessons);
  for(const id of ids.slice(0,ids.indexOf('mc06-dual-fault-instrumentation'))){
   p.notes['lesson-'+id]='2026-10-26T16:00:00Z';
   if(transferCase(id))p.cases.push({id:'lab-reasoning-'+id+'-v3',at:'2026-10-26T16:00:01Z',score:100,passed:true});
   const practice=lessonPractice(id);
   if(practice?.kind==='embedded')p.cases.push({id:practice.caseId,at:'2026-10-26T16:00:02Z',score:100,passed:true});
  }
  p.cases.push({id:'lab-volt-drop-holdout-v2',at:'2026-10-26T16:00:03Z',score:100,passed:true});
  p.cases.push({id:'lab-dtc-holdout-v1',at:'2026-10-26T16:00:04Z',score:100,passed:true});
  p.cases.push({id:'lab-scope-holdout-v1',at:'2026-10-26T16:00:05Z',score:100,passed:true});
  p.cases.push({id:'lab-can-holdout-v1',at:'2026-10-26T16:00:06Z',score:100,passed:true});
  p.cases.push({id:'lab-bms-holdout-v1',at:'2026-10-26T16:00:07Z',score:100,passed:true});
  p.cases.push({id:'lab-hv-safety-holdout-v1',at:'2026-10-26T16:00:08Z',score:100,passed:true});
  p.notes['lesson-mc06-dual-fault-instrumentation']='2026-10-26T16:00:00Z';
  await saveProgress(p);
 });
 await page.reload();await itinerary(page);
 await expect(page.locator('#next-evidence-reason')).toContainText('Resolver hipótesis y transferencia');
 await page.evaluate(async()=>{
  const {loadProgress,saveProgress}=await import('./src/core.js');
  const p=await loadProgress();
  p.cases.push({id:'lab-reasoning-mc06-dual-fault-instrumentation-v3',at:new Date().toISOString(),score:100,passed:true});
  await saveProgress(p);
 });
 await page.reload();await itinerary(page);
 await expect(page.locator('#next-evidence-reason')).toContainText('Realizar el laboratorio de esta lección');
 await page.evaluate(async()=>{
  const {loadProgress,saveProgress}=await import('./src/core.js');
  const p=await loadProgress();
  p.cases.push({id:'lab-powertrain-mc06-v1',at:new Date().toISOString(),score:100,passed:true});
  await saveProgress(p);
 });
 await page.reload();await itinerary(page);
 await expect(page.locator('#next-evidence-reason')).not.toContainText('Realizar el laboratorio de esta lección');
 await expect(page.getByText('Transferencia aprobada')).not.toHaveCount(0);
 await expect(page.getByText('Laboratorio aprobado')).not.toHaveCount(0);
});
