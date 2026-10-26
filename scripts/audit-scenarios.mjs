import{tracks,cases as baseCases}from'../src/content.js';
import{additionalCases}from'../src/cases-advanced.js';
import{validateScenario}from'../src/workshop-engine.js';
import{ecuCases,validateEcuCase}from'../src/ecu-lab.js';
import{multiFaultCases,verifyMultiFaultCase}from'../src/differential-lab.js';
import{differentialCases,validateDifferentialCase}from'../src/fault-discrimination.js';
import{TRACE_CASES}from'../src/temporal-trace-lab.js';
import{FUEL_CASES,validateFuelCase}from'../src/fuel-system-lab.js';
import{MISFIRE_CASES,verifyMisfireCase}from'../src/misfire-lab.js';
import{INTEGRATIVE_CASES,validateIntegrativeCase}from'../src/integrative-lab.js';
import{TRANSFER_CASES}from'../src/transfer-exercises.js';
import{DIAGNOSTIC_TRANSFER_CASES}from'../src/diagnostic-transfer.js';
import{componentScenarios}from'../src/component-lab.js';
import{WAVEFORM_SCENARIOS}from'../src/waveform-lab.js';
import{BMS_SCENARIOS}from'../src/bms-lab.js';
import{auditScenarioCatalogs}from'../src/scenario-audit.js';
export const catalogs=[
 {name:'casos generales',items:[...baseCases,...additionalCases],validate:validateScenario,sourceRequired:true},
 {name:'casos ECU',items:ecuCases,validate:validateEcuCase,sourceRequired:true},
 {name:'fallas múltiples',items:multiFaultCases,validate:verifyMultiFaultCase},
 {name:'diagnóstico diferencial',items:differentialCases,validate:validateDifferentialCase},
 {name:'trazas temporales',items:TRACE_CASES},
 {name:'inyección',items:FUEL_CASES,validate:validateFuelCase},
 {name:'combustión',items:MISFIRE_CASES,validate:verifyMisfireCase},
 {name:'taller integrador',items:INTEGRATIVE_CASES,validate:validateIntegrativeCase},
 {name:'transferencia numérica',items:TRANSFER_CASES},
 {name:'transferencia diagnóstica',items:DIAGNOSTIC_TRANSFER_CASES},
 {name:'componentes',items:componentScenarios},
 {name:'osciloscopio',items:WAVEFORM_SCENARIOS},
 {name:'BMS',items:BMS_SCENARIOS,topic:'ev'}
];
const result=auditScenarioCatalogs(catalogs,tracks.map(t=>t.id));
console.log('Auditoría de escenarios de todas las familias, sin validación empírica:');
console.log(JSON.stringify(result.summary,null,2));
for(const error of result.errors)console.error('ERROR:',error);
for(const warning of result.warnings)console.warn('AVISO:',warning);
if(!result.ok)process.exitCode=1;
