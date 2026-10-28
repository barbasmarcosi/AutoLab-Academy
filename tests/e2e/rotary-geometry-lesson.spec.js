import{test,expect}from'@playwright/test';
test('RW1+ independent mathematical verification lesson integrates into learning and portfolio',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="learn"]').click();
 const card=page.locator('article.lesson-card').filter({hasText:'RW1+ — Validar geometría'});
 await expect(card).toBeVisible();
 await card.getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'RW1+ — Validar geometría Wankel idealizada con una integral independiente'})).toBeVisible();
 await page.getByRole('button',{name:'Registrar lectura y volver'}).click();
 await expect(card).toContainText('Lectura registrada');
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByText('Ingeniería rotativa: termodinámica')).toBeVisible();
});
