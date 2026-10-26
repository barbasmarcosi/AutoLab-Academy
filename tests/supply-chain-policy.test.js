import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const files=['.github/workflows/pages.yml','.github/workflows/science-pybamm.yml'];
test('acciones GitHub de CI y ciencia fijadas por SHA inmutable',()=>{
 for(const file of files){
  const yaml=readFileSync(file,'utf8');
  const actions=[...yaml.matchAll(/^\s*-\s*uses:\s*(\S+)/gm)].map(m=>m[1]);
  assert(actions.length>=3,file+': faltan acciones');
  for(const action of actions)assert.match(action,/^[a-z0-9-]+\/[a-z0-9-]+@[a-f0-9]{40}$/,file+' contiene una etiqueta móvil '+action);
 }
});
test('supply chain: npm ci, audit high/critical y actualizaciones controladas',()=>{
 const workflow=readFileSync('.github/workflows/pages.yml','utf8');
 assert.match(workflow,/run:\s+npm ci --no-audit --no-fund/);
 assert.match(workflow,/run:\s+npm audit --audit-level=high/);
 const dependabot=readFileSync('.github/dependabot.yml','utf8');
 assert.match(dependabot,/package-ecosystem:\s+npm/);
 assert.match(dependabot,/package-ecosystem:\s+github-actions/);
 assert.match(dependabot,/open-pull-requests-limit:\s+3/);
 assert(!/auto-merge/i.test(dependabot),'Las actualizaciones no deben fusionarse solas');
});
