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
 expect((await page.evaluate(()=>caches.keys())).includes('autolab-academy-v23')).toBe(true);
 await context.setOffline(true);
 await page.reload();
 await expect(page.getByRole('heading',{name:/Aprendé a encontrar la causa/i})).toBeVisible();
 await section(page,'diagtransfer');
 await expect(page.getByRole('heading',{name:'Mismo síntoma, causas distintas'})).toBeVisible();
 await page.locator('[data-action="diagtransfer-start"]').click();
 await expect(page.locator('#diagtransfer-initial')).toBeVisible();
 await context.setOffline(false);
});
