import {categories,type Category} from './math.ts';
export type HeatmapReading={scores:Record<Category,number>;signals:readonly {category:Category}[]};
export type HeatCell={instant:Date;indices:Record<Category,number|null>;average:number|null;coverage:{present:number;total:number;missing:Category[]}};
/** A report's default 50 is not evidence. Keep unavailable domains null and
 * average only domains with a calculated signal, retaining their coverage. */
function heatCell(instant:Date,reading:HeatmapReading):HeatCell{
 if(!reading||!reading.scores||!Array.isArray(reading.signals))throw Error('Missing heatmap evidence coverage');
 const supported=new Set(reading.signals.map(s=>s.category));
 if([...supported].some(c=>!categories.includes(c)))throw Error('Invalid heatmap evidence category');
 const indices=Object.fromEntries(categories.map(category=>{
  if(!supported.has(category))return [category,null];
  const value=reading.scores[category];
  if(!Number.isFinite(value)||value<1||value>99)throw Error('Invalid observed symbolic index');
  return [category,value];
 })) as Record<Category,number|null>;
 const observed=categories.flatMap(category=>indices[category]===null?[]:[indices[category]!]);
 const missing=categories.filter(category=>indices[category]===null);
 return {instant,indices,average:observed.length?Math.round(observed.reduce((sum,value)=>sum+value,0)/observed.length):null,
  coverage:{present:observed.length,total:categories.length,missing}};
}
export function calculateHeatmap(at:Date,days:number,read:(at:Date)=>HeatmapReading):HeatCell[]{
 if(!Number.isFinite(+at)||!Number.isInteger(days)||days<1||days>62)throw Error('Invalid heatmap range');
 return Array.from({length:days},(_,i)=>{
  const instant=new Date(+at+i*86400000);
  return heatCell(instant,read(instant));
 });
}
export function heatSummary(cells:readonly HeatCell[],key:Category|'average'){
 if(!cells.length)throw Error('Empty heatmap');
 const get=(c:HeatCell)=>key==='average'?c.average:c.indices[key];
 const observed=cells.filter(cell=>get(cell)!==null);
 const sorted=[...observed].sort((a,b)=>get(b)!-get(a)!||(+a.instant)-(+b.instant));
 return {highest:sorted[0]??null,lowest:sorted[sorted.length-1]??null,
  mean:observed.length?Math.round(observed.reduce((sum,c)=>sum+get(c)!,0)/observed.length):null,
  considered:observed.length,total:cells.length};
}

/** Real ephemeris samples every 3 days over 90 days, or every 7 days over a year.
 * Does not imply that un-sampled dates were measured or predict future events.
 */
export function sampledHeatmap(at:Date,spanDays:90|365,read:(at:Date)=>HeatmapReading):HeatCell[]{
 if(!Number.isFinite(+at))throw Error('Invalid heatmap date');
 const step=spanDays===90?3:7,items:HeatCell[]=[];
 for(let d=0;d<spanDays;d+=step){
  const instant=new Date(+at+d*86400000);
  items.push(heatCell(instant,read(instant)));
 }
 return items;
}
