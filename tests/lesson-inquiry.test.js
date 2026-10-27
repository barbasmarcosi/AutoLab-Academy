import test from 'node:test';
import assert from 'node:assert/strict';
import {makeInquiryRecord,inquiryId,inquiryProgress} from '../src/lesson-inquiry.js';
import {learningStages} from '../src/learning-path.js';
import {portfolioSnapshot,portfolioMarkdown} from '../src/portfolio.js';
import {serializeBackup,parseBackup,emptyProgress} from '../src/core.js';
const lesson={id:'hv',title:'Seguridad HV',sections:[['Límites','La lectura no habilita a intervenir.']]};
const answer={
 hypothesis:'La condición anómala podría depender de una referencia compartida verificable en banco aislado.',
 alternative:'Un defecto en el canal de medición individual podría explicar el mismo síntoma aparente.',
 probe:'Verificar la referencia con un instrumento independiente y compararla con otro canal en baja tensión.',
 predictH1:'Si la referencia común falla, ambos canales deberían exhibir un error correlacionado.',
 predictH2:'Si la lectura individual falla, el contraste independiente solo mostrará diferencia en uno.',
 falsifier:'Una referencia estable en ambos canales refutaría la explicación de error compartido.',
 confounder:'La temperatura y el error sistemático de la segunda sonda podrían confundir el resultado.',
 limits:'No se realizó intervención ni medición de alta tensión. Este estudio no habilita trabajo profesional ni reemplaza una supervisión.',
 mode:'design'
};
test('a design-only record never attests practical success and survives backup',()=>{
 const row=makeInquiryRecord(lesson,answer);
 assert.equal(row.id,inquiryId('hv'));assert.equal(row.score,0);assert.equal(row.passed,false);
 assert.match(row.report,/SIN OBSERVACIÓN/);
 const progress=emptyProgress();progress.cases.push(row);
 const back=parseBackup(serializeBackup(progress));
 assert.equal(back.cases[0].id,row.id);assert.equal(back.cases[0].passed,false);
 assert.equal(back.cases[0].report,row.report);
 assert.deepEqual(inquiryProgress(back,'hv'),{attempts:1,passed:false,status:'documented-unverified'});
});
test('notebook is its own portfolio category, not a lab or v2 reasoning attempt',()=>{
 const row=makeInquiryRecord(lesson,answer),p=emptyProgress();p.cases.push(row);
 const snap=portfolioSnapshot(p,[lesson]);
 assert.equal(snap.totals.practices,0);assert.equal(snap.totals.reasoning,0);assert.equal(snap.totals.inquiries,1);
 assert.equal(snap.events[0].kind,'inquiry');
 assert.match(portfolioMarkdown(p,[lesson]),/Cuadernos de investigación sin nota: 1/);
 assert.match(portfolioMarkdown(p,[lesson]),/SIN OBSERVACIÓN/);
});
test('observations demand provenance and always remain unverified',()=>{
 assert.throws(()=>makeInquiryRecord(lesson,{...answer,mode:'observation'}),RangeError);
 const item=makeInquiryRecord(lesson,{...answer,mode:'observation',
  observation:'El banco aislado mostró una diferencia reproducible de potencial entre ambos canales.',
  provenance:'Banco virtual de baja tensión, canal de referencia B y condiciones controladas.',
  interpretation:'La observación favorece el defecto común, sin excluir el sesgo de instrumentación.'});
 assert.equal(item.passed,false);assert.match(item.report,/AUTORREPORTADA/);
});
test('reject incomplete, unsafe or fabricated notebook states and preserve 94 stable IDs',()=>{
 for(const k of ['hypothesis','alternative','probe','predictH1','predictH2','falsifier','confounder','limits'])
  assert.throws(()=>makeInquiryRecord(lesson,{...answer,[k]:'breve'}),RangeError);
 assert.throws(()=>makeInquiryRecord(lesson,{...answer,mode:'verified'}),RangeError);
 assert.throws(()=>makeInquiryRecord(lesson,{...answer,alternative:answer.hypothesis}),/H1 y H2/);
 assert.throws(()=>makeInquiryRecord(lesson,{...answer,predictH2:answer.predictH1}),/predicciones/);
 assert.throws(()=>makeInquiryRecord(lesson,{...answer,alternative:'  '+answer.hypothesis.toUpperCase()+'  '}),/H1 y H2/);
 assert.throws(()=>makeInquiryRecord({id:'bad!',sections:[]},answer),RangeError);
 const ids=learningStages.flatMap(x=>x.lessons);
 assert.equal(ids.length,94);assert.equal(new Set(ids.map(inquiryId)).size,94);
 for(const id of ids)assert.equal(inquiryProgress({cases:[{id:inquiryId(id),passed:true}]},id).passed,false);
});
