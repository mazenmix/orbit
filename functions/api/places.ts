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
async function photonPlaces(query:string):Promise<City[]>{
 const api='https://photon.komoot.io/api/?'+new URLSearchParams({q:query,limit:'5'}).toString();
 const res=await fetch(api,{signal:AbortSignal.timeout(8000)});
 if(!res.ok)return [];
 const body=await res.json() as {features?:unknown};
 if(!Array.isArray(body.features))return [];
 const features=body.features.slice(0,5).filter((item:any)=>item&&Array.isArray(item.geometry?.coordinates)&&typeof item.properties?.name==='string');
 const locations=await Promise.all(features.map(async(item:any)=>{
  const lon=Number(item.geometry.coordinates[0]),lat=Number(item.geometry.coordinates[1]);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;
  try{
   // Geographic timezone comes from forecast metadata, not the web browser.
   const tzURL='https://api.open-meteo.com/v1/forecast?'+new URLSearchParams({latitude:String(lat),longitude:String(lon),timezone:'auto',forecast_days:'1',daily:'sunrise'});
   const response=await fetch(tzURL,{signal:AbortSignal.timeout(7000)});
   if(!response.ok)return null;
   const data=await response.json() as {timezone?:string};
   if(typeof data.timezone!=='string'||data.timezone.length>80)return null;
   const prop=item.properties,name=String(prop.name).slice(0,90),admin=String(prop.state??prop.city??prop.county??'').slice(0,80),country=String(prop.country??'').slice(0,80);
   return {name,admin,country,lat,lon,zone:data.timezone,label:[name,admin,country].filter(Boolean).join(', ').slice(0,180)};
  }catch{return null}
 }));
 return locations.filter((city):city is City=>!!city);
}

export async function onRequestGet({request}:{request:Request}){
 const url=new URL(request.url),query=(url.searchParams.get('q')??'').trim();
 if(query.length<2||query.length>80)return new Response(JSON.stringify({error:'Search for a city using 2–80 characters'}),{status:400,headers});
 const upstream='https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name:query,count:'10',language:'en',format:'json'}).toString();
 try{
  const resp=await fetch(upstream,{signal:AbortSignal.timeout(12000)});
  let cities:City[]=[];
  if(resp.ok){
   const source=await resp.json() as {results?:unknown};
   cities=parseCities(source.results);
  }
  // Open-Meteo covers named towns worldwide. Photon/OSM additionally covers
  // Arabic-script place names, provinces, villages and specific landmarks.
  if(cities.length===0||url.searchParams.get('detailed')==='1'){
   try{
    const more=await photonPlaces(query);
    const seen=new Set(cities.map(c=>c.name.toLowerCase()+'/'+c.country.toLowerCase()));
    for(const entry of more){
     const key=entry.name.toLowerCase()+'/'+entry.country.toLowerCase();
     if(!seen.has(key)){cities.push(entry);seen.add(key)}
    }
   }catch{}
  }
  return new Response(JSON.stringify({results:cities.slice(0,12)}),{headers});
 }catch{
  try{return new Response(JSON.stringify({results:await photonPlaces(query)}),{headers})}
  catch{return new Response(JSON.stringify({error:'Location search unavailable'}),{status:502,headers})}
 }
}
