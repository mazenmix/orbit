import type {LunarWindow} from './timing.ts';
export type EyeSettings={enabled:boolean;moon:boolean;hourly:boolean;daily:boolean};
export type EyeClock={date:string;hour:number;minute:number};
export type EyeEvent={id:string;ar:string;en:string;at:Date};
export const defaultEyeSettings:EyeSettings={enabled:false,moon:true,hourly:false,daily:false};
const storageKey='mx.orbit.eye.v1';
export function loadEyeSettings():EyeSettings{
 try{const s=JSON.parse(localStorage.getItem(storageKey)??'null');if(!s||typeof s!=='object')return {...defaultEyeSettings};
  return {enabled:s.enabled===true,moon:s.moon!==false,hourly:s.hourly===true,daily:s.daily===true};
 }catch{return {...defaultEyeSettings}}
}
export function saveEyeSettings(value:EyeSettings){localStorage.setItem(storageKey,JSON.stringify(value))}
export function dueEyeEvents(now:Date,clock:EyeClock,moon:LunarWindow|null,settings:EyeSettings):EyeEvent[]{
 if(!settings.enabled||!Number.isFinite(+now))return [];
 const result:EyeEvent[]=[];
 if(settings.hourly&&clock.minute<5)result.push({id:'hour:'+clock.date+':'+clock.hour,ar:'MX Eye · مراجعة الساعة الجديدة',en:'MX Eye · New hour check-in',at:now});
 if(settings.daily&&clock.hour===8&&clock.minute<5)result.push({id:'day:'+clock.date,ar:'MX Eye · مراجعة اليوم',en:'MX Eye · Daily review',at:now});
 if(settings.moon&&moon){
  for(const [key,date,ar,en] of [
   ['voc',moon.vocStartsAt,'القمر يدخل فترة خلو المسار','Moon begins void-of-course'],
   ['ingress',moon.ingressAt,'القمر يدخل برجاً جديداً','Moon enters a new sign']
  ] as const){
   if(+date>=+now&&+date-+now<=15*60000)result.push({id:key+':'+date.toISOString(),ar:'MX Eye · '+ar,en:'MX Eye · '+en,at:date});
  }
 }
 return result;
}
