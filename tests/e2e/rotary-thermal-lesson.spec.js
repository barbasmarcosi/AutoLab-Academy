import{test,expect}from'@playwright/test';
test('RW2/RW3 curriculum study shows dedicated lessons, marks reading and exposes stage',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="learn"]').click();
 const card=page.locator('article.lesson-card').filter({hasText:'RW2 — Ciclo Otto ideal'});
 await expect(card).toBeVisible();
 await card.getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'RW2 — Ciclo Otto ideal, compresión y límites Wankel'})).toBeVisible();
 await expect(page.getByText(/Ciclo no es arquitectura/)).toBeVisible();
 await page.getByRole('button',{name:'Registrar lectura y volver'}).click();
 await expect(page.locator('article.lesson-card').filter({hasText:'RW2 — Ciclo Otto ideal'})).toContainText('Lectura registrada');
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByText('Ingeniería rotativa: termodinámica')).toBeVisible();
});
