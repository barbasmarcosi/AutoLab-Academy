/** MC module family exams: explicit question subsets tied to progressive stage goals. */
export const mechanicsExamStages=Object.freeze([
 Object.freeze({id:'mechanics',label:'MC00–MC01 · Seguridad y metrología',modules:['mc00','mc01']}),
 Object.freeze({id:'engine-core',label:'MC02–MC05 · Motores y termodinámica',modules:['mc02','mc03','mc04','mc05']}),
 Object.freeze({id:'chassis-core',label:'MC06–MC09 · Tren motriz y chasis',modules:['mc06','mc07','mc08','mc09']}),
 Object.freeze({id:'control-core',label:'MC10–MC12 · Electrónica y vehículos híbridos',modules:['mc10','mc11','mc12']}),
 Object.freeze({id:'research-core',label:'MC13–MC14 · Diagnóstico y diseño experimental',modules:['mc13','mc14']})
]);
export function mechanicsStageQuestions(questions,id){
 const stage=mechanicsExamStages.find(x=>x.id===id);
 if(!stage)throw RangeError('Etapa MC desconocida');
 return questions.filter(q=>q.topic==='motor'&&stage.modules.some(m=>q.id.startsWith(m+'-')||q.id.startsWith(m+'sys-')));
}
