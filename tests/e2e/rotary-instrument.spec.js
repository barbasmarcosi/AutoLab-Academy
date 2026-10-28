import{test,expect}from'@playwright/test';
test('RW4+ adversarial: solo instrumentación independiente demuestra que índice bajo engaña',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="rotary-instruments"]').click();
 await expect(page.getByRole('heading',{name:'Instrument Verification Lab'})).toBeVisible();
 await page.evaluate(()=>{Math.random=()=>0.5;});
 await page.getByRole('button',{name:'Crear desafío adversarial'}).click();
 await page.locator('#ri-initial').selectOption('sealing');
 await page.getByRole('button',{name:'Congelar hipótesis provisional'}).click();
 const actual=await page.evaluate(async()=>{
  const {buildAdversarialCase}=await import('./src/rotary-instrument-check.js');
  return buildAdversarialCase(1073741824);
 });
 for(const check of actual.checks){
  await page.locator('#ri-'+check.id).selectOption(check.classification);
  await page.locator('[data-ri="probe"][data-probe="'+check.id+'"]').click();
 }
 await page.locator('#ri-final').selectOption(actual.cause);
 await page.locator('#ri-reason').fill('La primera lectura de retención es ambigua. Contrasté el segundo instrumento y el control de cero para demostrar si la señal anómala es del sistema o del instrumento simulado.');
 await page.locator('#ri-limits').fill('Estas pruebas son totalmente sintéticas, sin presión de compresión OEM ni calibración profesional de un instrumento físico.');
 await page.getByRole('button',{name:'Concluir desafío adversarial'}).click();
 await expect(page.getByText(/Resultado: 100\/100/)).toBeVisible();
 await page.getByRole('button',{name:'Guardar expediente adversarial'}).click();
 await expect(page.getByRole('button',{name:'Evidencia registrada'})).toBeDisabled();
 await page.locator('nav.nav button[data-id="portfolio"]').click();
 await expect(page.getByText('RW4+ — Verificación instrumental adversarial')).toBeVisible();
 await page.reload();
 await page.locator('nav.nav button[data-id="portfolio"]').click();
 await expect(page.getByText('RW4+ — Verificación instrumental adversarial')).toBeVisible();
});

test('RW4++ simultaneous synthetic faults require a second instrument and zero reference',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="rotary-instruments"]').click();
 await page.evaluate(()=>{Math.random=()=>1.5/2147483647;});
 await page.getByRole('button',{name:'Crear desafío adversarial'}).click();
 await expect(page.getByRole('heading',{name:/semilla 2/})).toBeVisible();
 await page.locator('#ri-initial').selectOption('sealing');
 await page.getByRole('button',{name:'Congelar hipótesis provisional'}).click();
 const actual=await page.evaluate(async()=>{const {buildAdversarialCase}=await import('./src/rotary-instrument-check.js');return buildAdversarialCase(2);});
 expect(actual.cause).toBe('both');
 for(const check of actual.checks){
  await page.locator('#ri-'+check.id).selectOption(check.classification);
  await page.locator('[data-ri="probe"][data-probe="'+check.id+'"]').click();
 }
 await page.locator('#ri-final').selectOption('both');
 await page.locator('#ri-reason').fill('El síntoma inicial es ambiguo. La segunda lectura señala retención sintética baja y el control de cero señala desviación del instrumento; las dos anomalías coexisten en el caso programado.');
 await page.locator('#ri-limits').fill('Las señales son índices adimensionales ficticios y no acreditan diagnóstico de compresión, metrología ni umbrales OEM de un motor real.');
 await page.getByRole('button',{name:'Concluir desafío adversarial'}).click();
 await expect(page.getByText(/Resultado: 100\/100/)).toBeVisible();
});
