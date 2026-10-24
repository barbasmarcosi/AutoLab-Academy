import test from 'node:test';
import assert from 'node:assert/strict';
import {BMS_SCENARIOS,generateSyntheticBms,parseBmsCsv,formatBmsCsv,analyzeBms,capacitySohPct,bmsQuestion,MAX_BMS_FILE_BYTES} from '../src/bms-lab.js';
test('BMS: 12 A durante una hora reduce SOC de 100 a 80% en 60 Ah',()=>{
 const d=generateSyntheticBms('nominal'),a=analyzeBms(d.rows,{capacityAh:60,initialSocPct:100});
 assert.equal(d.rows.length,121);
 assert(Math.abs(a.dischargeAh-12)<1e-9);
 assert(Math.abs(a.finalSocPct-80)<1e-9);
 assert(Math.abs(a.finalErrorPp)<1e-9);
});
test('BMS: un sesgo +0.6 A produce error acumulado y puede corregirse',()=>{
 const d=generateSyntheticBms('bias');
 const bad=analyzeBms(d.rows,{capacityAh:60});
 assert(Math.abs(bad.finalErrorPp+1)<1e-9);
 const good=analyzeBms(d.rows,{capacityAh:60,biasCorrectionA:0.6});
 assert(Math.abs(good.finalErrorPp)<1e-9);
});
test('BMS: la capacidad real 48 Ah difiere de estimación 60 Ah',()=>{
 const d=generateSyntheticBms('aged');
 const estimate=analyzeBms(d.rows,{capacityAh:60});
 assert.equal(estimate.finalSocPct,80);
 assert.equal(estimate.referenceSocPct,75);
 assert.equal(estimate.finalErrorPp,5);
 const corrected=analyzeBms(d.rows,{capacityAh:48});
 assert(Math.abs(corrected.finalErrorPp)<1e-9);
 assert.equal(capacitySohPct(48,60),80);
});
test('BMS: importación CSV conserva curva, sin fórmula propietaria',()=>{
 const data=generateSyntheticBms('nominal');
 const csv=formatBmsCsv(data.rows);
 const p=parseBmsCsv(csv);
 assert.equal(p.rows.length,121);
 const result=analyzeBms(p.rows);
 assert.equal(result.finalSocPct,80);
 assert.equal(result.referenceSocPct,80);
});
test('BMS: rechazo de CSV defectuoso, puntos inconsistentes y capacidad inválida',()=>{
 assert.throws(()=>parseBmsCsv('x,y\\n1,2\\n3,4'),/columna/i);
 assert.throws(()=>parseBmsCsv('t_s,current_a,voltage_v\\n0,12,4.0\\n0,12,3.9'),/tiempo/i);
 assert.throws(()=>parseBmsCsv('x'.repeat(MAX_BMS_FILE_BYTES+1)),/grande/i);
 assert.throws(()=>analyzeBms(generateSyntheticBms('nominal').rows,{capacityAh:0}),/capacidad/i);
 assert.throws(()=>capacitySohPct(10,0),/referencia/i);
});
test('BMS: diferencias negativas por carga y saturación advertida',()=>{
 const p=parseBmsCsv('t_s,current_a,voltage_v\\n0,-6,3.7\\n3600,-6,3.8');
 const a=analyzeBms(p.rows,{capacityAh:60,initialSocPct:95});
 assert(Math.abs(a.netDischargeAh+6)<1e-9);
 assert.equal(a.finalSocPct,100);
 assert(a.warnings.some(w=>w.includes('0–100%')));
});
test('BMS: ejercicios no implican intervención física',()=>{
 for(const s of BMS_SCENARIOS){const q=bmsQuestion(s.id);assert.equal(q.options.filter(x=>x[0]===q.answer).length,1);assert(q.explanation.length>50);}
});
