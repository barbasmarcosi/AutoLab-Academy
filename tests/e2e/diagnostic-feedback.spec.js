import {test,expect} from '@playwright/test';
test('la evaluación muestra revisión formativa sin reclamar criterio profesional',async({page})=>{
 await page.goto('./');
 await page.evaluate(()=>{Date.now=()=>733;});
 const cases=await page.evaluate(async()=>{
  const {buildDiagnosticTransfer}=await import('./src/diagnostic-transfer.js');
  return buildDiagnosticTransfer(733).cases;
 });
 await page.locator('nav.nav button[data-id="diagtransfer"]').click();
 await page.locator('[data-action="diagtransfer-start"]').click();
 for(const c of cases){
  await page.locator('#diagtransfer-initial').selectOption({index:1});
  await page.locator('[data-action="diagtransfer-lock"]').click();
  const p=c.probes.find(p=>!p.unsafe);
  await page.locator('[data-action="diagtransfer-probe"][data-id="'+p.id+'"]').click();
  await page.locator('#diagtransfer-prediction').selectOption('normal');
  await page.locator('[data-action="diagtransfer-reveal"]').click();
  await page.locator('#diagtransfer-final').selectOption({index:1});
  await page.locator('#diagtransfer-reason').fill('Esta hipótesis sigue siendo provisional; una sola lectura no es suficiente para eliminar explicaciones alternativas en un vehículo real.');
  await page.locator('#diagtransfer-limits').fill('Se necesitan manuales, otras pruebas discriminantes y comprobación técnica supervisada, no solamente este banco de datos sintético.');
  await page.locator('[data-action="diagtransfer-next"]').click();
 }
 const reviews=page.locator('details.diagnostic-review');
 await expect(reviews).toHaveCount(5);
 await reviews.first().locator('summary').click();
 await expect(reviews.first()).toContainText('Validación externa del razonamiento');
 await expect(reviews.first()).toContainText('no su precisión técnica');
});
