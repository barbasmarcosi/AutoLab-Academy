import {test,expect} from '@playwright/test';

test('MA00 distinguishes synthetic functional changes, session replication and no mechanical age',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="mechanical-age"]').click();
 await expect(page.getByRole('heading',{name:/Edad mecánica · laboratorio experimental/})).toBeVisible();
 await page.getByRole('button',{name:'Evaluar ambas mediciones'}).click();
 await expect(page.getByText('Condiciones comparables')).toBeVisible();
 await expect(page.getByText(/Diferencia de índice funcional sintético/)).toBeVisible();
 await expect(page.getByText(/Edad equivalente:.*no determinada/).first()).toBeVisible();
 await page.getByRole('button',{name:/Ensayar repetibilidad 2 \+ 2/}).click();
 await expect(page.getByRole('heading',{name:/Ensayo de repetibilidad · 4 sesiones sintéticas/})).toBeVisible();
 await expect(page.getByText(/Unidades experimentales: 4 sesiones/)).toBeVisible();
 await expect(page.getByText(/Sin intervalo de confianza, prueba causal ni edad mecánica/)).toBeVisible();
});

test('MA00 edited JSON cannot spoof synthetic data and get an uncalibrated score',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="mechanical-age"]').click();
 const raw=await page.locator('#ma-before').inputValue();
 const altered=JSON.parse(raw);
 altered.samples[1].rpm+=3;
 altered.source='synthetic';
 await page.locator('#ma-before').fill(JSON.stringify(altered,null,2));
 await page.getByRole('button',{name:'Evaluar ambas mediciones'}).click();
 await expect(page.getByText(/Datos externos: NO calculamos ningún índice no calibrado/)).toBeVisible();
 await expect(page.getByText(/SIN puntuación de datos externos/)).toBeVisible();
 await expect(page.getByText(/Procedencia: provided_obd_unverified/)).toHaveCount(2);
});

test('MA00 reloads offline with research modules, and rejects malformed data safely',async({page,context})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="mechanical-age"]').click();
 await page.locator('#ma-before').fill('{malformed JSON');
 await page.getByRole('button',{name:'Evaluar ambas mediciones'}).click();
 await expect(page.getByText(/No se pudo evaluar/)).toBeVisible();
 await page.getByRole('button',{name:'Restaurar ejemplo sintético'}).click();
 await expect(page.getByText(/No se pudo evaluar/)).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await context.setOffline(true);
 try{
  await page.reload();
  await page.locator('nav.nav button[data-id="mechanical-age"]').click();
  await page.getByRole('button',{name:'Evaluar ambas mediciones'}).click();
  await expect(page.getByText(/Diferencia de índice funcional sintético/)).toBeVisible();
 }finally{await context.setOffline(false);}
});


test('MA00 user can falsify the scoring assumptions using deterministic negative controls',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="mechanical-age"]').click();
 await page.getByRole('button',{name:'Intentar refutar el índice'}).click();
 await expect(page.getByRole('heading',{name:/Controles negativos de falsación/})).toBeVisible();
 await expect(page.getByText(/Se detectaron limitaciones del indicador/)).toBeVisible();
 await expect(page.locator('li').filter({hasText:'STFT y LTFT se compensan'})).toBeVisible();
 await expect(page.getByText(/El score no identifica desgaste ni causa/)).toHaveCount(0);
});


test('MA00 A-A receipt-level demo runs offline-friendly and never labels functional drift as wear',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="mechanical-age"]').click();
 await expect(page.getByRole('heading',{name:/A–A: repetibilidad sin intervención/})).toBeVisible();
 await page.getByRole('button',{name:'Ensayo A–A sintético'}).click();
 await expect(page.getByRole('heading',{name:'Evaluación A–A'})).toBeVisible();
 await expect(page.getByText(/Ventanas documentalmente compatibles/)).toBeVisible();
 await expect(page.getByText(/Edad mecánica, score de salud, desgaste y causalidad/)).toBeVisible();
 await expect(page.getByText(/Evidencia física o sincronización ECU/)).toBeVisible();
 await page.getByRole('button',{name:'Limpiar'}).click();
 await expect(page.getByRole('heading',{name:'Evaluación A–A'})).toHaveCount(0);
});
test('MA00 A-A rejects forged contradictory or incomplete data without showing a delta',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="mechanical-age"]').click();
 await page.locator('#ma-aa-json').fill('[{"invalid":"<script>alert(1)</script>"}]');
 await page.getByRole('button',{name:'Evaluar sesiones aportadas'}).click();
 await expect(page.getByText(/No se pudo evaluar A–A/)).toBeVisible();
 await expect(page.locator('script').filter({hasText:'alert(1)'})).toHaveCount(0);
});


test('MA00 R12 six-session OBD quality demo is offline and abstains on unverified replay',async({page,context})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="mechanical-age"]').click();
 await page.getByRole('button',{name:'Demo R12 (6 sesiones)'}).click();
 await expect(page.getByRole('heading',{name:/R12 — Repetibilidad entre sesiones/})).toBeVisible();
 await expect(page.getByText('Comparación descriptiva habilitada')).toBeVisible();
 await expect(page.getByText(/4 sesiones de referencia \+ 2 posteriores/)).toBeVisible();
 await expect(page.getByText(/Secuencias 100 % sintéticas/)).toBeVisible();
 await expect(page.getByText(/Desgaste, edad mecánica, vida útil y salud porcentual/)).toBeVisible();
 await context.setOffline(true);
 try{
  await page.reload();
  await page.locator('nav.nav button[data-id="mechanical-age"]').click();
  await page.getByRole('button',{name:'Demo R12 (6 sesiones)'}).click();
  await expect(page.getByText('Comparación descriptiva habilitada')).toBeVisible();
 }finally{await context.setOffline(false);}
});


test('MA00 R13 shows classified evidence and never promotes user-entered OBD to synthetic evidence',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="mechanical-age"]').click();
 await page.getByRole('button',{name:'Evaluar ambas mediciones'}).click();
 await expect(page.getByText(/R13 · Contrato de afirmaciones: clasificado; nivel E0/)).toHaveCount(2);
 await expect(page.getByText(/tecnología declarada gasoline_ice \/ gasoline/)).toHaveCount(2);
 const original=JSON.parse(await page.locator('#ma-before').inputValue());
 original.samples[4].rpm+=3;
 original.source='synthetic'; // user cannot forge the demo's evidence tier in the UI
 await page.locator('#ma-before').fill(JSON.stringify(original,null,2));
 await page.getByRole('button',{name:'Evaluar ambas mediciones'}).click();
 await expect(page.getByText(/R13 · Contrato de afirmaciones: clasificado; nivel unverified/)).toHaveCount(2);
 await expect(page.getByText(/Datos externos: NO calculamos ningún índice no calibrado/)).toBeVisible();
 await expect(page.getByText(/Edad equivalente:.*no determinada/)).toHaveCount(2);
});
