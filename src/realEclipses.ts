/** Confirmed solar/lunar eclipses from Swiss Ephemeris eclipse search routines.
 * Unlike the lunar latitude screening, these routines solve geometric shadows.
 * Local visibility is evaluated at the exact profile coordinates, not user geolocation.
 */
const JULIAN_UNIX=2440587.5, DAY=86400000;
export const jdToDate=(jd:number)=>{if(!Number.isFinite(jd)||jd<JULIAN_UNIX-365000||jd>JULIAN_UNIX+365000)throw Error('Invalid eclipse Julian time');return new Date(Math.round((jd-JULIAN_UNIX)*DAY/1000)*1000)};
export type EclipseRaw={retFlag:number;tret:ArrayLike<number>};
export type EclipseLocalRaw=EclipseRaw&{attr:ArrayLike<number>};
export type EclipseWhereRaw={retFlag:number;geopos:ArrayLike<number>;attr:ArrayLike<number>};
export interface EclipseAPI{
 sol_eclipse_when_glob:(jd:number,flags:number,types:number,backwards:number)=>EclipseRaw|null;
 lun_eclipse_when:(jd:number,flags:number,types:number,backwards:number)=>EclipseRaw|null;
 sol_eclipse_when_loc?:(jd:number,flags:number,location:number[],backwards:number)=>EclipseLocalRaw|null;
 lun_eclipse_when_loc?:(jd:number,flags:number,location:number[],backwards:number)=>EclipseLocalRaw|null;
 sol_eclipse_where?:(jd:number,flags:number)=>EclipseWhereRaw|null;
 getLastError?:()=>string;
}
export type EclipseKind='solar'|'lunar';
export type EclipseType='total'|'annular'|'hybrid'|'partial'|'penumbral'|'unknown';
export type ConfirmedEclipse={kind:EclipseKind;type:EclipseType;maximum:Date;contacts:{first:Date|null;second:Date|null;third:Date|null;fourth:Date|null};retFlag:number;globalCoordinates:{lon:number;lat:number}|null;local:{visible:boolean;maximum:Date|null;flag:number;location:{lon:number;lat:number}}|null};
function safeTime(jd:number){return Number.isFinite(jd)&&jd>1000000?jdToDate(jd):null}
export function eclipseType(flags:number):EclipseType{
 if(flags&32)return 'hybrid';if(flags&4)return 'total';if(flags&8)return 'annular';if(flags&16)return 'partial';if(flags&64)return 'penumbral';return 'unknown';
}
export function calculateEclipses(api:EclipseAPI,from:Date,count=3,location?:{lat:number;lon:number},includeLocal=false):ConfirmedEclipse[]{
 if(!Number.isFinite(+from)||!Number.isInteger(count)||count<1||count>12)throw Error('Invalid eclipse search interval');
 if(location&&(!Number.isFinite(location.lat)||!Number.isFinite(location.lon)||Math.abs(location.lat)>90||Math.abs(location.lon)>180))throw Error('Invalid location');
 const search=(kind:EclipseKind,after:number)=>kind==='solar'?api.sol_eclipse_when_glob(after,2,0,0):api.lun_eclipse_when(after,2,0,0);
 const events:ConfirmedEclipse[]=[];
 for(const kind of ['solar','lunar'] as const){
  let cursor=+from/DAY+JULIAN_UNIX;
  for(let i=0;i<count;i++){
   const raw=search(kind,cursor);
   if(!raw||raw.retFlag<=0||!raw.tret||raw.tret.length<8||!Number.isFinite(raw.tret[0])||raw.tret[0]<=cursor)throw Error('Swiss eclipse search failed for '+kind+': '+(api.getLastError?.()??'no valid event'));
   const maximum=jdToDate(raw.tret[0]);
   const contacts=kind==='solar'?{
    first:safeTime(raw.tret[2]),second:safeTime(raw.tret[4]),third:safeTime(raw.tret[5]),fourth:safeTime(raw.tret[3])
   }:{
    first:safeTime(raw.tret[6]),second:safeTime(raw.tret[2]),third:safeTime(raw.tret[3]),fourth:safeTime(raw.tret[7])
   };
   let globalCoordinates:ConfirmedEclipse['globalCoordinates']=null;
   if(kind==='solar'&&api.sol_eclipse_where){
    const result=api.sol_eclipse_where(raw.tret[0],2);
    if(result&&result.retFlag>0&&Number.isFinite(result.geopos[0])&&Number.isFinite(result.geopos[1]))
     globalCoordinates={lon:result.geopos[0],lat:result.geopos[1]};
   }
   let local:ConfirmedEclipse['local']=null;
   if(includeLocal&&location){
    const fn=kind==='solar'?api.sol_eclipse_when_loc:api.lun_eclipse_when_loc;
    if(fn){
     // Local eclipse maximum might differ from global maximum; search for the
     // next eclipse visible locally then accept ONLY the current global event.
     const candidate=fn(raw.tret[0]-3,2,[location.lon,location.lat,0],0);
     const isSame=!!candidate&&candidate.retFlag>0&&Number.isFinite(candidate.tret[0])&&Math.abs(candidate.tret[0]-raw.tret[0])<=1;
     local={visible:isSame,maximum:isSame?jdToDate(candidate!.tret[0]):null,flag:isSame?candidate!.retFlag:0,location};
    }
   }
   events.push({kind,type:eclipseType(raw.retFlag),maximum,contacts,retFlag:raw.retFlag,globalCoordinates,local});
   cursor=raw.tret[0]+1;
  }
 }
 return events.sort((a,b)=>+a.maximum-+b.maximum);
}
