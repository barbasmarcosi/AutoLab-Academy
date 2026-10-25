import test from 'node:test';
import assert from 'node:assert/strict';
import{componentScenarios,componentModel,gradeComponent,parseComponentNumber,rcSamples,componentReport}from'../src/component-lab.js';
test('seis circuitos sintéticos con medidas y fuentes',()=>{
 assert.equal(componentScenarios.length,6);
 assert.equal(new Set(componentScenarios.map(c=>c.id)).size,6);
 for(const c of componentScenarios){assert.match(c.source,/^https:\/\//);
  for(const condition of ['nominal','fault'])assert(Number.isFinite(componentModel(c.id,condition).expected));}
});
test('vectores de referencia numéricos y razonamiento algebraico',()=>{
 const near=(a,b)=>assert(Math.abs(a-b)<1e-7,a+' vs '+b);
 near(componentModel('divider').expected,2);near(componentModel('divider','fault').expected,5);
 near(componentModel('wire').expected,12*.1/6.1);near(componentModel('wire','fault').expected,12/7);
 near(componentModel('mosfet').expected,12*.04/8.04);near(componentModel('mosfet','fault').expected,12*1.2/9.2);
 near(componentModel('shunt').expected,12*.1/10.1);near(componentModel('shunt','fault').expected,12*.5/10.5);
 near(componentModel('rc').expected,12*(1-Math.exp(-1)));
 near(componentModel('rc','fault').expected,12*(1-Math.exp(-5)));
 near(componentModel('inductor').expected,.3);near(componentModel('inductor','fault').expected,1.2);
});
test('corrección exige número, evidencia y texto; inseguro puntúa cero',()=>{
 const reasoning='Comparé los valores teóricos bajo las condiciones del ejemplo, elegí una observación discriminante y descarté la alternativa de riesgo.';
 for(const c of componentScenarios){
  const m=componentModel(c.id,'fault'),base={value:m.expected.toFixed(7),reasoning};
  const correct=gradeComponent(c.id,'fault',{...base,evidence:'confirm'});
  assert.equal(correct.score,100);assert.equal(correct.passed,true);assert.equal(correct.textReviewed,false);
  assert.equal(gradeComponent(c.id,'fault',{...base,evidence:'weak'}).score,70);
  assert.equal(gradeComponent(c.id,'fault',{...base,evidence:'unsafe'}).score,0);
 }
});
test('texto corto no se confunde con evaluación semántica',()=>{
 const result=gradeComponent('divider','nominal',{value:'2',evidence:'confirm',reasoning:'texto'});
 assert.equal(result.score,100);assert.equal(result.passed,false);assert.equal(result.textReviewed,false);
});
test('entradas inválidas o circuitos desconocidos se rechazan',()=>{
 assert.equal(parseComponentNumber(' 12,5 '),12.5);
 for(const s of ['','NaN','Infinity','1e2','1.000,5','12V'])assert.throws(()=>parseComponentNumber(s));
 assert.throws(()=>componentModel('unknown'));
});
test('curva RC muestra respuesta temporal monótona',()=>{
 const values=rcSamples('fault',101);assert.equal(values.length,101);assert.equal(values[0].observed,0);
 for(let i=1;i<values.length;i++)assert(values[i].observed>values[i-1].observed);
 assert(values.at(-1).observed<12);
});
test('informe conserva cálculos, evidencia, supuestos y límites',()=>{
 const input={value:'1.2',evidence:'confirm',reasoning:'Explicación didáctica de la medición sintética.'};
 const text=componentReport('inductor','fault',input,gradeComponent('inductor','fault',input),new Date('2026-10-24T12:00:00Z'));
 assert.match(text,/sintético/);assert.match(text,/Texto no revisado/);assert.match(text,/Ecuación/);
});
