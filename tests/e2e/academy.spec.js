import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const reasoning='Contrasté una medición que confirma el mecanismo sintético con una prueba independiente que descarta la alternativa. Registré el contexto, anticipé las lecturas y comparé los resultados antes de concluir.';
const uncertainty='Son lecturas ficticias sin tolerancias OEM ni medición física de vehículo alguno. Para trabajar en un vehículo real faltan manuales del fabricante y comprobaciones supervisadas.';

async function progress(page){
 return page.evaluate(()=>new Promise((resolve,reject)=>{
  const request=indexedDB.open('autolab-academy',1);
  request.onerror=()=>reject(request.error?.message);
  request.onsuccess=()=>{
   const db=request.result,tx=db.transaction('data','readonly');
   const read=tx.objectStore('data').get('progress');
   read.onsuccess=()=>resolve(read.result);
   read.onerror=()=>reject(read.error?.message);
   tx.oncomplete=()=>db.close();
  };
 }));
}
async function section(page,id){
 await page.locator('nav.nav button[data-action="nav"][data-id="'+id+'"]').click();
}

test('diagnóstico en navegador → informe → IndexedDB → JSON → restauración',async({page})=>{
 await page.goto('./');
 await expect(page.getByRole('heading',{name:/Aprendé a encontrar la causa/i})).toBeVisible();
 // Only stabilize the test session. Production uses Date.now normally.
 await page.evaluate(()=>{Date.now=()=>291;});
 const cases=await page.evaluate(async()=>(
  await import('./src/diagnostic-transfer.js')
 ).buildDiagnosticTransfer(291).cases);
 await section(page,'diagtransfer');
 await page.locator('[data-action="diagtransfer-start"]').click();
 for(const c of cases){
  await expect(page.getByRole('heading',{name:c.title})).toBeVisible();
  await page.locator('#diagtransfer-initial').selectOption(c.options[0][0]);
  await page.locator('[data-action="diagtransfer-lock"]').click();
  for(const probe of c.probes.filter(p=>!p.unsafe)){
   await page.locator('[data-action="diagtransfer-probe"][data-id="'+probe.id+'"]').click();
   await page.locator('#diagtransfer-prediction').selectOption(probe.outcome);
   await page.locator('[data-action="diagtransfer-reveal"]').click();
   await expect(page.locator('.answer-card').filter({hasText:probe.label})).toBeVisible();
  }
  await page.locator('#diagtransfer-final').selectOption(c.cause);
  await page.locator('#diagtransfer-reason').fill(reasoning);
  await page.locator('#diagtransfer-limits').fill(uncertainty);
  await page.locator('[data-action="diagtransfer-next"]').click();
 }
 await expect(page.getByRole('heading',{name:/Transferencia diagnóstica: 5\/5 casos/})).toBeVisible();
 await expect(page.locator('.panel').filter({hasText:'100/100'})).toHaveCount(5);
 await expect.poll(async()=>(await progress(page)).cases.length).toBe(5);
 const saved=await progress(page);
 expect(saved.cases.every(c=>c.score===100&&c.passed)).toBe(true);
 expect(saved.cases.every(c=>c.report.includes('Procedencia:')&&c.report.includes('Pronosticado:'))).toBe(true);
 expect(saved.cases.every(c=>c.used.length===3)).toBe(true);
 const reportPromise=page.waitForEvent('download');
 await page.locator('[data-action="diagtransfer-export"]').click();
 const markdown=await readFile(await (await reportPromise).path(),'utf8');
 expect(markdown).toContain('Semilla reproducible: 291');
 expect(markdown.match(/Procedencia:/g)?.length).toBe(15);
 await page.reload();
 await section(page,'portfolio');
 await expect(page.getByRole('heading',{name:'Evidencias de tu formación'})).toBeVisible();
 expect((await progress(page)).cases).toHaveLength(5);

 await section(page,'data');
 const jsonPromise=page.waitForEvent('download');
 await page.locator('[data-action="export"]').click();
 const json=await readFile(await (await jsonPromise).path(),'utf8');
 const backup=JSON.parse(json);
 expect(backup.payload.cases).toHaveLength(5);
 expect(backup.payload.cases[0].report).toContain('Procedencia:');
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('[data-action="reset"]').click();
 await expect.poll(async()=>(await progress(page)).cases.length).toBe(0);
 await section(page,'data');
 await page.locator('#import-file').setInputFiles({
  name:'autolab-backup.json',mimeType:'application/json',buffer:Buffer.from(json)
 });
 await expect.poll(async()=>(await progress(page)).cases.length).toBe(5);
 await section(page,'portfolio');
 await expect(page.getByRole('heading',{name:'Evidencias de tu formación'})).toBeVisible();
 await section(page,'data');
 await page.locator('#import-file').setInputFiles({
  name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"format":"wrong"}')
 });
 await expect(page.getByText(/No se pudo importar:/)).toBeVisible();
 expect((await progress(page)).cases).toHaveLength(5);
});

test('PWA instalada en scope Pages: funciona sin red y sin datos OEM',async({page,context})=>{
 await page.goto('./');
 await expect(page.getByRole('heading',{name:/Aprendé a encontrar la causa/i})).toBeVisible();
 await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:30_000});
 expect((await page.evaluate(()=>caches.keys())).includes('autolab-academy-v73')).toBe(true);
 await context.setOffline(true);
 await page.reload();
 await expect(page.getByRole('heading',{name:/Aprendé a encontrar la causa/i})).toBeVisible();
 await section(page,'diagtransfer');
 await expect(page.getByRole('heading',{name:'Mismo síntoma, causas distintas'})).toBeVisible();
 await page.locator('[data-action="diagtransfer-start"]').click();
 await expect(page.locator('#diagtransfer-initial')).toBeVisible();
 await context.setOffline(false);
});


test('borrador retoma después de recargar, navegar y recuperar JSON',async({page})=>{
 await page.goto('./');
 await page.evaluate(()=>{Date.now=()=>491;});
 const c=await page.evaluate(async()=>(
  await import('./src/diagnostic-transfer.js')
 ).buildDiagnosticTransfer(491).cases[0]);
 await section(page,'diagtransfer');
 await page.locator('[data-action="diagtransfer-start"]').click();
 await page.locator('#diagtransfer-initial').selectOption(c.options[0][0]);
 await page.locator('[data-action="diagtransfer-lock"]').click();
 const p=c.probes.find(p=>!p.unsafe);
 await page.locator('[data-action="diagtransfer-probe"][data-id="'+p.id+'"]').click();
 await page.locator('#diagtransfer-prediction').selectOption(p.outcome);
 await page.locator('[data-action="diagtransfer-reveal"]').click();
 await page.locator('#diagtransfer-reason').fill('Una explicación provisional debe poder seguir disponible después de cerrar la pestaña y retomar las pruebas.');
 await expect.poll(async()=>(await progress(page)).diagnosticDraft.answers[c.id].observations.length).toBe(1);
 await expect.poll(async()=>(await progress(page)).diagnosticDraft.answers[c.id].reasoning).toContain('explicación provisional');
 await page.reload();
 await section(page,'diagtransfer');
 await page.locator('[data-action="diagtransfer-resume"]').click();
 await expect(page.getByRole('heading',{name:c.title})).toBeVisible();
 await expect(page.locator('.answer-card').filter({hasText:p.label})).toBeVisible();
 await expect(page.locator('#diagtransfer-reason')).toHaveValue(/explicación provisional/);
 await section(page,'home');
 await section(page,'diagtransfer');
 await page.locator('[data-action="diagtransfer-resume"]').click();
 await expect(page.locator('.answer-card').filter({hasText:p.label})).toBeVisible();
 await page.locator('[data-action="diagtransfer-quit"]').click();
 await section(page,'data');
 const downloadPromise=page.waitForEvent('download');
 await page.locator('[data-action="export"]').click();
 const json=await readFile(await (await downloadPromise).path(),'utf8');
 expect(JSON.parse(json).payload.diagnosticDraft.answers[c.id].observations).toHaveLength(1);
 page.on('dialog',d=>d.accept());
 await page.locator('[data-action="reset"]').click();
 await expect.poll(async()=>(await progress(page)).diagnosticDraft).toBe(null);
 await section(page,'data');
 await page.locator('#import-file').setInputFiles({
  name:'borrador.json',mimeType:'application/json',buffer:Buffer.from(json)
 });
 await expect.poll(async()=>(await progress(page)).diagnosticDraft?.seed).toBe(491);
 await section(page,'diagtransfer');
 await page.locator('[data-action="diagtransfer-resume"]').click();
 await expect(page.locator('.answer-card').filter({hasText:p.label})).toBeVisible();
});


test('guardado explícito del borrador espera a IndexedDB y confirma éxito',async({page})=>{
 await page.goto('./');
 await section(page,'diagtransfer');
 await page.locator('[data-action="diagtransfer-start"]').click();
 await page.locator('#diagtransfer-initial').selectOption({index:1});
 await page.locator('[data-action="diagtransfer-lock"]').click();
 await page.locator('#diagtransfer-reason').fill('Se registra una hipótesis provisional antes de proseguir con el descarte de causas alternativas.');
 await page.locator('[data-action="diagtransfer-save"]').click();
 await expect(page.getByRole('status').filter({hasText:'Borrador guardado en este dispositivo'})).toBeVisible();
 const before=await progress(page);
 expect(before.diagnosticDraft).toBeTruthy();
 const first=before.diagnosticDraft.answers[Object.keys(before.diagnosticDraft.answers)[0]];
 expect(first.reasoning).toContain('hipótesis provisional');
 await page.reload();
 await section(page,'diagtransfer');
 await page.locator('[data-action="diagtransfer-resume"]').click();
 await expect(page.locator('#diagtransfer-reason')).toHaveValue(/hipótesis provisional/);
});
