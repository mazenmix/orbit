import {soulThemesData1} from './soulThemesData1.ts';
import {soulThemesData2} from './soulThemesData2.ts';
import {soulTopics} from './soulData.ts';
export type SoulTheme={id:number;focusAr:string;focusEn:string;actionAr:string;actionEn:string};
const corpus=[...soulThemesData1,...soulThemesData2];
if(corpus.length!==25||corpus.some(g=>g.length!==8))throw Error('Soul DNA topic corpus must be 25 × 8.');
export const soulThemes:readonly SoulTheme[]=corpus.flatMap((group,i)=>group.map((values,j)=>{
 if(values.length!==4||values.some(v=>typeof v!=='string'||v.trim().length<25))throw Error('Incomplete thematic topic: '+(i*8+j+1));
 return {id:i*8+j+1,focusAr:values[0],focusEn:values[1],actionAr:values[2],actionEn:values[3]};
}));
if(soulThemes.length!==soulTopics.length||soulThemes.some((t,i)=>t.id!==soulTopics[i].id))throw Error('Soul topics and authored themes are out of sync.');
export const getSoulTheme=(topicId:number):SoulTheme=>{
 const result=soulThemes[topicId-1];if(!result||result.id!==topicId)throw Error('Unknown Soul DNA topic');
 return result;
};
