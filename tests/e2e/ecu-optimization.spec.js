import{test,expect}from'@playwright/test';
test('RW8 feasible DAILY prediction, constraint review, report and recovery',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="ecu-optimization"]').click();
 await expect(page.getByRole('heading',{name:'ECU Optimization Research Lab'})).toBeVisible();
 await page.locator('#er-scenario').selectOption('daily');
 await page.locator('#er-predicted').selectOption('DAILY');
 await page.locator('#er-real').selectOption('no');
 await page.getByRole('button',{name:'Congelar hipótesis y optimizar'}).click();
 await expect(page.getByText('Comparativa sintética de perfiles: índices sin unidad, no límites de motor real')).toBeVisible();
 await expect(page.getByText(/Opción seleccionada por el optimizador:/)).toBeVisible();
 await page.locator('#er-reason').fill('La exigencia mínima de respuesta descarta ECO y DIAGNOSTIC. SPORT excede varios índices de seguridad inventados, así que DAILY es la única opción admisible.');
 await page.locator('#er-limits').fill('Este experimento no representa una ECU real, ni emisiones, knock, torque o temperaturas. No permite programar mapas ni homologar vehículos.');
 await page.getByRole('button',{name:'Evaluar investigación RW8'}).click();
 await expect(page.getByText(/Resultado: 100\/100/)).toBeVisible();
 await page.getByRole('button',{name:'Guardar expediente RW8'}).click();
 await expect(page.getByRole('button',{name:'Evidencia registrada'})).toBeDisabled();
 await page.locator('nav.nav button[data-id="portfolio"]').click();
 await expect(page.getByText('RW8 — Optimización ECU restringida')).toBeVisible();
 await page.reload();await page.locator('nav.nav button[data-id="portfolio"]').click();
 await expect(page.getByText('RW8 — Optimización ECU restringida')).toBeVisible();
});
test('RW8 incomplete hypotheses never reveal objective solution or evidence button',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="ecu-optimization"]').click();
 await page.getByRole('button',{name:'Congelar hipótesis y optimizar'}).click();
 await expect(page.getByText(/Primero congelá una estrategia/)).toBeVisible();
 await expect(page.getByRole('button',{name:'Guardar expediente RW8'})).toHaveCount(0);
});
