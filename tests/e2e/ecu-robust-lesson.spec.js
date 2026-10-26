import{test,expect}from'@playwright/test';
test('RW8+ study teaches interval uncertainty and nondominance inside control level 16',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="learn"]').click();
 const card=page.locator('article.lesson-card').filter({hasText:'RW8+ — Incertidumbre'});
 await expect(card).toBeVisible();await card.getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'RW8+ — Incertidumbre, peor caso y factibilidad robusta'})).toBeVisible();
 await page.getByRole('button',{name:'Registrar lectura y volver'}).click();
 await expect(page.locator('article.lesson-card').filter({hasText:'RW8+ — Incertidumbre'})).toContainText('Lectura registrada');
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByText('Ingeniería rotativa: control y optimización')).toBeVisible();
});

test('RW8++ factorial research lesson is visible in the rotary control learning path',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="learn"]').click();
 const card=page.locator('article.lesson-card').filter({hasText:'RW8++ — Diseño factorial'});
 await expect(card).toBeVisible();
 await card.getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'RW8++ — Diseño factorial 2² y perturbaciones acopladas'})).toBeVisible();
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByText('Ingeniería rotativa: control y optimización')).toBeVisible();
});
