import test from 'node:test';
import assert from 'node:assert/strict';
import {rawAAShell,mountRawAA} from '../src/mechanical-age-aa-view.js';
import {syntheticAAReceiptPair} from '../src/mechanical-age-raw-obd.js';
function harness(){
 const events={};
 const root={innerHTML:'',addEventListener(name,fn){events[name]=fn;}};
 return {root,click:key=>events.click({target:{closest:()=>({dataset:{aa:key}})}}),
  input:(id,value)=>events.input({target:{id,value}})};
}
test('MA00 raw A-A UI shows synthetic comparison and explicitly no wear or health age',()=>{
 const {root,click}=harness();
 assert.match(rawAAShell(),/sin intervención/);
 mountRawAA(root);
 assert.match(root.innerHTML,/A–A/);
 click('demo');
 assert.match(root.innerHTML,/Ventanas documentalmente compatibles/);
 assert.match(root.innerHTML,/Mediana A1/);
 assert.match(root.innerHTML,/Edad mecánica, score de salud, desgaste y causalidad/);
 assert.match(root.innerHTML,/no determinados/);
 click('clear');
 assert.doesNotMatch(root.innerHTML,/Ventanas documentalmente compatibles/);
});
test('MA00 user supplied JSON cannot forge synthetic source label',()=>{
 const {root,click,input}=harness();
 mountRawAA(root);
 const f=syntheticAAReceiptPair();
 f[0].events[0].value+=10;
 input('ma-aa-json',JSON.stringify(f));
 click('evaluate');
 assert.match(root.innerHTML,/Ventanas documentalmente compatibles/);
 assert.match(root.innerHTML,/Evidencia física o sincronización ECU/);
 assert.match(root.innerHTML,/no verificada/);
});
test('MA00 raw A-A UI escapes errors and refuses undocumented service',()=>{
 const {root,click,input}=harness();
 mountRawAA(root);
 input('ma-aa-json','{"x":"<img src=x onerror=alert(1)>"}');
 click('evaluate');
 assert.match(root.innerHTML,/No se pudo evaluar A–A/);
 assert.doesNotMatch(root.innerHTML,/<img src=x onerror/);
 const external=syntheticAAReceiptPair();
 external[1].conditions.intervention='oil_change';
 input('ma-aa-json',JSON.stringify(external));
 click('evaluate');
 assert.match(root.innerHTML,/Comparación bloqueada/);
 assert.doesNotMatch(root.innerHTML,/Mediana A1/);
});
