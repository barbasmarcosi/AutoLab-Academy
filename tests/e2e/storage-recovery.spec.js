import {test,expect} from '@playwright/test';

// Intercept the actual object-store put operation, not UI handlers or a mocked
// save function. This mimics QuotaExceededError before the IDB transaction can
// write and asserts truthful user feedback plus recovery.
test('error de cuota: no afirma guardado y permite recuperar la sesión anterior',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="diagtransfer"]').click();
 await page.locator('[data-action="diagtransfer-start"]').click();
 await page.locator('#diagtransfer-initial').selectOption({index:1});
 await page.locator('[data-action="diagtransfer-lock"]').click();
 await page.locator('[data-action="diagtransfer-save"]').click();
 await expect(page.getByRole('status').filter({hasText:'Borrador guardado en este dispositivo.'})).toBeVisible();
 await page.evaluate(()=>{
  const old=IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put=function(...args){
   if(window.__failWrites)throw new DOMException('Almacenamiento lleno','QuotaExceededError');
   return old.apply(this,args);
  };
  window.__failWrites=true;
 });
 await page.locator('#diagtransfer-reason').fill('Texto que no debería quedar en la base por falta de cuota.');
 await page.locator('[data-action="diagtransfer-save"]').click();
 await expect(page.locator('.toast.error')).toContainText('No se pudo guardar en este dispositivo.');
 await page.reload();
 await page.locator('nav.nav button[data-id="diagtransfer"]').click();
 await page.locator('[data-action="diagtransfer-resume"]').click();
 await expect(page.locator('#diagtransfer-reason')).toHaveValue('');
 await page.locator('#diagtransfer-reason').fill('Ahora existe espacio suficiente y el expediente puede volver a escribirse.');
 await page.locator('[data-action="diagtransfer-save"]').click();
 await expect(page.getByRole('status')).toContainText('Borrador guardado en este dispositivo.');
 await page.reload();
 await page.locator('nav.nav button[data-id="diagtransfer"]').click();
 await page.locator('[data-action="diagtransfer-resume"]').click();
 await expect(page.locator('#diagtransfer-reason')).toHaveValue(/Ahora existe espacio suficiente/);
});

test('cola FIFO de restauración y cambios rápidos no reemplaza progreso reciente',async({page})=>{
 await page.goto('./');
 const result=await page.evaluate(async()=>{
  const {saveProgress,loadProgress,emptyProgress}=await import('./src/core.js');
  const make=(n)=>{const data=emptyProgress();data.notes.general='write-'+n;return data;};
  const tasks=[saveProgress(make(1)),saveProgress(make(2)),saveProgress(make(3))];
  await Promise.all(tasks);
  return (await loadProgress()).notes.general;
 });
 expect(result).toBe('write-3');
});
