import {test,expect} from '@playwright/test';

async function injectQuota(page){
 await page.evaluate(()=>{
  const original=IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put=function(...args){
   if(window.__failWrites)throw new DOMException('Capacidad agotada','QuotaExceededError');
   return original.apply(this,args);
  };
  window.__failWrites=true;
 });
}
async function stored(page){
 return page.evaluate(async()=>{
  const {loadProgress}=await import('./src/core.js');
  return await loadProgress();
 });
}

test('notas: no confirmar guardado falso, mostrar alerta y reintentar',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="data"]').click();
 await injectQuota(page);
 await page.locator('#notebook').fill('Notas de taller que deben persistir solo después del reintento');
 await page.locator('[data-action="save-notes"]').click();
 await expect(page.locator('.storage-unsaved')).toContainText('Cambios sin guardar');
 await expect(page.locator('.toast.error')).toContainText('No se pudo guardar');
 expect((await stored(page)).notes.general).toBe('');
 await page.evaluate(()=>{window.__failWrites=false;});
 await page.locator('[data-action="retry-save"]').click();
 await expect(page.locator('.storage-unsaved')).toHaveCount(0);
 await expect(page.getByRole('status')).toContainText('Cambios guardados en este dispositivo');
 await page.reload();
 await page.locator('nav.nav button[data-id="data"]').click();
 await expect(page.locator('#notebook')).toHaveValue('Notas de taller que deben persistir solo después del reintento');
});

test('examen con cuota agotada muestra resultado sin afirmar persistencia',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="exams"]').click();
 await page.locator('[data-action="start-exam"][data-topic="cumulative"]').click();
 await injectQuota(page);
 for(let i=0;i<15;i++){
  await page.locator('input[name="answer"]').first().check();
  await page.locator('[data-action="advance-exam"]').click();
 }
 await expect(page.getByRole('heading',{name:'Evaluación finalizada'})).toBeFocused();
 await expect(page.locator('.storage-unsaved')).toContainText('Cambios sin guardar');
 expect((await stored(page)).attempts.length).toBe(0);
 await page.evaluate(()=>{window.__failWrites=false;});
 await page.locator('[data-action="retry-save"]').click();
 await expect(page.locator('.storage-unsaved')).toHaveCount(0);
 expect((await stored(page)).attempts.length).toBe(1);
 await page.reload();
 expect((await stored(page)).attempts.length).toBe(1);
});
