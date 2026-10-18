import {categories,type Category} from './math.ts';
export type MonthInsight={at:Date;best:Category;needsCare:Category;bestScore:number;careScore:number;change:number;house:number;indices:Record<Category,number>};
export function annualOutlook(from:Date,read:(at:Date)=>{scores:Record<Category,number>;house:number},months=12):MonthInsight[]{
 if(!Number.isFinite(+from)||!Number.isInteger(months)||months<1||months>24)throw Error('Invalid annual reading interval');
 const res:MonthInsight[]=[];const startMonth=from.getUTCMonth(),startYear=from.getUTCFullYear();
 for(let i=0;i<months;i++){
  const at=new Date(Date.UTC(startYear,startMonth+i,15,12));
  if(at.getUTCFullYear()>2399||at.getUTCFullYear()<1800)break;
  const data=read(at),v=data.scores;
  if(!categories.every(k=>Number.isFinite(v[k])&&v[k]>=1&&v[k]<=99))throw Error('Invalid monthly symbolic score');
  const sorted=[...categories].sort((a,b)=>v[b]-v[a]||categories.indexOf(a)-categories.indexOf(b));
  const best=sorted[0],needsCare=sorted[sorted.length-1],bestScore=v[best],careScore=v[needsCare];
  res.push({at,best,needsCare,bestScore,careScore,change:res.length?bestScore-res[res.length-1].bestScore:0,house:data.house,indices:v});
 }
 return res;
}
