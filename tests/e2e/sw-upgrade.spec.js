import {test,expect} from '@playwright/test';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';

// A real versioned worker from the previous release, installed and activated
// in the same browser origin/scope before upgrading to the current release.
// Fixture files exist only while tests run and are deleted before artifacts.
test('actualización v28 → v29 conserva IndexedDB y reabre la PWA sin red',async({page,context},testInfo)=>{
 const stem='sw-legacy-'+testInfo.project.name.replace(/[^a-z0-9-]/ig,'-');
 const workerName=stem+'.js',htmlName=stem+'.html';
 const folder=join('site','AutoLab-Academy');
 const workerPath=join(folder,workerName),htmlPath=join(folder,htmlName);
 writeFileSync(workerPath,readFileSync(join('tests','fixtures','sw-v28.js')));
 writeFileSync(htmlPath,'<!doctype html><html lang="es"><title>SW fixture</title><body>Preparar migración</body></html>');
 try{
  await page.goto('./'+htmlName);
  await page.evaluate(async name=>{
   const r=await navigator.serviceWorker.register('./'+name,{scope:'./'});
   await new Promise((resolve,reject)=>{
    if(r.active?.state==='activated')return resolve();
    const candidate=r.installing||r.waiting||r.active;
    if(!candidate)return reject(Error('worker legacy no instalado'));
    candidate.addEventListener('statechange',()=>{if(candidate.state==='activated')resolve();});
   });
  },workerName);
  await expect.poll(()=>page.evaluate(async()=>await caches.keys())).toContain('autolab-academy-v28');
  await page.evaluate(async()=>{
   const {emptyProgress,saveProgress}=await import('./src/core.js');
   const progress=emptyProgress();
   progress.notes.general='Prueba local: no borrar progreso durante upgrade offline';
   await saveProgress(progress);
  });
  // Updating a registration to a different script URL but identical scope
  // exercises real installation, activation, cache migration and clients.claim.
  await page.evaluate(async()=>{
   await navigator.serviceWorker.register('./sw.js',{scope:'./'});
  });
  await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js'),null,{timeout:30_000});
  await expect.poll(()=>page.evaluate(()=>caches.keys())).toContain('autolab-academy-v29');
  await expect.poll(()=>page.evaluate(()=>caches.keys())).not.toContain('autolab-academy-v28');
  await context.setOffline(true);
  await page.goto('./');
  await expect(page.getByRole('heading',{name:/Aprendé a encontrar la causa/i})).toBeVisible();
  await page.locator('nav.nav button[data-id="data"]').click();
  await expect(page.locator('#notebook')).toHaveValue('Prueba local: no borrar progreso durante upgrade offline');
  await page.locator('nav.nav button[data-id="diagtransfer"]').click();
  await expect(page.getByRole('heading',{name:'Mismo síntoma, causas distintas'})).toBeVisible();
 }finally{
  await context.setOffline(false);
  try{unlinkSync(workerPath);}catch{}
  try{unlinkSync(htmlPath);}catch{}
 }
});
