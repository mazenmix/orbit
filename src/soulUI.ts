import {soulCategories,soulSearch,soulTopics} from './soulData.ts';
import {soulReading,soulProfileSummary,soulEvidenceText} from './soulEngine.ts';
import {humanSoul} from './humanReading.ts';
import type {Chart,Profile} from './engine.ts';
import {lang} from './i18n.ts';
import {interpretableNatalPoints} from './readingBasis.ts';
export type SoulAI={summary:string;detailedAnalysis:string;strengths:string[];challenges:string[];practicalInsights:string[];reflectionQuestions:string[];quality?:'source-grounded-model'|'verified-editorial-fallback'};
type SoulView={profile:Profile;chart:Chart;categoryId:number;topicId:number;query:string;privateNote?:string;ai?:SoulAI;aiBusy?:boolean;aiError?:string};
const xml=(x:unknown)=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const paths:Record<string,string>={
 brain:'<path d="M12 18.5c-2.3 2-6 1.2-6.7-1.6a4.4 4.4 0 0 1-2-7.6 4.7 4.7 0 0 1 4.8-6.7A4 4 0 0 1 12 3a4 4 0 0 1 5.2 2.5A4.7 4.7 0 0 1 22 12a4.4 4.4 0 0 1-2 7.6c-.7 2.8-4.4 3.6-6.7 1.6z"/><path d="M12 3v18m-5-13 2 2m-3 4 4-1m4-5-2 2m5 4-3-1"/>',
 moon:'<path d="M20.5 15.2A9 9 0 0 1 8.8 3.5 9.2 9.2 0 1 0 20.5 15.2Z"/><path d="m18 3 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
 'brain-circuit':'<circle cx="12" cy="12" r="3"/><path d="M12 2v6m0 8v6M2 12h6m8 0h6M5 5l4 4m6 6 4 4M5 19l4-4m6-6 4-4"/><circle cx="12" cy="2" r=".6"/><circle cx="22" cy="12" r=".6"/>',
 messages:'<path d="M4 4h13a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H9l-5 3v-4A3 3 0 0 1 2 15V7a3 3 0 0 1 2-3Z"/><path d="M6 9h10M6 13h7"/>',
 'yin-yang':'<circle cx="12" cy="12" r="9"/><path d="M12 3c9 1 9 9 0 9s-9 8 0 9"/><circle cx="12" cy="7.5" r="1.3"/><circle cx="12" cy="16.5" r="1.3"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
 magnet:'<path d="M5 4v9a7 7 0 0 0 14 0V4h-5v9a2 2 0 0 1-4 0V4Z"/><path d="M5 8h5m4 0h5"/>',
 'heart-handshake':'<path d="M12 21s-9-5.2-9-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.8-9 11-9 11Z"/><path d="m8 13 3-3 2 2 3-2"/>',
 heart:'<path d="M12 21s-9.5-6-9.5-12a5.5 5.5 0 0 1 9.5-3.5A5.5 5.5 0 0 1 21.5 9C21.5 15 12 21 12 21Z"/>',
 crown:'<path d="M3 8 7 12l5-8 5 8 4-4-2 12H5Z"/><path d="M5 20h14"/>',
 rings:'<circle cx="9" cy="13" r="6"/><circle cx="16" cy="11" r="6"/><path d="m6 4 3-2 3 2"/>',
 flame:'<path d="M12 22c-5 0-8-3.6-8-8 0-3.5 2-5.5 4-8 .2 3 1 5 3 6 .4-5 2.4-7 5-10 0 4 5 7 5 12 0 4.4-3.4 8-9 8Z"/><path d="M12 20c-2.6 0-4-2-3-4 1 1 2 1 3-1 2 1 3 4 0 5Z"/>',
 sparkles:'<path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z"/><path d="m4 2 1 2.5L7 5 5 6l-1 2-1-2-2-1 2-.5z"/>',
 anchor:'<circle cx="12" cy="5" r="2"/><path d="M12 7v14M5 11H2c0 5.5 4.2 9 10 9s10-3.5 10-9h-3M8 11h8"/>',
 flag:'<path d="M5 22V4m0 0c4-3 7 3 12 0v11c-5 3-8-3-12 0"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2ZM17 6a3 3 0 0 1 0 6m1 3c3 0 4 2 4 5"/>',
 house:'<path d="m2 11 10-8 10 8M5 10v11h14V10M9 21v-7h6v7"/>',
 briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V4h8v3M2 13h20m-12-2v4h4v-4"/>',
 coins:'<circle cx="10" cy="11" r="7"/><path d="M10 7v8m-3-6h4c2 0 2 3 0 3H8m8-9 4 4-3 3"/>',
 palette:'<path d="M12 2a10 10 0 1 0 0 20h2c2 0 2-3 .5-4.5a2 2 0 0 1 1.5-3.5H18c5 0 6-12-6-12Z"/><circle cx="7" cy="10" r="1"/><circle cx="11" cy="6" r="1"/><circle cx="17" cy="9" r="1"/><circle cx="7" cy="16" r="1"/>',
 wand:'<path d="m4 20 13-13 3 3L7 23M15 4l1-3 1 3 3 1-3 1-1 3-1-3-3-1ZM5 4l.5-2L6 4l2 .5L6 5l-.5 2L5 5 3 4.5Z"/>',
 zap:'<path d="m13 2-10 12h8l-1 8 11-13h-8Z"/>',
 coffee:'<path d="M4 7h13v8a6 6 0 0 1-13 0Zm13 2h3a3 3 0 0 1 0 6h-3M3 22h16m-12-19 1 2m5-2 1 2"/>',
 shield:'<path d="M12 2 3 6v6c0 6 4 9 9 10 5-1 9-4 9-10V6Z"/><path d="m8 12 3 3 5-6"/>',
 route:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v2c0 3 10 1 10 5s-10 1-10 5h10"/>'
};
export function soulIcon(id:string,color='#ba9cff',size=36){
 const path=paths[id]??paths.sparkles;
 return '<svg class="soul-icon-svg" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
}
const signsAr=['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'];
const signsEn=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const signOf=(degree:number,ar:boolean)=>[...(ar?signsAr:signsEn)][Math.floor(((degree%360)+360)%360/30)];
const point=(c:Chart,id:string,known=true)=>{
 if(!known&&['Moon','Ascendant','MC'].includes(id))return null;
 const longitude=id==='Ascendant'?c.asc:id==='MC'?c.mc:(interpretableNatalPoints(c.points,known).find(p=>p.id===id)?.longitude??null);
 return longitude!==null&&Number.isFinite(longitude)&&longitude>=0&&longitude<360?longitude:null;
};
export function soulRender(view:SoulView){
 const {profile,chart,categoryId,topicId,query}=view,ar=lang==='ar',l=<T,>(arabic:T,english:T):T=>ar?arabic:english;
 const summary=soulProfileSummary(chart,profile);
 const filtered=soulSearch(query);
 const current=soulCategories.find(c=>c.id===categoryId)??soulCategories[0];
 const activeTopic=current.topics.find(t=>t.id===topicId)??current.topics[0];
 const reading=soulReading(chart,activeTopic,{knownTime:profile.known});
 const direct=humanSoul(reading);
 const overview=humanSoul(soulReading(chart,soulTopics[7],{knownTime:profile.known}));
 const link=(id:string)=>'<button class="soul-category '+(current.id===+id?'is-active':'')+'" data-soul-category="'+id+'" style="--soul-color:'+xml(soulCategories[+id-1].color)+'"><span class="soul-category-num">'+String(id).padStart(2,'0')+'</span><span class="soul-category-icon">'+soulIcon(soulCategories[+id-1].icon,soulCategories[+id-1].color,31)+'</span><span class="soul-category-label">'+xml(l(soulCategories[+id-1].ar,soulCategories[+id-1].en))+'</span><small>'+xml(l(soulCategories[+id-1].en,soulCategories[+id-1].ar))+'</small><span class="soul-topic-count">8 '+l('تحليلات','topics')+' <span>›</span></span></button>';
 const planet=(id:string,visual:string,color:string)=>{const longitude=point(chart,id,profile.known);return '<div class="soul-planet-card" style="--planet-color:'+color+'"><span class="soul-planet-symbol">'+visual+'</span><span>'+l(({Sun:'الشمس',Moon:'القمر',Ascendant:'الطالع',MC:'وسط السماء'} as Record<string,string>)[id],id)+'</span><b>'+(longitude===null?l('غير محسوب','Unavailable'):signOf(longitude,ar))+'</b><small>'+(longitude===null?'—':(profile.known?'':'≈ ')+(longitude%30).toFixed(2)+'°')+'</small></div>'};
 const emphasize=(title:string,body:string,css='')=>!body.trim()?'':'<section class="soul-detail-box '+css+'"><h4>'+title+'</h4>'+body.split(/\n\s*\n/).filter(p=>p.trim()).map(p=>'<p>'+xml(p)+'</p>').join('')+'</section>';
 const list=(title:string,items:string[],cls:string)=>!items.length?'':'<section class="soul-detail-box '+cls+'"><h4>'+title+'</h4><ul>'+items.map(x=>'<li>'+xml(x)+'</li>').join('')+'</ul></section>';
 const activeIndex=current.topics.findIndex(x=>x.id===activeTopic.id),prev=current.topics[(activeIndex+7)%8],next=current.topics[(activeIndex+1)%8];
 const evidence=soulEvidenceText(reading.basis,ar);
 return '<section class="soul-dashboard" id="soul-dashboard">'+
  '<div class="soul-hero"><div class="soul-identity"><div class="soul-identity-header"><span class="soul-sun">☼</span><div><h2>'+l('تحليل الخارطة الشخصية','Your natal chart analysis')+'</h2><strong>'+l('قراءة مباشرة بمعانٍ من الحياة اليومية','DIRECT PERSONAL INTERPRETATION')+'</strong></div></div><p>'+l('تفاصيل ميلاد الشخص المختار تدخل بالحساب، بس الكلام هنا يشرح معناها الرمزي بحالات يومية، مو يحكم على شخصيته كحقيقة علمية.','Birth data powers the calculations, while this screen presents practical symbolic reflections—not scientific personality conclusions.')+'</p></div>'+'<div class="soul-hero-stats"><div class="soul-profile-strip"><span>♙ '+xml(profile.name)+'</span><span>▦ '+xml(profile.date)+'</span><span>◷ '+(profile.known?xml(profile.time):'—')+'</span><span>⌖ '+xml(profile.city)+'</span></div><div class="soul-planet-grid">'+planet('Sun','☼','#f7c36b')+planet('Moon','☾','#bb9bff')+planet('Ascendant','♢','#76f4ce')+planet('MC','MC','#eabd81')+'</div></div></div>'+
  '<section class="soul-who"><div class="soul-who-title"><span>'+l('من البيانات إلى المعنى','FROM DATA TO MEANING')+'</span><h3>'+l('شنو ممكن تفهم عن نفسك؟','What might this mean for you?')+'</h3><p>'+xml(l(overview.summary.ar,overview.summary.en))+'</p><button type="button" class="soul-link" data-soul-scroll="reading">'+l('اقرأ التحليل الكامل','Read the full analysis')+' ‹</button></div><div class="soul-who-traits">'+['Sun','Moon','Venus','Mercury'].map((id,i)=>{const lon=point(chart,id,profile.known);const subject=[l('الهوية والاتجاه','Identity and direction'),l('العالم العاطفي','Emotional world'),l('القيم والانجذاب','Values and attraction'),l('العقل والتواصل','Mind and communication')][i];return '<div><span class="soul-trait-symbol">'+['✦','☾','♡','✧'][i]+'</span><b>'+subject+'</b><small>'+(lon===null?l('لا توجد بيانات','Data unavailable'):signOf(lon,ar))+'</small></div>'}).join('')+'</div></section>'+
  '<div class="soul-library-head"><div><span class="soul-eyebrow">25 '+l('قسم','CATEGORIES')+' · 200 '+l('تحليل','ANALYSES')+'</span><h3>'+l('اكتشف بصمتك الشخصية','Explore your personal blueprint')+'</h3></div><label class="soul-search"><span>⌕</span><input id="soul-search" type="search" value="'+xml(query)+'" autocomplete="off" placeholder="'+l('ابحث عن كل التحليلات…','Search all 200 topics…')+'" aria-label="'+l('بحث في تحليلات الشخصية','Search personality topics')+'"></label></div>'+
  '<div class="soul-category-grid">'+(filtered.length?filtered.map(c=>link(String(c.id))).join(''):'<p class="soul-no-results">'+l('ماكو نتيجة مطابقة. جرّب اسم ثاني.','No matching topic; try a different phrase.')+'</p>')+'</div>'+(query.trim()?'<div class="soul-matched-topics"><div class="soul-search-results-label">'+l('التحليلات المطابقة','Matching analysis topics')+' · '+filtered.reduce((n,c)=>n+c.topics.length,0)+'</div><div class="soul-search-result-grid">'+filtered.flatMap(c=>c.topics.map(t=>'<button class="soul-result-link" data-soul-topic="'+t.id+'"><span>'+String(t.id).padStart(3,'0')+'</span>'+xml(l(t.ar,t.en))+' <b>›</b></button>')).join('')+'</div></div>':'')+
  '<section class="soul-reading-section" id="soul-reading" style="--active-soul-color:'+xml(current.color)+'"><div class="soul-reading-heading"><div class="soul-reading-heading-main"><span class="soul-focus-icon">'+soulIcon(current.icon,current.color,47)+'</span><div><span class="soul-eyebrow">'+String(current.id).padStart(2,'0')+' · '+xml(current.en)+'</span><h3>'+xml(l(current.ar,current.en))+'</h3><p>'+l('ثمانية تحليلات متخصصة عن','Eight focused analyses within')+' '+xml(l(current.ar,current.en))+'</p></div></div><b>8 '+l('تحليلات','TOPICS')+'</b></div>'+
   '<div class="soul-reading-body"><nav class="soul-topic-rail" aria-label="'+l('اختر موضوع التحليل','Select analysis topic')+'">'+current.topics.map((topic,i)=>'<button data-soul-topic="'+topic.id+'" class="'+(topic.id===activeTopic.id?'selected':'')+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+xml(l(topic.ar,topic.en))+'<b>›</b></button>').join('')+'</nav>'+
   '<article class="soul-topic-content"><div class="soul-topic-header"><div><span class="soul-eyebrow">'+String(activeTopic.id).padStart(3,'0')+' / 200</span><h3>'+xml(l(activeTopic.ar,activeTopic.en))+'</h3></div><div class="soul-topic-actions"><button data-soul-topic="'+prev.id+'" aria-label="'+l('السابق','Previous')+'">‹ '+l('السابق','Previous')+'</button><button data-soul-topic="'+next.id+'" aria-label="'+l('التالي','Next')+'">'+l('التالي','Next')+' ›</button></div></div>'+
   '<div class="soul-detail-grid">'+emphasize(l('✧ الخلاصة','✧ Summary'),l(direct.summary.ar,direct.summary.en),'summary')+emphasize(l('▤ التحليل العميق','▤ Deep analysis'),l(direct.deep.ar,direct.deep.en).replace('الجانب اللي تگدر تنمّيه:','\n\nالجانب اللي تگدر تنمّيه:').replace('A useful strength to develop is','\n\nA useful strength to develop is'),'deep')+list(l('⊕ نقاط القوة التي يمكن تنميتها','⊕ Strengths to develop'),l(reading.strengths.ar,reading.strengths.en),'strengths')+list(l('⊖ نقاط الضعف المحتملة للمراجعة','⊖ Patterns to watch'),l(reading.weaknesses.ar,reading.weaknesses.en),'weaknesses')+emphasize(l('◉ مثال توضيحي، لا واقعة مفترضة','◉ Illustrative example, not a claimed event'),l(reading.example.ar,reading.example.en),'example')+emphasize(l('☼ خطوة عملية لتجربتها','☼ A practical step to try'),l(reading.advice.ar,reading.advice.en),'advice')+'</div>'+
   '<details class="soul-evidence"><summary>'+l('التفاصيل الحسابية (اختياري)','Calculation details (optional)')+' ▿</summary><p class="soul-original-summary">'+xml(l(reading.summary.ar,reading.summary.en))+'</p><p dir="auto">'+xml(evidence)+'</p><p dir="auto">'+xml(l('بيانات الحساب: ','Calculation data: ')+profile.date+' · '+(profile.known?profile.time:l('12:00 تقريباً، وقت الولادة مجهول','12:00 approximate; birth time unknown'))+' · '+profile.city+' · '+profile.zone+' · UTC '+chart.date.toISOString())+'</p><p>'+l('Swiss Ephemeris · أبراج استوائية · Placidus عند توفر البيوت · أورب الاتصالات المختارة ≤ 3°','Swiss Ephemeris · tropical zodiac · Placidus when houses are available · selected aspect orb ≤ 3°')+'</p><p>'+xml(l(reading.limitations.ar,reading.limitations.en))+'</p>'+(reading.contradictory?'<p>'+l('تجتمع اتصالات داعمة وأخرى تحتاج موازنة بين المؤشرات المختارة. هذا وصف للتأويل، وليس تشخيصاً لتناقض نفسي.','Selected indicators include both harmonious and challenging aspects. This describes symbolism, not a psychological contradiction.')+'</p>':'')+'</details>'+
   '</article></div></section></section>';
}
