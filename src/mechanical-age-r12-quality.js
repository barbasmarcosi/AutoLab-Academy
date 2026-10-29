/**
 * MA00 R12 — prospective A–A raw OBD repeatability and fail-closed data quality.
 *
 * Four *session* calibration observations and >=2 subsequent session checks.
 * No resampling of correlated OBD rows; no statistical confidence or causal
 * inference. No known sensor acquisition time, metrological calibration or wear.
 * Works fully offline in the existing PWA.
 */
import {evaluateAAWithoutService, syntheticAAReceiptPair} from './mechanical-age-raw-obd.js';

export const R12_VERSION='ma00-obd-multisession-quality-v1';
export const R12_REQUIRED_PIDS=Object.freeze(['010C','0105','0104','0106','0107']);
export const R12_OPTIONAL_PIDS=Object.freeze(['010F']);
const CALIBRATION_SESSIONS=4;
const MIN_CHECK_SESSIONS=2;
const MIN_SEPARATION_MS=5*60*1000;
// *Readout quantization*, not uncertainty of a physical sensor/ECU.
// RPM=1/4, ECT/IAT=1, load=100/255, trim=100/128 per Mode 01 byte encoding.
const READOUT_STEP=Object.freeze({
 '010C':.25,'0105':1,'0104':100/255,'0106':100/128,
 '0107':100/128,'010F':1
});
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const median=x=>{
 const a=[...x].sort((p,q)=>p-q),n=a.length;
 return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;
};
const round=x=>Number(x.toFixed(4));
const stat=audits=>({
 sessions:audits.length,
 totalEvents:audits.reduce((sum,a)=>sum+a.eventCount,0),
 requestedTimestampsMissing:audits.reduce((sum,a)=>sum+a.requestTimeMissingCount,0),
 skippedBecauseOfSerialMismatch:audits.filter(a=>a.traceIntegrity.applies&&!a.traceIntegrity.internallyConsistent).length,
 apparentStableOrStalePids:[...new Set(audits.flatMap(a=>Object.entries(a.channels)
  .filter(([,c])=>c.possibleStaleOrStable).map(([pid])=>pid)))].sort(),
 // Received-at is host time; no ECU acquisition timestamps exist.
 hostReceiptTimesOnly:true,
 ecuAcquisitionTimingKnown:false,
});

function releaseBlocked(blockers,sessionCount,aa,provenance){
 return {
  version:R12_VERSION,protocol:'AA_4_calibration_then_2plus_holdout',
  sessionUnit:'independent-session-asserted-not-verified',
  sessionCount,calibrationSessionCount:0,holdoutSessionCount:0,
  status:'abstain',eligibleForDescriptiveTrend:false,blockers,
  provenance,evidenceGrade:'unverified_or_synthetic',
  qa:aa?stat(aa.sessionAudits):null,
  pidReports:null,summary:null,calibratedWearThreshold:false,
  predictedFailure:null,structuralWear:null,mechanicalAgeKm:null,
  physicalAccuracyValidated:false,verifiedSessionIndependence:false,
  caveat:'Sin metrología independiente ni patrón físico. Ningún umbral de anomalía o desgaste está calibrado.'
 };
}

/** Descriptive change versus an *observed reference band*, not a fault alarm. */
export function assessObdMultiSessionRepeatability(sessions){
 if(!Array.isArray(sessions)||sessions.length<2||sessions.length>12)
  throw RangeError('R12 requiere 2–12 sesiones para la auditoría A–A');
 const aa=evaluateAAWithoutService(sessions);
 const provenance=[...new Set(aa.sessionAudits.map(a=>a.source))];
 const blockers=[...aa.blockers];
 if(sessions.length<CALIBRATION_SESSIONS+MIN_CHECK_SESSIONS)
  blockers.push('R12 requiere 4 sesiones de calibración y al menos 2 sesiones posteriores; las filas PID no sustituyen sesiones');
 // Wall-clock timestamps provided by capture operator, not independently signed.
 const dates=aa.sessionAudits.map(a=>Date.parse(a.capturedAt));
 for(let i=1;i<dates.length;i++){
  if(dates[i]-dates[i-1]<MIN_SEPARATION_MS){
   blockers.push('Separación temporal entre sesiones inferior a cinco minutos; independencia no respaldada');
   break;
  }
 }
 const synthetic=provenance.length===1&&provenance[0]==='synthetic';
 if(!synthetic){
  // Values typed into arbitrary JSON without original bytes cannot establish
  // even internal serial integrity. The shell re-labels imported JSON as real
  // *unverified* regardless of self-asserted synthetic status.
  if(sessions.some((s,i)=>s.schema!=='ma00-local-serial-receipts-v1'||
    aa.sessionAudits[i].traceIntegrity?.applies!==true||
    aa.sessionAudits[i].traceIntegrity?.internallyConsistent!==true))
   blockers.push('Falta expediente serial Mode 01 consistente en todas las capturas externas');
 }
 if(blockers.length)return releaseBlocked(blockers,sessions.length,aa,provenance);
 const calibration=aa.sessionAudits.slice(0,CALIBRATION_SESSIONS);
 const holdout=aa.sessionAudits.slice(CALIBRATION_SESSIONS);
 const pidReports={};
 for(const pid of [...R12_REQUIRED_PIDS,...R12_OPTIONAL_PIDS]){
  const initial=calibration.map(a=>a.channels[pid]?.median);
  const subsequent=holdout.map(a=>a.channels[pid]?.median);
  if(pid===R12_OPTIONAL_PIDS[0]&&[...initial,...subsequent].every(v=>v===undefined))continue;
  if([...initial,...subsequent].some(v=>!finite(v))){
   // Optional channel must be present everywhere or nowhere; required PIDs
   // are already checked in A-A, but be strict rather than partially impute.
   return releaseBlocked(['Cobertura del PID '+pid+' no completa en todas las sesiones'],
    sessions.length,aa,provenance);
  }
  const center=median(initial);
  const spread=Math.max(...initial)-Math.min(...initial);
  const resolutionFloor=2*READOUT_STEP[pid];
  // No training on holdout: observed reference variation + minimum two
  // nominal resolution steps; no claimed 95th percentile from n=4.
  const descriptiveBand=Math.max(spread,resolutionFloor);
  const deltas=subsequent.map(v=>v-center);
  const outside=deltas.map(d=>Math.abs(d)>descriptiveBand+1e-10);
  pidReports[pid]={
   unit:calibration[0].channels[pid].unit,
   referenceSessions:CALIBRATION_SESSIONS,holdoutSessions:holdout.length,
   referenceMedian:round(center),referenceObservedSpread:round(spread),
   nominalPidReadoutStep:round(READOUT_STEP[pid]),
   descriptiveBandHalfWidth:round(descriptiveBand),
   subsequentSessionMedians:subsequent.map(round),
   subsequentMinusReference:deltas.map(round),
   sessionsOutsideObservedReferenceBand:outside.filter(Boolean).length,
   anyOutsideObservedReferenceBand:outside.some(Boolean),
   thresholdMeaning:'observed_four_session_spread_or_two_nominal_readout_steps_NOT_a_fault_threshold'
  };
 }
 const changed=Object.entries(pidReports).filter(([,r])=>r.anyOutsideObservedReferenceBand).map(([pid])=>pid);
 const qa=stat(aa.sessionAudits);
 return {
  version:R12_VERSION,protocol:'AA_4_calibration_then_2plus_holdout',
  sessionUnit:'independent-session-asserted-not-verified',
  sessionCount:sessions.length,
  calibrationSessionCount:CALIBRATION_SESSIONS,holdoutSessionCount:holdout.length,
  status:'descriptive_only',eligibleForDescriptiveTrend:true,blockers:[],
  provenance,
  evidenceGrade:synthetic?'synthetic_demonstration':'operator_asserted_serial_bytes_not_authenticated',
  qa,pidReports,
  summary:{
   channelsWithObservedShift:changed,
   shiftedChannelCount:changed.length,
   comparableWarmIdleByOperatorDocumentation:true,
   evidenceFromIndependentPhysicalReference:false,
   functionalDiagnosisSupported:false,
   sampleUnit:'session_not_obd_sample',
  },
  calibratedWearThreshold:false,predictedFailure:null,structuralWear:null,
  mechanicalAgeKm:null,physicalAccuracyValidated:false,
  verifiedSessionIndependence:false,
  caveat:'La banda es descriptiva con 4 sesiones; no mide incertidumbre metrológica, error causal, falla, desgaste o edad. Tiempos host ≠ ECU.'
 };
}

/** Six genuinely distinct signal sequences, still entirely FAKE. */
export function syntheticR12ReceiptSeries(){
 const base=syntheticAAReceiptPair();
 const result=[];
 for(let k=0;k<6;k++){
  const s=structuredClone(base[k%2]);
  s.sessionId='r12-demo-session-'+(k+1);
  s.capturedAt='2026-10-2'+(k+2)+'T12:00:00Z';
  s.conditions.ambientC=20+Math.sin(k)*.6;
  s.events=s.events.map((event,i)=>{
   if(event.status!=='ok')return event;
   if(event.pid==='010C')return {...event,value:event.value+Math.sin(k*.8+i*.11)*.8};
   if(event.pid==='0106')return {...event,value:event.value+Math.sin(k+i*.05)*.09};
   if(event.pid==='0107')return {...event,value:event.value+Math.cos(k+i*.07)*.1};
   if(event.pid==='0104')return {...event,value:event.value+Math.sin(k*.2+i*.03)*.05};
   return {...event};
  });
  result.push(s);
 }
 return result;
}
