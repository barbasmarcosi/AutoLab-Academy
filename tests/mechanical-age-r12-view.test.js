import test from 'node:test';
import assert from 'node:assert/strict';
import {mountRawAA} from '../src/mechanical-age-aa-view.js';
import {syntheticR12ReceiptSeries} from '../src/mechanical-age-r12-quality.js';

function harness(){
 const events={};
 const root={innerHTML:'',addEventListener(name,fn){events[name]=fn;}};
 return {root,click:key=>events.click({target:{closest:()=>({dataset:{aa:key}})}}),
  input:(value)=>events.input({target:{id:'ma-aa-json',value}})};
}
test('R12 PWA explorer: six-session synthetic demonstration stays explicitly non-physical',()=>{
 const {root,click}=harness();
 mountRawAA(root);
 assert.match(root.innerHTML,/Demo R12/);
 click('demo-r12');
 assert.match(root.innerHTML,/R12 — Repetibilidad entre sesiones/);
 assert.match(root.innerHTML,/Comparación descriptiva habilitada/);
 assert.match(root.innerHTML,/4 sesiones de referencia \+ 2 posteriores/);
 assert.match(root.innerHTML,/Secuencias 100 % sintéticas/);
 assert.match(root.innerHTML,/no verificadas/);
 assert.match(root.innerHTML,/Desgaste, edad mecánica, vida útil/);
 assert.doesNotMatch(root.innerHTML,/diagnóstico confirmado/);
 click('clear');
 assert.doesNotMatch(root.innerHTML,/Comparación descriptiva habilitada/);
});
test('R12 PWA explorer: pasted fake data does NOT become verified physical evidence',()=>{
 const {root,click,input}=harness();
 mountRawAA(root);
 const forged=syntheticR12ReceiptSeries();
 forged[4].events.filter(e=>e.pid==='0106').forEach(e=>{e.value+=5;});
 input(JSON.stringify(forged));
 click('evaluate-r12');
 assert.match(root.innerHTML,/Abstención obligatoria/);
 assert.match(root.innerHTML,/Falta expediente serial Mode 01/);
 assert.doesNotMatch(root.innerHTML,/Comparación descriptiva habilitada/);
});
test('R12 PWA explorer: XSS stays escaped and insufficient 2 sessions abstain',()=>{
 const {root,click,input}=harness();
 mountRawAA(root);
 input('<img src=x onerror=alert(1)>');
 click('evaluate-r12');
 assert.match(root.innerHTML,/No se pudo evaluar A–A/);
 assert.doesNotMatch(root.innerHTML,/<img src=x onerror/);
 const short=syntheticR12ReceiptSeries().slice(0,2);
 input(JSON.stringify(short));
 click('evaluate-r12');
 assert.match(root.innerHTML,/Abstención obligatoria/);
 assert.match(root.innerHTML,/4 sesiones de calibración/);
 assert.doesNotMatch(root.innerHTML,/Medianas posteriores/);
});
