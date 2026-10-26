import{test,expect}from'@playwright/test';
test('MC14 black-box training is visible in research stage and saved offline',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="learn"]').click();
 const card=page.locator('article.lesson-card').filter({hasText:'MC14 — Identificación de caja negra'});
 await expect(card).toBeVisible();
 await card.getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'MC14 — Identificación de caja negra y conjunto de validación'})).toBeVisible();
 await page.getByRole('button',{name:'Registrar lectura y volver'}).click();
 await expect(card).toContainText('Lectura registrada');
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByText('Diagnóstico e investigación')).toBeVisible();
});
