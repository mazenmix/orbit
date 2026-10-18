import {normalize,distance,angles,type Point} from './math.ts';
import {signSymbols,signsAr,signsEn,planet,t} from './i18n.ts';
import type {Chart} from './engine.ts';

export function horoscopeXY(lon:number,asc:number,r:number,center=210):[number,number]{
 const a=(180+normalize(lon-asc))*Math.PI/180;
 return [center+Math.cos(a)*r,center-Math.sin(a)*r];
}
/** From the left-hand ASC house 2 lies below-left; zodiac longitude increases counterclockwise. */
export function houseOrder(cusps:readonly number[]){
 return cusps.length===12&&cusps.every((lon,i)=>normalize(cusps[(i+1)%12]-lon)>0&&normalize(cusps[(i+1)%12]-lon)<180);
}
const palette=['#f59c8e','#f1c681','#a7dccd','#92bbf6','#e9b976','#a7dc9c','#d6a4f4','#f29dc1','#b8abff','#b4c9ea','#8cdbde','#a6aff8'];
const aspects:Record<number,string>={0:'#d7b1ff',60:'#7ad7e5',90:'#ed9a81',120:'#83ddb3',180:'#f18ba5'};
const escape=(x:string)=>x.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const fixed=(n:number)=>Number(n.toFixed(2));
const dms=(n:number)=>(normalize(n)%30).toFixed(1)+'°';
export type WheelLabel={id:string;longitude:number;displayAngle:number;lane:number};
/** Rotate at the largest gap and distribute labels without changing actual planet longitudes. */
export function layoutWheelLabels(points:readonly Point[],asc:number,minGap=11):WheelLabel[]{
 if(!points.length)return [];
 const sorted=points.map(p=>({p,a:normalize(p.longitude-asc)})).sort((a,b)=>a.a-b.a);
 let cut=0,max=-1;
 for(let i=0;i<sorted.length;i++){
  const space=normalize(sorted[(i+1)%sorted.length].a-sorted[i].a);
  if(space>max){max=space;cut=(i+1)%sorted.length}
 }
 const order=[...sorted.slice(cut),...sorted.slice(0,cut)],first=order[0].a,gap=Math.min(minGap,360/order.length-.1);
 const original=order.map(v=>first+normalize(v.a-first));
 const output=[original[0]];
 for(let i=1;i<order.length;i++)output[i]=Math.max(original[i],output[i-1]+gap);
 const shift=output.reduce((sum,n,i)=>sum+n-original[i],0)/order.length;
 const placements=order.map((v,i)=>({id:v.p.id,longitude:v.p.longitude,displayAngle:normalize(output[i]-shift),lane:i%2}));
 return placements.sort((a,b)=>points.findIndex(p=>p.id===a.id)-points.findIndex(p=>p.id===b.id));
}
export function wheel(chart:Chart,transit?:Chart){
 const C=440,asc=chart.asc??chart.cusps[0]??0;
 const xy=(lon:number,r:number):[number,number]=>{
  const a=(180+normalize(lon-asc))*Math.PI/180;
  return [fixed(C+Math.cos(a)*r),fixed(C-Math.sin(a)*r)];
 };
 const line=(a:number[],b:number[],color:string,width=1,opacity=1)=>'<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="'+color+'" stroke-width="'+width+'" stroke-opacity="'+opacity+'"/>';
 const ring=(r:number,color:string,width=1,opacity=1)=>'<circle cx="'+C+'" cy="'+C+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-opacity="'+opacity+'"/>';
 const txt=(lon:number,r:number,value:string,color:string,size:number,weight=600)=>{const [x,y]=xy(lon,r);return '<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'" text-anchor="middle" dominant-baseline="central" font-weight="'+weight+'">'+escape(value)+'</text>'};
 let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 880" class="chart-wheel professional-wheel" role="img" aria-label="'+escape(t('خارطة فلكية مفصلة تشمل الأبراج والكواكب والبيوت والزوايا','Professional astrological wheel with signs, planets, houses and aspects'))+'"><defs><radialGradient id="mxprofessional"><stop stop-color="#1b223b"/><stop offset=".78" stop-color="#11182a"/><stop offset="1" stop-color="#0d1122"/></radialGradient></defs>';
 svg+='<circle cx="'+C+'" cy="'+C+'" r="421" fill="url(#mxprofessional)" stroke="#a893d2" stroke-width="2.2"/>';
 for(let i=0;i<12;i++){
  const a=xy(i*30,408),b=xy((i+1)*30,408),c=xy((i+1)*30,366),d=xy(i*30,366);
  svg+='<path d="M'+a.join(' ')+' A408 408 0 0 0 '+b.join(' ')+' L'+c.join(' ')+' A366 366 0 0 1 '+d.join(' ')+' Z" fill="'+palette[i]+'" fill-opacity=".23" stroke="'+palette[i]+'" stroke-width="1"/>';
  svg+=txt(i*30+15,393,signSymbols[i],palette[i],25,800);
  svg+=txt(i*30+15,372,t(signsAr[i],signsEn[i]),'#f3e8ff',9,700);
 }
 svg+=ring(409,'#a996d1',1.1)+ring(366,'#9a8ab8',1.4)+ring(337,'#696f99',1.1)+ring(327,'#575f86',1.1);
 // One degree precision, with prominent five and ten degree graduations.
 for(let i=0;i<360;i++){
  const major=i%10===0,medium=i%5===0;
  svg+=line(xy(i,major?347:medium?353:358),xy(i,364),major?'#f0d29a':medium?'#a2a5c9':'#5c688b',major?1.25:.55,major?.96:.6);
  if(major&&i%30!==0)svg+=txt(i,342,String(i%30),'#afb7d8',8.4);
 }
 const houses=chart.cusps.length===12&&chart.cusps.every(Number.isFinite);
 if(houses){
  for(let i=0;i<12;i++){
   const start=chart.cusps[i],finish=chart.cusps[(i+1)%12],width=normalize(finish-start);
   if(width>0&&width<180){
    const a=xy(start,234),b=xy(finish,234),c=xy(finish,184),d=xy(start,184);
    svg+='<path d="M'+a.join(' ')+' A234 234 0 0 0 '+b.join(' ')+' L'+c.join(' ')+' A184 184 0 0 1 '+d.join(' ')+' Z" fill="'+palette[(i+4)%12]+'" fill-opacity="'+(i%2===0?.13:.07)+'"/>';
   }
   const axis=i%3===0;
   svg+=line(xy(start,183),xy(start,327),axis?'#f1c58f':'#69769f',axis?2.3:1,axis?.95:.78);
   const [x,y]=xy(start+width/2,211);
   svg+='<circle cx="'+x+'" cy="'+y+'" r="12.5" fill="'+(axis?'#59416a':'#222a47')+'" stroke="'+(axis?'#f7ca96':'#938cbb')+'" stroke-width="1"/>';
   svg+='<text x="'+x+'" y="'+(y+4.3)+'" fill="#fff" font-weight="850" font-size="12" text-anchor="middle">'+(i+1)+'</text>';
  }
  const marks=[{lon:chart.asc,label:'ASC',color:'#8debd7'},{lon:chart.mc,label:'MC',color:'#f7d094'},{lon:chart.asc===null?null:normalize(chart.asc+180),label:'DSC',color:'#8debd7'},{lon:chart.mc===null?null:normalize(chart.mc+180),label:'IC',color:'#f7d094'}];
  for(const mark of marks){
   if(mark.lon===null)continue;
   const [x,y]=xy(mark.lon,246);
   svg+='<rect x="'+(x-21)+'" y="'+(y-11)+'" width="42" height="21" rx="6" fill="#121b30" stroke="'+mark.color+'" stroke-width="1.4"/>';
   svg+='<text x="'+x+'" y="'+(y+3.6)+'" fill="'+mark.color+'" font-size="12" font-weight="900" text-anchor="middle">'+mark.label+'</text>';
  }
 }else svg+='<text x="'+C+'" y="664" fill="#f4c998" text-anchor="middle" font-size="13">'+escape(t('البيوت والطالع مخفيان: وقت الولادة غير معروف','Houses and ASC hidden: birth time is unknown'))+'</text>';
 svg+=ring(184,'#7e8bb5',1.5,.96)+ring(173,'#647496',.8,.66);
 // Real natal aspects inside the innermost circle.
 for(let i=0;i<chart.points.length;i++)for(let j=i+1;j<chart.points.length;j++){
  const a=chart.points[i],b=chart.points[j],sep=distance(a.longitude,b.longitude),angle=angles.find(v=>Math.abs(sep-v)<=4);
  if(angle===undefined)continue;
  const color=aspects[angle]??'#9e91c2';
  if(angle===0){const p=xy(a.longitude,166);svg+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4" fill="'+color+'"/>';continue}
  svg+=line(xy(a.longitude,164),xy(b.longitude,164),color,angle===90||angle===180?1.6:1.2,.72);
 }
 svg+=ring(163,'#7480a8',.9,.6);
 // Label routing uses displacement lines but never changes the actual longitude.
 const positioned=layoutWheelLabels(chart.points,asc,12);
 for(const label of positioned){
  const p=chart.points.find(v=>v.id===label.id)!;
  const onRing=xy(p.longitude,326),bend=xy(asc+label.displayAngle,315),[x,y]=xy(asc+label.displayAngle,label.lane?277:297);
  svg+=line(xy(p.longitude,335),onRing,'#d9c3ff',1.2,.84);
  svg+='<path d="M'+onRing.join(' ')+' L'+bend.join(' ')+' L'+x+' '+y+'" fill="none" stroke="#8996be" stroke-width=".9" stroke-opacity=".75"/>';
  const right=x>=C,tx=right?x+22:x-22,anchor=right?'start':'end';
  const full=escape(planet(p.id)+' '+dms(p.longitude)+' '+t(signsAr[Math.floor(normalize(p.longitude)/30)],signsEn[Math.floor(normalize(p.longitude)/30)])+(p.speed<0?' Rx':''));
  svg+='<g class="wheel-planet" data-planet="'+escape(p.id)+'"><title>'+full+'</title><circle cx="'+x+'" cy="'+y+'" r="16" fill="#162137" stroke="'+(p.speed<0?'#f6bf89':'#b6a6e8')+'" stroke-width="1.25"/>';
  svg+='<text x="'+x+'" y="'+(y+5.8)+'" fill="'+(p.speed<0?'#ffcc9c':'#efe7ff')+'" font-size="21" text-anchor="middle" font-weight="850">'+escape(p.symbol)+'</text>';
  svg+='<text x="'+tx+'" y="'+(y-2)+'" text-anchor="'+anchor+'" fill="#eee9fb" font-size="10.5" font-weight="800">'+escape(p.id)+'</text>';
  svg+='<text x="'+tx+'" y="'+(y+11)+'" text-anchor="'+anchor+'" fill="'+(p.speed<0?'#fbc390':'#9fe1db')+'" font-size="9.5" font-weight="650">'+dms(p.longitude)+(p.speed<0?' Rx':'')+'</text></g>';
 }
 if(transit){
  svg+=ring(330,'#69e9d8',1.9,.87);
  for(const p of transit.points){
   const [x,y]=xy(p.longitude,330);
   svg+='<g data-transit="'+escape(p.id)+'"><title>'+escape(planet(p.id)+' '+dms(p.longitude))+'</title><circle cx="'+x+'" cy="'+y+'" r="7.5" fill="#11323b" stroke="#81f3e1" stroke-width="1.3"/>';
   svg+='<text x="'+x+'" y="'+(y+3.6)+'" font-size="10" text-anchor="middle" fill="#c0fff3">'+escape(p.symbol)+'</text></g>';
  }
 }
 svg+='<circle cx="'+C+'" cy="'+C+'" r="47" fill="#0d172a" stroke="#987bcb" stroke-width="1.7"/>';
 svg+='<circle cx="'+C+'" cy="'+C+'" r="38" fill="none" stroke="#eac78c" stroke-opacity=".62"/>';
 svg+='<text x="'+C+'" y="'+(C-2)+'" font-size="25" fill="#f3e1ff" font-weight="900" text-anchor="middle">MX</text>';
 svg+='<text x="'+C+'" y="'+(C+16)+'" font-size="10" fill="#8ce3d0" letter-spacing="2.4" font-weight="800" text-anchor="middle">ASTRO</text>';
 return svg+'</svg>';
}
