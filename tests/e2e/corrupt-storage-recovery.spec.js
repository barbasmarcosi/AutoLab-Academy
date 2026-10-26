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
