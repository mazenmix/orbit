import type {Category} from './math.ts';
import type {MetricResult} from './metrics.ts';
import {gaugeLevel} from './peopleInsights.ts';
import {t} from './i18n.ts';
import {goLifeGauges,travelActivity,travelChecks,travelCompletion} from './lifeGauges.ts';

const escapeHTML=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

/** A separate group: the original 29 calculated indicators are unchanged. */
export function renderGoLifeGauges(scores:Record<Category,number>,supportedCategories:readonly Category[]=[]):string{
 const gauges=goLifeGauges(scores),supported=new Set(supportedCategories);
 return '<section class="panel mx-go-life"><div class="section-title"><h2>'+t('قرارات الحياة اليومية','Daily decision lenses')+'</h2></div>'+
  '<div class="metrics-grid mx-go-life-grid">'+gauges.map(m=>{
   const label=t(m.name.ar,m.name.en),advice=t(m.advice.ar,m.advice.en);
   const present=m.source.filter(part=>supported.has(part.category));
   const weight=present.reduce((sum,part)=>sum+part.weight,0);
   // Renormalize only real, supported source scores: never blend default 50s.
   const value=weight>0?Math.round(present.reduce((sum,part)=>sum+scores[part.category]*part.weight,0)/weight):null;
   const available=value!==null,complete=present.length===m.source.length;
   const coverage=complete?'':available?t('قراءة جزئية','Partial reading')+' '+present.length+'/'+m.source.length:t('لا يوجد اتصال قريب محسوب','No close calculated aspect');
   return '<article class="metric-card mx-go-life-card '+(available?gaugeLevel(value):'mx-unavailable')+'" data-life-gauge="'+m.id+'">'+
    '<small>'+escapeHTML(label)+'</small><b>'+(available?value:t('لا اتصال','No aspect'))+(available?'<em>/100</em>':'')+'</b>'+
    (available?'<div class="meter" role="progressbar" aria-label="'+escapeHTML(label)+'" aria-valuemin="1" aria-valuemax="99" aria-valuenow="'+value+'"><i style="width:'+value+'%"></i></div>':
     '<div class="meter" aria-label="'+t('بيانات شخصية غير كافية','Insufficient personal evidence')+'"><i style="width:0%"></i></div>')+
    (coverage?'<small class="mx-metric-coverage">'+escapeHTML(coverage)+'</small>':'')+
    '<p>'+escapeHTML(available?advice:t('ماكو زاوية شخصية قريبة بهذا المجال للوقت المختار.','No close natal aspect was calculated in this area for the selected time.'))+'</p></article>';
  }).join('')+'</div></section>';
}

/** Read only explicit checklist confirmations. No invented live weather/safety values. */
function readChecklist(key:string):Record<string,number[]>{
 try{
  const input=JSON.parse(localStorage.getItem(key)??'{}') as Record<string,unknown>;
  if(!input||typeof input!=='object'||Array.isArray(input))return {};
  const result:Record<string,number[]>={};
  for(const group of travelChecks){
   const indices=input[group.id];
   result[group.id]=Array.isArray(indices)?indices.filter((n):n is number=>Number.isInteger(n)&&n>=0&&n<group.items.length):[];
  }
  return result;
 }catch{return {}}
}
export function renderTravelPractical(metrics:readonly MetricResult[],key:string):string{
 const state=readChecklist(key);
 const cards=travelChecks.map(group=>{
  const completed=state[group.id]??[],score=travelCompletion(group.items.map((_,i)=>completed.includes(i)),group.items.length),title=t(group.name.ar,group.name.en);
  return '<article class="metric-card mx-travel-practical '+gaugeLevel(score)+'" data-practical-gauge="'+group.id+'">'+
   '<small>'+escapeHTML(title)+'</small><b data-travel-progress>'+score+'<em>/100</em></b>'+
   '<div class="meter" role="progressbar" aria-label="'+escapeHTML(title)+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+score+'"><i style="width:'+score+'%"></i></div>'+
   '<div class="mx-travel-check-items">'+group.items.map((item,i)=>'<label><input type="checkbox" data-travel-check="'+group.id+'" data-travel-index="'+i+'" '+(completed.includes(i)?'checked':'')+'/><span>'+escapeHTML(t(item.ar,item.en))+'</span></label>').join('')+'</div>'+
   '<p class="mx-travel-check-count" data-travel-count>'+completed.length+'/'+group.items.length+' '+t('تم التحقق','checked')+'</p></article>';
 }).join('');
 const hint=travelActivity(metrics),title=t('أفضل نشاط الآن','Activity to consider'),value=hint.value;
 const activity='<article class="metric-card mx-travel-practical mx-travel-activity '+gaugeLevel(value)+'" data-travel-activity="'+hint.id+'"><small>'+title+' · '+t('رمزي','symbolic')+'</small><b>'+value+'<em>/100</em></b><div class="meter" role="progressbar" aria-label="'+title+'" aria-valuemin="1" aria-valuemax="99" aria-valuenow="'+value+'"><i style="width:'+value+'%"></i></div><strong>'+escapeHTML(t(hint.name.ar,hint.name.en))+'</strong><p>'+escapeHTML(t(hint.advice.ar,hint.advice.en))+'</p></article>';
 return '<section class="panel mx-travel-practical-section"><div class="section-title"><h2>'+t('الجاهزية العملية','Practical readiness')+'</h2><small>'+t('نسبة التحقق من قائمتك؛ لا تمثل قياساً مباشراً للطقس أو الأمان','Percent of your verified checklist, not real-time weather or safety ratings')+'</small></div>'+
  '<div class="mx-travel-practical-grid">'+cards+activity+'</div></section>';
}
export function bindTravelPractical(root:HTMLElement,key:string):void{
 root.querySelectorAll<HTMLInputElement>('[data-travel-check]').forEach(box=>box.onchange=()=>{
  const id=box.dataset.travelCheck,index=Number(box.dataset.travelIndex),group=travelChecks.find(c=>c.id===id);
  if(!group||!Number.isInteger(index)||index<0||index>=group.items.length)return;
  const state=readChecklist(key),set=new Set(state[group.id]??[]);
  if(box.checked)set.add(index);else set.delete(index);
  state[group.id]=[...set].sort((a,b)=>a-b);
  try{localStorage.setItem(key,JSON.stringify(state))}catch{/* Session still updates. */}
  const card=box.closest<HTMLElement>('[data-practical-gauge]');if(!card)return;
  const score=travelCompletion(group.items.map((_,i)=>set.has(i)),group.items.length);
  card.classList.remove('low','caution','steady','strong');card.classList.add(gaugeLevel(score));
  const num=card.querySelector<HTMLElement>('[data-travel-progress]');if(num)num.innerHTML=score+'<em>/100</em>';
  const meter=card.querySelector<HTMLElement>('[role="progressbar"]');if(meter){meter.setAttribute('aria-valuenow',String(score));const bar=meter.querySelector<HTMLElement>('i');if(bar)bar.style.width=score+'%'}
  const count=card.querySelector<HTMLElement>('[data-travel-count]');if(count)count.textContent=set.size+'/'+group.items.length+' '+t('تم التحقق','checked');
 });
}
