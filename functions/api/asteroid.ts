import {namedAsteroids,asteroidSourcePath} from '../../src/asteroids.ts';
/** Allowlist Swiss SE1 asset download to 56 source-backed MPC numbers. */
const allowed=new Set(namedAsteroids.map(a=>a.number));
const json=(error:string,status:number)=>new Response(JSON.stringify({error}),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function onRequestGet({request}:{request:Request}):Promise<Response>{
 const url=new URL(request.url),value=url.searchParams.get('number');
 if(!value||!/^[1-9][0-9]{0,5}$/.test(value))return json('Valid numbered asteroid required',400);
 const number=Number(value);
 if(!allowed.has(number))return json('Asteroid not on verified MX Eye catalogue',404);
 const path=asteroidSourcePath(number);
 const remote='https://ephe.scryr.io/ephe/'+path;
 try{
  const response=await fetch(remote,{signal:AbortSignal.timeout(14000),headers:{Accept:'application/octet-stream'}});
  if(!response.ok)return json('Ephemeris file unavailable upstream',502);
  const size=Number(response.headers.get('content-length')??0);
  if(size>2_000_000)return json('Ephemeris file exceeds safe download limit',502);
  const data=await response.arrayBuffer();
  if(data.byteLength<1000||data.byteLength>2_000_000)return json('Invalid ephemeris file size',502);
  if(url.searchParams.get('probe')==='1')return new Response(JSON.stringify({available:true,body:number,bytes:data.byteLength,path}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  return new Response(data,{status:200,headers:{'Content-Type':'application/octet-stream','Content-Disposition':'inline; filename="'+path.split('/').pop()+'"','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff','X-Ephemeris-Body':String(number)}});
 }catch{return json('Ephemeris upstream unreachable',502)}
}
