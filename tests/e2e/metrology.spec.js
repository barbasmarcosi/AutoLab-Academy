import{test,expect}from'@playwright/test';
test('MC01 laboratorio reproducible guarda informe de incertidumbre y persiste',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="metrology"]').click();
 await expect(page.getByRole('heading',{name:'Metrology Research Bench'})).toBeVisible();
 await page.evaluate(()=>{Math.random=()=>0.5;});
 await page.getByRole('button',{name:'Nuevo expediente reproducible'}).click();
 const expected=await page.evaluate(async()=>{
  const {simulateMetrology}=await import('./src/metrology-research.js');
  return simulateMetrology(1073741824,'micro');
 });
 await page.locator('#mc-tool').selectOption('micro');
 await page.locator('#mc-prediction').selectOption(expected.conclusion);
 await page.getByRole('button',{name:'Congelar pronóstico y medir'}).click();
 await expect(page.getByText('Presupuesto de incertidumbre')).toBeVisible();
 await expect(page.getByText('Series simuladas en mm, por repetición')).toBeVisible();
 await page.locator('#mc-decision').selectOption(expected.conclusion);
 await page.locator('#mc-reason').fill('La diferencia B menos A debe superar dos veces la incertidumbre combinada. El sesgo instrumental compartido no se suma dos veces y cancela entre series.');
 await page.locator('#mc-limits').fill('Las lecturas son sintéticas y no están calibradas contra patrón real; k igual a dos es un criterio didáctico, no confianza garantizada.');
 await page.getByRole('button',{name:'Cerrar investigación'}).click();
 await expect(page.getByText(/Resultado: 100\/100/)).toBeVisible();
 await page.getByRole('button',{name:'Guardar expediente MC01'}).click();
 await expect(page.getByRole('button',{name:'Evidencia registrada'})).toBeDisabled();
 await page.locator('nav.nav button[data-id="portfolio"]').click();
 await expect(page.getByText('MC01 — Metrología e incertidumbre')).toBeVisible();
 await page.reload();
 await page.locator('nav.nav button[data-id="portfolio"]').click();
 await expect(page.getByText('MC01 — Metrología e incertidumbre')).toBeVisible();
});
