import{test,expect}from'@playwright/test';
test('RW4 investigación sintética: predicción, descarte, cierre y persistencia',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="rotary-seals"]').click();
 await expect(page.getByRole('heading',{name:'Rotary Diagnostic Research'})).toBeVisible();
 await page.evaluate(()=>{Math.random=()=>0.5;});
 await page.getByRole('button',{name:'Crear caso reproducible'}).click();
 await expect(page.getByText(/Arranque difícil y ralentí irregular/)).toBeVisible();
 await page.locator('#rw4-initial').selectOption('ignition');
 await page.getByRole('button',{name:'Congelar hipótesis inicial'}).click();
 await expect(page.getByText(/Hipótesis congelada:/)).toBeVisible();
 const detail=await page.evaluate(async()=>{
  const {buildSealInvestigation}=await import('./src/rotary-seal-diagnostic.js');
  return buildSealInvestigation(1073741824);
 });
 for(const p of detail.probes){
  await page.locator('#rw4-'+p.id).selectOption(p.predicted);
  await page.locator('[data-rw4="reveal"][data-probe="'+p.id+'"]').click();
  await expect(page.getByText(/observado:/).first()).toBeVisible();
 }
 await page.locator('#rw4-final').selectOption(detail.cause);
 await page.locator('#rw4-reason').fill('Comparé retención neumática relativa y energía primaria simulada bajo iguales condiciones. Un índice anómalo y el otro normal permiten discriminar las dos causas posibles dentro de este modelo.');
 await page.locator('#rw4-uncertainty').fill('Los índices adimensionales son sintéticos, no valores reales de presión o voltaje; no existen límites OEM y se requiere prueba en taller.');
 await page.getByRole('button',{name:'Concluir investigación'}).click();
 await expect(page.getByText(/Resultado: 100\/100/)).toBeVisible();
 await page.getByRole('button',{name:'Guardar expediente RW4'}).click();
 await expect(page.getByRole('button',{name:'Evidencia registrada'})).toBeDisabled();
 await page.locator('nav.nav button[data-id="portfolio"]').click();
 await expect(page.getByText('RW4 — Diagnóstico diferencial rotativo')).toBeVisible();
 await page.reload();
 await page.locator('nav.nav button[data-id="portfolio"]').click();
 await expect(page.getByText('RW4 — Diagnóstico diferencial rotativo')).toBeVisible();
});
test('MC00/MC01: lecciones disponibles y registro de lectura tras recarga',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="learn"]').click();
 const card=page.locator('article.lesson-card').filter({hasText:'MC00 — Seguridad'});
 await expect(card).toBeVisible();
 await card.getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'MC00 — Seguridad: analizar riesgos antes de intervenir'})).toBeVisible();
 await page.getByRole('button',{name:'Registrar lectura y volver'}).click();
 await expect(page.locator('article.lesson-card').filter({hasText:'MC00 — Seguridad'})).toContainText('Lectura registrada');
 await page.reload();
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByText('Mecánica integral — fundamentos')).toBeVisible();
});
