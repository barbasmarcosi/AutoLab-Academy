import{test,expect}from'@playwright/test';
import{readFile}from'node:fs/promises';
const reasoning='Primero planteo hipótesis alternativas sobre el período, amplitud y señal diferencial del modelo. Mi predicción numérica depende de una condición controlada; si el resultado contradice el criterio refutador, rechazo la inferencia original.';
const limits='Este oscilograma solo se genera a partir de cálculos ideales. No contiene ruido, datos OEM, carga real ni medición calibrada y nunca constituye prueba sobre un automóvil.';
const cases=[
 {title:'Lectura inicial de señales con osciloscopio',id:'lab-scope-waveform-v1',variant:'1',predicted:'200',hypothesis:'0',falsifier:'1'},
 {title:'PWM y disparo: leer amplitud, período y duty',id:'lab-pwm-waveform-v1',variant:'50',predicted:'50',hypothesis:'1',falsifier:'2'},
 {title:'CKP, CMP y sincronización del motor',id:'lab-ckp-waveform-v1',variant:'0.8',predicted:'750',hypothesis:'2',falsifier:'1'},
 {title:'CAN físico: terminación y alimentación de nodos',id:'lab-can-differential-waveform-v1',variant:'2',predicted:'2',hypothesis:'2',falsifier:'1'}
];
async function visit(page,title){
 await page.goto('./');await page.locator('nav.nav button[data-id="learn"]').click();
 await page.locator('article.lesson-card').filter({hasText:title}).getByRole('button',{name:'Estudiar'}).click();
}
for(const c of cases){
 test('oscilloscope investigation '+c.id+' hides trace until prediction and restores saved report',async({page})=>{
  await visit(page,c.title);
  const root=page.locator('.waveform-inquiry');
  await expect(root).toBeVisible();
  await expect(root.getByText(/La captura permanece oculta/)).toBeVisible();
  await expect(root.locator('.inquiry-oscillogram')).toHaveCount(0);
  await expect(root.getByText(/Resultado del modelo/)).toHaveCount(0);
  await root.getByRole('button',{name:'Congelar predicción y revelar oscilograma'}).click();
  await expect(root.getByRole('status')).toContainText('Completá hipótesis');
  await root.locator('#wi-variant').selectOption(c.variant);
  await root.locator('#wi-hypothesis').selectOption(c.hypothesis);
  await root.locator('#wi-predicted').fill(c.predicted);
  await root.locator('#wi-falsifier').selectOption(c.falsifier);
  await root.locator('#wi-explanation').fill(reasoning);
  await root.locator('#wi-limits').fill(limits);
  await expect(root.locator('svg')).toHaveCount(0);
  await root.getByRole('button',{name:'Congelar predicción y revelar oscilograma'}).click();
  await expect(root.locator('svg[role="img"]')).toBeVisible();
  await expect(root.locator('.inquiry-oscillogram figcaption')).toContainText('GENERADO');
  await expect(root.locator('p').filter({hasText:'Resultado del modelo:'})).toContainText('100/100');
  await expect(root.getByText(/Hipótesis compatible:/)).toBeVisible();
  await root.getByRole('button',{name:'Guardar evidencia del oscilograma'}).click();
  const independent=c.id==='lab-scope-waveform-v1';
  await expect(page.locator('#lesson-practice-status')).toContainText(
   independent?'Banco guiado completado · caso independiente sin resolver':'Práctica aprobada');
  if(!independent)await expect(page.locator('#lesson-practice-status')).toContainText('NO competencia física');
  // The new scope holdout is required separately; a guided pass alone must not imply transfer.
  if(independent)await expect(page.locator('#scope-holdout-host')).toBeVisible();
  await expect(page.getByText(/Teoría: lectura pendiente/)).toBeVisible();
  await page.locator('nav.nav button[data-id="data"]').click();
  const dl=page.waitForEvent('download');await page.locator('[data-action="export"]').click();
  const raw=JSON.parse(await readFile(await(await dl).path(),'utf8'));
  const record=raw.payload.cases.find(x=>x.id===c.id);
  expect(record?.passed).toBe(true);
  expect(record?.report).toContain('Modelo: autolab-waveform-inquiry-v1');
  expect(record?.report).toContain('Predicción congelada');
  expect(record?.report).toContain('NO evaluada semánticamente');
  await page.reload();await page.locator('nav.nav button[data-id="learn"]').click();
  await expect(page.locator('article.lesson-card').filter({hasText:c.title})).toContainText('Práctica aprobada');
 });
}
test('wrong waveform inference stays unapproved and retake does not leak model plot',async({page})=>{
 await visit(page,'PWM y disparo: leer amplitud, período y duty');
 const root=page.locator('.waveform-inquiry');
 await root.locator('#wi-variant').selectOption('50');
 await root.locator('#wi-hypothesis').selectOption('0');
 await root.locator('#wi-predicted').fill('25');
 await root.locator('#wi-falsifier').selectOption('0');
 await root.locator('#wi-explanation').fill(reasoning);
 await root.locator('#wi-limits').fill(limits);
 await root.getByRole('button',{name:'Congelar predicción y revelar oscilograma'}).click();
 await expect(root.getByText(/Resultado del modelo/)).toBeVisible();
 await root.getByRole('button',{name:'Guardar evidencia del oscilograma'}).click();
 await expect(page.locator('#lesson-practice-status')).toContainText('todavía sin aprobar');
 await root.getByRole('button',{name:'Replantear investigación'}).click();
 await expect(root.locator('svg')).toHaveCount(0);
 await expect(root.locator('#wi-predicted')).toBeVisible();
});
