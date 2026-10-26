import{test,expect}from'@playwright/test';
test('MC06 diagnostic training is a study path lesson with persistent reading progress',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="learn"]').click();
 const card=page.locator('article.lesson-card').filter({hasText:'MC06+ — Deslizamiento, sensor'});
 await expect(card).toBeVisible();
 await card.getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'MC06+ — Deslizamiento, sensor y balance energético del tren motriz'})).toBeVisible();
 await page.getByRole('button',{name:'Registrar lectura y volver'}).click();
 await expect(card).toContainText('Lectura registrada');
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByText('Chasis, transmisión y seguridad')).toBeVisible();
});
