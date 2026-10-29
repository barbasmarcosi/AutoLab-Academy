import{test,expect}from'@playwright/test';
test('RW6+ planar aperture is incorporated into rotary-science curriculum',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="learn"]').click();
 const card=page.locator('article.lesson-card').filter({hasText:'RW6+ — Apertura de lumbreras'});
 await expect(card).toBeVisible();
 await card.getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'RW6+ — Apertura de lumbreras: área nominal, máscara móvil y convergencia'})).toBeVisible();
 await page.getByRole('button',{name:'Registrar lectura y volver'}).click();
 await expect(page.locator('article.lesson-card').filter({hasText:'RW6+ — Apertura de lumbreras'})).toContainText('Lectura registrada');
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByText('Ingeniería rotativa: termodinámica')).toBeVisible();
});
