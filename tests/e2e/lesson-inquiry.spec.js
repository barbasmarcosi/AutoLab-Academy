import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test('every lesson can host a frozen inquiry design without inventing a simulator or approved practice',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="learn"]').click();
 await page.locator('article.lesson-card').filter({hasText:'Seguridad de alta tensión: reconocer el límite'}).getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'Cuaderno científico: diseñá una investigación'})).toBeVisible();
 await expect(page.locator('#lesson-practice-host')).toHaveCount(0);
 const text={
  hypothesis:'H1: existe una diferencia local de referencia de tensión en el circuito conceptual.',
  alternative:'H2: un canal del instrumento produce la diferencia aparente sin falla física.',
  probe:'Comparar una referencia aislada y un segundo canal en un circuito didáctico protegido.',
  predictH1:'La referencia aislada repetirá la desviación en las dos lecturas del circuito.',
  predictH2:'El canal independiente no repetirá el error mostrado por la primera medición.',
  falsifier:'Una referencia estable en ambas condiciones refutaría la hipótesis principal.',
  confounder:'La deriva térmica de la referencia y del instrumento puede sesgar las comparaciones.',
  limits:'Esta práctica de diseño usa un ejemplo virtual y no habilita mediciones reales sobre sistemas de alta tensión. Requiere supervisión especializada.'
 };
 const fill=async(id)=>page.locator('#inquiry-'+id).fill(text[id]);
 await fill('hypothesis');await fill('alternative');
 await page.getByRole('button',{name:'Congelar hipótesis del cuaderno'}).click();
 for(const key of ['probe','predictH1','predictH2','falsifier','confounder'])await fill(key);
 await page.getByRole('button',{name:'Congelar prueba y predicciones'}).click();
 await expect(page.locator('#inquiry-hypothesis')).toHaveCount(0);
 await expect(page.locator('#inquiry-probe')).toHaveCount(0);
 await fill('limits');
 await page.getByRole('button',{name:'Guardar diseño sin acreditar práctica'}).click();
 await expect(page.locator('#lesson-inquiry-status')).toContainText('1 diseño');
 await expect(page.locator('#lesson-theory-practice-status')).toContainText('No hay práctica vinculada');
 await expect(page.locator('#lesson-theory-reasoning-status')).toContainText('Razonamiento y transferencia pendientes');
 await expect(page.locator('#reasoning-hypothesis')).toBeVisible();
 await expect(page.getByText('Teoría: lectura pendiente',{exact:false})).toBeVisible();
 await page.locator('nav.nav button[data-id="data"]').click();
 const pending=page.waitForEvent('download');await page.locator('[data-action="export"]').click();
 const raw=JSON.parse(await readFile(await (await pending).path(),'utf8'));
 const row=raw.payload.cases.find(x=>x.id==='lab-inquiry-hv-v1');
 expect(row?.score).toBe(0);expect(row?.passed).toBe(false);expect(row?.report).toContain('SIN OBSERVACIÓN');
 await page.reload();await page.locator('nav.nav button[data-id="learn"]').click();
 await page.locator('article.lesson-card').filter({hasText:'Seguridad de alta tensión: reconocer el límite'}).getByRole('button',{name:'Estudiar'}).click();
 await expect(page.locator('#lesson-inquiry-status')).toContainText('1 diseño');
});
