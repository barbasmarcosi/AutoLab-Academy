import{test,expect}from'@playwright/test';
import{readFile}from'node:fs/promises';
test('MC06 three-cause powertrain diagnosis, immutable predictions, energy report and offline backup',async({page,context})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="powertrain"]').click();
 await expect(page.getByRole('heading',{name:'Powertrain Diagnostic Bench'})).toBeVisible();
 await page.evaluate(()=>{Math.random=()=>1.5/2147483647;});
 await page.getByRole('button',{name:'Crear investigación MC06'}).click();
 await expect(page.getByText(/semilla 2/)).toBeVisible();
 await page.locator('#pt-initial').selectOption('slip');
 await page.getByRole('button',{name:'Congelar hipótesis'}).click();
 await page.locator('#pt-independent').selectOption('normal');
 await page.getByRole('button',{name:/Congelar y revelar Tacómetro independiente/}).click();
 await expect(page.getByText(/clase: normal/)).toBeVisible();
 await page.locator('#pt-reference').selectOption('large');
 await page.getByRole('button',{name:/Congelar y revelar Chequeo independiente/}).click();
 await page.locator('#pt-final').selectOption('sensor');
 await page.locator('#pt-reason').fill('Una caída indicada de RPM no identifica al sistema mecánico. El tacómetro independiente virtual detecta régimen nominal y la prueba de referencia detecta el canal sesgado, descartando falla mecánica programada.');
 await page.locator('#pt-limits').fill('Los valores corresponden a una caja didáctica, no a un convertidor real. Faltan manual específico, mediciones físicas supervisadas y condiciones de carga antes de intervenir.');
 await page.getByRole('button',{name:'Evaluar investigación'}).click();
 await expect(page.getByText(/Resultado: 100\/100/)).toBeVisible();
 await expect(page.getByText(/Balance energético ficticio:/)).toBeVisible();
 await page.getByRole('button',{name:'Guardar investigación MC06'}).click();
 await expect(page.getByRole('button',{name:'Evidencia registrada'})).toBeDisabled();
 await page.locator('nav.nav button[data-id="data"]').click();
 const wait=page.waitForEvent('download');await page.locator('[data-action="export"]').click();
 const backup=await readFile(await (await wait).path(),'utf8');
 expect(JSON.parse(backup).payload.cases.find(c=>c.id==='lab-powertrain-mc06-v1').report).toContain('Semilla: 2');
 page.on('dialog',d=>d.accept());await page.locator('[data-action="reset"]').click();
 await page.locator('nav.nav button[data-id="data"]').click();
 await page.locator('#import-file').setInputFiles({name:'mc06.json',mimeType:'application/json',buffer:Buffer.from(backup)});
 await expect.poll(()=>page.evaluate(async()=>{const {loadProgress}=await import('./src/core.js');return (await loadProgress()).cases.some(c=>c.id==='lab-powertrain-mc06-v1')})).toBe(true);
 await page.locator('nav.nav button[data-id="portfolio"]').click();
 await expect(page.getByText('MC06 — Diagnóstico del tren motriz')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await context.setOffline(true);
 try{await page.reload();await page.locator('nav.nav button[data-id="powertrain"]').click();await expect(page.getByRole('heading',{name:'Powertrain Diagnostic Bench'})).toBeVisible();}
 finally{await context.setOffline(false);}
});
test('MC06 will not reveal probes until a hypothesis and a predicted class are frozen',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="powertrain"]').click();
 await page.getByRole('button',{name:'Crear investigación MC06'}).click();
 await page.getByRole('button',{name:'Congelar hipótesis'}).click();
 await expect(page.getByText(/Elegí una hipótesis inicial/)).toBeVisible();
 await page.locator('#pt-initial').selectOption('sensor');
 await page.getByRole('button',{name:'Congelar hipótesis'}).click();
 await expect(page.locator('#pt-reference')).toHaveCount(0);
 await page.getByRole('button',{name:/Congelar y revelar Tacómetro independiente/}).click();
 await expect(page.getByText(/La clase seleccionada no es válida/)).toBeVisible();
});
