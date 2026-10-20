import type {MetricName,MetricResult} from './metrics.ts';

/** The twelve indicators chosen for travel in the Philippines.
 * Order and groupings are editorial priorities, not separate observations.
 * Values are read exclusively from the existing derivedMetrics calculator.
 */
export type TravelMetricGroup={
 id:'social'|'night'|'movement';
 titleAr:string;titleEn:string;descriptionAr:string;descriptionEn:string;
 ids:readonly MetricName[];
};
export const travelMetricGroups:readonly TravelMetricGroup[]=[
 {
  id:'social',titleAr:'التعارف والمواعيد',titleEn:'Meeting people & dating',
  descriptionAr:'راجعها قبل ما تبادر بالتعارف أو ترتب موعداً. خلي تجاوب الشخص الحقيقي وراحته أساس قرارك.',
  descriptionEn:'Review before meeting someone or planning a date. Their real interest and comfort matter most.',
  ids:['dating','newpeople','social','attraction','romance','chemistry']
 },
 {
  id:'night',titleAr:'الجنس والسهر',titleEn:'Intimacy & nightlife',
  descriptionAr:'مؤشرات رمزية للسهر والقرب. ما تقيس رغبة الطرف الثاني أو موافقته.',
  descriptionEn:'Symbolic prompts for nights out and intimacy, never a measure of another person’s desire or consent.',
  ids:['sexuality','desire','nightlife']
 },
 {
  id:'movement',titleAr:'التنقل والراحة والحذر',titleEn:'Getting around, rest & caution',
  descriptionAr:'قبل السفر بين المدن أو الرجعة المتأخرة، راجع خطط النقل وأمان المكان وراحتك الحقيقية.',
  descriptionEn:'Before city transfers or late returns, check real transport, neighborhood safety and your rest.',
  ids:['travel','risk','sleep']
 }
] as const;

export type TravelMetricRow={id:MetricName;metric:MetricResult};
export function travelMetricsByGroup(metrics:readonly MetricResult[]){
 const byId=new Map(metrics.map(m=>[m.id,m]));
 const all=new Set<MetricName>();
 return travelMetricGroups.map(group=>({
  ...group,
  rows:group.ids.map(id=>{
   if(all.has(id))throw new Error('Repeated Travel Mode indicator '+id);
   all.add(id);
   const metric=byId.get(id);
   if(!metric)throw new Error('Missing calculated Travel Mode indicator '+id);
   if(!Number.isFinite(metric.value)||metric.value<1||metric.value>99)throw new Error('Invalid Travel Mode index '+id);
   return {id,metric};
  })
 }));
}
