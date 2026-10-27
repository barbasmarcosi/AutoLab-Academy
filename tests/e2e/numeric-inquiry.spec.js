import{test,expect}from'@playwright/test';
import{readFile}from'node:fs/promises';
const why='La observación es un resultado ideal y no basta por sí sola para diagnosticar sensores ni módulos. El parámetro se usa como entrada de un modelo causal reproducible, por lo que una segunda condición permite buscar predicciones incompatibles.';
const limits='El cálculo es sintético, no una lectura instrumental. Falta tolerancia térmica, control de errores sistemáticos, referencia metrológica y verificación física supervisada.';
const entries=[
 {title:'Divisores resistivos y entradas analógicas',id:'lab-numeric-divider-v1',variant:'10',hypothesis:'0',falsifier:'0',predicted:'1.6666667'},
 {title:'Filtro RC: constante de tiempo y respuesta a escalón',id:'lab-numeric-rc-v1',variant:'2',hypothesis:'2',falsifier:'1',predicted:'0.2'},
 {title:'Medición de corriente: shunt y diferencial',id:'lab-numeric-shunt-v1',variant:'12.5',hypothesis:'0',falsifier:'2',predicted:'4'},
 {title:'Entradas digitales, pull-up y circuitos abiertos',id:'lab-numeric-pullup-v1',variant:'10',hypothesis:'2',falsifier:'1',predicted:'2.5'},
 {title:'Driver, actuador y carga: mando no es funcionamiento',id:'lab-numeric-pwm-v1',variant:'50',hypothesis:'1',falsifier:'2',predicted:'6'},
 {title:'CAN: más allá de los dos cables',id:'lab-numeric-can-termination-v1',variant:'2',hypothesis:'2',falsifier:'1',predicted:'60'}
];
async function visit(page,title){
 await page.goto('./');
 await page.locator('nav.nav button[data-id="learn"]').click();
 await page.locator('article.lesson-card').filter({hasText:title}).getByRole('button',{name:'Estudiar'}).click();
}
for(const entry of entries){
 test('blind numeric bench '+entry.id+' persists a model result without accrediting theory',async({page})=>{
  await visit(page,entry.title);
  const root=page.locator('.numeric-bench');
  await expect(root).toBeVisible();
  await expect(root).toContainText('NO es una medición de instrumento');
  await expect(page.locator('#lesson-practice-status')).toContainText('no registrada');
  await root.getByRole('button',{name:'Congelar predicción y calcular el modelo'}).click();
  await expect(root.getByRole('status')).toContainText('Definí hipótesis');
  await root.locator('#nb-variant').selectOption(entry.variant);
  await root.locator('#nb-hypothesis').selectOption(entry.hypothesis);
  await root.locator('#nb-predicted').fill(entry.predicted);
  await root.locator('#nb-falsifier').selectOption(entry.falsifier);
  await root.locator('#nb-explanation').fill(why);
  await root.locator('#nb-limitations').fill(limits);
  await expect(root.getByText(/Resultado matemático:/)).toHaveCount(0);
  await root.getByRole('button',{name:'Congelar predicción y calcular el modelo'}).click();
  await expect(root.getByText(/Resultado matemático:/)).toBeVisible();
  await expect(root.getByText(/100\/100/)).toBeVisible();
  await expect(root.locator('#nb-predicted')).toHaveCount(0);
  await root.getByRole('button',{name:'Guardar evidencia del banco numérico'}).click();
  await expect(page.locator('#lesson-practice-status')).toContainText('Práctica aprobada');
  await expect(page.locator('#lesson-theory-practice-status')).toContainText('Práctica aprobada');
  await expect(page.getByText(/Teoría: lectura pendiente/)).toBeVisible();
  await page.locator('nav.nav button[data-id="data"]').click();
  const download=page.waitForEvent('download');await page.locator('[data-action="export"]').click();
  const raw=JSON.parse(await readFile(await(await download).path(),'utf8'));
  const record=raw.payload.cases.find(x=>x.id===entry.id);
  expect(record?.passed).toBe(true);
  expect(record?.report).toContain('Modelo: autolab-numeric-bench-v1');
  expect(record?.report).toContain('Predicción numérica congelada');
  expect(record?.report).toContain('Resultado CALCULADO del modelo');
  expect(record?.report).toContain('No equivale a medición');
  await page.reload();
  await page.locator('nav.nav button[data-id="learn"]').click();
  await expect(page.locator('article.lesson-card').filter({hasText:entry.title})).toContainText('Práctica aprobada');
 });
}
test('wrong numeric prediction fails closed, retry does not turn reading or nonnumeric evidence into approval',async({page})=>{
 await visit(page,'Divisores resistivos y entradas analógicas');
 const root=page.locator('.numeric-bench');
 await root.locator('#nb-variant').selectOption('10');
 await root.locator('#nb-hypothesis').selectOption('1');
 await root.locator('#nb-predicted').fill('4');
 await root.locator('#nb-falsifier').selectOption('1');
 await root.locator('#nb-explanation').fill(why);
 await root.locator('#nb-limitations').fill(limits);
 await root.getByRole('button',{name:'Congelar predicción y calcular el modelo'}).click();
 await expect(root.getByText(/revisar la hipótesis o el valor predicho/)).toBeVisible();
 await root.getByRole('button',{name:'Guardar evidencia del banco numérico'}).click();
 await expect(page.locator('#lesson-practice-status')).toContainText('todavía sin aprobar');
 await root.getByRole('button',{name:'Realizar otro contraste'}).click();
 await expect(root.locator('#nb-predicted')).toBeVisible();
 await expect(page.locator('#lesson-theory-reasoning-status')).toContainText('pendientes');
});
