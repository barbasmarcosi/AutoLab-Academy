import test from 'node:test';import assert from 'node:assert/strict';import{auditScenarioCatalogs}from'../src/scenario-audit.js';
const allowed=['electricidad','motor','senales','redes','ev'];
const input=[{name:'instrumentos',sourceRequired:true,items:[{id:'test-scope',topic:'senales',title:'Lectura bajo carga',source:'https://example.org/test'}]}];
test('audita un catálogo sintético completo con ID, título, tema y fuente',()=>{
 const result=auditScenarioCatalogs(input,allowed);
 assert.equal(result.ok,true);
 assert.equal(result.summary.scenarios,1);
 assert.equal(result.summary.uniqueIds,1);
});
test('detecta duplicidad transversal entre módulos independientes',()=>{
 const r=auditScenarioCatalogs([...input,{name:'segundo',items:[{...input[0].items[0]}]}],allowed);
 assert.equal(r.ok,false);assert(r.errors.some(s=>s.includes('ID duplicado')));
});
test('bloquea fuentes inseguras y errores de validadores existentes',()=>{
 const r=auditScenarioCatalogs([{name:'bad',sourceRequired:true,validate:()=>{throw Error('sin confirmación')},items:[{id:'bad-id',topic:'motor',title:'Lectura ficticia',source:'http://example.org'}]}],allowed);
 assert(r.errors.some(x=>x.includes('fuente no HTTPS')));
 assert(r.errors.some(x=>x.includes('sin confirmación')));
});
test('la fuente contextual es obligatoria cuando así lo declara el catálogo',()=>{
 const r=auditScenarioCatalogs([{...input[0],items:[{id:'missing-source',topic:'motor',title:'Modelo eléctrico'}]}],allowed);
 assert(r.errors.some(x=>x.includes('fuente conceptual ausente')));
});
