import {categories,type Category} from './math.ts';
export type HeatCell={instant:Date;indices:Record<Category,number>;average:number};
export function calculateHeatmap(at:Date,days:number,read:(at:Date)=>Record<Category,number>):HeatCell[]{
 if(!Number.isFinite(+at)||!Number.isInteger(days)||days<1||days>62)throw Error('Invalid heatmap range');
 return Array.from({length:days},(_,i)=>{
  const instant=new Date(+at+i*86400000);
  const indices=read(instant);
  if(!categories.every(c=>Number.isFinite(indices[c])&&indices[c]>=1&&indices[c]<=99))throw Error('Invalid symbolic indices');
  const average=Math.round(categories.reduce((a,c)=>a+indices[c],0)/categories.length);
  return {instant,indices,average};
 });
}
export function heatSummary(cells:readonly HeatCell[],key:Category|'average'){
 if(!cells.length)throw Error('Empty heatmap');
 const get=(c:HeatCell)=>key==='average'?c.average:c.indices[key];
 const sorted=[...cells].sort((a,b)=>get(b)-get(a)||(+a.instant)-(+b.instant));
 return {highest:sorted[0],lowest:sorted[sorted.length-1],mean:Math.round(cells.reduce((sum,c)=>sum+get(c),0)/cells.length)};
}
