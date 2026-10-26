import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const pkg=JSON.parse(readFileSync('package.json','utf8'));
const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
test('v1.9.13: manifiesto y lockfile reproducible de npm coinciden',()=>{
 assert.equal(lock.lockfileVersion,3);
 assert.equal(lock.name,pkg.name);
 assert.equal(lock.version,pkg.version);
 assert.equal(lock.packages[''].version,pkg.version);
 assert.deepEqual(lock.packages[''].dependencies,pkg.dependencies);
 assert.deepEqual(lock.packages[''].devDependencies,pkg.devDependencies);
 assert(Object.keys(lock.packages).length>=20);
});
test('v1.9.13: dependencias publicadas tienen hashes de integridad',()=>{
 for(const [name,item] of Object.entries(lock.packages)){
  if(!name)continue;
  assert(typeof item.version==='string'&&item.version.length>0,name+' sin versión');
  if(item.resolved?.startsWith('https://registry.npmjs.org/'))
   assert.match(item.integrity||'',/^sha(?:512|384|256)-/,name+' sin integrity SRI');
 }
 for(const name of ['candied','ts-fsrs','esbuild','@playwright/test','@axe-core/playwright'])
  assert(lock.packages['node_modules/'+name],name+' ausente');
});
