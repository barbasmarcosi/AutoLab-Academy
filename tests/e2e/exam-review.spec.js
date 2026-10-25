import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('examen completo: plan de repaso basado en respuestas guardadas y foco del resultado',async({page})=>{
 await page.goto('./');
 await page.locator('nav.nav button[data-id="exams"]').click();
 await page.locator('[data-action="start-exam"][data-topic="cumulative"]').click();
 for(let i=0;i<15;i++){
  await expect(page.getByRole('heading',{name:'Pregunta '+(i+1)+' de 15'})).toBeVisible();
  await page.locator('input[name="answer"]').first().check();
  await page.locator('input[name="confidence"][value="high"]').check();
  await page.locator('[data-action="advance-exam"]').click();
 }
 await expect(page.getByRole('heading',{name:'Evaluación finalizada'})).toBeFocused();
 const review=page.locator('#exam-review-plan');
 await expect(review.getByRole('heading',{name:'Prioridades para el próximo estudio'})).toBeVisible();
 const attempt=await page.evaluate(async()=>(await (await import('./src/core.js')).loadProgress()).attempts.at(-1));
 const wrong=attempt.details.filter(d=>!d.correct);
 const wrongHigh=wrong.filter(d=>d.confidence==='high');
 if(wrong.length){
  await expect(review).toContainText('Errores observados: '+wrong.length);
  await expect(review).toContainText('Errores con «Muy seguro»: '+wrongHigh.length);
  const topics=[...new Set(wrong.map(x=>x.id))];
  expect(topics.length).toBe(wrong.length);
  expect(await review.locator('li').count()).toBeGreaterThan(0);
  await expect(review.getByRole('button',{name:'Repasar errores registrados'})).toBeVisible();
 }else{
  await expect(review).toContainText('no se registraron respuestas incorrectas');
 }
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(audit.violations.map(x=>x.id)).toEqual([]);
});
