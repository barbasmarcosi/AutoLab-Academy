/**
 * RW8 virtual ECU optimization — discrete, normalized and intentionally
 * synthetic profiles. It is a reasoning exercise about constraints, NOT an ECU
 * calibration, physical engine model, torque map or flashable configuration.
 * No telemetry, APIs, vehicle bus writes, OEM temperatures or emissions data.
 */
export const ECU_RESEARCH_VERSION='rw8-constrained-synthetic-profiles-v1';
export const ECU_RESEARCH_SOURCE='https://www.bosch-mobility.com/en/solutions/control-units/engine-control-unit/';
export const ECU_OPTIMIZATION_SOURCE='https://saemobilus.sae.org/articles/engine-model-based-pre-calibration-optimization-mid-level-hierarchical-control-design-03-14-05-0039';
export const ECU_PROFILES=Object.freeze([
 Object.freeze({id:'ECO',response:.45,fuelProxy:.30,thermalProxy:.28,emissionsProxy:.25,knockProxy:.11,observability:.30}),
 Object.freeze({id:'DAILY',response:.68,fuelProxy:.50,thermalProxy:.49,emissionsProxy:.43,knockProxy:.22,observability:.46}),
 Object.freeze({id:'SPORT',response:.92,fuelProxy:.85,thermalProxy:.86,emissionsProxy:.75,knockProxy:.52,observability:.24}),
 Object.freeze({id:'DIAGNOSTIC',response:.20,fuelProxy:.56,thermalProxy:.22,emissionsProxy:.31,knockProxy:.10,observability:.98})
]);
export const ECU_SCENARIOS=Object.freeze([
 Object.freeze({id:'daily',name:'Respuesta cotidiana con restricciones',description:'Exigir respuesta mínima .60 y techos de calor .65, emisiones .55, golpe simulado .30.',objective:'response',limits:{minResponse:.60,maxThermal:.65,maxEmissions:.55,maxKnock:.30,minObservability:0}}),
 Object.freeze({id:'eco',name:'Carga térmica restringida',description:'Exigir respuesta mínima .40; techos de calor .35, emisiones .40, golpe .20.',objective:'fuelProxy',limits:{minResponse:.40,maxThermal:.35,maxEmissions:.40,maxKnock:.20,minObservability:0}}),
 Object.freeze({id:'sport',name:'Demanda elevada con límites ampliados',description:'Exigir respuesta mínima .80; techos de calor .95, emisiones .80, golpe .60.',objective:'response',limits:{minResponse:.80,maxThermal:.95,maxEmissions:.80,maxKnock:.60,minObservability:0}}),
 Object.freeze({id:'diagnostic',name:'Observabilidad instrumental prioritizada',description:'Exigir observabilidad mínima .90, techos de calor .35, emisiones .40, golpe .20.',objective:'observability',limits:{minResponse:0,maxThermal:.35,maxEmissions:.40,maxKnock:.20,minObservability:.90}})
]);
const isUnit=v=>Number.isFinite(v)&&v>=0&&v<=1;
const validLimits=x=>{
 if(!x||!['minResponse','maxThermal','maxEmissions','maxKnock','minObservability'].every(k=>isUnit(x[k])))throw RangeError('Límites de restricciones incorrectos');
 return x;
};
const scenario=id=>{const p=ECU_SCENARIOS.find(s=>s.id===id);if(!p)throw RangeError('Escenario desconocido');return p;};
export function checkProfile(profile,limits){
 if(!profile||!ECU_PROFILES.some(p=>p.id===profile.id)||
  !['response','fuelProxy','thermalProxy','emissionsProxy','knockProxy','observability'].every(k=>profile[k]===ECU_PROFILES.find(x=>x.id===profile.id)[k]))
  throw RangeError('Perfil alterado o ajeno al catálogo sintético');
 validLimits(limits);
 const violations=[];
 if(profile.response<limits.minResponse)violations.push('response_below_minimum');
 if(profile.thermalProxy>limits.maxThermal)violations.push('thermal_over_limit');
 if(profile.emissionsProxy>limits.maxEmissions)violations.push('emissions_over_limit');
 if(profile.knockProxy>limits.maxKnock)violations.push('knock_over_limit');
 if(profile.observability<limits.minObservability)violations.push('observability_below_minimum');
 return {id:profile.id,feasible:violations.length===0,violations};
}
export function optimizeProfiles(limits,objective){
 validLimits(limits);
 if(!['response','observability','fuelProxy'].includes(objective))throw RangeError('Objetivo desconocido');
 const feasibility=ECU_PROFILES.map(p=>checkProfile(p,limits));
 const eligible=feasibility.filter(p=>p.feasible);
 const value=id=>ECU_PROFILES.find(p=>p.id===id)[objective];
 const ranked=[...eligible].sort((a,b)=>objective==='fuelProxy'?value(a.id)-value(b.id):value(b.id)-value(a.id));
 // Stable, deterministic tie-breaking among hypothetical discrete options.
 return {feasibility,chosen:ranked[0]?.id??null,feasibleIds:eligible.map(p=>p.id),objective,
  failClosed:eligible.length===0,model:ECU_RESEARCH_VERSION,
  provenance:'synthetic_discrete_constraint_catalog'};
}
export function evaluateECUScenario(id){
 const s=scenario(id);
 return {id:s.id,name:s.name,description:s.description,limits:{...s.limits},objective:s.objective,
  ...optimizeProfiles(s.limits,s.objective),
  profiles:ECU_PROFILES.map(p=>({...p})),
  warning:'Todos los valores entre 0 y 1 son índices inventados sin calibración, unidad física, homologación o equivalencia con emisiones/knock reales.'};
}
export function gradeECUScenario({scenarioId,predicted,realCalibrationPrediction,reasoning,limits}){
 if(!ECU_PROFILES.some(p=>p.id===predicted)||!['no','si'].includes(realCalibrationPrediction))throw RangeError('Hipótesis incompletas');
 const s=evaluateECUScenario(scenarioId),correct=predicted===s.chosen;
 const bounded=realCalibrationPrediction==='no';
 const explanation=typeof reasoning==='string'&&reasoning.trim().length>=100;
 const uncertainty=typeof limits==='string'&&limits.trim().length>=70;
 const score=(correct?50:0)+(bounded?20:0)+(explanation?15:0)+(uncertainty?15:0);
 return {version:ECU_RESEARCH_VERSION,score,passed:correct&&bounded&&explanation&&uncertainty,
  expected:s.chosen,correct,bounded,provenance:'synthetic_discrete_constraint_catalog',
  warning:'La nota comprueba decisiones discretas y extensión del texto, no valida desempeño, emisiones reales ni aptitud para configurar o programar una ECU.'};
}
export function ecuScenarioReport(session,result){
 const s=evaluateECUScenario(session.scenarioId);
 const lines=['# AutoLab RW8 — ECU Research: Optimización restringida ficticia','',
  'Modelo: '+ECU_RESEARCH_VERSION,'Procedencia: synthetic_discrete_constraint_catalog',
  'Escenario: '+s.id+'; objetivo: '+s.objective,'Límites adimensionales asumidos: '+JSON.stringify(s.limits),
  'Hipótesis congelada: '+session.predicted,'¿Aplicable a ECU real?: '+session.realCalibrationPrediction,
  'Resultados del catálogo ficticio:'];
 for(const p of s.profiles){const t=s.feasibility.find(x=>x.id===p.id);
  lines.push('- '+p.id+' '+
   Object.entries(p).filter(([key])=>key!=='id').map(([key,value])=>key+'='+value).join(', ')+
   '; elegible='+t.feasible+'; violaciones='+t.violations.join(', '));
 }
 lines.push('Opción elegida por reglas: '+String(s.chosen),
  'Calificación estructural: '+result.score+'/100; aprobado='+result.passed,
  'Razonamiento (sin evaluación semántica): '+session.reasoning,
  'Limitaciones del alumno: '+session.limits,
  'Origen conceptual: '+ECU_RESEARCH_SOURCE+'; '+ECU_OPTIMIZATION_SOURCE,
  'No existen tablas de encendido/inyección, presión de sobrealimentación, rpm, SOI, lambda, bus CAN, medidas OEM o acciones de flasheo. Los índices no predicen propiedades físicas.');
 return lines.join('\n');
}
