import test from 'node:test';
import assert from 'node:assert/strict';
import {mechanicalAgeShell,mountMechanicalAgeLab} from '../src/mechanical-age-view.js';

const fakeRoot=()=>{
 const events={},root={innerHTML:'',addEventListener(name,handler){events[name]=handler;}};
 const click=action=>events.click({target:{closest:()=>({dataset:{ma:action}})}});
 const input=(id,value)=>events.input({target:{id,value}});
 return {root,click,input};
};
test('MA00 renders synthetic cases and compares with clearly non-aged conclusions',()=>{
 const {root,click}=fakeRoot();
 assert.match(mechanicalAgeShell(),/Edad mecánica/);
 assert.match(mechanicalAgeShell(),/mechanical-age-explorer/);
 mountMechanicalAgeLab(root);
 assert.match(root.innerHTML,/synthetic/);
 assert.match(root.innerHTML,/antes/mi);
 click('evaluate');
 assert.match(root.innerHTML,/Condiciones comparables/);
 assert.match(root.innerHTML,/Diferencia de índice funcional/);
 assert.match(root.innerHTML,/no determinada/);
 assert.doesNotMatch(root.innerHTML,/edad equivalente a \d+/i);
});
test('MA00 rejects forged JSON and escapes user supplied HTML',()=>{
 const {root,click,input}=fakeRoot();
 mountMechanicalAgeLab(root);
 input('ma-before','{"bad":"<img src=x onerror=alert(1)>"}');
 click('evaluate');
 assert.match(root.innerHTML,/No se pudo evaluar/);
 assert.doesNotMatch(root.innerHTML,/<img src=x/);
 input('ma-before','not JSON');
 click('evaluate');
 assert.match(root.innerHTML,/No se pudo evaluar/);
 click('demo');
 assert.match(root.innerHTML,/demo-unit-001/);
 assert.doesNotMatch(root.innerHTML,/No se pudo evaluar/);
});

test('MA00 shows repeated-session uncertainty instead of treating 160 sensor rows as 160 engines',()=>{
 const {root,click}=fakeRoot();
 mountMechanicalAgeLab(root);
 assert.match(root.innerHTML,/repetibilidad 2 \+ 2/i);
 click('replicates');
 assert.match(root.innerHTML,/4 sesiones sintéticas/);
 assert.match(root.innerHTML,/Unidades experimentales: 4 sesiones/);
 assert.match(root.innerHTML,/Sin intervalo de confianza/);
 assert.match(root.innerHTML,/NO prueba causalidad/);
});
