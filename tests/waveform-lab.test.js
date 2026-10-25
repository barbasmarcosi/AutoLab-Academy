import test from 'node:test';
import assert from 'node:assert/strict';
import{WAVEFORM_SCENARIOS,generateWaveform,gradeWaveform,parseWaveAnswer}from'../src/waveform-lab.js';
test('cuatro escenarios visuales sintéticos con muestras válidas y trazables',()=>{
 assert.equal(WAVEFORM_SCENARIOS.length,4);
 assert.equal(new Set(WAVEFORM_SCENARIOS.map(s=>s.id)).size,4);
 for(const scenario of WAVEFORM_SCENARIOS){
  const wave=generateWaveform(scenario.id);
  assert.equal(wave.series.length,600);
  assert(wave.series.every((p,i)=>p.values.every(v=>Number.isFinite(v)&&v>=0&&v<=6)&&p.t>=0&&(!i||p.t>wave.series[i-1].t)));
  assert.equal(wave.series.at(-1).t,scenario.duration);
  assert.match(scenario.source,/^https:\/\//);
  assert.equal(gradeWaveform(scenario.id,String(scenario.target)).success,true);
 }
});
test('PWM 5 V, 2/8 de duty: muestreo da aproximadamente 25% activo',()=>{
 const wave=generateWaveform('pwm',1601);
 const active=wave.series.filter(s=>s.values[0]>=4.9).length/wave.series.length;
 assert(Math.abs(active-0.25)<0.01);
});
test('CKP de 58 dientes conserva la pausa de dos posiciones',()=>{
 const wave=generateWaveform('ckp',1201);
 assert(wave.series.some(x=>x.t>97&&x.values[0]===0));
 assert(wave.series.some(x=>x.t<20&&x.values[0]===5));
});
test('CAN-H y CAN-L representan diferencial dominante de 2 V, recesivo de 0 V',()=>{
 const wave=generateWaveform('can');
 assert(wave.series.some(x=>Math.abs(x.values[0]-x.values[1]-2)<1e-9));
 assert(wave.series.some(x=>Math.abs(x.values[0]-x.values[1])<1e-9));
});
test('respuestas tolerantes al decimal y sin atajos no numéricos',()=>{
 assert.equal(parseWaveAnswer(' 2,5 '),2.5);
 for(const answer of ['','NaN','Infinity','2e3','20%','1,234.5'])assert.throws(()=>parseWaveAnswer(answer));
 assert.equal(gradeWaveform('sine','200,2').success,true);
 assert.equal(gradeWaveform('sine','210').success,false);
});
