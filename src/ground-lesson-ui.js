/**
 * Lesson 07 UI: no second circuit solver; consumes ground-lesson model only.
 * The guided and independent case IDs deliberately do not overlap.
 */
import{GROUND_GUIDED_ID,GROUND_HOLDOUT_ID,GROUND_HOLDOUT_CASES,GROUND_PROBES,GROUND_FALSIFIERS,
 groundLabModel,groundObservation,freezeGroundPlan,gradeGroundHoldout}from'./ground-lesson.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toFixed(2).replace('.',',');
const causes=[['return','Resistencia adicional del retorno ficticio'],['positive','Resistencia adicional del positivo ficticio'],['load','Variación de demanda de la carga sin defecto de conductor probado'],['unknown','No concluyente']];
const GUIDED=Object.freeze([
 Object.freeze({id:'G01',cause:'return',rP:0.05,rR:0.25,rL:2}),
 Object.freeze({id:'G02',cause:'positive',rP:0.25,rR:0.05,rL:2}),
 Object.freeze({id:'G03',cause:'load',rP:0.05,rR:0.05,rL:1.7})
]);
const selectors=(id,title,items,disable=false)=>"<label for='"+id+"'>"+esc(title)+"</label><select class='field' id='"+id+"' "+(disable?'disabled':'')+"><option value=''>Elegí</option>"+
 items.map(([key,name])=>"<option value='"+esc(key)+"'>"+esc(name)+"</option>").join('')+"</select>";
export function mountGroundGuided(root,{record,onSaved=()=>{}}={}){
 if(!root||typeof record!=='function')throw Error('El laboratorio requiere guardado');
 let index=0,frozen=null,complete=[],busy=false;
 const $=id=>root.querySelector('#'+id);
 const render=()=>{
  const c=GUIDED[index],m=groundLabModel({positiveOhm:c.rP,returnOhm:c.rR,loadOhm:c.rL});
  root.innerHTML="<section class='panel stack' aria-label='Banco guiado de retornos'><h3>Banco guiado: corriente, positivo y retorno</h3>"+
   "<p>Escenario ficticio "+(index+1)+"/3. Fuente ideal 12 V. En el ensayo anterior las resistencias del positivo y retorno eran 0,05 Ω cada una, y la carga era 2 Ω.</p>"+
   (!frozen?selectors('ground-g-hypothesis','Hipótesis antes de observar',causes)+
    "<label for='ground-g-pred'>Caída estimada de retorno en este caso (V)</label><input class='field' id='ground-g-pred' type='number' step='any' min='0' max='12'/>"+
    "<button class='button' type='button' data-ground-g='freeze'>Congelar y revelar medidas de banco</button>":
    "<p><strong>Hipótesis congelada:</strong> "+esc(causes.find(x=>x[0]===frozen.hypothesis)[1])+"; pronóstico de retorno "+fmt(frozen.predicted)+" V.</p>"+
    "<p>Modelo de datos: corriente "+fmt(m.currentA)+" A, positivo "+fmt(m.positiveV)+" V, retorno "+fmt(m.returnV)+" V y carga "+fmt(m.loadV)+" V.</p>"+
    selectors('ground-g-cause','Causa final sustentada por las medidas',causes.filter(x=>x[0]!=='unknown'))+
    selectors('ground-g-probe','Observable más discriminante',GROUND_PROBES)+
    "<label for='ground-g-explain'>Por qué ese observable discrimina (mín. 25 caracteres)</label>"+
    "<textarea id='ground-g-explain' class='field' rows='3' maxlength='1200'></textarea>"+
    "<button class='button' type='button' data-ground-g='check'>Contrastar y registrar el escenario</button>")+
   "<p id='ground-g-status' role='status' aria-live='polite'></p></section>";
 };
 root.addEventListener('click',async e=>{
  const button=e.target.closest('[data-ground-g]');if(!button||busy)return;
  const c=GUIDED[index],action=button.dataset.groundG;
  if(action==='freeze'&&!frozen){
   const hypothesis=$('ground-g-hypothesis').value,predicted=Number($('ground-g-pred').value);
   if(!hypothesis||$('ground-g-pred').value===''||!Number.isFinite(predicted)||predicted<0||predicted>12){
    $('ground-g-status').textContent='Elegí hipótesis y predicción numérica antes de observar.';return;
   }
   frozen={hypothesis,predicted};render();return;
  }
  if(action==='check'&&frozen){
   const cause=$('ground-g-cause').value,probe=$('ground-g-probe').value,explanation=$('ground-g-explain').value.trim();
   if(!cause||!probe||explanation.length<25){$('ground-g-status').textContent='Completá conclusión, observable y justificación (mínimo 25 caracteres).';return;}
   const decisive={return:'return',positive:'positive',load:'current'}[c.cause];
   if(cause!==c.cause||probe!==decisive){
    $('ground-g-status').textContent="No se confirmó esa causa. Compará qué tramo cambia respecto del patrón; una continuidad en reposo no basta. La explicación abierta requiere revisión humana.";
    return;
   }
   complete.push({id:c.id,prior:frozen,decision:cause,decisiveProbe:probe,explanation,model:'synthetic-lv-only'});
   if(index<GUIDED.length-1){index++;frozen=null;render();return;}
   busy=true;try{
    await record({id:GROUND_GUIDED_ID,at:new Date().toISOString(),score:100,passed:true,
     hypothesis:'Diagnóstico guiado LV',conclusion:'Tres contrastes guiados objetivos de banco',
     reasoning:'Identificó el tramo o cambio de carga dentro del modelo y registró evidencia.',
     report:JSON.stringify({rubric:GROUND_GUIDED_ID,complete,qualitativeReview:'pending',noPhysicalCompetence:true})});
    root.innerHTML="<section class='panel stack' id='ground-g-result' role='status'><h3>3/3 contrastes digitales registrados</h3>"+
     "<p>Banco de baja tensión sintético aprobado objetivamente. Respuestas abiertas pendientes de revisión. Continuá con el caso reservado independiente.</p></section>";
    onSaved();
   }catch(error){$('ground-g-status').textContent='Guardado no confirmado: '+String(error.message||error);}
   finally{busy=false;}
  }
 });
 render();
}
export function nextGroundHoldoutIndex(history=[]){
 if(!Array.isArray(history))return 0;
 for(let i=history.length-1;i>=0;i--){
  const entry=history[i];if(entry?.id!==GROUND_HOLDOUT_ID||typeof entry.report!=='string')continue;
  try{const report=JSON.parse(entry.report),index=GROUND_HOLDOUT_CASES.findIndex(c=>c.id===report.caseId);
   if(report.rubric===GROUND_HOLDOUT_ID&&index>=0)return(index+1)%GROUND_HOLDOUT_CASES.length;
  }catch{ /* corrupted record not used */ }
 }return 0;
}
export function mountGroundHoldout(root,{record,history=[],onSaved=()=>{}}={}){
 if(!root||typeof record!=='function')throw Error('Falta almacenamiento de transferencia');
 let index=nextGroundHoldoutIndex(history),prior=null,observations=[],result=null,busy=false,reasoning='',alternative='';
 const $=id=>root.querySelector('#'+id);
 const intro=()=>"<section class='panel stack' aria-label='Transferencia independiente de caídas bajo carga'><h3>Investigación independiente: localizá la caída</h3>"+
  "<p>Banco reservado "+GROUND_HOLDOUT_CASES[index].id+". "+esc(GROUND_HOLDOUT_CASES[index].story)+"</p>"+
  "<p class='muted small'>Fuente ideal 12 V. Patrones iniciales: 0,05 Ω en cada conductor y 2 Ω de carga. No se muestra la causa ni se usa hardware real.</p>";
 const render=()=>{
  if(!prior){
   root.innerHTML=intro()+selectors('ground-h-initial','Hipótesis inicial, sin puntuación',causes)+
    selectors('ground-h-first','Primera prueba, antes de ver datos',GROUND_PROBES)+
    "<label for='ground-h-forecast'>Pronóstico de caída de retorno (V)</label><input type='number' id='ground-h-forecast' class='field' min='0' max='12' step='any'/>"+
    "<button class='button' type='button' data-ground-h='freeze'>Congelar hipótesis, contraste y pronóstico</button>"+
    "<p id='ground-h-status' role='status' aria-live='polite'></p></section>";return;
  }
  root.innerHTML=intro()+"<p id='ground-h-frozen'><strong>Previsto:</strong> "+esc(causes.find(x=>x[0]===prior.hypothesis)[1])+
   "; primero "+esc(prior.firstProbe)+"; retorno "+fmt(prior.predictedReturnV)+" V.</p>"+
   selectors('ground-h-next','Siguiente dato virtual',GROUND_PROBES.filter(x=>!observations.includes(x[0])),Boolean(result)||observations.length===4)+
   "<button type='button' class='button alt' data-ground-h='measure' "+(result||observations.length===4?'disabled':'')+">Revelar observación</button>"+
   "<div id='ground-h-observations' role='status' aria-live='polite' class='panel stack'><strong>"+observations.length+"/4 observaciones</strong>"+
   (observations.length?"<ol>"+observations.map(p=>"<li>"+esc(groundObservation(GROUND_HOLDOUT_CASES[index].id,p))+"</li>").join('')+"</ol>":"<p>Aún no se muestran lecturas.</p>")+"</div>"+
   (result?"<div id='ground-h-result' class='result' role='status' tabindex='-1'><strong>"+result.score+"/100 · "+(result.passed?'objetivos digitales cumplidos':'revisar inferencia')+"</strong>"+
    "<p>Cálculo de retorno: "+(result.numeric?'correcto':'incorrecto')+". Causa: "+(result.causal?'compatible':'incorrecta')+
    ". Prueba discriminante: "+(result.discriminated?'correcta':'incorrecta')+". Refutación: "+(result.falsified?'correcta':'incorrecta')+".</p>"+
    "<p>Resultado del modelo: retorno "+fmt(result.expected.returnV)+" V; mecanismo "+esc(result.expected.cause)+". La hipótesis inicial fue revisada: "+(result.changed?'sí':'no')+".</p>"+
    "<p>Justificación escrita: "+esc(reasoning)+"</p><p>Alternativa: "+esc(alternative)+"</p>"+
    "<p>"+esc(result.disclaimer)+" La calidad del texto queda pendiente de revisión humana.</p></div>"+
    "<button class='button alt' type='button' data-ground-h='again'>Resolver otra variación</button>":
    "<label for='ground-h-return'>Caída de retorno inferida desde el banco (V)</label><input id='ground-h-return' class='field' type='number' step='any' min='0' max='12'/>"+
    selectors('ground-h-cause','Conclusión después de observar',causes.filter(x=>x[0]!=='unknown'))+
    selectors('ground-h-decisive','Observación más discriminante',GROUND_PROBES)+
    "<fieldset id='ground-h-falsifier' class='panel'><legend>¿Qué resultado refutaría la conclusión elegida?</legend><p>Elegí primero una causa.</p></fieldset>"+
    "<label for='ground-h-why'>Razonamiento con unidades y condiciones (mín. 25 caracteres)</label><textarea id='ground-h-why' class='field' maxlength='1200' rows='3'></textarea>"+
    "<label for='ground-h-alt'>Causa alternativa y prueba que la debilita (mín. 20 caracteres)</label><textarea id='ground-h-alt' class='field' maxlength='1200' rows='3'></textarea>"+
    "<button class='button' type='button' data-ground-h='grade' "+(observations.length!==4?'disabled':'')+">Entregar transferencia</button>")+
   "<p id='ground-h-status' role='status' aria-live='polite'></p></section>";
 };
 root.addEventListener('change',e=>{
  if(e.target.id==='ground-h-cause'&&!result){const selected=e.target.value,el=$('ground-h-falsifier');
   el.innerHTML="<legend>¿Qué resultado refutaría la conclusión elegida?</legend>"+
    (GROUND_FALSIFIERS[selected]?GROUND_FALSIFIERS[selected].options.map((s,i)=>"<label class='option'><input type='radio' name='ground-h-falsifier' value='"+i+"'>"+esc(s)+"</label>").join(''):"<p>Elegí primero una causa.</p>");
  }
 });
 root.addEventListener('click',async e=>{
  const btn=e.target.closest('[data-ground-h]');if(!btn||busy)return;
  const c=GROUND_HOLDOUT_CASES[index],action=btn.dataset.groundH;
  if(action==='freeze'&&!prior){
   if($('ground-h-forecast').value===''){$('ground-h-status').textContent='Indicá un pronóstico explícito antes de mirar datos.';return;}
   try{prior=freezeGroundPlan({caseId:c.id,hypothesis:$('ground-h-initial').value,firstProbe:$('ground-h-first').value,predictedReturnV:Number($('ground-h-forecast').value)});render();}
   catch(error){$('ground-h-status').textContent=error.message;}return;
  }
  if(action==='measure'&&prior&&!result){
   const p=$('ground-h-next').value;
   if(observations.length===0&&p!==prior.firstProbe){$('ground-h-status').textContent='Respetá primero el contraste congelado.';return;}
   if(observations.includes(p)||!GROUND_PROBES.some(x=>x[0]===p)){$('ground-h-status').textContent='Elegí otra observación.';return;}
   observations.push(p);render();return;
  }
  if(action==='grade'&&prior&&!result){
   if($('ground-h-return').value===''){$('ground-h-status').textContent='Indicá una caída de retorno numérica.';return;}
   const falsifier=root.querySelector("input[name='ground-h-falsifier']:checked");
   if(!falsifier){$('ground-h-status').textContent='Elegí una refutación posible.';return;}
   reasoning=$('ground-h-why').value.trim();alternative=$('ground-h-alt').value.trim();
   let g;try{g=gradeGroundHoldout({caseId:c.id,prior,observations,returnV:Number($('ground-h-return').value),
    cause:$('ground-h-cause').value,decisiveProbe:$('ground-h-decisive').value,falsifier:Number(falsifier.value),reasoning,alternative});}
   catch(err){$('ground-h-status').textContent=err.message;return;}
   busy=true;try{
    await record({id:GROUND_HOLDOUT_ID,at:new Date().toISOString(),score:g.score,passed:g.passed,
     hypothesis:'Retornos sintéticos '+g.expected.cause,conclusion:'Evaluación objetiva de caída '+g.score+'/100',reasoning,
     report:JSON.stringify({rubric:GROUND_HOLDOUT_ID,caseId:c.id,prior,observationsInOrder:observations,
      observations:observations.map(p=>({probe:p,value:groundObservation(c.id,p)})),grade:g,
      final:{returnV:Number($('ground-h-return').value),cause:$('ground-h-cause').value,decisiveProbe:$('ground-h-decisive').value,
       falsifier:Number(falsifier.value)},reasoning,alternative,qualitativeReview:'pending'})});
    result=g;render();$('ground-h-result')?.focus({preventScroll:true});onSaved(g);
   }catch(err){$('ground-h-status').textContent='Guardado no confirmado: '+String(err.message||err);}
   finally{busy=false;}return;
  }
  if(action==='again'&&result){index=(index+1)%GROUND_HOLDOUT_CASES.length;prior=null;observations=[];result=null;reasoning='';alternative='';render();}
 });
 render();
}
