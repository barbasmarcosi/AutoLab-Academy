import {test,expect} from '@playwright/test';

test('Modo Taller: iPhone can perform measurements and submit a diagnosis',async({page})=>{
 await page.goto('diagnostico/');
 await expect(page.getByRole('heading',{name:/Una falla. Tres sospechosos/})).toBeVisible();
 await expect(page.getByText('Sin compras, anuncios ni respuestas regaladas.')).toBeVisible();
 await page.getByRole('button',{name:/Investigar/}).first().click();
 await expect(page.getByRole('heading',{name:'Arranque en frío'})).toBeVisible();
 await page.getByRole('radio',{name:'Termistor ECT abierto'}).check();
 await page.getByRole('button',{name:/Registrar hipótesis/}).click();
 await page.getByRole('button',{name:/Resistencia del ECT desconectado/}).click();
 await page.getByRole('button',{name:'Realizar medición'}).click();
 await expect(page.getByText('RESULTADO DEL INSTRUMENTO')).toBeVisible();
 await page.getByRole('button',{name:/Continuidad del conductor de señal/}).click();
 await page.getByRole('button',{name:'Realizar medición'}).click();
 await page.locator('#final-diagnosis').selectOption('sensor');
 await page.locator('#reasoning').fill('Comprobé la resistencia del sensor y la continuidad de la señal para contrastar ambas causas.');
 await page.getByRole('button',{name:/Entregar diagnóstico/}).click();
 await expect(page.getByText('INFORME DE DIAGNÓSTICO')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Tu diagnóstico'})).toBeVisible();
 await page.reload();
 await expect(page.getByText('1', {exact:true}).first()).toBeVisible();
});

test('Modo Taller: unfinished diagnosis can resume after reload',async({page})=>{
 await page.goto('diagnostico/');
 await page.getByRole('button',{name:/Investigar/}).nth(1).click();
 await page.getByRole('radio',{name:'Resistencia excesiva en alimentación'}).check();
 await page.getByRole('button',{name:/Registrar hipótesis/}).click();
 await page.reload();
 await expect(page.getByRole('button',{name:/Continuar diagnóstico/})).toBeVisible();
 await page.getByRole('button',{name:/Continuar diagnóstico/}).click();
 await expect(page.getByRole('heading',{name:'ECU se reinicia'})).toBeVisible();
});
