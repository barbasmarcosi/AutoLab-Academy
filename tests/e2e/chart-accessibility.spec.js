import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function goLab(page,mode){
 await page.goto('./');
 await page.locator('nav.nav button[data-id="labs"]').click();
 await page.locator('[data-action="lab-mode"][data-id="'+mode+'"]').click();
}
async function axe(page){
 const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(report.violations.map(v=>v.id)).toEqual([]);
}
test('osciloscopio: tabla real de muestras, unidades y rango completo',async({page})=>{
 await goLab(page,'wave');
 const details=page.locator('.chart-evidence').first();
 await expect(details).toContainText('Explorar datos numéricos');
 await details.locator('summary').click();
 await expect(details.locator('table caption')).toContainText('muestra de');
 await expect(details.locator('tbody tr')).toHaveCount(9);
 await expect(details.locator('thead')).toContainText('Tiempo');
 await expect(details.locator('.chart-ranges')).toContainText('mín.');
 await expect(details.locator('div[role="region"]')).toHaveAttribute('tabindex','0');
 await axe(page);
 // Changing scenario recomputes both visual and tabular evidence.
 const select=page.locator('#wave-scenario');
 await select.selectOption({index:1});
 await expect(page.locator('.chart-evidence')).toHaveCount(1);
 await page.locator('.chart-evidence summary').click();
 await expect(page.locator('.chart-evidence tbody tr')).toHaveCount(9);
});
test('BMS: evolución de SOC y voltaje ofrecen tablas con origen no certificado',async({page})=>{
 await goLab(page,'bms');
 const charts=page.locator('.chart-evidence');
 await expect(charts).toHaveCount(2);
 await charts.first().locator('summary').click();
 await charts.nth(1).locator('summary').click();
 await expect(charts.first()).toContainText('Mínimos y máximos calculados sobre todos');
 await expect(charts.nth(1).locator('thead')).toContainText('Tiempo (s)');
 await expect(charts.first().locator('tbody tr')).toHaveCount(9);
 await expect(charts.nth(1).locator('tbody tr')).toHaveCount(9);
 await axe(page);
});
test('RC: modelo nominal y condición alterada siguen siendo comparables sin SVG',async({page})=>{
 await goLab(page,'components');
 await page.locator('#component-scenario').selectOption('rc');
 const details=page.locator('.chart-evidence');
 await expect(details).toHaveCount(1);
 await details.locator('summary').click();
 await expect(details.locator('thead')).toContainText('Tensión nominal');
 await expect(details.locator('thead')).toContainText('Tensión en condición elegida');
 await expect(details.locator('tbody tr')).toHaveCount(9);
 await page.locator('#component-condition').selectOption('fault');
 await page.locator('.chart-evidence summary').click();
 await expect(page.locator('.chart-evidence tbody tr')).toHaveCount(9);
 await axe(page);
});
