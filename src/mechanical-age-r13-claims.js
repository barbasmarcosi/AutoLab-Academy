/**
 * MA00 R13 — evidence permission and fail-closed output contract.
 * This is a SOFTWARE policy: source strings and operator documents are NOT
 * independently authenticated, even when internally consistent.
 */
import {auditDynamicMA00Structure} from './mechanical-age-r13-structure.js';
export const CLAIMS_VERSION='ma00-r13-evidence-claims-v1';
export const CLAIM_LEVELS=Object.freeze(['E0','E1','E2','E3','E4','E5']);
export const CLAIM_KIND=Object.freeze(['metadata','observation','derived','operator_assertion',
 'synthetic_demonstration','hypothesis','unknown','blocked','container']);

/** Every permitted primary-output field is explicitly classified below.
 * Containers have named nested contracts; see REPORT_SUBFIELDS.
 * Unknown fields reject the whole report; no permissive default.
 */
export const REPORT_FIELDS=Object.freeze({
 snapshot:Object.freeze({
  metadata:'model protocol phase source engineFamily sampleCount elapsedSec medianIntervalMs maxIntervalMs status exclusion vehicleAlias scoringStatus provenance indexMeaning thresholdsMeaning caveat',
  container:'measurementEvidence signalObservability features observability',
  synthetic_demonstration:'deviationIndex',
  blocked:'structuralWear mechanicalAgeEquivalentKm remainingUsefulLife',
 }),
 comparison:Object.freeze({
  metadata:'model comparable blockers interpretation structuralRejuvenationClaim',
  container:'before after measurementEvidence',
  synthetic_demonstration:'deltaDeviationIndex',
  blocked:'mechanicalAgeChangeKm',
 }),
 raw_session:Object.freeze({
  metadata:'version sessionId vehicleAlias engineFamily adapterModel softwareVersion source capturedAt clock eventCount elapsedHostReceiptMs requestTimeMissingCount caveat',
  container:'channels warnings traceIntegrity observability sourceTrace',
  observation:'hostReceiptTimePresent',
  unknown:'sensorAcquisitionTimeKnown simultaneityVerified',
  blocked:'estimatedAgeKm structuralWear remainingUsefulLife',
 }),
 aa:Object.freeze({
  metadata:'version design sessionCount dataUnit comparable blockers caveat',
  container:'sessionAudits observedChanges',
  unknown:'confidenceInterval noiseThresholdCalibrated verifiedIndependence causalEffect',
  blocked:'healthScore mechanicalAgeKm wear',
 }),
 r12:Object.freeze({
  metadata:'version protocol sessionUnit sessionCount calibrationSessionCount holdoutSessionCount status eligibleForDescriptiveTrend blockers provenance evidenceGrade caveat',
  container:'qa pidReports summary',
  unknown:'physicalAccuracyValidated verifiedSessionIndependence calibratedWearThreshold',
  blocked:'predictedFailure structuralWear mechanicalAgeKm',
 }),
 replicates:Object.freeze({
  metadata:'version comparable blockers sessionUnitCount evidenceLevel verdict',
  container:'phases baseline after observedDifferences',
  unknown:'confidenceInterval causalMaintenanceEffect',
  blocked:'structuralWear mechanicalAgeEquivalentKm',
 }),
 falsification:Object.freeze({
  metadata:'version source passedBehaviorChecks conclusion',
  container:'controls',
  blocked:'mechanicalAgeInferenceAllowed',
 })
});
export const REPORT_SUBFIELDS=Object.freeze({
 raw_session:Object.freeze({observability:'version powertrain fuel control status mode requiredPids missingPids supportedPids unobservableMechanisms blockers allowableInterpretation independentlyVerified'}),
 snapshot:Object.freeze({features:'medianRpm rpmRobustSigma medianEctC medianLoadPct medianIatC medianCombinedTrimPct temperatureRange loadRange',
  observability:'version powertrain fuel control status mode requiredPids missingPids supportedPids unobservableMechanisms blockers allowableInterpretation independentlyVerified'}),
 aa:Object.freeze({observedChanges:'*pid-map-session-deltas-only*'}),
 r12:Object.freeze({summary:'channelsWithObservedShift shiftedChannelCount comparableWarmIdleByOperatorDocumentation evidenceFromIndependentPhysicalReference functionalDiagnosisSupported sampleUnit'}),
 replicates:Object.freeze({phases:'before after',observedDifferences:'medianRpm rpmRobustSigma medianCombinedFuelTrim syntheticDeviationIndex'}),
});

export const BLOCKED_PHYSICAL_CLAIMS=Object.freeze([
 'mechanicalAgeEquivalentKm','mechanicalAgeChangeKm','mechanicalAgeKm',
 'estimatedAgeKm','structuralWear','remainingUsefulLife','wear','healthScore',
 'predictedFailure','physicalRulCycles','remainingAutomotiveLife'
]);

function declaredFieldMap(kind){
 const spec=REPORT_FIELDS[kind];
 if(!spec)throw RangeError('Tipo de informe MA00 sin contrato de evidencia');
 const result={};
 for(const [cls,fields] of Object.entries(spec)){
  if(!CLAIM_KIND.includes(cls))throw Error('Clase de evidencia no registrada: '+cls);
  for(const field of fields.split(/\s+/)){
   if(Object.hasOwn(result,field))throw Error('Campo duplicado en contratos de evidencia: '+field);
   result[field]=cls;
  }
 }
 return result;
}

/** Rejects unclassified claims, non-null physical estimates, and synthetic
 * scoring on external observations. Does NOT cryptographically verify origin.
 */
export function auditMA00Report(report,kind,{source=null}={}){
 if(!report||typeof report!=='object'||Array.isArray(report))
  throw TypeError('Informe de evidencia inválido');
 const registry=declaredFieldMap(kind);
 const keys=Object.keys(report).filter(k=>k!=='evidenceContract');
 const unclassified=keys.filter(k=>!Object.hasOwn(registry,k));
 const missing=Object.keys(registry).filter(k=>!Object.hasOwn(report,k));
 const unclassifiedNested=[],missingNested=[];
 for(const [container,contract] of Object.entries(REPORT_SUBFIELDS[kind]??{})){
  const data=report[container];
  if(data===null||data===undefined)continue;
  if(typeof data!=='object'||Array.isArray(data)) {
   unclassifiedNested.push(container+' (estructura inválida)');continue;
  }
  if(contract.startsWith('*'))continue; // Dynamic PID→delta maps have a separate allowlist.
  const expected=contract.split(/\s+/);
  for(const field of Object.keys(data)){
   if(!expected.includes(field))unclassifiedNested.push(container+'.'+field);
  }
  for(const field of expected){
   if(!Object.hasOwn(data,field))missingNested.push(container+'.'+field);
  }
 }
 const dynamicViolations=auditDynamicMA00Structure(report,kind);
 const violations=[...dynamicViolations];
 if(unclassified.length)violations.push('Campos sin clasificación: '+unclassified.join(', '));
 if(missing.length)violations.push('Campos declarados pero ausentes: '+missing.join(', '));
 if(unclassifiedNested.length)violations.push('Subcampos sin clasificación: '+unclassifiedNested.join(', '));
 if(missingNested.length)violations.push('Subcampos ausentes: '+missingNested.join(', '));
 for(const key of BLOCKED_PHYSICAL_CLAIMS)if(Object.hasOwn(report,key)&&
   report[key]!==null&&report[key]!==false)
  violations.push('Estimación física no respaldada: '+key);
 const relevantSource=source??(kind==='snapshot'||kind==='raw_session'?report.source:null);
 const external=relevantSource!=='synthetic';
 if(external){
  for(const key of ['deviationIndex','deltaDeviationIndex']){
   if(Object.hasOwn(report,key)&&report[key]!==null)
    violations.push('Índice sintético aplicado a fuente externa: '+key);
  }
 }
 const nullOnly=['confidenceInterval','causalEffect'];
 for(const key of nullOnly)if(Object.hasOwn(report,key)&&report[key]!==null)
  violations.push('Intervalo o efecto causal no validado: '+key);
 return {version:CLAIMS_VERSION,kind,complete:unclassified.length===0&&missing.length===0&&unclassifiedNested.length===0&&missingNested.length===0&&dynamicViolations.length===0,
  violations,unclassified:[...unclassified,...unclassifiedNested],missing:[...missing,...missingNested],classifiedCount:keys.length-unclassified.length,
  evidenceLevel:relevantSource==='synthetic'?'E0':'unverified',
  independentlyVerified:false,
  physicalWearAuthorized:false};
}

export function assertMA00Report(report,kind,opts={}){
 const audit=auditMA00Report(report,kind,opts);
 if(audit.violations.length)throw RangeError('R13 afirmación no sustentada: '+audit.violations.join('; '));
 return {...report,evidenceContract:audit};
}

export function checkObservabilityClaim(claim){
 if(!claim||typeof claim!=='object'||Array.isArray(claim))
  throw TypeError('EvidenceClaim inválido');
 const {kind,level,value,sourceIds,alternativeHypothesis,testablePrediction}=claim;
 if(!CLAIM_KIND.includes(kind)||!CLAIM_LEVELS.includes(level))
  throw RangeError('Categoría o nivel de evidencia desconocido');
 if(!Array.isArray(sourceIds)||!sourceIds.length||
  !sourceIds.every(s=>typeof s==='string'&&s.length>2&&s.length<=128))
  throw RangeError('Toda afirmación necesita referencias a observaciones o documentos');
 if(kind==='hypothesis'&&(!alternativeHypothesis||!testablePrediction))
  throw RangeError('Hipótesis sin alternativa ni prueba falsable');
 if(kind==='blocked'&&value!==null)throw RangeError('Estimación bloqueada debe ser null');
 if(level!=='E0')
  throw RangeError('Niveles E1–E5 no autorizados todavía: requieren evidencia independiente verificada; autoafirmaciones o simulaciones no validan desgaste físico');
 return Object.freeze({...claim,independentlyVerified:false});
}
