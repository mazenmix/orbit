import {soulDeep1} from './soulDeep1.ts';
import {soulDeep2} from './soulDeep2.ts';
import {soulTopics} from './soulData.ts';
const deepGroups=[...soulDeep1,...soulDeep2];
if(deepGroups.length!==25||deepGroups.some(g=>g.length!==8))throw Error('Incomplete Soul deep analysis 25 x 8');
export const soulDeep:readonly {id:number;ar:string;en:string}[]=deepGroups.flatMap((g,i)=>g.map((pair,j)=>{
 if(pair.length!==2||pair.some(v=>typeof v!=='string'||v.trim().length<35))throw Error('Unwritten deep interpretation '+(i*8+j+1));
 return {id:i*8+j+1,ar:pair[0],en:pair[1]};
}));
if(soulDeep.length!==soulTopics.length||soulDeep.some((x,i)=>x.id!==soulTopics[i].id))throw Error('Deep analysis and topic catalogue mismatch');
export function soulDeepFor(id:number){const x=soulDeep[id-1];if(!x||x.id!==id)throw Error('Missing topic-specific deep interpretation');return x}
