/** Keep the dashboard concise: avoid repeating the headline or the same advice across cards.
 * This changes presentation only. Every calculated contact remains available in Signals/Evidence.
 */
export function distinctHighlights<T>(
 items:readonly T[],
 project:(item:T)=>{title:string;action:string},
 limit=3,
 skip=0
):Array<{item:T;index:number}>{
 const result:Array<{item:T;index:number}>=[];
 const titles=new Set<string>(),actions=new Set<string>();
 const normalize=(s:string)=>s.normalize('NFKC').toLocaleLowerCase().replace(/[\\s\\p{P}\\p{S}]+/gu,'');
 for(let index=0;index<items.length;index++){
  const item=items[index],v=project(item),title=normalize(v.title),action=normalize(v.action);
  if(!title||!action||titles.has(title)||actions.has(action))continue;
  titles.add(title);actions.add(action);
  if(index<skip)continue;
  result.push({item,index});if(result.length>=limit)break;
 }
 return result;
}
