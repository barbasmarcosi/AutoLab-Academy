import test from 'node:test';
import assert from 'node:assert/strict';
import {chartEvidence} from '../src/chart-accessibility.js';

const series=[{key:'v',label:'Tensión',unit:'V'}];
test('muestra acotada conserva extremos y estadísticas calculadas con la serie completa',()=>{
 const points=Array.from({length:101},(_,i)=>({t:i,v:i===37?-11:i===63?21:i/10}));
 const r=chartEvidence(points,'t',series,7);
 assert.equal(r.count,101);
 assert.equal(r.samples.length,7);
 assert.deepEqual([r.samples[0].t,r.samples.at(-1).t],[0,100]);
 assert.equal(r.stats[0].min,-11);
 assert.equal(r.stats[0].max,21);
 assert(!r.samples.some(p=>p.t===37||p.t===63));
});
test('no inventa valores de un canal faltante ni interpola huecos',()=>{
 const r=chartEvidence([{t:0,v:0},{t:1,v:null},{t:2,v:12}], 't',series);
 assert.equal(r.count,3);
 assert.equal(r.stats[0].count,2);
 assert.equal(r.stats[0].min,0);
 assert.equal(r.stats[0].max,12);
 assert.equal(r.samples[1].v,null);
});
test('ignora tiempos inválidos y acota la tabla a máximo 20 filas',()=>{
 const points=[{t:'1',v:100},{t:NaN,v:20},...Array.from({length:100},(_,i)=>({t:i,v:i}))];
 const r=chartEvidence(points,'t',series,10000);
 assert.equal(r.count,100);
 assert.equal(r.total,102);
 assert.equal(r.samples.length,20);
 assert.equal(r.firstTime,0);
 assert.equal(r.lastTime,99);
});
test('serie vacía deja explícitamente cero registros y sin rangos inventados',()=>{
 const r=chartEvidence([], 't',series);
 assert.equal(r.count,0);
 assert.equal(r.firstTime,null);
 assert.equal(r.stats[0].min,null);
 assert.deepEqual(r.samples,[]);
});
