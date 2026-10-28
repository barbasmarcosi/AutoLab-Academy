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

test('MA00 cannot be tricked into scoring edited measurements through a forged source: synthetic field',()=>{
 const {root,click,input}=fakeRoot();
 mountMechanicalAgeLab(root);
 const changed=JSON.stringify({
  engineFamily:'demo-gasoline-inline4',vehicleAlias:'demo-unit-001',
  protocol:'warm-idle-fixed-load-v0',phase:'before_service',source:'synthetic',
  samples:Array.from({length:40},(_,i)=>({timeMs:i*1000,rpm:800+i%3,ectC:90,loadPct:16,stftPct:10,ltftPct:6,iatC:32}))
 },null,2);
 input('ma-before',changed);
 click('evaluate');
 assert.match(root.innerHTML,/provided_obd_unverified/);
 assert.match(root.innerHTML,/No calculable/);
 assert.match(root.innerHTML,/SIN puntuación/);
});
