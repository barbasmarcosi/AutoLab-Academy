/**
 * In-lesson scientific notebook. It teaches falsifiable study design, not
 * instrument simulation, semantic grading, or practical accreditation.
 */
export const INQUIRY_MODEL='autolab-inquiry-v1';
export const inquiryId=id=>'lab-inquiry-'+id+'-v1';
const required=(value,min=30,max=700)=>{
 if(typeof value!=='string'||value.trim().length<min||value.length>max)
  throw RangeError('Completá el criterio con al menos '+min+' caracteres concretos.');
 return value.trim();
};
export function inquiryProgress(progress,id){
 const cases=Array.isArray(progress?.cases)?progress.cases.filter(x=>x?.id===inquiryId(id)):[];
 return {attempts:cases.length,passed:false,status:cases.length?'documented-unverified':'not-started'};
}
export function makeInquiryRecord(lesson,input){
 if(!lesson||!/^[a-z0-9-]+$/.test(lesson.id)||!Array.isArray(lesson.sections)||!lesson.sections.length)
  throw RangeError('Lección inválida');
 const values={};
 for(const field of ['hypothesis','alternative','probe','predictH1','predictH2','falsifier','confounder'])
  values[field]=required(input?.[field]);
 values.limits=required(input?.limits,60,900);
 if(!['design','observation'].includes(input?.mode))throw RangeError('Modo de evidencia inválido');
 const observed=input.mode==='observation';
 for(const key of ['observation','provenance','interpretation'])
  values[key]=observed?required(input[key]):'No consta (solo diseño)';
 const report=['# AutoLab — cuaderno de investigación sin calificación',
  'Modelo: '+INQUIRY_MODEL,'Lección: '+lesson.id+' — '+lesson.title,
  'Teoría de partida: '+lesson.sections[0][0]+' — '+lesson.sections[0][1],
  'Hipótesis principal: '+values.hypothesis,'Alternativa: '+values.alternative,
  'Prueba propuesta: '+values.probe,
  'Predicción H1 congelada: '+values.predictH1,'Predicción H2 congelada: '+values.predictH2,
  'Criterio de falsación: '+values.falsifier,'Factor de confusión: '+values.confounder,
  'Observación: '+values.observation,'Procedencia declarada: '+values.provenance,
  'Interpretación: '+values.interpretation,'Límites: '+values.limits,
  observed?'Observación AUTORREPORTADA: no verificada por AutoLab.':'SIN OBSERVACIÓN: diseño pendiente de contraste.',
  'No existe corrección automática, validación de medición ni aprobación práctica.'].join('\n');
 if(report.length>10000)throw RangeError('Reporte demasiado extenso');
 return {id:inquiryId(lesson.id),score:0,passed:false,at:new Date().toISOString(),
  hypothesis:values.hypothesis.slice(0,80),conclusion:values.interpretation.slice(0,2000),
  used:['hypothesis-alternative','frozen-predictions',observed?'unverified-observation':'design-only'],
  reasoning:values.hypothesis+'\nAlternativa: '+values.alternative,report};
}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountInquiryNotebook(root,{lesson,record,onSaved=()=>{}}){
 if(!root||!lesson||typeof record!=='function')throw Error('Falta contexto');
 const fields=['hypothesis','alternative','probe','predictH1','predictH2','falsifier','confounder','limits'];
 const questions={
  hypothesis:'H1: formulá una hipótesis verificable para esta lección',
  alternative:'H2: proponé una causa alternativa al mismo fenómeno',
  probe:'¿Qué prueba distinguiría H1 de H2?',
  predictH1:'Antes del contraste, ¿qué observarías si H1 fuera correcta?',
  predictH2:'¿Qué observarías en la misma prueba si H2 fuera correcta?',
  falsifier:'¿Qué observación concreta refutaría H1?',
  confounder:'¿Qué error de instrumento, condición o variable podría confundirte?',
  limits:'¿Qué no demuestra el ejercicio y qué condiciones de seguridad aplican?'
 };
 let stage=0,values={},frozen={},saved=false,saving=false,error='';
 const field=id=>'<label for="inquiry-'+id+'">'+esc(questions[id]||id)+'</label>'+
  '<textarea id="inquiry-'+id+'" class="field" rows="3" maxlength="'+(id==='limits'?900:700)+'">'+esc(values[id]||'')+'</textarea>';
 const frozenView=id=>'<p class="reasoning-frozen"><strong>'+esc(questions[id])+':</strong> '+esc(frozen[id])+' <span class="tag dim">Congelado</span></p>';
 function render(){
  let out='<section class="panel stack inquiry-notebook"><div class="eyebrow">DISEÑO CIENTÍFICO · SIN NOTA</div>'+
  '<h2>Cuaderno de investigación: '+esc(lesson.title)+'</h2>'+
  '<p class="muted">Del concepto «'+esc(lesson.sections[0]?.[0]||'teoría')+'» a hipótesis, prueba y falsación. No se simula ninguna lectura ni se acredita práctica.</p>';
  if(stage===0)out+=field('hypothesis')+field('alternative')+'<button type="button" class="button" data-inquiry="first">Congelar hipótesis</button>';
  else{
   out+=frozenView('hypothesis')+frozenView('alternative');
   if(stage===1)out+=fields.slice(2,7).map(field).join('')+
    '<button type="button" class="button" data-inquiry="second">Congelar prueba y predicciones</button>';
   else{
    out+=fields.slice(2,7).map(frozenView).join('');
    if(!saved){
     out+='<label for="inquiry-mode">¿Contás con observación documentada?</label>'+
      '<select class="field" id="inquiry-mode"><option value="design" '+(values.mode==='observation'?'':'selected')+'>No: guardar solamente diseño</option>'+
      '<option value="observation" '+(values.mode==='observation'?'selected':'')+'>Sí: documentar sin verificación</option></select>';
     if(values.mode==='observation')out+=
      ['observation','provenance','interpretation'].map(id=>'<label for="inquiry-'+id+'">'+
       esc({observation:'Observación concreta',provenance:'Procedencia, método y condiciones',interpretation:'Interpretación frente a las alternativas'}[id])+
       '</label><textarea id="inquiry-'+id+'" rows="3" maxlength="700" class="field">'+esc(values[id]||'')+'</textarea>').join('');
     out+=field('limits')+'<button type="button" class="button" data-inquiry="save" '+(saving?'disabled':'')+'>Guardar diseño sin acreditar práctica</button>';
    }else out+='<p role="status">Diseño guardado sin nota ni acreditación instrumental.</p>';
   }
  }
  root.innerHTML=out+'<p role="status" aria-live="polite" class="muted">'+esc(error)+'</p></section>';
 }
 root.addEventListener('input',e=>{
  if(e.target.id?.startsWith('inquiry-')&&e.target.tagName==='TEXTAREA')values[e.target.id.slice(8)]=e.target.value;
 });
 root.addEventListener('change',e=>{if(e.target.id==='inquiry-mode'){values.mode=e.target.value;render();}});
 root.addEventListener('click',async e=>{
  const action=e.target.closest('[data-inquiry]')?.dataset.inquiry;
  if(!action||saving||saved)return;
  error='';
  try{
   if(action==='first'&&stage===0){
    for(const id of fields.slice(0,2))frozen[id]=required(values[id]);stage=1;
   }else if(action==='second'&&stage===1){
    for(const id of fields.slice(2,7))frozen[id]=required(values[id]);stage=2;
   }else if(action==='save'&&stage===2){
    const entry=makeInquiryRecord(lesson,{...frozen,...values,mode:values.mode||'design'});
    saving=true;
    try{await record(entry);saved=true;onSaved(entry);}
    finally{saving=false;}
   }
  }catch(e){error=e instanceof RangeError?e.message:'No se pudo confirmar el guardado. Reintentá.';}
  if(root.isConnected)render();
 });
 render();
}
