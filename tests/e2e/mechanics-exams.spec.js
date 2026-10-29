import{test,expect}from'@playwright/test';
test('MC00–MC14 stage-specific exams select the correct 6-question pool',async({page})=>{
 await page.goto('./');await page.locator('nav.nav button[data-id="exams"]').click();
 await expect(page.getByRole('heading',{name:'Exámenes por etapa de mecánica MC00–MC14'})).toBeVisible();
 const cards=page.locator('.panel').filter({has:page.getByRole('button',{name:'Examinar etapa'})});
 await expect(page.getByRole('button',{name:'Examinar etapa'})).toHaveCount(5);
 await page.getByRole('button',{name:'Examinar etapa'}).first().click();
 await expect(page.getByRole('heading',{name:'Pregunta 1 de 6'})).toBeVisible();
 const actual=await page.locator('section.panel.quiz h2').textContent();
 const firstPool=await page.evaluate(async()=>{
  const [{mechanicsStageQuestions},{mechanicsQuestions}]=await Promise.all([
   import('./src/mechanics-exams.js'),import('./src/mechanics-curriculum.js')
  ]);
  return mechanicsStageQuestions(mechanicsQuestions,'mechanics').map(q=>q.question);
 });
 expect(firstPool).toContain(actual);
});
