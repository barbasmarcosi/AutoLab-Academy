import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 CLAIMS_VERSION,REPORT_FIELDS,REPORT_SUBFIELDS,auditMA00Report,
 assertMA00Report,checkObservabilityClaim
} from '../src/mechanical-age-r13-claims.js';
import {
 assessMA00Observability,explainConfoundedObservations,POWERTRAINS,FUELS
} from '../src/mechanical-age-r13-observability.js';
import {evaluateMechanicalSnapshot,compareMechanicalSnapshots,syntheticServicePair} from '../src/mechanical-age-research.js';
import {auditRawObdSession,evaluateAAWithoutService,syntheticAAReceiptPair} from '../src/mechanical-age-raw-obd.js';
import {assessObdMultiSessionRepeatability,syntheticR12ReceiptSeries} from '../src/mechanical-age-r12-quality.js';
import {evaluateReplicatedMeasurements,syntheticReplicatedServiceCase} from '../src/mechanical-age-repeatability.js';
import {runMechanicalAgeFalsification} from '../src/mechanical-age-falsification.js';

const deep=x=>structuredClone(x);
test('R13: all principal report contracts classify their top-level and nested claims',()=>{
 assert.equal(Object.keys(REPORT_FIELDS).length,7);
 assert.ok(Object.keys(REPORT_SUBFIELDS).length>=3);
 const {before,after}=syntheticServicePair();
 const reports=[
  [evaluateMechanicalSnapshot(before),'snapshot'],
  [compareMechanicalSnapshots(before,after),'comparison'],
  [auditRawObdSession(syntheticAAReceiptPair()[0]),'raw_session'],
  [evaluateAAWithoutService(syntheticAAReceiptPair()),'aa'],
  [assessObdMultiSessionRepeatability(syntheticR12ReceiptSeries()),'r12'],
  [evaluateReplicatedMeasurements(syntheticReplicatedServiceCase()),'replicates'],
  [runMechanicalAgeFalsification(),'falsification'],
 ];
 for(const [report,kind] of reports){
  assert.equal(report.evidenceContract.version,CLAIMS_VERSION);
  assert.equal(report.evidenceContract.kind,kind);
  assert.equal(report.evidenceContract.complete,true,kind);
  assert.deepEqual(report.evidenceContract.violations,[],kind);
  assert.equal(report.evidenceContract.physicalWearAuthorized,false);
  const duplicated=auditMA00Report(report,kind,{source:'synthetic'});
  assert.equal(duplicated.complete,true,kind);
 }
});
test('R13: unknown top-level/nested claims, forged health/wear or uncalibrated index are rejected',()=>{
 const report=evaluateMechanicalSnapshot(syntheticServicePair().before);
 assert.throws(()=>assertMA00Report({...report,healthScore:99},'snapshot',{source:'synthetic'}),/R13 afirmación no sustentada/);
 assert.throws(()=>assertMA00Report({...report,structuralWear:12},'snapshot',{source:'synthetic'}),/Estimación física no respaldada/);
 assert.throws(()=>assertMA00Report({...report,deviationIndex:17},'snapshot',{source:'provided_obd_unverified'}),/Índice sintético/);
 assert.throws(()=>assertMA00Report({...report,features:{...report.features,secretWearProbability:0.9}},'snapshot',{source:'synthetic'}),/Subcampos sin clasificación/);
 assert.throws(()=>assertMA00Report({...report,features:{medianRpm:800}},'snapshot',{source:'synthetic'}),/Subcampos ausentes/);
});
test('R13: unsupported GNC/diesel/HEV/BEV are not gasoline-trim proxies',()=>{
 const all=['010C','0105','0104','0106','0107'];
 const good=assessMA00Observability({powertrain:'gasoline_ice',fuel:'gasoline',control:'closed_loop_observed',availablePids:all});
 assert.equal(good.status,'descriptive_only');
 assert.equal(good.unobservableMechanisms.includes('mechanical_cylinder_wear'),true);
 assert.equal(good.independentlyVerified,false);
 const noTrims=assessMA00Observability({powertrain:'gasoline_ice',fuel:'gasoline',control:'closed_loop_observed',availablePids:['010C','0105']});
 assert.equal(noTrims.status,'abstain');
 assert.ok(noTrims.missingPids.includes('0107'));
 for(const v of [
  {powertrain:'gasoline_ice',fuel:'gnc',control:'closed_loop_observed'},
  {powertrain:'diesel_ice',fuel:'diesel',control:'closed_loop_observed'},
  {powertrain:'hybrid',fuel:'mixed',control:'closed_loop_observed'},
  {powertrain:'battery_electric',fuel:'electric',control:'unknown'},
  {powertrain:'unknown',fuel:'unknown',control:'unknown'}
 ]){
  const result=assessMA00Observability({...v,availablePids:all});
  assert.equal(result.status,'abstain',JSON.stringify(v));
  assert.equal(result.mode,'signals_only');
  assert.ok(result.blockers.length>0);
  assert.equal(result.independentlyVerified,false);
 }
 assert.ok(POWERTRAINS.includes('hybrid')&&FUELS.includes('gnc'));
 assert.throws(()=>assessMA00Observability({powertrain:'magic_engine'}),RangeError);
 assert.throws(()=>assessMA00Observability({availablePids:['221234']}),RangeError);
});
test('R13: synthesis demo scores do not travel to undocumented powertrains',()=>{
 const demo=syntheticServicePair();
 const baseline=evaluateMechanicalSnapshot(demo.before);
 assert.equal(baseline.observability.status,'descriptive_only');
 assert.ok(baseline.deviationIndex!==null);
 for(const [powertrain,fuel] of [['diesel_ice','diesel'],['hybrid','mixed'],['battery_electric','electric'],['gasoline_ice','gnc']]){
  const altered=deep(demo.before);
  altered.powertrain=powertrain;
  altered.fuel=fuel;
  const report=evaluateMechanicalSnapshot(altered);
  assert.equal(report.deviationIndex,null,powertrain);
  assert.equal(report.observability.status,'abstain');
  assert.equal(report.structuralWear,null);
  assert.equal(report.mechanicalAgeEquivalentKm,null);
 }
 const untrusted=deep(demo.before);untrusted.source='provided_obd_unverified';
 const report=evaluateMechanicalSnapshot(untrusted);
 assert.equal(report.deviationIndex,null);
 assert.equal(report.evidenceContract.evidenceLevel,'unverified');
});
test('R13: no hypothesis can be published without alternatives and falsification',()=>{
 const h=explainConfoundedObservations('positive_fuel_trims');
 assert.match(h.alternative,/combustible|lambda/);
 assert.match(h.discriminatingTest,/Contrastar|Comparar/);
 assert.equal(h.confirmedDiagnosis,null);
 assert.equal(h.structuralWear,null);
 assert.equal(h.identifiableFromCurrentMode01,false);
 const allowed=checkObservabilityClaim({
  kind:'hypothesis',level:'E0',value:'posible admisión',
  sourceIds:['ma00-synthetic-session-1'],
  alternativeHypothesis:h.alternative,testablePrediction:h.discriminatingTest
 });
 assert.equal(allowed.independentlyVerified,false);
 assert.throws(()=>checkObservabilityClaim({kind:'hypothesis',level:'E0',value:'admisión',sourceIds:['demo-1']}),/alternativa/);
 assert.throws(()=>checkObservabilityClaim({kind:'blocked',level:'E0',value:10,sourceIds:['demo-1']}),/null/);
 assert.throws(()=>checkObservabilityClaim({kind:'synthetic_demonstration',level:'E5',value:10,sourceIds:['demo-1']}),/no validan/);
 assert.throws(()=>explainConfoundedObservations('unknown'),RangeError);
});
test('R13: imported raw sessions still never authenticate physical signal provenance',()=>{
 const s=syntheticAAReceiptPair()[0];
 s.source='provided_obd_unverified';
 const a=auditRawObdSession(s);
 assert.equal(a.observability.status,'abstain');
 assert.equal(a.evidenceContract.evidenceLevel,'unverified');
 assert.equal(a.traceIntegrity.independentlyAuthenticated,false);
 assert.equal(a.sensorAcquisitionTimeKnown,false);
 assert.equal(a.estimatedAgeKm,null);
});


test('R13: machine-readable claims.json stays in sync with runtime allowlist',()=>{
 const doc=JSON.parse(readFileSync(new URL('../docs/ma00/claims.json',import.meta.url),'utf8'));
 const keys=Object.keys(REPORT_FIELDS).sort();
 assert.deepEqual(Object.keys(doc.reportContracts).sort(),keys);
 let classified=0;
 for(const kind of keys){
  const declared=REPORT_FIELDS[kind];
  const published=doc.reportContracts[kind];
  assert.deepEqual(Object.keys(published).sort(),Object.keys(declared).sort());
  for(const [cls,names] of Object.entries(declared)){
   assert.deepEqual(published[cls],names.trim().split(/\s+/),kind+'.'+cls);
   classified+=published[cls].length;
  }
 }
 assert.ok(classified>=90);
 for(const [kind,inner] of Object.entries(REPORT_SUBFIELDS)){
  for(const [container,fields] of Object.entries(inner)){
   if(fields.startsWith('*'))continue;
   assert.deepEqual(doc.nestedContracts[kind+'.'+container],fields.trim().split(/\s+/));
  }
 }
 assert.ok(doc.preRealPhysicalClaimVeto.includes('healthScore'));
 assert.ok(doc.evidenceLevels.E4.includes('NOT AVAILABLE'));
 assert.ok(doc.evidenceLevels.E5.includes('NOT AVAILABLE'));
});
