import {asteroidSourcePath,namedAsteroids,type NamedAsteroid} from './asteroids.ts';
import type {Point} from './math.ts';
/** Mount user-requested SE1 files into the exact Emscripten Swiss ephemeris FS.
 * Never invent missing bodies, interpolate unavailable binary data, or redownload
 * a file already mounted in the current session.
 */
export type AsteroidSwiss={
 SweModule:{FS_createPath?:(base:string,name:string,canRead:boolean,canWrite:boolean)=>void;
 FS_createDataFile?:(parent:string,name:string,data:Uint8Array,canRead:boolean,canWrite:boolean,canOwn:boolean)=>void};
 set_ephe_path:(path:string)=>unknown;
 calc_ut:(jd:number,id:number,flags:number)=>Float64Array|null;
 getLastError?:()=>string;
};
export type LoadProgress={ready:number;total:number;failed:number;current:string};
export type LoadResult={ready:number;failed:{name:string;reason:string}[]};
const mounted=new Set<number>();
export function mountedAsteroidCount(){return mounted.size}
export function isAsteroidMounted(number:number){return mounted.has(number)}
export function mountAsteroid(swe:AsteroidSwiss,number:number,data:Uint8Array){
 const entry=namedAsteroids.find(a=>a.number===number);
 if(!entry)throw Error('Asteroid is not on the MX Eye catalogue');
 if(data.byteLength<1000||data.byteLength>2_000_000)throw Error('Invalid Swiss ephemeris file size');
 const fs=swe.SweModule;
 if(typeof fs.FS_createPath!=='function'||typeof fs.FS_createDataFile!=='function')throw Error('WASM filesystem functions unavailable');
 const source=asteroidSourcePath(number),[directory,file]=source.split('/');
 fs.FS_createPath('/sweph',directory,true,true);
 fs.FS_createDataFile('/sweph/'+directory,file,data,true,true,true);
 swe.set_ephe_path('/sweph');
 mounted.add(number);
}
async function cachedFetch(body:NamedAsteroid,signal?:AbortSignal){
 const url='/api/asteroid?number='+body.number;
 let cache:Cache|null=null;
 if(typeof caches!=='undefined')try{cache=await caches.open('mx-asteroid-se1-v1')}catch{}
 let response:Response|undefined;
 if(cache)try{response=await cache.match(url)??undefined}catch{}
 if(!response){
  response=await fetch(url,{signal,headers:{Accept:'application/octet-stream'}});
  if(!response.ok)throw Error('Ephemeris download returned HTTP '+response.status);
  if(!response.headers.get('content-type')?.includes('application/octet-stream'))throw Error('Not a binary ephemeris file');
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(bytes.byteLength<1000||bytes.byteLength>2_000_000)throw Error('Invalid ephemeris file length');
  if(cache)try{await cache.put(url,new Response(bytes,{headers:{'Content-Type':'application/octet-stream'}}))}catch{}
  return bytes;
 }
 const data=new Uint8Array(await response.arrayBuffer());
 if(data.byteLength<1000||data.byteLength>2_000_000)throw Error('Invalid cached ephemeris');
 return data;
}
export async function loadNamedAsteroids(swe:AsteroidSwiss,onProgress?:(progress:LoadProgress)=>void,signal?:AbortSignal):Promise<LoadResult>{
 let ready=mounted.size,failed:{name:string;reason:string}[]=[];
 const pending=namedAsteroids.filter(a=>!mounted.has(a.number));let cursor=0;
 async function worker(){
  while(cursor<pending.length){
   if(signal?.aborted)throw new Error('Loading cancelled');
   const item=pending[cursor++];
   try{
    const bytes=await cachedFetch(item,signal);
    mountAsteroid(swe,item.number,bytes);
    // Distinguish binary-file existence from actual position availability:
    // test a representative epoch well inside the file's stated coverage.
    const value=swe.calc_ut(2451545,item.swissBodyId,2|256);
    if(!value||!Number.isFinite(value[0])||!Number.isFinite(value[3]))throw Error('Swiss failed to calculate a valid position');
    ready++;
   }catch(e){
    mounted.delete(item.number);
    failed.push({name:item.name,reason:String(e)});
   }
   onProgress?.({ready,total:namedAsteroids.length,failed:failed.length,current:item.name});
  }
 }
 await Promise.all(Array.from({length:Math.min(4,pending.length)},()=>worker()));
 return {ready,failed};
}
export function namedAsteroidPositions(swe:AsteroidSwiss,at:Date):Point[]{
 if(!Number.isFinite(+at))throw Error('Invalid chart instant');
 const jd=+at/86400000+2440587.5;
 const positions:Point[]=[];
 for(const asteroid of namedAsteroids){
  if(!mounted.has(asteroid.number))continue;
  try{
   const result=swe.calc_ut(jd,asteroid.swissBodyId,2|256);
   if(result&&Number.isFinite(result[0])&&Number.isFinite(result[3]))
    positions.push({id:asteroid.name,symbol:'✧',longitude:((result[0]%360)+360)%360,speed:result[3]});
  }catch{}
 }
 return positions;
}
