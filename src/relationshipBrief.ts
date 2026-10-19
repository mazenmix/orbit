import type {SynastryEvidence} from './math.ts';
import {synastryPlainReading,type TwoLanguage} from './relationshipPlain.ts';

type ContactKind='attraction'|'sexual';
export type RelationshipBrief={
 attraction:TwoLanguage;sexual:TwoLanguage;
 attractionContact:SynastryEvidence|null;sexualContact:SynastryEvidence|null;
 harmony:TwoLanguage;harmonyAction:TwoLanguage;harmonyTitle:TwoLanguage;harmonyContact:SynastryEvidence|null;
 challenge:TwoLanguage;challengeAction:TwoLanguage;challengeTitle:TwoLanguage;challengeContact:SynastryEvidence|null;
};
const joined=(e:SynastryEvidence)=>[e.first.id,e.second.id].sort().join('|');
const weights:Record<ContactKind,Record<string,number>>={
 attraction:{'Mars|Venus':1.55,'Ascendant|Venus':1.45,'Sun|Venus':1.22,'Moon|Venus':1.1,'Venus|Venus':1,'Ascendant|Mars':1.05,'Pluto|Venus':1.18,'Mars|Pluto':.95},
 sexual:{'Mars|Venus':1.65,'Mars|Mars':1.18,'Pluto|Venus':1.34,'Mars|Pluto':1.35,'Ascendant|Mars':1.1,'Mars|Moon':1.02,'Uranus|Venus':.9}
};
const pairSubject=(e:SynastryEvidence):TwoLanguage=>{
 const pair=joined(e);
 if(pair==='Mars|Venus')return {ar:'الزهرة والمريخ',en:'Venus and Mars'};
 if(pair==='Pluto|Venus')return {ar:'الزهرة وبلوتو',en:'Venus and Pluto'};
 if(pair==='Mars|Pluto')return {ar:'المريخ وبلوتو',en:'Mars and Pluto'};
 if(pair==='Mars|Mars')return {ar:'المريخ في الخارطتين',en:'Mars in both charts'};
 if(pair==='Ascendant|Venus')return {ar:'الزهرة والطالع',en:'Venus and the Ascendant'};
 if(pair==='Ascendant|Mars')return {ar:'المريخ والطالع',en:'Mars and the Ascendant'};
 if(pair==='Mars|Moon')return {ar:'القمر والمريخ',en:'Moon and Mars'};
 if(pair==='Moon|Venus')return {ar:'القمر والزهرة',en:'Moon and Venus'};
 if(pair==='Sun|Venus')return {ar:'الشمس والزهرة',en:'Sun and Venus'};
 if(pair==='Uranus|Venus')return {ar:'الزهرة وأورانوس',en:'Venus and Uranus'};
 return {ar:'الاتصالات بين الخارطتين',en:'the chart contacts'};
};
const aspectKind=(e:SynastryEvidence):TwoLanguage=>e.angle===120?
 {ar:'بتثليث',en:'trine'}:e.angle===60?{ar:'بتسديس',en:'sextile'}:
 e.angle===90?{ar:'بتربيع',en:'square'}:e.angle===180?{ar:'بمقابلة',en:'opposition'}:
 {ar:'باقتران',en:'conjunction'};
const find=(evidence:readonly SynastryEvidence[],kind:ContactKind):SynastryEvidence|null=>{
 const ranked=evidence.filter(e=>weights[kind][joined(e)]&&Number.isFinite(e.influence)&&Number.isFinite(e.orb)).slice()
 .sort((a,b)=>{
  const magnitude=(e:SynastryEvidence)=>weights[kind][joined(e)]*e.influence*((e.angle===90||e.angle===180)?.87:1);
  return magnitude(b)-magnitude(a)||a.orb-b.orb;
 });
 return ranked[0]??null;
};
const initial:TwoLanguage={ar:'ماكو اتصال قريب يدعم تقييم هالجانب فلكياً.',en:'No close calculated aspect supports a reading of this area.'};
export function relationshipBrief(evidence:readonly SynastryEvidence[]):RelationshipBrief{
 const attractionContact=find(evidence,'attraction'),sexualContact=find(evidence,'sexual');
 const supportive=evidence.filter(e=>e.angle===60||e.angle===120).slice().sort((a,b)=>b.influence-a.influence||a.orb-b.orb);
 const challenging=evidence.filter(e=>e.angle===90||e.angle===180).slice().sort((a,b)=>b.influence-a.influence||a.orb-b.orb);
 // When possible, let the harmony box explain a different contact from the attraction and sex box.
 const selected=new Set([attractionContact,sexualContact].filter(Boolean));
 const harmonyContact=supportive.find(e=>!selected.has(e))??supportive[0]??null;
 const challengeContact=challenging.find(e=>!selected.has(e))??challenging[0]??null;
 const harmony=synastryPlainReading(harmonyContact??undefined,'harmony');
 const challenge=synastryPlainReading(challengeContact??undefined,'challenge');
 const attraction=attractionContact?(()=>{
  const subject=pairSubject(attractionContact),aspect=aspectKind(attractionContact);
  return {ar:subject.ar+' '+aspect.ar+': دلالة رمزية على الجاذبية والإعجاب بين الخارطتين.',
   en:subject.en+' '+aspect.en+': a symbolic indicator of attraction between the charts.'};
 })():initial;
 const sexual=sexualContact?(()=>{
  const subject=pairSubject(sexualContact),aspect=aspectKind(sexualContact);
  const stress=sexualContact.angle===90||sexualContact.angle===180;
  return {ar:subject.ar+' '+aspect.ar+': '+(stress?'كيمياء جنسية مع شدّ واختلاف محتمل.':'دلالة على شرارة جنسية وانجذاب جسدي محتمل.')+' ',
   en:subject.en+' '+aspect.en+': '+(stress?'symbolic sexual chemistry with possible friction.':'a symbolic indication of sexual chemistry and physical attraction.')+''};
 })():initial;
 const focusedMeaning=(full:TwoLanguage):TwoLanguage=>{
  const trim=(s:string)=>s.replace(/\s+/g,' ').trim().split(/(?<=[.!؟])\s+/u)[0]||s;
  return {ar:trim(full.ar),en:trim(full.en)};
 };
 return {attraction,sexual,attractionContact,sexualContact,
  harmony:focusedMeaning(harmony.meaning),harmonyAction:harmony.advice,harmonyTitle:harmony.title,harmonyContact,
  challenge:focusedMeaning(challenge.meaning),challengeAction:challenge.advice,challengeTitle:challenge.title,challengeContact};
}
