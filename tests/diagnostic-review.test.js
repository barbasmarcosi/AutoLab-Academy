import test from 'node:test';
import assert from 'node:assert/strict';
import {diagnosticReview} from '../src/diagnostic-review.js';

test('todo 100/100 sigue requiriendo revisión humana: no se inventa competencia',()=>{
 const r=diagnosticReview({correct:true,confirm:true,exclude:true,context:true,predicted:true,unsafe:false});
 assert.deepEqual(r.map(x=>x.id),['review']);
 assert.match(r[0].guidance,/no su precisión técnica/i);
});
test('omisiones discriminantes generan pasos concretos basados en banderas reales',()=>{
 const r=diagnosticReview({correct:false,confirm:false,exclude:false,context:false,predicted:false,unsafe:false});
 assert.deepEqual(r.map(x=>x.id),['hypothesis','confirm','exclude','context','prediction','review']);
 assert(r.every(x=>x.label&&x.guidance));
});
test('una maniobra insegura se señala primero sin proponer ejecuciones HV',()=>{
 const r=diagnosticReview({unsafe:true,correct:true,confirm:true,exclude:true,context:true,predicted:true});
 assert.equal(r[0].id,'safety');
 assert.match(r[0].guidance,/no la ejecutes/i);
 assert.equal(r.at(-1).id,'review');
});
test('entrada vacía o malformada no fabrica retroalimentación',()=>{
 assert.deepEqual(diagnosticReview(null),[]);
 assert.deepEqual(diagnosticReview('bad'),[]);
});
