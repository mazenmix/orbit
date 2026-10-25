import {normalize,type Point} from './math.ts';
import type {Chart} from './engine.ts';

/** These are NOT numbered asteroids. Mean and true nodes use different Swiss
 * definitions, and the south nodes are the exact opposite derived points.
 * Chart angles require reliable birth time and a valid Placidus solution.
 */
export const NODE_DEFINITIONS=[
 {swissId:10,north:'MeanNorthNode',south:'MeanSouthNode'},
 {swissId:11,north:'TrueNorthNode',south:'TrueSouthNode'}
] as const;
export type AuxiliaryPoint=Point&{source:'swiss-mean-node'|'swiss-true-node'|'opposite-derived'|'placidus-derived'};
export type AuxiliaryResult={points:AuxiliaryPoint[];missing:string[]};
const make=(id:string,longitude:number,speed:number,symbol:string,source:AuxiliaryPoint['source']):AuxiliaryPoint=>{
 if(!Number.isFinite(longitude)||!Number.isFinite(speed))throw Error('Invalid auxiliary position: '+id);
 return {id,symbol,longitude:normalize(longitude),speed,source};
};
export function auxiliaryNodes(read:(id:number)=>ArrayLike<number>|null):AuxiliaryResult{
 const points:AuxiliaryPoint[]=[],missing:string[]=[];
 for(const definition of NODE_DEFINITIONS){
  try{
   const values=read(definition.swissId);
   if(!values||values.length<4)throw Error('Ephemeris unavailable');
   const source=definition.swissId===10?'swiss-mean-node':'swiss-true-node';
   const north=make(definition.north,values[0],values[3],'☊',source);
   points.push(north,make(definition.south,north.longitude+180,north.speed,'☋','opposite-derived'));
  }catch{missing.push(definition.north,definition.south)}
 }
 return {points,missing};
}
export function natalDerivedAngles(chart:Chart,knownBirthTime:boolean):AuxiliaryResult{
 if(!knownBirthTime||chart.cusps.length!==12||
    chart.cusps.some(x=>!Number.isFinite(x)))
  return {points:[],missing:['Descendant','IC','Vertex']};
 const points:AuxiliaryPoint[]=[],missing:string[]=[];
 if(chart.asc===null||!Number.isFinite(chart.asc))missing.push('Descendant');
 else points.push(make('Descendant',chart.asc+180,0,'DSC','placidus-derived'));
 if(chart.mc===null||!Number.isFinite(chart.mc))missing.push('IC');
 else points.push(make('IC',chart.mc+180,0,'IC','placidus-derived'));
 if(chart.vertex===undefined||chart.vertex===null||!Number.isFinite(chart.vertex))missing.push('Vertex');
 else points.push(make('Vertex',chart.vertex,0,'Vx','placidus-derived'));
 return {points,missing};
}

/** Human label without conflating Mean Node, True Node or asteroid Lilith. */
const labels:Readonly<Record<string,readonly [string,string]>>={
 MeanNorthNode:['العقدة الشمالية المتوسطة','Mean North Node'],
 MeanSouthNode:['العقدة الجنوبية المتوسطة','Mean South Node'],
 TrueNorthNode:['العقدة الشمالية الحقيقية','True North Node'],
 TrueSouthNode:['العقدة الجنوبية الحقيقية','True South Node'],
 Descendant:['الغارب','Descendant'],
 IC:['وتد الأرض','Imum Coeli'],
 Vertex:['نقطة الفيرتكس','Vertex']
};
export function auxiliaryName(id:string,arabic:boolean):string{
 const pair=labels[id];return pair?pair[arabic?0:1]:id;
}
