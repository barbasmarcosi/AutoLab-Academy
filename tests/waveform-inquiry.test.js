import test from'node:test';
import assert from'node:assert/strict';
import{WAVE_INQUIRY_MODEL,WAVE_INQUIRIES,waveInquiryFor,generateInquiryTrace,evaluateInquiryTrace,inquiryTraceRecord,renderInquiryOscillogram}from'../src/waveform-inquiry.js';
import{generateWaveform}from'../src/waveform-lab.js';
const explanation='El resultado se obtiene de un modelo sintético con reloj explícito. Diferenciaría período y amplitud, compararía una segunda condición y abandonaría la hipótesis si el observable no respondiera como predije.';
const limits='El generador no reproduce ruido, cables, impedancia, fallas eléctricas ni sensores reales. No hay instrumento conectado ni referencia OEM; se necesita supervisión.';
const fixtures=[
 {lessonId:'scope',variant:1,predicted:200,hypothesis:0,falsifier:1},
 {lessonId:'pwm-scope',variant:50,predicted:50,hypothesis:1,falsifier:2},
 {lessonId:'ckp-cmp',variant:0.8,predicted:750,hypothesis:2,falsifier:1},
 {lessonId:'physical-can',variant:2,predicted:2,hypothesis:2,falsifier:1}
];
test('four real lesson bridges have unique, safely generated waveform scenarios',()=>{
 assert.equal(WAVE_INQUIRIES.length,4);
 assert.equal(new Set(WAVE_INQUIRIES.map(x=>x.lessonId)).size,4);
 assert.equal(new Set(WAVE_INQUIRIES.map(x=>x.caseId)).size,4);
 assert.equal(waveInquiryFor('not-found'),null);
 for(const e of WAVE_INQUIRIES){
  assert.equal(e.options.length,3);
  assert.equal(e.hypotheses.length,3);assert.equal(e.falsifiers.length,3);
  assert.ok(e.title.length>30&&e.description.length>100);
  for(const option of e.options){
   const trace=generateInquiryTrace(e.lessonId,option.value);
   assert.equal(trace.series.length,320);
   assert.ok(trace.series.every(x=>x.values.every(Number.isFinite)&&Number.isFinite(x.t)));
   assert.ok(trace.series.every((x,i,a)=>i===0||x.t>=a[i-1].t));
   assert.ok(Math.abs(trace.series.at(-1).t-trace.duration)<1e-9);
   assert.ok(trace.expected>0);
   assert.match(trace.source,/no proviene de ningún instrumento/);
   const svg=renderInquiryOscillogram(trace);
   assert.match(svg,/role="img"/);assert.match(svg,/Oscilograma GENERADO/);
   assert.ok(svg.includes('path d="M'));
  }
 }
 assert.throws(()=>generateInquiryTrace('unknown',1),RangeError);
 assert.throws(()=>generateInquiryTrace('scope',999),RangeError);
 assert.throws(()=>generateInquiryTrace('scope',NaN),RangeError);
 assert.throws(()=>generateInquiryTrace('scope',1,2),Error);
});
test('hypothesis, falsifier and numeric prediction are independent fail-closed decisions',()=>{
 for(const fixture of fixtures){
  const input={...fixture,explanation,limits};
  const result=evaluateInquiryTrace(input);
  assert.equal(result.model,WAVE_INQUIRY_MODEL);
  assert.equal(result.passed,true);assert.equal(result.score,100);
  assert.equal(evaluateInquiryTrace(input).expected,result.expected);
  assert.equal(result.expected,fixture.predicted);
  assert.equal(evaluateInquiryTrace({...input,predicted:fixture.predicted*1.2}).passed,false);
  assert.equal(evaluateInquiryTrace({...input,hypothesis:(fixture.hypothesis+1)%3}).passed,false);
  assert.equal(evaluateInquiryTrace({...input,falsifier:(fixture.falsifier+1)%3}).passed,false);
  const record=inquiryTraceRecord(input,result);
  assert.equal(record.id,waveInquiryFor(fixture.lessonId).caseId);
  assert.equal(record.passed,true);
  assert.match(record.report,/Predicción congelada/);
  assert.match(record.report,/CALCULADO tras congelar/);
  assert.match(record.report,/no osciloscopia real/);
  assert.match(record.report,/NO evaluada semánticamente/);
  assert.throws(()=>evaluateInquiryTrace({...input,predicted:Infinity}),RangeError);
  assert.throws(()=>evaluateInquiryTrace({...input,predicted:-10}),RangeError);
  assert.throws(()=>evaluateInquiryTrace({...input,explanation:'respuesta corta'}),RangeError);
  assert.throws(()=>evaluateInquiryTrace({...input,limits:'sin límites'}),RangeError);
  assert.throws(()=>inquiryTraceRecord({...input,variant:999},result),RangeError);
 }
});
test('timebase, PWM duty and physical CAN differential vary causally, not by memorized result',()=>{
 assert.deepEqual([0.5,1,2].map(v=>generateInquiryTrace('scope',v).expected),[400,200,100]);
 assert.deepEqual([25,50,75].map(v=>generateInquiryTrace('pwm-scope',v).expected),[25,50,75]);
 assert.deepEqual([0.8,1,1.2].map(v=>generateInquiryTrace('ckp-cmp',v).expected),[750,600,500]);
 assert.deepEqual([1,2,3].map(v=>generateInquiryTrace('physical-can',v).expected),[1,2,3]);
 const c=generateInquiryTrace('physical-can',3);
 const dom=c.series.find(x=>x.values[0]>2.5);
 assert.ok(dom);assert.equal(dom.values[0]-dom.values[1],3);
 const rec=c.series.find(x=>x.values[0]===2.5);
 assert.ok(rec);assert.deepEqual(rec.values,[2.5,2.5]);
 const pwm=generateInquiryTrace('pwm-scope',75).series;
 assert.ok(pwm.some(x=>x.values[0]===0)&&pwm.some(x=>x.values[0]===5));
 assert.equal(generateWaveform('ckp',100).series.length,100);
});
