import{test,expect}from'@playwright/test';
test('RW8 engine control lessons belong to a specific progressive level',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="learn"]').click();
 const lesson=page.locator('article.lesson-card').filter({hasText:'RW8 — Ingeniería de ECU'});
 await expect(lesson).toBeVisible();await lesson.getByRole('button',{name:'Estudiar'}).click();
 await expect(page.getByRole('heading',{name:'RW8 — Ingeniería de ECU: límites, observabilidad y funciones de protección'})).toBeVisible();
 await page.getByRole('button',{name:'Registrar lectura y volver'}).click();
 await expect(page.locator('article.lesson-card').filter({hasText:'RW8 — Ingeniería de ECU'})).toContainText('Lectura registrada');
 await page.locator('nav.nav button[data-id="path"]').click();
 await expect(page.getByText('Ingeniería rotativa: control y optimización')).toBeVisible();
});
