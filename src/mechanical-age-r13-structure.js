/**
 * MA00 R13.1 — bounded structural contracts for dynamic report containers.
 * No crypto, no private identifiers and no independent physical authenticity.
 *
 * Maps are PID allowlists, arrays are bounded and their child fields typed.
 * This module is intentionally independent of the report classifier to avoid
 * circular imports. Report classifier enforces both contracts.
 */
export const STRUCTURE_VERSION='ma00-r13-structure-v1';
export const MODE01_PIDS=Object.freeze(['0103','0104','0105','0106','0107','010C','010F']);
const FIELDS=Object.freeze({
 channel:'channel unit attempts success failures failFraction median medianAbsoluteDeviation distinctValues maxIdenticalRun possibleStaleOrStable observedSpan medianReceiptGapMs maxReceiptGapMs medianHostRoundTripMs unmeasuredRoundTripCount',
 change:'unit firstMedian lastMedian lastMinusFirst maxMinusMin sourceSessionRefs',
 r12Pid:'unit referenceSessions holdoutSessions referenceMedian referenceObservedSpread nominalPidReadoutStep descriptiveBandHalfWidth subsequentSessionMedians subsequentMinusReference sourceSessionRefs sessionsOutsideObservedReferenceBand anyOutsideObservedReferenceBand thresholdMeaning',
 r12Qa:'sessions totalEvents requestedTimestampsMissing skippedBecauseOfSerialMismatch apparentStableOrStalePids hostReceiptTimesOnly ecuAcquisitionTimingKnown',
 traceCommon:'version applies internallyConsistent errors independentlyAuthenticated wearInferenceAllowed',
 traceSerial:'activePids expectedEventCount observedEventCount caveat',
 reference:'version sessionReference eventCount pidEventIndexes independentlyAuthenticated eventIndexIsNotAcquisitionTimestamp',
 falsificationControl:'id label expectedBehavior behaviorObserved comparisonAllowed baselineIndex alteredIndex delta blockers baselineTrims alteredTrims structuralWearGroundTruth causalServiceEffect caveat',
 phase:'sessions rpm rpmRobustSigma combinedFuelTrim experimentalDeviationIndex',
 phaseMetric:'median range',
});
export const DYNAMIC_FIELD_CONTRACTS=Object.freeze(
 Object.fromEntries(Object.entries(FIELDS).map(([key,value])=>[key,Object.freeze(value.split(' '))]))
);
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&
 (Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null);
const has=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const physical=/^(?:healthScore|predictedFailure|structuralWear|mechanicalAgeKm|mechanicalAgeEquivalentKm|remainingUsefulLife|remainingAutomotiveLife|physicalRulCycles|wear)$/i;
function checkFields(obj,fields,path,errors){
 if(!plain(obj)){errors.push(path+': object required');return false;}
 for(const k of Object.keys(obj)){
  if(!fields.includes(k))errors.push(path+'.'+k+': unclassified dynamic field');
  if(physical.test(k)&&obj[k]!==null&&obj[k]!==false)errors.push(path+'.'+k+': unverified physical claim');
 }
 for(const k of fields)if(!has(obj,k))errors.push(path+'.'+k+': missing field');
 return true;
}
function map(obj,path,errors,callback,{max=7}={}){
 if(!plain(obj)){errors.push(path+': PID map required');return;}
 const keys=Object.keys(obj);
 if(keys.length>max){errors.push(path+': excessive PID keys');return;}
 for(const key of keys){
  if(!MODE01_PIDS.includes(key)){errors.push(path+'.'+key+': unknown PID key');continue;}
  callback(obj[key],path+'.'+key,key);
 }
}
const finite=x=>typeof x==='number'&&Number.isFinite(x);
function boundedArray(arr,path,errors,max=20000){
 if(!Array.isArray(arr)||arr.length>max){errors.push(path+': invalid or unbounded array');return false;}
 return true;
}
function traceValid(v,path,errors){
 if(!plain(v)){errors.push(path+': trace object required');return;}
 const names=[...FIELDS.traceCommon.split(' '),...(v.applies&&v.internallyConsistent?FIELDS.traceSerial.split(' '):[])];
 checkFields(v,names,path,errors);
 if(v.independentlyAuthenticated!==false||v.wearInferenceAllowed!==false)errors.push(path+': unauthorized physical authenticity');
 if(boundedArray(v.errors,path+'.errors',errors,50)&&v.errors.some(x=>typeof x!=='string'||x.length>350))
  errors.push(path+'.errors: invalid message');
 if(v.applies===false&&v.internallyConsistent!==null)errors.push(path+': nonserial trace cannot assert verified consistency');
 if(v.applies===true&&v.internallyConsistent===true&&v.errors.length!==0)
  errors.push(path+': contradictory trace errors');
}
function sessionRefs(value,path,errors,expectedCount){
 if(!boundedArray(value,path,errors,12))return;
 if(value.length!==expectedCount||value.some(x=>typeof x!=='string'||!/^session:[A-Za-z0-9][\w.-]{2,79}$/.test(x)))
  errors.push(path+': expected ordered source session references');
 if(new Set(value).size!==value.length)errors.push(path+': duplicate source session');
}
function rawSourceRefs(x,path,errors,report){
 if(!checkFields(x,FIELDS.reference.split(' '),path,errors))return;
 if(x.independentlyAuthenticated!==false||x.eventIndexIsNotAcquisitionTimestamp!==true)
  errors.push(path+': forged proof of physical authenticity/timing');
 if(x.eventCount!==report.eventCount||typeof x.sessionReference!=='string'||
  x.sessionReference!==('session:'+report.sessionId))
  errors.push(path+': session reference mismatch');
 let referencedCount=0;
 const observedPids=new Set();
 map(x.pidEventIndexes,path+'.pidEventIndexes',errors,(indexes,p,pid)=>{
  observedPids.add(pid);
  if(!boundedArray(indexes,p,errors,20000))return;
  if(indexes.length!==report.channels?.[pid]?.attempts)
   errors.push(p+': source events do not match counted PID attempts');
  referencedCount+=indexes.length;
  let previous=-1;
  for(const idx of indexes){
   if(!Number.isInteger(idx)||idx<0||idx>=report.eventCount||idx<=previous){
    errors.push(p+': invalid event index or ordering');break;
   }
   previous=idx;
  }
 });
 if(referencedCount!==report.eventCount)errors.push(path+': source event references incomplete');
 if(Object.keys(report.channels??{}).some(pid=>!observedPids.has(pid)))
  errors.push(path+': source PID map missing observed channel');
}
function rawChecks(report,errors,prefix='raw_session'){
 map(report.channels,prefix+'.channels',errors,(ch,path,pid)=>{
  if(checkFields(ch,FIELDS.channel.split(' '),path,errors)){
   if(!Number.isInteger(ch.attempts)||ch.attempts<1||ch.success+ch.failures!==ch.attempts)
    errors.push(path+': inconsistent counts');
   if(ch.failFraction<0||ch.failFraction>1)
    errors.push(path+': invalid failure fraction');
   if(ch.unit!==({'0103':'enum','0104':'%','0105':'C','0106':'%','0107':'%','010C':'rpm','010F':'C'})[pid])
    errors.push(path+': unsupported unit');
  }
 });
 if(boundedArray(report.warnings,prefix+'.warnings',errors,7)&&report.warnings.some(x=>typeof x!=='string'||x.length>300))
  errors.push(prefix+'.warnings: invalid text');
 traceValid(report.traceIntegrity,prefix+'.traceIntegrity',errors);
 if(report.sourceTrace!==undefined)rawSourceRefs(report.sourceTrace,prefix+'.sourceTrace',errors,report);
}
function r12Checks(report,errors){
 if(report.qa!==null){
  checkFields(report.qa,FIELDS.r12Qa.split(' '),'r12.qa',errors);
  if(report.qa?.ecuAcquisitionTimingKnown!==false)errors.push('r12.qa: ECU timing not known');
 }
 if(report.pidReports!==null){
  map(report.pidReports,'r12.pidReports',errors,(obj,path)=>{
   checkFields(obj,FIELDS.r12Pid.split(' '),path,errors);
   if(!boundedArray(obj?.subsequentSessionMedians,path+'.subsequentSessionMedians',errors,8))return;
   if(!boundedArray(obj?.subsequentMinusReference,path+'.subsequentMinusReference',errors,8))return;
   if(obj?.referenceSessions!==4||obj?.holdoutSessions!==report.holdoutSessionCount)
    errors.push(path+': calibration/holdout changed');
   sessionRefs(obj?.sourceSessionRefs,path+'.sourceSessionRefs',errors,report.sessionCount);
   if(obj?.subsequentSessionMedians.some(x=>!finite(x))||obj?.subsequentMinusReference.some(x=>!finite(x)))
    errors.push(path+': invalid median or delta');
  });
 }
 if(report.summary!==null&&report.summary!==undefined){
  if(boundedArray(report.summary.channelsWithObservedShift,'r12.summary.channelsWithObservedShift',errors,7)&&
   report.summary.channelsWithObservedShift.some(pid=>!MODE01_PIDS.includes(pid)))
   errors.push('r12.summary: invalid shifted PID');
  if(report.summary.functionalDiagnosisSupported!==false||
     report.summary.evidenceFromIndependentPhysicalReference!==false)
   errors.push('r12.summary: unverified diagnosis or physical reference');
 }
}
export function auditDynamicMA00Structure(report,kind){
 const errors=[];
 if(!plain(report))return ['Report must be object'];
 if(kind==='raw_session')rawChecks(report,errors);
 if(kind==='aa'){
  if(!boundedArray(report.sessionAudits,'aa.sessionAudits',errors,12))return errors;
  for(const [i,session] of report.sessionAudits.entries())rawChecks(session,errors,'aa.sessionAudits.'+i);
  if(report.observedChanges!==null){
   map(report.observedChanges,'aa.observedChanges',errors,(x,path)=>{
    checkFields(x,FIELDS.change.split(' '),path,errors);
    sessionRefs(x?.sourceSessionRefs,path+'.sourceSessionRefs',errors,report.sessionCount);
   });
  }
 }
 if(kind==='r12')r12Checks(report,errors);
 if(kind==='replicates'){
  checkFields(report.phases,['before','after'],'replicates.phases',errors);
  for(const phase of ['baseline','after']){
   const x=report[phase];
   if(x===null)continue;
   if(checkFields(x,FIELDS.phase.split(' '),'replicates.'+phase,errors)){
    for(const key of ['rpm','rpmRobustSigma','combinedFuelTrim','experimentalDeviationIndex']){
     if(x[key]!==null)checkFields(x[key],FIELDS.phaseMetric.split(' '),'replicates.'+phase+'.'+key,errors);
    }
   }
  }
 }
 if(kind==='falsification'){
  if(boundedArray(report.controls,'falsification.controls',errors,100)){
   for(const [i,item] of report.controls.entries()){
    checkFields(item,FIELDS.falsificationControl.split(' '),'falsification.controls.'+i,errors);
    if(item?.structuralWearGroundTruth!==null||item?.causalServiceEffect!==null)
     errors.push('falsification.controls.'+i+': unauthorized physical ground truth');
   }
  }
 }
 return errors;
}
