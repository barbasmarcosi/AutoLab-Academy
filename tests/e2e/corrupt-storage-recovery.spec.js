import {test,expect} from '@playwright/test';

async function corruptStore(page){
 await page.evaluate(async()=>{
  const request=indexedDB.open('autolab-academy',1);
  const db=await new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
  await new Promise((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').put({schema:99,attempts:[],cases:[],reviews:{},notes:{source:'incompatible'}},'progress');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
  db.close();
 });
}
async function validBackup(page){
 return await page.evaluate(async()=>{
  const {emptyProgress,serializeBackup}=await import('./src/core.js');
  const data=emptyProgress();data.notes.general='Datos recuperados desde un JSON verificado';
  return serializeBackup(data);
 });
}
test('un registro incompatible no se elimina: ofrece restauración y vuelve a iniciar con progreso íntegro',async({page})=>{
 await page.goto('./');
 const backup=await validBackup(page);
 await corruptStore(page);
 await page.reload();
 await expect(page.getByRole('heading',{name:'No se pudo abrir el almacenamiento'})).toBeVisible();
 await expect(page.locator('#recovery-file')).toBeVisible();
 await page.once('dialog',dialog=>dialog.accept());
 await page.locator('#recovery-file').setInputFiles({name:'backup-autolab.json',mimeType:'application/json',buffer:Buffer.from(backup)});
 await expect(page.locator('nav.nav')).toBeVisible();
 await expect(page.getByRole('status')).toContainText('Respaldo restaurado correctamente');
 await page.locator('nav.nav button[data-id="data"]').click();
 await expect(page.locator('#notebook')).toHaveValue('Datos recuperados desde un JSON verificado');
 await page.reload();
 await expect(page.locator('nav.nav')).toBeVisible();
 await page.locator('nav.nav button[data-id="data"]').click();
 await expect(page.locator('#notebook')).toHaveValue('Datos recuperados desde un JSON verificado');
});
test('un archivo incompatible no destruye progreso corrupto ni sale de la pantalla de reparación',async({page})=>{
 await page.goto('./');await corruptStore(page);await page.reload();
 await page.locator('#recovery-file').setInputFiles({name:'mal.json',mimeType:'application/json',buffer:Buffer.from('{"not":"autolab"}')});
 await expect(page.locator('.toast.error')).toContainText('No se pudo importar');
 await expect(page.locator('#recovery-file')).toBeVisible();
 await page.reload();
 await expect(page.locator('#recovery-file')).toBeVisible();
});
test('si falla la escritura de recuperación tampoco afirma haber restaurado datos',async({page})=>{
 await page.goto('./');const backup=await validBackup(page);await corruptStore(page);await page.reload();
 await page.evaluate(()=>{
  const original=IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put=function(...args){throw new DOMException('Cuota agotada','QuotaExceededError')};
  window.__originalPut=original;
 });
 await page.once('dialog',dialog=>dialog.accept());
 await page.locator('#recovery-file').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(backup)});
 await expect(page.locator('.toast.error')).toContainText('No se pudo importar');
 await expect(page.locator('#recovery-file')).toBeVisible();
 await page.reload();
 await expect(page.locator('#recovery-file')).toBeVisible();
});


test('P1: importar JSON con expediente inválido no elimina datos existentes ni solicita reemplazo',async({page})=>{
 await page.goto('./');
 const backup=await page.evaluate(async()=>{
  const {emptyProgress,saveProgress}=await import('./src/core.js');
  const original=emptyProgress();original.notes.general='Expediente anterior intacto';
  original.cases.push({id:'old-case',score:85,at:'2026-10-27',passed:true});
  await saveProgress(original);
  const incoming=emptyProgress();
  incoming.cases.push({id:'new-case',score:90,at:'2026-10-27',passed:true});
  incoming.cases.push({id:'bad-case',score:'100',at:'2026-10-27',passed:true});
  return JSON.stringify({format:'autolab-academy-backup',payload:incoming});
 });
 let dialogs=0;
 page.on('dialog',async dialog=>{dialogs++;await dialog.dismiss()});
 await page.locator('nav.nav button[data-id="data"]').click();
 await page.locator('#import-file').setInputFiles({name:'parcial.json',mimeType:'application/json',buffer:Buffer.from(backup)});
 await expect(page.locator('.toast.error')).toContainText('expediente incompatible');
 expect(dialogs).toBe(0);
 await page.reload();
 await page.locator('nav.nav button[data-id="data"]').click();
 await expect(page.locator('#notebook')).toHaveValue('Expediente anterior intacto');
 const cases=await page.evaluate(async()=>{const {loadProgress}=await import('./src/core.js');return (await loadProgress()).cases});
 expect(cases.map(c=>c.id)).toEqual(['old-case']);
});

test('P1: IndexedDB con examen inválido abre recuperación en lugar de borrar registros',async({page})=>{
 await page.goto('./');
 await page.evaluate(async()=>{
  const {emptyProgress}=await import('./src/core.js');
  const p=emptyProgress();
  p.attempts.push({id:'valid',topic:'can',percentage:90,at:'2026-10-27'});
  p.attempts.push({id:'invalid',topic:'can',percentage:'90',at:'2026-10-27'});
  const request=indexedDB.open('autolab-academy',1);
  const db=await new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
  await new Promise((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').put(p,'progress');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
  db.close();
 });
 await page.reload();
 await expect(page.getByRole('heading',{name:'No se pudo abrir el almacenamiento'})).toBeVisible();
 await expect(page.locator('#recovery-file')).toBeVisible();
});
