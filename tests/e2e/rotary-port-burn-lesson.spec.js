import{test,expect}from'@playwright/test';
test('RW6/RW7 study path shows port timing and assumed heat release lessons',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="learn"]').click();
 const card=page.locator('article.lesson-card').filter({hasText:'RW6 — Puertos Wankel'});
 await expect(card).toBeVisible();await card.getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'RW6 — Puertos Wankel: solapamiento, oportunidad de admisión y límites de diseño'})).toBeVisible();
 await page.getByRole('button',{name:'Registrar lectura y volver'}).click();
 await expect(page.locator('article.lesson-card').filter({hasText:'RW6 — Puertos Wankel'})).toContainText('Lectura registrada');
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByText('Ingeniería rotativa: termodinámica')).toBeVisible();
});
