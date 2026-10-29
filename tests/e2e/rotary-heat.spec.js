import{test,expect}from'@playwright/test';
test('RW5 lower area but higher convection coefficient: report and backup persist',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="rotary-heat"]').click();
 await expect(page.getByRole('heading',{name:'Rotary Heat Transfer Lab'})).toBeVisible();
 await page.locator('#rh-h').selectOption('400');
 await page.locator('#rh-prediction').selectOption('aumenta');
 await page.locator('#rh-real').selectOption('no');
 await page.getByRole('button',{name:'Congelar hipótesis y revelar'}).click();
 await expect(page.getByText('Convección ideal uniforme: valores sintéticos y dimensionalmente consistentes')).toBeVisible();
 await expect(page.getByText(/Tendencia del modelo: aumenta/)).toBeVisible();
 await page.locator('#rh-reason').fill('La transferencia de calor convectiva es proporcional al área y al coeficiente h: al subir h desde 250 a 400, puede aumentar el calor pese a la disminución del área en este modelo.');
 await page.locator('#rh-limits').fill('Sin datos físicos de temperaturas, Nusselt o corrientes de gas; es un modelo lumped sintético que no representa el comportamiento térmico real del Wankel.');
 await page.getByRole('button',{name:'Cerrar investigación RW5'}).click();
 await expect(page.getByText(/Resultado: 100\/100/)).toBeVisible();
 await page.getByRole('button',{name:'Guardar investigación RW5'}).click();
 await expect(page.getByRole('button',{name:'Evidencia registrada'})).toBeDisabled();
 await page.locator('nav.nav button[data-id="portfolio"]').click();
 await expect(page.getByText('RW5 — Sensibilidad de transferencia térmica')).toBeVisible();
 await page.reload();await page.locator('nav.nav button[data-id="portfolio"]').click();
 await expect(page.getByText('RW5 — Sensibilidad de transferencia térmica')).toBeVisible();
});
test('RW5 incomplete hypothesis must not reveal results or allow storage',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="rotary-heat"]').click();
 await page.getByRole('button',{name:'Congelar hipótesis y revelar'}).click();
 await expect(page.getByText(/Primero formulá las dos predicciones/)).toBeVisible();
 await expect(page.getByRole('button',{name:'Guardar investigación RW5'})).toHaveCount(0);
});
