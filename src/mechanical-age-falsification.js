/**
 * MA00 adversarial counterfactuals: deliberately synthetic sensitivity probes.
 * These are NOT reconstructed patient/vehicle facts, mechanical wear simulations,
 * validated causal effects, or proofs of a service's effectiveness.
 */
import {compareMechanicalSnapshots,syntheticServicePair} from './mechanical-age-research.js';
import {assertMA00Report} from './mechanical-age-r13-claims.js';
export const FALSIFICATION_VERSION='ma00-adversarial-negative-controls-v1';
const clone=x=>structuredClone(x);
const makePair=(mutation)=>{
 const demo=syntheticServicePair();
 const before=clone(demo.before),after=clone(demo.before);
 after.phase='after_service';
 // Different acquisition timeline; the original structural condition is conceptually fixed.
 after.samples.forEach(s=>{s.timeMs+=60000;});
 mutation(after);
 return {before,after};
};
const CASES=Object.freeze([
 {id:'null_control',label:'Control sin cambio operacional',build:()=>makePair(()=>{}),expect:'no_detectable_change'},
 {id:'trim_bias',label:'Sesgo instrumental en STFT, sin desgaste simulado',build:()=>makePair(x=>x.samples.forEach(s=>s.stftPct+=11)),expect:'false_change_possible'},
 {id:'opposing_trims',label:'STFT y LTFT se compensan',build:()=>makePair(x=>x.samples.forEach(s=>{s.stftPct+=14;s.ltftPct-=14;})),expect:'blind_spot'},
 {id:'temperature_confounder',label:'Perturbación térmica fuera del protocolo',build:()=>makePair(x=>x.samples.forEach(s=>s.ectC+=8)),expect:'reject_noncomparable'},
 {id:'load_confounder',label:'Carga accesoria modificada',build:()=>makePair(x=>x.samples.forEach(s=>s.loadPct+=7)),expect:'reject_noncomparable'}
]);
export function runMechanicalAgeFalsification(){
 const results=CASES.map(({id,label,build,expect})=>{
  const {before,after}=build();
  const comparison=compareMechanicalSnapshots(before,after);
  const delta=comparison.deltaDeviationIndex;
  const observed=expect==='reject_noncomparable'?!comparison.comparable
   :expect==='false_change_possible'?comparison.comparable&&delta!==null&&Math.abs(delta)>=1
   :comparison.comparable&&delta===0;
  return {
   id,label,expectedBehavior:expect,behaviorObserved:observed,comparisonAllowed:comparison.comparable,
   baselineIndex:comparison.before.deviationIndex,alteredIndex:comparison.after.deviationIndex,
   delta,blockers:comparison.blockers,
   baselineTrims:comparison.before.features.medianCombinedTrimPct,
   alteredTrims:comparison.after.features.medianCombinedTrimPct,
   structuralWearGroundTruth:null,
   causalServiceEffect:null,
   caveat:'El cambio simulado se asignó al sensor/operación. El score no identifica desgaste ni causa.'
  };
 });
 return assertMA00Report({version:FALSIFICATION_VERSION,source:'synthetic_negative_controls',
  passedBehaviorChecks:results.every(x=>x.behaviorObserved),
  controls:results,mechanicalAgeInferenceAllowed:false,
  conclusion:'Un índice funcional puede variar sin desgaste, o permanecer igual cuando STFT y LTFT se compensan; la condición de un motor no es identificable sólo a partir de estas lecturas.'},'falsification',{source:'synthetic'});
}
