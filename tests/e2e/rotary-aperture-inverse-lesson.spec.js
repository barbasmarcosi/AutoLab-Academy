import{test,expect}from'@playwright/test';
test('RW6++ inverse problem lesson is accessible in academy and stage 15',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="learn"]').click();
 const card=page.locator('article.lesson-card').filter({hasText:'RW6++ — Metrología inversa'});
 await expect(card).toBeVisible();
 await card.getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'RW6++ — Metrología inversa: recuperar apertura desde área con sesgo'})).toBeVisible();
 await page.getByRole('button',{name:'Registrar lectura y volver'}).click();
 await expect(page.locator('article.lesson-card').filter({hasText:'RW6++ — Metrología inversa'})).toContainText('Lectura registrada');
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByText('Ingeniería rotativa: termodinámica')).toBeVisible();
});
