type City={name:string;admin:string;country:string;lat:number;lon:number;zone:string;label:string};
const headers={'Content-Type':'application/json','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'};
export const parseCities=(records:unknown):City[]=>{
 if(!Array.isArray(records))return [];
 return records.slice(0,10).flatMap(x=>{
  if(!x||typeof x.name!=='string'||!Number.isFinite(x.latitude)||!Number.isFinite(x.longitude)||!Number.isFinite(x.id)||typeof x.timezone!=='string')return [];
  const city:City={name:String(x.name).slice(0,90),admin:String(x.admin1??'').slice(0,80),country:String(x.country??'').slice(0,80),lat:x.latitude,lon:x.longitude,zone:x.timezone,label:[x.name,x.admin1,x.country].filter(Boolean).join(', ').slice(0,180)};
  if(Math.abs(city.lat)>90||Math.abs(city.lon)>180)return [];
  return [city];
 });
};
export async function onRequestGet({request}:{request:Request}){
 const url=new URL(request.url),query=(url.searchParams.get('q')??'').trim();
 if(query.length<2||query.length>80)return new Response(JSON.stringify({error:'Search for a city using 2–80 characters'}),{status:400,headers});
 const upstream='https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name:query,count:'10',language:'en',format:'json'}).toString();
 try{
  const resp=await fetch(upstream,{signal:AbortSignal.timeout(12000)});
  if(!resp.ok)return new Response(JSON.stringify({error:'Location search unavailable'}),{status:502,headers});
  const source=await resp.json() as {results?:unknown};
  return new Response(JSON.stringify({results:parseCities(source.results)}),{headers});
 }catch{return new Response(JSON.stringify({error:'Location search unavailable'}),{status:502,headers})}
}
