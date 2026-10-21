import type {ConfirmedEclipse} from './realEclipses.ts';

export type EclipsePhase = 'upcoming'|'warning'|'live'|'finished';
export function eclipseEventBounds(event:Pick<ConfirmedEclipse,'maximum'|'contacts'>){
 // Swiss Ephemeris first / fourth contacts are the global event limits.
 const start=event.contacts.first ? +event.contacts.first : +event.maximum;
 const end=event.contacts.fourth ? +event.contacts.fourth : +event.maximum;
 return {start,end};
}
export function eclipseEventPhase(event:Pick<ConfirmedEclipse,'maximum'|'contacts'>,now:number):EclipsePhase{
 const {start,end}=eclipseEventBounds(event);
 if(now>=end)return 'finished';
 if(now>=start)return 'live';
 if(start-now<=6*3600000)return 'warning';
 return 'upcoming';
}
export function eclipseEndHms(now:number,end:number){
 const total=Math.max(0,Math.ceil((end-now)/1000));
 return {hours:Math.floor(total/3600),minutes:Math.floor(total%3600/60),seconds:total%60};
}
const rad=(value:number)=>value*Math.PI/180;
const deg=(value:number)=>value*180/Math.PI;
const normalize=(value:number)=>((value%360)+360)%360;
/** Moon overhead at event maximum, from astronomical ecliptic longitude/latitude and Greenwich sidereal time. */
export function lunarSubpoint(at:Date,moonLongitude:number,moonLatitude:number){
 const jd=+at/86400000+2440587.5;
 const centuries=(jd-2451545)/36525;
 const obliquity=rad(23.439291-0.0130042*centuries);
 const lon=rad(moonLongitude),lat=rad(moonLatitude);
 const ra=normalize(deg(Math.atan2(Math.sin(lon)*Math.cos(obliquity)-Math.tan(lat)*Math.sin(obliquity),Math.cos(lon))));
 const dec=deg(Math.asin(Math.sin(lat)*Math.cos(obliquity)+Math.cos(lat)*Math.sin(obliquity)*Math.sin(lon)));
 const gmst=normalize(280.46061837+360.98564736629*(jd-2451545)+0.000387933*centuries*centuries-centuries**3/38710000);
 return {lat:dec,lon:((ra-gmst+540)%360)-180};
}
type ViewingCountry={ar:string;en:string;lat:number;lon:number;region:string};
/** Sample reference cities, not a map of eclipse totality or an exhaustive visibility forecast. */
const capitals:ViewingCountry[]=[
 {ar:'العراق',en:'Iraq',lat:33.3,lon:44.4,region:'westasia'},
 {ar:'السعودية',en:'Saudi Arabia',lat:24.7,lon:46.7,region:'westasia'},
 {ar:'الإمارات',en:'UAE',lat:24.5,lon:54.4,region:'westasia'},
 {ar:'تركيا',en:'Turkey',lat:39.9,lon:32.9,region:'westasia'},
 {ar:'الفلبين',en:'Philippines',lat:14.6,lon:121,region:'seasia'},
 {ar:'إندونيسيا',en:'Indonesia',lat:-6.2,lon:106.8,region:'seasia'},
 {ar:'ماليزيا',en:'Malaysia',lat:3.1,lon:101.7,region:'seasia'},
 {ar:'تايلند',en:'Thailand',lat:13.8,lon:100.5,region:'seasia'},
 {ar:'الهند',en:'India',lat:28.6,lon:77.2,region:'southasia'},
 {ar:'باكستان',en:'Pakistan',lat:33.7,lon:73.1,region:'southasia'},
 {ar:'بنغلادش',en:'Bangladesh',lat:23.8,lon:90.4,region:'southasia'},
 {ar:'اليابان',en:'Japan',lat:35.7,lon:139.7,region:'eastasia'},
 {ar:'الصين',en:'China',lat:39.9,lon:116.4,region:'eastasia'},
 {ar:'كوريا الجنوبية',en:'South Korea',lat:37.6,lon:127,region:'eastasia'},
 {ar:'مصر',en:'Egypt',lat:30,lon:31.2,region:'africa'},
 {ar:'كينيا',en:'Kenya',lat:-1.3,lon:36.8,region:'africa'},
 {ar:'جنوب أفريقيا',en:'South Africa',lat:-25.7,lon:28.2,region:'africa'},
 {ar:'نيجيريا',en:'Nigeria',lat:9.1,lon:7.4,region:'africa'},
 {ar:'المغرب',en:'Morocco',lat:34,lon:-6.8,region:'africa'},
 {ar:'إسبانيا',en:'Spain',lat:40.4,lon:-3.7,region:'europe'},
 {ar:'فرنسا',en:'France',lat:48.9,lon:2.4,region:'europe'},
 {ar:'بريطانيا',en:'United Kingdom',lat:51.5,lon:-.1,region:'europe'},
 {ar:'ألمانيا',en:'Germany',lat:52.5,lon:13.4,region:'europe'},
 {ar:'إيطاليا',en:'Italy',lat:41.9,lon:12.5,region:'europe'},
 {ar:'الولايات المتحدة',en:'United States',lat:38.9,lon:-77,region:'namerica'},
 {ar:'كندا',en:'Canada',lat:45.4,lon:-75.7,region:'namerica'},
 {ar:'المكسيك',en:'Mexico',lat:19.4,lon:-99.1,region:'namerica'},
 {ar:'البرازيل',en:'Brazil',lat:-15.8,lon:-47.9,region:'samerica'},
 {ar:'الأرجنتين',en:'Argentina',lat:-34.6,lon:-58.4,region:'samerica'},
 {ar:'تشيلي',en:'Chile',lat:-33.4,lon:-70.7,region:'samerica'},
 {ar:'أستراليا',en:'Australia',lat:-35.3,lon:149.1,region:'oceania'},
 {ar:'نيوزيلندا',en:'New Zealand',lat:-41.3,lon:174.8,region:'oceania'}
];
/** Countries with high lunar elevation at maximum, one representative per geographic region. */
export function lunarViewingCountries(at:Date,moonLongitude:number,moonLatitude:number,max=5){
 const p=lunarSubpoint(at,moonLongitude,moonLatitude);
 const cosDist=(c:ViewingCountry)=>Math.sin(rad(p.lat))*Math.sin(rad(c.lat))+Math.cos(rad(p.lat))*Math.cos(rad(c.lat))*Math.cos(rad(p.lon-c.lon));
 const chosen=new Set<string>();
 return capitals.map(c=>({...c,elevation:deg(Math.asin(Math.max(-1,Math.min(1,cosDist(c))))) }))
  .filter(c=>c.elevation>=25)
  .sort((a,b)=>b.elevation-a.elevation)
  .filter(c=>{if(chosen.has(c.region))return false;chosen.add(c.region);return true})
  .slice(0,max);
}
