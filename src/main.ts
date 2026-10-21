import './style.css';
import './refinement.css';
import './soul.css';
import './observatory.css';
import {eclipseCountdownParts} from './eclipseCountdown.ts';
import {heatmapBand} from './heatmapBands.ts';
import {eclipseEventBounds,eclipseEventPhase,eclipseEndHms,lunarViewingCountries} from './eclipseVisibility.ts';
import './security.css';
import './mychart.css';
import './premium.css';
import {moonSignReading} from './moonSignNarrative.ts';
import {moonHumanReading} from './moonHuman.ts';
import {moonPersonalSummary} from './moonPersonal.ts';
import {natalPortrait} from './natalPortrait.ts';
import {precisionChartStories} from './chartPrecisionNarrative.ts';
import './astroCalendar.css';
import './typography.css';
import './focus.css';
import {astroCalendarDays,calendarDaySynthesis,calendarMomentEvidence,CALENDAR_SAMPLE_HOURS,type AstroCalendarDay,type AstroCalendarRating,type CalendarDayRating} from './astroCalendar.ts';
import {optionalComparison,distinctParagraphs} from './reading.ts';
import {narrativeEvidence} from './narrativeEvidence.ts';
import {CALCULATION_VERSION} from './engine.ts';
import {distinctHighlights} from './highlights.ts';
import {rankPrioritySignals,distinctPriority,conciseInterpretation} from './focusPriority.ts';
import {refineNatalTransit} from './precision.ts';
import {scanLunations,type Lunation} from './eclipse.ts';
import type {ConfirmedEclipse} from './realEclipses.ts';
import {namedAsteroids,asteroidSourcePath} from './asteroids.ts';
import {loadNamedAsteroids,mountedAsteroidCount,namedAsteroidPositions} from './asteroidRuntime.ts';
import {asteroidReading,namedAsteroidContacts} from './asteroidInterpretation.ts';
import {partnerInsights,gaugeLevel} from './peopleInsights.ts';
import {personalTransitPlainReading} from './relationshipPlain.ts';
import {relationshipBrief} from './relationshipBrief.ts';
import {signalStory} from './readingNarrative.ts';
import {humanPlanet,humanSoul,humanPartner} from './humanReading.ts';
import {decodePrivateSetup} from './privateSetup.ts';
import {readJournal,writeJournal,checkJournal,parseJournalBackup,summarizeJournal,type JournalEntry,type InteractionKind,type Outcome} from './journal.ts';
import {reviewEvidence,reviewSignal} from './decision.ts';
import {resolveDecisions,decisionExplanation,type DecisionDetail} from './decisionUltra.ts';
import {calculateHeatmap,sampledHeatmap,heatSummary,type HeatCell} from './heatmap.ts';
import {soulRender,type SoulAI} from './soulUI.ts';
import {soulReading} from './soulEngine.ts';
import {soulCategories,soulTopics} from './soulData.ts';
import {relationshipWindows,bestWindows} from './relationshipWindows.ts';
import {lunarWindow,type LunarWindow} from './timing.ts';
import {vocPhase,vocRemaining,remainingPercent} from './liveVoc.ts';
import {calendarEvent,calendarDownload} from './calendar.ts';
import {encryptBackup,decryptBackup} from './secureBackup.ts';
import {isVaultConfigured,vaultOpened,setupVault,flushVault,vaultPending,unlockVaultWithUI} from './vault.ts';
import {createSyncCode,parseSyncCode,uploadEncrypted,downloadEncrypted,syncStatus} from './syncClient.ts';
import {subscribeBackgroundPush,unsubscribeBackgroundPush,sendBackgroundPushTest,getPushStatus,pushAvailableOnThisDevice,backgroundPushOptedIn,refreshBackgroundPushIfNeeded,type MoonPushEvent} from './pushClient.ts';
import {secondaryInstant,solarArcDegrees,directedNatal,solarReturnNear} from './progressions.ts';
import {loadEyeSettings,saveEyeSettings,dueEyeEvents,type EyeClock,type EyeEvent} from './eye.ts';
import {derivedMetrics,goModes,reviewGoMode,type GoDomain,type GoReview,type MetricResult} from './metrics.ts';
import {travelMetricsByGroup} from './travelMode.ts';
import {supportive,difficult} from './math.ts';
import {initEngine,report,defaultProfile,compatibility,chart,sunMoonState,confirmedEclipses,asteroidSwissRuntime,birthInstant,targets,localValue,zonedInstant,validateProfile,type Profile,type Report,type Chart} from './engine.ts';
import {categories,category as evidenceCategory,aspects,angles,aspectNames,type Category,type Signal} from './math.ts';
import {lang,setLang,t,cat,categoryLabels,planet,signSymbols,signsAr,signsEn,signName,copy as sourceCopy,tone,notice,technical,aspect} from './i18n.ts';
import {loadProfiles,saveProfiles,download,parseBackup} from './storage.ts';
import {wheel} from './chart.ts';
import {chartStories,profileAddress,transitOverview,actionForGender,partnerArabic} from './chartNarrative.ts';
const root=document.querySelector<HTMLDivElement>('#app')!;
await unlockVaultWithUI(root);
window.addEventListener('beforeunload',ev=>{if(vaultPending()){ev.preventDefault();ev.returnValue='Encrypted vault save is still in progress.'}});
let profiles=loadProfiles();
try{
 const oneTime=decodePrivateSetup(location.hash);
 if(oneTime){
  const existing=profiles.find(p=>p.kind==='self'&&p.name.trim().toLowerCase()===oneTime.name.trim().toLowerCase());
  const seeded={...oneTime,id:existing?.id??crypto.randomUUID()};
  profiles=profiles.filter(p=>p.id!==(existing?.id??'')&&p.id!=='demo');
  profiles.unshift(seeded);saveProfiles(profiles);localStorage.setItem('mx.active',seeded.id);
  history.replaceState(null,'',location.pathname+location.search+'#settings');
 }
}catch(e){console.warn('Invalid private setup link; no profiles were replaced',e)}

// Correct the old sample UTC zone on previously saved Baghdad profiles, without altering birth data.
if(profiles.some(p=>['baghdad','بغداد'].includes(p.city.toLowerCase().trim())&&p.zone==='Etc/UTC')){profiles=profiles.map(p=>['baghdad','بغداد'].includes(p.city.toLowerCase().trim())&&p.zone==='Etc/UTC'?{...p,zone:'Asia/Baghdad'}:p);saveProfiles(profiles)}
let active=profiles.find(p=>p.id===localStorage.getItem('mx.active'))??profiles[0];
let screen=location.hash.slice(1)||'today',selected=new Date(),data:Report|undefined,ready=false,engineVersion='',error='',toastTimer:ReturnType<typeof setTimeout>,installPrompt:any;
let aiConnection={checked:false,configured:false,provider:'none',model:'Qwen3'};
async function refreshAIConnection(){try{const response=await fetch('/api/explain',{cache:'no-store',signal:AbortSignal.timeout(8000)});const result=await response.json();aiConnection={checked:true,configured:result.configured===true,provider:String(result.provider??'none'),model:String(result.model??'Qwen3')};}catch{aiConnection={checked:true,configured:false,provider:'none',model:'Qwen3'}}if(screen==='ai'){updateLiveQwenCard();void refreshLiveQwen(true)}}
let uiMode:'simple'|'pro'=localStorage.getItem('mx.uiMode')==='pro'?'pro':'simple';
let calendarExpanded=false;
type FocusEvent={name:string;at:Date;mark:string;personal:boolean};
let focusScan:{key:string;events:FocusEvent[];running:boolean;done:boolean}|null=null;
let focusMoonEvents:FocusEvent[]=[];
let compareId='',chartMode='natal',soulPersonId='',soulCategory=1,soulTopic=1,soulQuery='',filter:Category|'all'='all',aiAnswer='',aiBusy=false;
let aiAnswerAt='',aiResponseSignature='',aiScope='',aiNextRequestAt=0,aiLastCheckMinute=-1,aiErrorMessage='',aiRequestId=0;
const AI_MIN_INTERVAL_MS=5*60_000;
const copy=(signal:Signal)=>{
 const source=sourceCopy(signal);
 const story=signalStory(signal,data?.natal,active.known,lang);
 const result=story?{...source,...story}:source;
 if(lang!=='ar'||active.sex!=='female')return result;
 return {...result,good:actionForGender(result.good,'female'),careful:actionForGender(result.careful,'female'),action:actionForGender(result.action,'female')};
};
const readingContext=()=>JSON.stringify([active,selected.toISOString(),lang]);
const cache=new Map<string,Report>();
let heatmapCategory:Category|'average'='average';
let heatmapSpan:30|90|365=30;
let calendarAnchor='',calendarVersion='',calendarDays:AstroCalendarDay[]=[],calendarCursor=0,calendarGeneration=0,calendarRunning=false,calendarSelected='';
type CalendarSnapshot=CalendarDayRating & {at:Date};
let calendarNatal:Chart|null=null;
const calendarSnapshots=new Map<string,CalendarSnapshot>();
const calendarFailures=new Map<string,string>();
let asteroidCategory:Category|'all'='all';
let asteroidLoading=false,asteroidProgress='',asteroidFailures:{name:string;reason:string}[]=[];
let heatmapCache:{key:string;cells:HeatCell[]}|null=null;
let lunationCache:{key:string;items:Lunation[]}|null=null;
let realEclipseCache:{checked:number;items:ConfirmedEclipse[]}|null=null;
function getRealEclipses(){
 const now=Date.now();
 // Search from two days ago so an eclipse remains visible *after maximum* until last contact.
 if(!realEclipseCache||now-realEclipseCache.checked>300000||realEclipseCache.items.some(e=>eclipseEventBounds(e).end<=now)){
  const possible=confirmedEclipses(new Date(now-2*86400000),2).filter(e=>eclipseEventBounds(e).end>now);
  const next=['solar','lunar'].map(kind=>possible.find(e=>e.kind===kind)).filter((e):e is ConfirmedEclipse=>!!e);
  if(next.length!==2)throw Error('Upcoming solar or lunar eclipse is unavailable');
  realEclipseCache={checked:now,items:next.sort((a,b)=>+a.maximum-+b.maximum)};
 }
 return realEclipseCache.items;
}
function getLunations(){const key=readingContext();if(!lunationCache||lunationCache.key!==key)lunationCache={key,items:scanLunations(selected,90,sunMoonState)};return lunationCache.items}
let moonCache:{key:string;value:LunarWindow}|null=null;
let syncCode='',syncRevisions=new Map<string,number>();
let eyeSettings=loadEyeSettings(),eyeCached:{checked:number;result:LunarWindow}|null=null;
function moonWindow(){
 const key=JSON.stringify(active);
 // An exact Moon sign interval has stable ingress/aspect roots. Only the current
 // instant and VOC state change within it, so avoid hundreds of WASM scans per tick.
 const existing=moonCache?.key===key?moonCache.value:null;
 if(existing&&+selected>=+existing.enteredAt&&+selected<+existing.ingressAt){
  return {...existing,at:selected,isVoid:+selected>=+existing.vocStartsAt};
 }
 const value=lunarWindow(selected,d=>chart(d,active,false,false).points);
 moonCache={key,value};
 return value;
}
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const icon=(name:string)=>({today:'✦',signals:'⌁',people:'♧',chart:'◎',settings:'⚙',time:'◷',lunar:'☾',eclipses:'◑',asteroids:'✧',advanced:'◈',intel:'✦',go:'➤',travelmode:'✈',calendar:'▦',more:'☷',ai:'✧',evidence:'⎔'}[name]??'·');
const labels:Record<string,()=>string>={today:()=>t('اليوم','Today'),signals:()=>t('الإشارات','Signals'),people:()=>t('الناس','People'),chart:()=>t('خارطتي','My chart'),settings:()=>t('الإعدادات','Settings'),time:()=>t('آلة الزمن','Time Machine'),lunar:()=>t('توقيت القمر','Moon timing'),eclipses:()=>t('الكسوف والخسوف','Eclipses'),asteroids:()=>t('الكويكبات','Named asteroids'),advanced:()=>t('التوقيت المتقدم','Advanced timing'),calendar:()=>t('التقويم','Calendar'),more:()=>t('المزيد','More'),go:()=>t('Go Mode','Go Mode'),travelmode:()=>t('Travel Mode','Travel Mode'),intel:()=>t('Go Mode','Go Mode'),ai:()=>t('شرح Ai','Ai explanations'),evidence:()=>t('الدليل الفلكي','Astrological evidence')};
let clockFormat: '24'|'12'=localStorage.getItem('mx.clockFormat')==='12'?'12':'24';
let liveTimePinned=false,liveLastRender=0,liveMinute=-1,moonNarrativeLastMinute=-1,liveSkyLastTick=0;
const LIVE_SKY_INTERVAL_MS=5000;
const LIVE_CONTENT_INTERVAL_MS:Record<string,number>={today:15000,signals:20000,go:15000,intel:15000,travelmode:15000,lunar:15000,chart:20000,people:30000,time:30000,eclipses:60000,asteroids:45000,advanced:60000,evidence:25000,ai:30000,more:60000};

const natalAsteroidHtmlCache=new Map<string,string>();
const dateText=(d:Date,options:Intl.DateTimeFormatOptions={dateStyle:'full',timeStyle:'short'})=>new Intl.DateTimeFormat('en-GB',{...options,timeZone:active.zone,numberingSystem:'latn',hour12:clockFormat==='12'}).format(d);
function getReport(at=selected){const key=active.id+JSON.stringify(active)+at.toISOString();let r=cache.get(key);if(!r){r=report(active,at);cache.set(key,r);if(cache.size>150)cache.delete(cache.keys().next().value!)}return r}
function average(r:Report){return Math.round(Object.values(r.scores).reduce((a,b)=>a+b,0)/8)}
function getHeatmap(){const key=readingContext()+heatmapSpan;if(!heatmapCache||heatmapCache.key!==key)heatmapCache={key,cells:heatmapSpan===30?calculateHeatmap(selected,30,at=>getReport(at).scores):sampledHeatmap(selected,heatmapSpan,at=>getReport(at).scores)};return heatmapCache.cells}
function heatmapUI(){try{const cells=getHeatmap(),key=heatmapCategory;const score=(c:HeatCell)=>key==='average'?c.average:c.indices[key];const label=key==='average'?t('المعدل الرمزي','Symbolic average'):cat(key);return `<section class="panel heatmap-panel"><div class="section-title"><div><span class="eyebrow">TIME MACHINE · 30 / 90 / 365 DAYS</span><h2>${t('خارطة المؤشرات خلال شهر أو سنة','Month and year symbolic heatmaps')}</h2></div>${tag(t('مؤشرات رمزية','Symbolic indices'))}</div><label class="heat-label">${t('المجال','Category')} <select id="heat-category"><option value="average" ${key==='average'?'selected':''}>${t('معدل كل المجالات','All-category average')}</option>${categories.map(c=>`<option value="${c}" ${key===c?'selected':''}>${cat(c)}</option>`).join('')}</select></label><label class="heat-label">${t('المدة','Period')} <select id="heat-span"><option value="30" ${heatmapSpan===30?'selected':''}>30 ${t('يوم','days')}</option><option value="90" ${heatmapSpan===90?'selected':''}>90 ${t('يوم','days')}</option><option value="365" ${heatmapSpan===365?'selected':''}>365 ${t('يوم','days')}</option></select></label><div class="heatmap-grid">${cells.map(c=>{const v=Math.max(0,Math.min(100,Math.round(score(c)))),d=dateText(c.instant,{day:'2-digit',month:'short'});return `<button class="heatmap-cell heatmap-${heatmapBand(v)}" data-heat-at="${+c.instant}" aria-label="${esc(d+' '+label+' '+v+'/100')}" title="${esc(d+' · '+label+' · '+v+'/100')}"><small>${esc(d)}</small><b>${v}</b></button>`}).join('')}</div></section>`}catch(e){return `<p class="alert">${t('تعذر حساب الـHeatmap: ','Could not calculate heatmap: ')}${esc(String(e))}</p>`}}

/** Six destinations; Go Mode is its own first-class page directly after People. */
const primaryRoutes=['today','chart','people','go','travelmode','calendar','more'];
function primarySection(route:string):string{
 if(route==='signals')return 'today';
 if(route==='asteroids')return 'chart';
 if(['time','lunar','eclipses','advanced'].includes(route))return 'calendar';
 if(route==='intel')return 'go'; // Keep legacy #intel bookmarks working.
 if(['ai','evidence','settings'].includes(route))return 'more';
 return primaryRoutes.includes(route)?route:'today';
}
const sectionRoutes:Record<string,string[]>={
 today:['today','signals'],
 chart:['chart','asteroids'],
 calendar:['calendar','time','lunar','eclipses','advanced'],
 more:['more','ai','evidence','settings']
};
function sectionTabs(){
 if(uiMode==='simple')return '';
 const current=primarySection(screen),routes=sectionRoutes[current];
 if(!routes||routes.length<2)return '';
 return '<nav class="mx-section-tabs" aria-label="'+t('تبويبات القسم','Section tabs')+'">'+routes.map(route=>
  '<button type="button" class="mx-section-tab '+(screen===route?'is-current':'')+'" data-go="'+route+'" '+(screen===route?'aria-current="page"':'')+'><span class="mx-tab-icon" aria-hidden="true">'+icon(route)+'</span>'+labels[route]()+'</button>'
 ).join('')+'</nav>';
}
function nav(names:string[],mobile=false){return `<nav class="${mobile?'mobile-nav':'nav'}" aria-label="${t('التنقل الرئيسي','Main navigation')}">${names.map(n=>{const active=primaryRoutes.includes(n)?primarySection(screen)===n:screen===n;return `<button data-go="${n}" class="nav-item ${active?'active':''}" ${active?'aria-current="page"':''}><span>${icon(n)}</span><b>${labels[n]()}</b></button>`}).join('')}</nav>`}
function demoNotice(){
 if(!(active.id==='demo'&&active.name==='Demo'&&active.city==='Greenwich'&&active.date==='2000-01-01'))return '';
 return `<section class="demo-notice" role="note"><div><strong>${t('هذه خارطة تجربة، مو خارطتك الشخصية.','This is a demo chart, not your personal reading.')}</strong><p>${t('القراءة هسّه محسوبة لبيانات Greenwich التجريبية. أدخل بيانات ميلادك الحقيقية حتى تطلع حساباتك إنت؛ بياناتك تبقى بهذا المتصفح.','The current reading uses the Greenwich sample profile. Enter your birth details for your own calculation; your details stay in this browser.')}</p></div><button class="secondary" data-go="settings">${t('ضبط بيانات ميلادي','Set up my chart')} ↗</button></section>`;
}
function render(){
 liveLastRender=Date.now();
 // These top-level routes use compact headings: preserve time, location and profile tools.
 const hidePageHeadingTitle=['travelmode','go','people','chart','today','calendar','more','ai','settings','eclipses'].includes(screen);
 document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.documentElement.lang=lang==='ar'?'ar-IQ':'en';
 document.documentElement.dataset.uiMode=uiMode;
 root.innerHTML=`<div class="shell ${uiMode==='simple'?'mx-simple':'mx-professional'}"><aside class="sidebar"><a class="brand" href="#today"><span class="brand-wordmark"><i>MX</i> Astro</span></a>${nav(primaryRoutes)}</aside><div class="workspace"><header class="topbar"><a class="mobile-brand" href="#today"><b class="brand-wordmark"><i>MX</i> Astro</b></a><div class="top-actions"><button class="language" id="language">${lang==='ar'?'EN':'عربي'}</button><button id="tools" class="icon-button mobile-tools" aria-label="${t('أدوات أكثر','More tools')}">⋯</button><button class="avatar" data-go="settings" aria-label="${t('الملف الشخصي','Profile')}">${esc(active.name.slice(0,1))}</button></div></header><main id="main"><div class="page-heading"><div>${hidePageHeadingTitle?'':`<div class="eyebrow">MX ASTRO · ${labels[primarySection(screen)]?.()??labels.today()}</div>${screen==='chart'||screen==='evidence'?'':`<h1>${labels[screen]?.()??labels.today()}</h1>`}`}<p><span id="live-page-clock">${dateText(selected)}</span> <span class="location">⌖ ${esc(screen==='chart'?chartOwnerProfile().city:active.city)}</span></p></div><div class="heading-actions"><label class="sr-only" for="active-profile">${t('الملف النشط','Active profile')}</label><select id="active-profile">${topProfileOptions()}</select><button class="icon-button" id="refresh" aria-label="${t('تحديث','Refresh')}">↻</button></div></div>${demoNotice()}${error?`<div class="alert">${esc(error)}</div>`:''}<div id="live-view-body">${!ready?`<section class="loading panel"><div class="orbital-loader">◎</div><h2>${t('دا أفتح مرصدك…','Opening your observatory…')}</h2><p>${t('تحميل المحرك والبيانات الفلكية المحلية.','Loading the local engine and ephemeris data.')}</p></section>`:content()}</div></main>${nav(primaryRoutes,true)}</div></div><dialog id="detail"><div id="dialog-content"></div></dialog><div class="toast" role="status" aria-live="polite" id="toast"></div>`;
 bind();
 if(screen==='eclipses')tickEclipseCountdowns(Date.now());
 if(screen==='today'&&uiMode==='simple'&&ready)startFocusEventScan();
 if(screen==='lunar'&&ready)updateLiveVocClock(+selected);
 if(screen==='ai'&&ready)void refreshLiveQwen(false);
 if(screen==='calendar'&&ready)startCalendarWork();
}
function content(){if(!data)return screen==='settings'?settingsPage():screen==='more'?morePage():'<section class="panel"><p>'+t('الحساب غير متاح لهذي البيانات. راجع الملف قبل عرض نتائج جديدة.','Calculation unavailable for these inputs. Review the profile before showing new results.')+'</p><button class="secondary" data-go="settings">'+t('مراجعة بيانات الميلاد','Review birth details')+'</button></section>';let inner:string;switch(screen){case 'today':inner=uiMode==='simple'?focusedToday():today();break;case 'signals':inner=signalsPage();break;case 'chart':inner=chartPage();break;case 'time':inner=uiMode==='simple'?focusedTime():timePage();break;case 'lunar':inner=lunarPage();break;case 'calendar':inner=uiMode==='simple'?focusedCalendar():astroCalendarPage();break;case 'eclipses':inner=eclipsesPage();break;case 'asteroids':inner=asteroidsPage();break;case 'advanced':inner=advancedPage();break;case 'intel':case 'go':inner=goModePage();break;case 'travelmode':inner=travelModePage();break;case 'people':inner=peoplePage();break;case 'evidence':inner=evidencePage();break;case 'ai':inner=aiPage();break;case 'settings':inner=settingsPage();break;case 'more':inner=morePage();break;default:screen='today';inner=today()}return sectionTabs()+(data.current.missing.length&&screen!=='settings'?'<p class="subtle" role="status">'+t('بيانات إضافية غير متاحة وتم استبعادها: ','Unavailable supplementary bodies omitted: ')+data.current.missing.map(id=>esc(planet(id))).join(' · ')+'</p>':'')+inner}
function tag(text:string,cls=''){return `<span class="tag ${cls}">${text}</span>`}

/** Restore the four daily gauges from existing calculated symbolic indices.
 * Their values must track the selected person's report, not a hard-coded score. */
/** One compact gauge component is used by Today, Go Mode's four primary
 * meters and all twelve Travel Mode cards. */
function quickGaugeCard(m:MetricResult,symbol:string,override?:readonly [string,string],travelId?:string){
 const label=override?t(override[0],override[1]):t(m.ar,m.en),amount=m.value;
 return '<article class="mx-focus-metric '+gaugeLevel(amount)+'"'+
  (travelId?' data-travel-metric="'+travelId+'"':' data-today-gauge="'+m.id+'"')+
  ' data-indicator-id="'+m.id+'">'+
  '<span class="mx-today-gauge-icon" aria-hidden="true">'+symbol+'</span><b>'+label+'</b>'+
  '<strong>'+amount+'<small>/100</small></strong>'+
  '<div class="mx-today-gauge-track" role="progressbar" aria-label="'+esc(label)+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+amount+'"><i style="width:'+amount+'%"></i></div>'+
  '</article>';
}
function todayQuickGauges(r:Report,insideGo=false){
 const available=derivedMetrics(r.scores);
 const items=[
  {id:'sexuality',ar:'الجنس',en:'Sex / intimacy',symbol:'✧'},
  {id:'love',ar:'الحب',en:'Love',symbol:'♥'},
  {id:'emotional',ar:'العاطفة',en:'Emotions',symbol:'☾'},
  {id:'career',ar:'العمل',en:'Work',symbol:'▣'}
 ] as const;
 const gauges=items.map(item=>{
  const found=available.find(row=>row.id===item.id);
  if(!found)throw Error('Missing daily gauge: '+item.id);
  return quickGaugeCard(found,item.symbol,[item.ar,item.en]);
 }).join('');
 return '<section class="panel mx-today-gauges mx-quick-gauges" aria-label="'+t('مؤشرات اليوم المختصرة','Today quick indicators')+'">'+
  (insideGo?'':'<div class="mx-today-gauge-header"><h2>'+t('مؤشرات اليوم','Today at a glance')+'</h2><button type="button" class="text-button" data-go="intel">'+t('كل المؤشرات','All indicators')+' ↗</button></div>')+
  '<div class="mx-focus-metrics">'+gauges+'</div>'+
  '</section>';
}
/** A single, source-grounded view of the selected time; no invented success probabilities. */
/** Match the professional My Chart wheel while showing the actual current sky.
 * This is an ephemeris chart for the active location, not a natal wheel. */
function todaySkyWheel(r:Report){
 return '<div class="chart-layout chart-expanded mx-today-sky-layout">'+
  '<section class="panel large-wheel mx-today-sky" aria-label="'+t('خارطة السماء بهاللحظة','Current sky wheel')+'">'+
  '<div class="mx-today-sky-heading"><h2>'+t('سماء اللحظة','Current sky')+'</h2>'+
  '<button type="button" class="secondary mx-today-sky-expand" id="expand-sky-wheel-link" aria-label="'+t('كبّر دائرة السماء','Expand sky wheel')+'">⤢ '+t('تكبير','Expand')+'</button></div>'+
  '<button type="button" id="expand-sky-wheel" class="mx-today-sky-open" aria-label="'+t('تكبير خارطة السماء الحالية','Expand current sky wheel')+'">'+wheel(r.current)+'</button>'+
  '<time class="mx-today-sky-time" datetime="'+r.at.toISOString()+'">'+dateText(r.at,{dateStyle:'full',timeStyle:'medium'})+'</time>'+
  '</section></div>';
}
function focusedToday(){
 const r=data!,priority=rankPrioritySignals({signals:r.signals,natal:r.natal,knownBirthTime:active.known,complete:r.complete})[0];
 const main=priority?.signal,reading=main?copy(main):null;
 const factor=priority?.factor;
 const evidence=factor?planet(factor.transit.id)+' '+aspect(factor.angle)+' '+planet(factor.natal.id)+' · '+factor.orb.toFixed(2)+'°':t('لا توجد زاوية رئيسية مهيمنة ضمن الأورب الحالي','No dominant major aspect in the current orb');
 const phase=factor?(factor.applying?t('يقترب من الدقة','Applying'):t('يبتعد عن الدقة','Separating')):'';
 const quality=priority?.status==='mixed'?'':
  priority?.limitation==='unknown-time'?t('وقت الميلاد مو مؤكد؛ البيوت والطالع مو داخلين بالترجيح.','Birth time unknown; house and ascendant relevance excluded.'):
  priority?.limitation==='missing-ephemeris'?t('بعض البيانات الفلكية الثانوية مو متوفرة؛ ما تم تعويضها بتخمين.','Some supplementary ephemerides are unavailable; missing positions were not invented.'):'';
 const time=(at:Date)=>dateText(at,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
 let moon='<p class="mx-focus-note">'+t('توقيت القمر غير متاح حالياً.','Moon calculation unavailable.')+'</p>';
 let futureEvents:FocusEvent[]=[];
 try{
  const w=moonWindow(),now=+selected;
  const percent=(from:Date,to:Date)=>Math.max(0,Math.min(100,Math.round(100*(+to-now)/Math.max(1,+to-(+from)))));
  const vocEnd=w.isVoid?w.ingressAt:w.vocStartsAt,vocStart=w.isVoid?w.vocStartsAt:w.enteredAt;
  moon='<div class="mx-focus-moon"><article><small>☾ '+t('القمر الآن','Current Moon')+'</small><strong>'+signName(w.sign*30)+'</strong><small>'+t('الانتقال القادم','Next ingress')+'</small><time datetime="'+w.ingressAt.toISOString()+'">'+time(w.ingressAt)+'</time><progress max="100" value="'+percent(w.enteredAt,w.ingressAt)+'"></progress></article>'+
   '<article><small>◌ VOID OF COURSE</small><strong>'+(w.isVoid?t('خالي المسار','VOC active'):t('ماشي عدل','Moon on course'))+'</strong><small>'+(w.isVoid?t('نهاية الفترة','Period ends'):t('بداية الفترة','Period begins'))+'</small><time datetime="'+vocEnd.toISOString()+'">'+time(vocEnd)+'</time><progress max="100" value="'+percent(vocStart,vocEnd)+'"></progress></article></div>';
  const moonIngress:FocusEvent={name:t('انتقال القمر للبرج التالي','Moon ingress'),at:w.ingressAt,mark:'☾',personal:false};
  const voc:FocusEvent={name:w.isVoid?t('نهاية خلو المسار','VOC ends'):t('بداية خلو المسار','VOC begins'),at:w.isVoid?w.ingressAt:w.vocStartsAt,mark:'◌',personal:false};
  futureEvents=[moonIngress,voc,...w.events.filter(e=>+e.time>now).map(e=>({name:planet(e.transit)+' '+aspect(e.angle)+' '+planet(e.target),at:e.time,mark:'✧',personal:false}))].filter(e=>+e.at>now);
 }catch(e){futureEvents=[];moon='<p class="mx-focus-note">'+t('تعذر التحقق من بيانات القمر: ','Moon ephemeris unavailable: ')+esc(String(e))+'</p>'}
 focusMoonEvents=futureEvents;
 const personal=focusScan?.done&&focusScan.key===focusEventKey()?focusScan.events:[];
 const eventMarkup=focusEventMarkup([...personal,...futureEvents]);
 const matchedAi=aiAnswer&&aiScope===liveQwenScope()&&aiAnswerAt&&Math.abs(+new Date(aiAnswerAt)-+selected)<15*60000;
 const secondFocus=rankPrioritySignals({signals:r.signals,natal:r.natal,knownBirthTime:active.known,complete:r.complete}).find(x=>x.signal.category!==main?.category);
 const secondReading=secondFocus?copy(secondFocus.signal):null;
 const aiSnippet=matchedAi?esc(conciseInterpretation(aiAnswer).brief):
   secondReading?esc(secondReading.title+' — '+secondReading.good):
   t('ماكو اتصال شخصي قوي حالياً حتى ننسب إله قصة من خيالنا. تابع بياناتك الفعلية، وافتح تحليل Ai لما تتوفر دلائل محسوبة.','There is no strong personal contact to justify a made-up narrative. Review real circumstances and use Ai when calculated evidence is available.');
 return todaySkyWheel(r)+'<div class="mx-focused-dashboard"><div class="mx-focus-main">'+
 '<section class="panel mx-focus-hero"><div class="mx-focus-heading"><span class="mx-focus-eyebrow">✦ '+t('شنو الأهم إلك هسه؟','YOUR MAIN FOCUS')+'</span><span class="tag cyan">'+(liveTimePinned?t('وقت مختار','SELECTED'): 'LIVE')+'</span></div><h2>'+esc(reading?.title??t('ماكو اتصال مهيمن الآن','No dominant aspect at this moment'))+'</h2><p>'+esc(reading?.good??t('ماكو اتصال فلكي قوي يدعم قراءة شخصية بهذه اللحظة.','No strong astrological contact supports a personal reading at this moment.'))+'</p>'+(reading?'<p class="mx-focus-story-example">'+esc(reading.careful)+'</p><p class="mx-focus-story-action"><strong>'+t('شنو تسوي؟ ','What to do: ')+'</strong>'+esc(reading.action)+'</p>':'')+(quality?'<p class="mx-focus-quality">'+quality+'</p>':'')+'<details class="mx-focus-technical"><summary>'+t('أساس الحساب (اختياري)','Calculation basis (optional)')+'</summary><p>'+esc(evidence)+'</p><small>'+dateText(selected,{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})+(phase?' · '+phase:'')+'</small></details>'+
 '<div class="mx-focus-actions"><button class="primary" data-go="evidence">'+t('ليش هاي القراءة؟','Why this reading?')+' ↗</button>'+(factor?'<button class="secondary" id="focus-refine-peak">'+t('احسب وقت الذروة','Verify exact peak')+' ⏱</button>':'')+'</div><div class="mx-focus-peak" id="focus-peak-result" aria-live="polite"></div></section>'+
 '<section class="panel mx-focus-panel mx-focus-ai"><h2>✧ MX Ai · '+t('قراءة قصيرة','Short explanation')+'</h2><p>'+aiSnippet+'</p><button class="secondary mx-focus-subaction" data-go="ai">'+t('تحليل Ai','Ai analysis')+' ↗</button></section></div>'+
 '<aside class="mx-focus-aside"><section class="panel mx-focus-panel"><h2>☾ '+t('القمر وخلو المسار','Moon & Void of Course')+'</h2>'+moon+'<p class="mx-moon-personal-summary">'+esc(moonPersonalSummary(r,active.known,lang))+'</p><button class="secondary mx-focus-subaction" data-go="lunar">'+t('تفاصيل القمر','Moon details')+' ↗</button></section>'+
 '<section class="panel mx-focus-panel"><h2>'+t('أقرب 3 أحداث فلكية دقيقة','Next 3 exact sky events')+'</h2><div id="focus-events">'+eventMarkup+'</div><small class="mx-focus-note">'+t('اتصالات شخصية وقمرية محسوبة؛ ما نعرض تواريخ مستقبلية بلا تحقق.','Verified natal-transit and lunar events only; never inferred event dates.')+'</small><button class="secondary mx-focus-subaction" data-go="calendar">'+t('فتح التقويم','Open calendar')+' ↗</button></section></aside></div>';
}

/** A stable daily scan, deferred until the home view is painted. Bounded to the
 * three strongest eligible contacts, never predicting exact times from orb/speed.
 * Missing ephemeris roots are omitted, not replaced by synthetic timings. */
function focusCandidates(){
 const report=data;
 if(!report)return [];
 const chosen:typeof report.evidence=[];
 const seen=new Set<string>();
 const priorities=rankPrioritySignals({signals:report.signals,natal:report.natal,knownBirthTime:active.known,complete:report.complete});
 for(const row of priorities){
  const e=row.factor;
  if(!e.applying||e.orb>3.5||chosen.length>=3)continue;
  const id=e.transit.id+':'+e.natal.id+':'+e.angle;
  if(seen.has(id))continue;
  if(e.transit.id==='Moon'&&chosen.some(p=>p.transit.id==='Moon'))continue;
  seen.add(id);chosen.push(e);
 }
 return chosen;
}
function focusEventKey(){
 const candidates=focusCandidates();
 return JSON.stringify([active.id,active.date,active.time,active.zone,localValue(selected,active.zone).slice(0,10),candidates.map(e=>e.id)]);
}
function focusEventMarkup(events:FocusEvent[]){
 const unique:FocusEvent[]=[];
 for(const e of events.filter(e=>+e.at>+selected).sort((a,b)=>+a.at-+b.at||Number(b.personal)-Number(a.personal))){
  const existing=unique.find(x=>Math.abs(+x.at-+e.at)<60000);
  if(existing){if(!existing.name.includes(e.name))existing.name+=' · '+e.name;existing.personal=existing.personal||e.personal;continue}
  unique.push({...e});
 }
 const three=unique.slice(0,3);
 return three.length?three.map(e=>'<div class="mx-focus-event"><span class="mx-event-mark">'+e.mark+'</span><div><strong>'+esc(e.name)+'</strong><small>'+dateText(e.at,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})+' · '+esc(active.zone)+(e.personal?' · '+t('شخصي','Personal'):'')+'</small></div></div>').join(''):
  '<p>'+t('لا توجد لحظات دقيقة مثبتة ضمن البحث الحالي.','No verified exact events in this search window.')+'</p>';
}
function startFocusEventScan(){
 if(!ready||!data||screen!=='today'||uiMode!=='simple')return;
 const key=focusEventKey();
 if(focusScan?.key===key)return;
 const items=focusCandidates(),at=new Date(+selected);
 focusScan={key,events:[],running:true,done:false};
 if(!items.length){focusScan.running=false;focusScan.done=true;return}
 let idx=0;
 const step=()=>{
  if(focusScan?.key!==key)return;
  if(idx>=items.length){
   focusScan.running=false;focusScan.done=true;
   if(screen==='today'&&uiMode==='simple'&&focusEventKey()===key){
    const display=root.querySelector<HTMLElement>('#focus-events');
    if(display)display.innerHTML=focusEventMarkup([...focusScan.events,...focusMoonEvents]);
   }
   return;
  }
  const e=items[idx++];
  try{
   const window=refineNatalTransit(e,at,d=>chart(d,active,true,false).points,e.transit.id==='Moon'?3:21);
   const future=window.events.filter(event=>+event.time>=+at);
   for(const peak of future){
    focusScan.events.push({name:planet(e.transit.id)+' '+aspect(e.angle)+' '+planet(e.natal.id),at:peak.time,mark:'✧',personal:true});
   }
  }catch(err){console.warn('Cannot verify personal transit peak',e.id,err)}
  setTimeout(step,60);
 };
 setTimeout(step,350);
}
function focusedCalendar(){
 const title=t('التقويم الفلكي','Astrological calendar');
 const sub=t('ابدأ بأقرب شهرين. افتح السنة أو آلة الزمن وقت ما تحتاج التفاصيل.','Start with the next two months. Expand the year or open Time Machine when needed.');
 return '<section class="panel mx-focus-panel"><h2>'+title+'</h2><p class="mx-focus-note">'+sub+'</p><div class="mx-focus-calendar-actions"><button class="secondary" data-go="time">'+t('آلة الزمن','Time Machine')+' ↗</button><button class="secondary" data-go="eclipses">'+t('الكسوف والخسوف','Eclipses')+'</button><button class="secondary" id="calendar-expand">'+(calendarExpanded?t('إظهار شهرين','Show two months'):t('إظهار كل الأشهر','Show all months'))+'</button></div></section>'+
 '<div class="mx-calendar-compact'+(calendarExpanded?' is-expanded':'')+'">'+astroCalendarPage()+'</div>';
}
function focusedTime(){
 const short=distinctPriority(rankPrioritySignals({signals:data!.signals,natal:data!.natal,knownBirthTime:active.known,complete:data!.complete}),3,copy).map(({signal,factor})=>{const info=copy(signal);return '<div class="mx-focus-event"><span class="mx-event-mark">'+categoryLabels[signal.category][2]+'</span><div><strong>'+esc(info.title)+'</strong><small>'+esc(info.action)+(factor?' · '+planet(factor.transit.id)+' '+aspect(factor.angle)+' '+planet(factor.natal.id)+' ('+factor.orb.toFixed(2)+'°)':'')+'</small></div></div>'}).join('');
 return '<section class="panel time-controls mx-time-compact"><div><span class="eyebrow">TIME MACHINE</span><h2>'+t('اختار يوم وساعة','Select a date and time')+'</h2><p>'+t('الحسابات تنعاد لموعدك المختار، بدون تخمين أيام غير محسوبة.','Calculations update to the selected moment; unsampled times are not guessed.')+'</p></div><form id="time-form"><label>'+t('التاريخ والوقت','Date & time')+'<input required name="moment" id="time-input" type="datetime-local" min="1800-01-01T00:00" max="2399-12-31T23:59" value="'+localValue(selected,active.zone)+'"></label><small>'+esc(active.zone)+'</small><button class="primary">'+t('احسب اللحظة','Calculate moment')+' ↗</button></form><div class="quick-times">'+[-24,-6,6,24,168].map(h=>'<button class="chip" data-shift="'+h+'">'+(h>0?'+':'')+h+' '+t('ساعة','h')+'</button>').join('')+'<button class="chip" data-now>'+t('هسه','Now')+'</button></div></section>'+
 '<section class="panel mx-focus-panel"><h2>'+t('أبرز 3 نتائج لهذا الوقت','Top 3 results for this moment')+'</h2>'+short+'<p class="mx-focus-note">'+t('هذه تفسيرات رمزية لاتصالات محسوبة، وليست توقعات مؤكدة.','These are symbolic readings of calculated aspects, not certain forecasts.')+'</p><div class="mx-focus-actions"><button class="secondary" data-go="evidence">'+t('التفصيل الحسابي','Evidence')+' ↗</button><button class="secondary" data-go="calendar">'+t('التقويم','Calendar')+'</button></div></section>';
}
function morePage(){
 const card=(route:string,ar:string,en:string,descAr:string,descEn:string)=>'<button type="button" data-go="'+route+'"><strong>'+icon(route)+' '+t(ar,en)+'</strong><small>'+t(descAr,descEn)+'</small></button>';
 const group=(ar:string,en:string,cards:string)=>'<section class="panel mx-focus-panel"><h2>'+t(ar,en)+'</h2><div class="mx-more-grid">'+cards+'</div></section>';
 return '<section class="panel mx-focus-panel"><div class="mx-mode-choices"><button class="secondary" data-ui-mode="simple" aria-pressed="'+(uiMode==='simple')+'">✦ '+t('بسيط','Simple')+'</button><button class="secondary" data-ui-mode="pro" aria-pressed="'+(uiMode==='pro')+'">◎ '+t('محترفين','Professional')+'</button></div></section>'+
 group('الرصد والتوقيت','Sky & timing',
  card('lunar','توقيت القمر','Moon timing','خلو المسار والاتصالات الدقيقة','VOC and exact Moon aspects')+
  card('time','آلة الزمن','Time Machine','تاريخ ووقت تختاره','Calculate a chosen moment')+
  card('eclipses','الكسوف والخسوف','Eclipses','الأحداث الفلكية المؤكدة','Certified astronomical events'))+
 group('القراءة والشرح','Reading & explanation',
  card('ai','شرح Ai','Ai explanation','مختصر موثق والتفاصيل عند الطلب','Short grounded reading with optional detail')+
  card('evidence','الدليل الحسابي','Calculation evidence','درجة وزاوية ووزن الاتصال','Source contacts, orbs and weights'))+
 group('أدوات المحترفين والإعدادات','Professional tools & settings',
  card('asteroids','الكويكبات','Asteroids','التحليل الموسع للأجرام الثانوية','Supplementary body calculations')+
  card('advanced','التوقيت المتقدم','Advanced timing','التقدّمات والعودة الشمسية','Progressions and solar return')+
  card('settings','الإعدادات','Settings','بيانات الميلاد والخصوصية والمزامنة','Birth profile, privacy and sync'));
}
function scoresHTML(r:Report){
 const fallback:Record<Category,[string,string]>={
  overview:['رتّب أولوياتك ولا تحمل نفسك أكثر من خطوة مهمة.','Set one clear priority and avoid overloading the day.'],
  career:['راجع مهمة العمل الأهم وخلي قرارك مبني على نتيجة واضحة.','Review the most important task and judge it by results.'],
  love:['شوف التواصل الحقيقي قبل ما تعتمد على إحساس الإعجاب.','Check real communication before drawing romantic conclusions.'],
  communication:['اختار كلام مباشر واسمع الرد بدون ما تقرأ ما بين السطور زيادة.','Communicate plainly and listen rather than overinterpreting silence.'],
  energy:['وزّع مجهودك بين الحركة والراحة بدل الاندفاع دفعة وحدة.','Pace your activity and rest instead of spending all your energy at once.'],
  emotions:['سمِّ شعورك الفعلي قبل ما تبني قرار عليه.','Name what you actually feel before acting on it.'],
  recovery:['خلّ الراحة والنوم جزء من جدولك مو شي تأجله.','Give rest and sleep a planned place in your day.'],
  timing:['تأكد من الموعد والتفاصيل واترك هامش للتغيير.','Verify the timing and leave room for adjustments.']
 };
 return '<div class="scores-grid rich-scores">'+categories.map(c=>{const signal=r.signals.find(s=>s.category===c),v=r.scores[c],line=signal?copy(signal).action:t(...fallback[c]);return '<button class="score-card '+gaugeLevel(v)+'" data-category="'+c+'"><span class="score-symbol '+c+'">'+categoryLabels[c][2]+'</span><span class="score-number">'+v+'<small>/100</small></span><b>'+cat(c)+'</b><p>'+esc(line)+'</p><div class="meter"><i style="width:'+v+'%"></i></div></button>'}).join('')+'</div>';
}
function signalCard(s:Signal,index:number){const text=copy(s);return `<button class="signal-card ${s.tone}" data-signal="${index}"><span class="signal-icon">${categoryLabels[s.category][2]}</span><div><div class="signal-meta">${cat(s.category)} <span>·</span> ${tone(s)}</div><h3>${text.title}</h3><div class="direct-advice"><p class="good"><b>${t("الزين","Good")}</b>${text.good}</p><p class="careful"><b>${t("انتبه","Watch out")}</b>${text.careful}</p><p class="do"><b>${t("سوي هالشي","Do this")}</b>${text.action}</p></div><small>${t('اعرض الدليل','See evidence')} <span class="arrow">↗</span></small></div></button>`}
function today(){const r=data!,primary=r.signals[0],text=primary?copy(primary):null;return `${todaySkyWheel(r)}<div class="dashboard-grid mx-today-compact"><div class="main-column"><section class="hero panel"><div class="hero-top"><span class="live-label"><i class="status-dot"></i>${t('هسّه · إيقاع اللحظة','NOW · THE MOMENT')}</span><span class="subtle">${dateText(selected,{hour:'2-digit',minute:'2-digit'})}</span></div><div class="hero-copy">${tag(t('مرحباً','Welcome')+' '+esc(active.name),'violet')}<h2>${text?.title??t('خذ مساحة وشوف الصورة','Make room for the bigger picture')}</h2><p>${text?.action??t('ماكو إشارة مهيمنة ضمن الأورب المحدد.','No dominant contact within the configured orbs.')}</p><div class="hero-bottom"><button class="primary" data-go="evidence">${t('ليش هاي القراءة؟','Why this reading?')} <span>↗</span></button><button class="secondary mx-ai-context" data-go="ai">✧ ${t('شرح Ai','Explain with Ai')}</button></div></div><div class="hero-orbit" aria-hidden="true"><i></i><i></i><i></i><span>✦</span><b>☾</b><em>·</em></div></section>${scoresHTML(r)}<div class="section-title"><h2>${t('إشارات تستحق انتباهك','Signals worth your attention')}</h2><button class="text-button" data-go="signals">${t('كل الإشارات','All signals')} ↗</button></div><div class="signal-list">${distinctHighlights(r.signals,copy,3,1).map(({item,index})=>signalCard(item,index)).join('')||`<p class="empty panel">${t('ماكو إشارات إضافية مختلفة عن القراءة الرئيسية ضمن الأورب المحدد.','No additional distinct signals beyond the headline reading within the configured orbs.')}</p>`}</div></div><aside class="right-column"><section class="panel lunar-card"><span class="moon-glyph">☾</span><span class="eyebrow">${t('القمر وخارطتك','THE MOON & YOUR CHART')}</span><h3>${signName(r.current.points.find(p=>p.id==='Moon')!.longitude)}</h3><p>${esc(moonPersonalSummary(r,active.known,lang))}</p><button class="text-button" data-go="evidence">${t('شوف التفاصيل','View details')} ↗</button></section><button class="panel time-shortcut" data-go="time"><span>◷</span><div><b>${t('آلة الزمن','Time Machine')}</b><p>${t('أي تاريخ. منظور جديد.','Another date. A new perspective.')}</p></div><b>↗</b></button></aside></div>`}
function trend(hours:number){const rows=Array.from({length:9},(_,i)=>{const at=new Date(Math.min(Date.UTC(2399,11,31,23,59),+selected+i*hours/8*3600000));return {at,value:average(getReport(at))}});const pts=rows.map((r,i)=>`${i*75},${130-r.value}`).join(' ');return `<div class="trend"><svg viewBox="0 0 600 150" role="img" aria-label="${t('مؤشر رمزي محسوب عبر الوقت','Calculated symbolic index over time')}"><defs><linearGradient id="area" x2="0" y2="1"><stop stop-color="#8272df" stop-opacity=".25"/><stop offset="1" stop-color="#8272df" stop-opacity="0"/></linearGradient></defs>${[25,50,75,100].map(v=>`<line x1="0" x2="600" y1="${130-v}" y2="${130-v}" stroke="#292d43" stroke-dasharray="3 5"/><text x="3" y="${126-v}" fill="#727993" font-size="8">${v}</text>`).join('')}<polygon points="0,140 ${pts} 600,140" fill="url(#area)"/><polyline points="${pts}" stroke="#a79aef" stroke-width="2" fill="none"/>${rows.map((r,i)=>`<circle cx="${i*75}" cy="${130-r.value}" r="3" fill="#c6bbff"><title>${dateText(r.at,{hour:'2-digit',minute:'2-digit'})}: ${r.value}/100</title></circle>`).join('')}</svg><div class="trend-labels" dir="ltr">${rows.filter((_,i)=>i%2===0).map(r=>`<span>${dateText(r.at,{hour:'2-digit',minute:'2-digit'})}</span>`).join('')}</div></div>`}
function signalsPage(){const r=data!;return `<div class="filter-row">${(['all',...categories] as const).map(c=>`<button data-filter="${c}" class="chip ${filter===c?'selected':''}">${c==='all'?t('الكل','All'):cat(c)}</button>`).join('')}</div><div class="signal-list wide">${r.signals.map((s,i)=>filter==='all'||filter===s.category?signalCard(s,i):'').join('')||`<div class="empty panel">${t('ماكو إشارة لهالمجال ضمن الأورب المحدد.','No signal in this category within the configured orbs.')}</div>`}</div>`}
const soulCharts=new Map<string,Chart>();
const soulAIResults=new Map<string,SoulAI>();
let soulAIBusy=false,soulAIActive='',soulAIError='';
const soulAIKey=(person:Profile,topic:number)=>JSON.stringify([person,topic,lang,'soul-v1']);
function soulViewProfile(){
 const person=profiles.find(p=>p.id===soulPersonId)??active;
 const key=JSON.stringify(person);
 if(soulCharts.size>16)soulCharts.clear();
 let natal=soulCharts.get(key);
 if(!natal){natal=chart(birthInstant(person),person,true,person.known);soulCharts.set(key,natal)}
 return {person,natal};
}
function chartOwnerProfile():Profile{return profiles.find(p=>p.id===soulPersonId)??active}
function topProfileOptions(){
 const items=screen==='chart'?profiles:profiles.filter(p=>p.kind==='self');
 const displayed=screen==='chart'?chartOwnerProfile():active;
 return items.map(p=>'<option value="'+esc(p.id)+'" '+(p.id===displayed.id?'selected':'')+'>'+esc(p.name)+'</option>').join('');
}
function chartOwnerHeader(person:Profile){
 const ar=lang==='ar',self=person.kind==='self';
 const sex=person.sex==='male'?'Male':person.sex==='female'?'Female':t('غير محدد','Not specified');
 const avatar=esc(person.name.trim().slice(0,1).toLocaleUpperCase());
 const values=[
  {key:'profile',icon:'◈',label:t('الملف','PROFILE'),value:person.name,sub:self?t('حسابي الشخصي','My profile'):t('شخص من الناس','Saved person')},
  {key:'gender',icon:'◇',label:t('الجنس','GENDER'),value:sex,sub:t('إعدادات هذا الشخص','Person setting')},
  {key:'birth',icon:'◷',label:t('الميلاد','BIRTH DATE'),value:person.date,sub:t('تاريخ الميلاد','Date of birth')},
  {key:'time',icon:'◴',label:t('الوقت','BIRTH TIME'),value:person.known?person.time:t('غير معروف','Unknown'),sub:person.known?'24h · '+esc(person.zone):t('البيوت والطالع غير متاحة','Houses & ASC unavailable')},
  {key:'place',icon:'⌖',label:t('المكان','BIRTH PLACE'),value:person.city,sub:person.zone}
 ];
 const items=profiles.map(p=>'<option value="'+esc(p.id)+'" '+(p.id===person.id?'selected':'')+'>'+esc(p.name)+'</option>').join('');
 return '<section class="panel mx-chart-owner"><div class="mx-chart-owner-top"><div class="mx-chart-owner-title"><span class="mx-profile-avatar">'+avatar+'</span><div><span class="eyebrow">MX ASTRO · NATAL DOSSIER</span><h2>'+esc(person.name)+'</h2></div></div><label class="mx-chart-person-picker"><span>'+t('اختار صاحب الخارطة','CHOOSE CHART OWNER')+'</span><select id="soul-person-select" aria-label="'+t('صاحب الخارطة','Chart owner')+'">'+items+'</select></label></div><div class="mx-chart-meta-grid">'+values.map(v=>'<div class="mx-chart-meta-card mx-meta-'+v.key+'"><span class="mx-meta-icon" aria-hidden="true">'+v.icon+'</span><div class="mx-meta-copy"><span class="mx-meta-label">'+v.label+'</span><b>'+esc(v.value)+'</b><small>'+esc(v.sub)+'</small></div></div>').join('')+'</div></section>';
}
function chartPlanetIndex(c:Chart,transit?:Chart){
 const all=(list:typeof c.points,type:'natal'|'transit')=>list.map(p=>{
  const sign=Math.floor(((p.longitude%360)+360)%360/30),color=type==='transit'?'#78e4cd':'#d9b3ff';
  return '<div class="mx-wheel-planet-key '+type+'"><span class="mx-wheel-key-glyph" style="color:'+color+'">'+esc(p.symbol)+'</span><span><b>'+esc(planet(p.id))+'</b><small>'+esc(t(signsAr[sign],signsEn[sign]))+' · '+(p.longitude%30).toFixed(2)+'°'+(p.speed<0?' · Rx':'')+'</small></span></div>';
 });
 return '<details class="mx-wheel-index"><summary>'+t('كل الكواكب بأسمائها ودرجاتها الدقيقة','All planets, names and exact degrees')+'</summary><div class="mx-wheel-planets">'+all(c.points,'natal').join('')+(transit?all(transit.points,'transit').join(''):'')+'</div></details>';
}

function natalAsteroidDetails(person:Profile,natal:Chart){
 const count=mountedAsteroidCount();
 if(count===0)return '<section class="panel mx-natal-asteroid-status"><h3>'+t('الكويكبات المحسوبة لصاحب الخارطة','Asteroids for this birth chart')+'</h3><button class="secondary" id="load-named-asteroids">'+t('حساب الكويكبات المتاحة','Calculate available asteroids')+' ↗</button><small id="asteroid-progress" role="status">'+esc(asteroidProgress)+'</small></section>';
 const key=JSON.stringify([person,natal.date.toISOString(),count,lang]);
 const cached=natalAsteroidHtmlCache.get(key);if(cached)return cached;
 try{
  const positions=namedAsteroidPositions(asteroidSwissRuntime(),birthInstant(person));
  const map=new Map(positions.map(pt=>[pt.id,pt]));
  const contacts=namedAsteroidContacts(positions,targets(natal).filter(pt=>person.known||!['Moon','Ascendant','MC'].includes(pt.id)),birthInstant(person));
  const closest=new Map<string,typeof contacts[number]>();
  for(const e of contacts)if(!closest.has(e.transit.id))closest.set(e.transit.id,e);
  const entries=namedAsteroids.map(a=>{
   const pos=map.get(a.name),near=closest.get(a.name);if(!pos)return '';
   const story=asteroidReading(a,near,lang==='en');
   const sign=t(signsAr[Math.floor((((pos.longitude%360)+360)%360)/30)],signsEn[Math.floor((((pos.longitude%360)+360)%360)/30)]);
   const literal=near?(t('أقرب اتصال محسوب: ','Closest exact natal contact: ')+planet(near.natal.id)+' · '+aspect(near.angle)+' · '+near.orb.toFixed(2)+'°') : t('ماكو اتصال ولادي قوي ضمن حدّ الحساب.','No close natal contact within the calculation threshold.');
   return '<article class="mx-asteroid-dossier-item"><div><b>'+esc(a.name)+'</b><span>MPC '+a.number+' · '+sign+' '+(pos.longitude%30).toFixed(2)+'°</span></div><p>'+esc(story.theme)+'</p><small>'+esc(literal)+'</small><p>'+esc(story.action)+'</p></article>';
  }).filter(Boolean);
  const html='<details class="panel mx-natal-asteroid-dossier"><summary>'+t('الكويكبات: مواقع صاحب الخارطة واتصالاته الخاصة','Asteroids: this person’s own positions and natal aspects')+' · '+entries.length+'/'+namedAsteroids.length+'</summary><p class="mx-asteroid-note">'+t('هذه المواضع محسوبة من ميلاد الشخص المختار، مو من ميلاد حسابك. تأويلاتها رمزية، ولا تكشف أسرار أو رغبات الشخص.','Positions belong to the selected person’s birth, not your account. Interpretations are symbolic; they cannot reveal private desires.')+'</p><div class="mx-asteroid-dossier-grid">'+entries.join('')+'</div></details>';
  natalAsteroidHtmlCache.set(key,html);if(natalAsteroidHtmlCache.size>10)natalAsteroidHtmlCache.delete(natalAsteroidHtmlCache.keys().next().value!);
  return html;
 }catch(e){return '<section class="panel"><p>'+t('تعذر تحليل الكويكبات المحسوبة لهذه الخارطة: ','Asteroid readings unavailable for this chart: ')+esc(String(e))+'</p></section>'}
}
function chartSpecificFingerprint(person:Profile,natal:Chart){
 const readings=precisionChartStories(natal,undefined,[],person.known).slice(0,4);
 return '<section class="panel mx-chart-fingerprint" data-chart-identity="'+esc(person.id)+'"><h3>'+t('ملامح شخصيتك بالحياة اليومية','Your real-life reflection themes')+'</h3><div class="mx-person-natal-portrait">'+natalPortrait(natal,person.known,lang).map((line,i)=>'<p data-portrait-line="'+i+'">'+esc(line)+'</p>').join('')+'</div><div class="mx-chart-fingerprint-grid">'+readings.map(r=>{const plain=humanPlanet(r);return '<article><b>'+t(plain.title.ar,plain.title.en)+'</b><p>'+t(plain.summary.ar,plain.summary.en)+'</p></article>'}).join('')+'</div></section>';
}

function chartPage(){
 if(chartMode==='details'){
  try{
   const {person,natal}=soulViewProfile();
   const profileSelect=chartOwnerHeader(person);
   const privateNote=person.kind==='self'?sessionStorage.getItem('mx.soul.discovery.v1:'+person.id+':'+soulTopic)??'':undefined;
   return '<div class="section-title chart-view-tabs"><div class="segmented"><button data-chart="natal">'+t('خارطة الولادة','Natal')+'</button><button data-chart="transit">'+t('العبور','Transits')+'</button><button data-chart="overlay">'+t('مقارنة العبور','Transit overlay')+'</button><button class="selected" data-chart="details">'+t('التفاصيل','Details')+'</button></div></div>'+profileSelect+chartSpecificFingerprint(person,natal)+soulRender({profile:person,chart:natal,categoryId:soulCategory,topicId:soulTopic,query:soulQuery,privateNote,ai:soulAIResults.get(soulAIKey(person,soulTopic)),aiBusy:soulAIBusy&&soulAIActive===soulAIKey(person,soulTopic),aiError:soulAIActive===soulAIKey(person,soulTopic)?soulAIError:''});
  }catch(e){return '<section class="panel"><h2>'+t('تعذر حساب تحليل الشخصية','Unable to calculate personality analysis')+'</h2><p>'+esc(String(e))+'</p></section>'}
 }
 const person=chartOwnerProfile();
 const r=person.id===active.id?data!:report(person,selected),c=chartMode==='transit'?r.current:r.natal;
 const owner=profileAddress(person,lang==='ar'),now=transitOverview(r);
 const sex=person.sex==='male'?'Male':person.sex==='female'?'Female':t('مو محدد','Not specified');
 const chartLead=chartMode==='natal'?t('هاي خارطة الميلاد الثابتة؛ التفاصيل أدناه تخص صاحب أو صاحبة الخارطة، مو أحداث اليوم.','This is the fixed natal chart; its descriptions concern the owner, not events today.'):chartMode==='transit'?t('هنا حركة الكواكب في الوقت المختار؛ التفسير مرتبط بالحاضر مو بطباع الشخص الثابتة.','These are current transits for the chosen moment, not fixed personality traits.'):t('المقارنة تعرض حركة اليوم فوق مواضع الميلاد. الألوان والرموز توضح الطبقتين.','The overlay compares current transits with natal positions. Colored symbols distinguish the layers.');
 const lead=chartOwnerHeader(person);
 const natalPortraitLines=natalPortrait(r.natal,person.known,lang);
 const daily='<section class="panel chart-transit-summary"><h2>'+t('شنو تقول الحركة الفلكية عن اللحظة؟','What stands out at this moment?')+'</h2><p>'+t(now.ar,now.en)+'</p><div class="mini-trends">'+r.signals.slice(0,4).map(signal=>'<div class="trend-item"><b>'+cat(signal.category)+'</b><span class="reading-level '+gaugeLevel(signal.score)+'">'+signal.score+'</span><small>'+esc(copy(signal).action)+'</small></div>').join('')+'</div></section>';
 return '<div class="section-title"><div class="segmented"><button data-chart="natal" class="'+(chartMode==='natal'?'selected':'')+'">'+t('خارطة الولادة','Natal')+'</button><button data-chart="transit" class="'+(chartMode==='transit'?'selected':'')+'">'+t('العبور','Transits')+'</button><button data-chart="overlay" class="'+(chartMode==='overlay'?'selected':'')+'">'+t('مقارنة العبور','Transit overlay')+'</button><button data-chart="details" class="'+(chartMode==='details'?'selected':'')+'">'+t('التفاصيل','Details')+'</button></div></div>'+lead+
 (!person.known||!c.cusps.length?'<div class="alert">'+t('وقت الميلاد غير معروف أو البيوت غير متاحة لهذا الموقع، لهذا ما نظهر أرقام بيوت غير موثوقة.','Birth time unknown or houses unavailable for these coordinates, so house positions are not invented.')+'</div>':'')+
 '<div class="chart-layout chart-expanded"><section class="panel large-wheel">'+wheel(c,chartMode==='overlay'?r.current:undefined)+chartPlanetIndex(c,chartMode==='overlay'?r.current:undefined)+'<p>'+dateText(chartMode==='natal'?r.natal.date:selected,{dateStyle:'full',timeStyle:'short'})+'</p><div class="wheel-guide"><span class="natal-dot">'+t('خارطة الولادة','Natal planets')+'</span>'+(chartMode==='overlay'?'<span class="transit-dot">'+t('العبور','Transits')+'</span>':'')+'</div><div class="mx-aspect-legend"><span class="harmonious">'+t('تثليث / تسديس','Trine / Sextile')+'</span><span class="challenging">'+t('تربيع / مقابلة','Square / Opposition')+'</span><span class="conjunction">'+t('اقتران','Conjunction')+'</span><span>Rx = '+t('تراجع','Retrograde')+'</span></div></section><section class="panel chart-side-reading">'+(chartMode==='natal'?'<h2>'+t('بصمة شخصية صاحب الخارطة','A portrait of this chart owner')+'</h2><div class="mx-person-natal-portrait" data-chart-owner="'+esc(person.id)+'">'+natalPortraitLines.map((line,i)=>'<p data-portrait-line="'+i+'">'+esc(line)+'</p>').join('')+'</div>':'<h2>'+t('شرح اللحظة','Moment summary')+'</h2><p>'+t(now.ar,now.en)+'</p>')+'</section></div>'+
 (chartMode==='natal'?'':daily)+natalAsteroidDetails(person,r.natal)+
 '<details class="panel chart-math"><summary>'+t('التفاصيل الرياضية: مواقع الكواكب والبيوت','Advanced technical positions and house cusps')+'</summary><h3>'+t('مواضع الكواكب','Celestial positions')+'</h3>'+positionTable(c.points)+(c.cusps.length?'<div class="house-grid">'+c.cusps.map((lon,i)=>'<div><small>'+t('البيت','House')+' '+(i+1)+'</small><b>'+signName(lon)+'</b><span>'+(lon%30).toFixed(2)+'°</span></div>').join('')+'</div>':'')+'</details>';
}
function positionTable(points:Report['current']['points']){return `<div class="table-wrap"><table><thead><tr><th>${t('الجرم','Body')}</th><th>${t('البرج','Sign')}</th><th>${t('الدرجة','Degree')}</th><th>${t('السرعة / يوم','Speed / day')}</th></tr></thead><tbody>${points.map(p=>`<tr><td><span class="planet-symbol">${p.symbol}</span> ${planet(p.id)} ${p.speed<0?'<b class="retro">℞</b>':''}</td><td>${signName(p.longitude)}</td><td dir="ltr">${(p.longitude%30).toFixed(4)}°</td><td dir="ltr">${p.speed.toFixed(4)}°</td></tr>`).join('')}</tbody></table></div>`}
function advancedPage(){
 try {
  const b=birthInstant(active),progress=secondaryInstant(b,selected);
  const natal=data!.natal,progressed=chart(progress.ephemerisTime,active,true,false);
  const natalSun=natal.points.find(p=>p.id==='Sun'),progSun=progressed.points.find(p=>p.id==='Sun');
  if(!natalSun||!progSun)throw Error('Sun ephemeris unavailable');
  const arc=solarArcDegrees(natalSun.longitude,progSun.longitude),directed=directedNatal(natal.points,arc);
  const year=Number(new Intl.DateTimeFormat('en-GB',{year:'numeric',timeZone:active.zone}).format(selected));
  const approx=new Date(Date.UTC(year,b.getUTCMonth(),b.getUTCDate(),b.getUTCHours(),b.getUTCMinutes()));
  const solarSky=(d:Date)=>chart(d,active,false,false).points;
  const ret=solarReturnNear(approx,natalSun.longitude,solarSky);
  const followingApprox=new Date(Date.UTC(year+1,b.getUTCMonth(),b.getUTCDate(),b.getUTCHours(),b.getUTCMinutes()));
  const nextRet=ret&&+ret>+selected?ret:year<2399?solarReturnNear(followingApprox,natalSun.longitude,solarSky):null;
  const table=(points:typeof directed)=>`<div class="table-wrap"><table><thead><tr><th>${t('الجرم','Body')}</th><th>${t('البرج','Sign')}</th><th>${t('الدرجة','Degree')}</th></tr></thead><tbody>${points.slice(0,10).map(p=>`<tr><td>${planet(p.id)}</td><td>${signName(p.longitude)}</td><td dir="ltr">${(p.longitude%30).toFixed(3)}°</td></tr>`).join('')}</tbody></table></div>`;
  return `<div class="section-title"><div><span class="eyebrow">TIME MACHINE · ADVANCED TECHNIQUES</span><h2>${t('التسيير الثانوي والتوجيه الشمسي والعودة الشمسية','Secondary progressions, Solar Arc & Solar Return')}</h2></div>${tag('TROPICAL','violet')}</div><section class="panel"><h2>${t('أساس الحساب','Calculation basis')}</h2><p>${t('المدخل هو تاريخ آلة الزمن المحدد. اليوم الفلكي الواحد يقابل سنة استوائية (365.2422 يوم) من عمر الشخص. التوجيه الشمسي يضاف إلى درجات الولادة. هذه تقنيات تنجيمية رمزية، مو عبور كواكب حقيقي ولا توقع علمي.','Uses the selected Time Machine instant. One ephemeris day is mapped to a tropical year (365.2422 days) lived. The progressed solar arc is added to natal longitudes. These are symbolic techniques, not live transits or scientific predictions.')}</p><p><b>${t('العمر','Age')}: ${progress.ageYears.toFixed(3)} ${t('سنة','years')}</b> · ${t('تاريخ التسيير','Progressed ephemeris date')}: <b>${dateText(progress.ephemerisTime)}</b></p><p>${t('القوس الشمسي','Solar arc')}: <strong dir="ltr">${arc.toFixed(4)}°</strong></p></section><div class="advanced-grid"><section class="panel"><h2>${t('Secondary Progressions','Secondary Progressions')}</h2><p class="subtle">${t('المواضع محسوبة لوقت التسيير، وليست مواقع اليوم الحقيقي.','Planetary positions for the symbolic progression date, not current transits.')}</p>${table(progressed.points)}</section><section class="panel"><h2>Solar Arc Directions</h2><p class="subtle">${t('مواضع الولادة بعد إضافة القوس الشمسي المحسوب.','Natal longitudes advanced by the calculated solar arc.')}</p>${table(directed)}</section></div><section class="panel"><h2>${t('موعد العودة الشمسية','Exact Solar Return')}</h2>${ret?`<p><small>${t('عودة الشمس قرب ذكرى الميلاد في السنة المحددة','Solar return near the selected year’s birthday')}</small><br><b>${dateText(ret)}</b></p>${nextRet?`<p><small>${t('العودة الشمسية القادمة بعد اللحظة المختارة','Next solar return after the selected moment')}</small><br><b>${dateText(nextRet)}</b></p>`:''}<p class="subtle">${t('وقت رجوع الشمس العابر لنفس الطول الاستوائي لشمس الولادة خلال هذه السنة؛ جرى البحث عن عبور فعلي وصقله عددياً.','Time when the transiting Sun returns to the natal tropical solar longitude in this year, refined from calculated positions.')}</p>`:`<p class="alert">${t('لم يُعثر على عبور دقيق في نافذة البحث.','No exact crossing in the bounded search window.')}</p>`}<div class="button-row"><button class="secondary" data-go="time">${t('ارجع لآلة الزمن','Return to Time Machine')}</button><button class="secondary" data-go="evidence">${t('الدليل الحسابي','Calculation receipt')}</button></div></section>`;
 }catch(e){return `<section class="panel"><h2>${t('الحساب المتقدم غير متاح لهذا الوقت','Advanced calculations unavailable at this date')}</h2><p class="alert">${esc(String(e))}</p></section>`}
}
function mxGoNarrative(domain:GoDomain,state:'go'|'check'|'hold',memo:GoReview){
 const ar:Record<GoDomain,[string,string,string]>={
  work:['حدد أصعب مهمة وأنجزها أولاً؛ خفف الاجتماعات الثانوية.','راجع الأولويات قبل توقيع التزام مهني جديد.','رتّب الملفات والمواعيد واترك القرار الكبير حتى تتضح معلوماته.'],
  social:['ابدأ حديثاً خفيفاً مع شخص تعرفه وشوف إذا الحوار متبادل.','شارك بمناسبة صغيرة من دون توقع رد مثالي من الآخرين.','خلي اللقاءات قليلة ومريحة بدل الإرهاق الاجتماعي.'],
  relationships:['إذا عندك تواصل متبادل، اختر دعوة واضحة ومحترمة.','تأكد من الرغبة المتبادلة قبل اقتراح موعد.','لا تفسر تأخر الرد كإشارة مؤكدة؛ حافظ على حدود الطرفين.'],
  travel:['رتّب مشواراً بسيطاً مع وقت احتياطي وانتباه للطريق.','دقق المواعيد والحجوزات قبل أي تغيير بخطة التنقل.','لا تؤجل احتياطات السلامة؛ اختَر جدولاً أقل ضغطاً.']
 };
 const en:Record<GoDomain,[string,string,string]>={
  work:['Prioritize one demanding task and protect time for it.','Review commitments before accepting another deadline.','Organize the essentials before making a major work commitment.'],
  social:['Start a light conversation and notice whether the exchange is mutual.','Choose a low-pressure meeting without assuming how others will respond.','Choose quieter social plans when you need more room to recharge.'],
  relationships:['Where interest is mutual, suggest a clear, respectful invitation.','Check reciprocal interest before proposing a date.','A slow response proves nothing; respect both people’s boundaries.'],
  travel:['Plan a manageable outing with extra time for delays.','Confirm departure times and reservations before changing plans.','Keep practical safety checks first and reduce schedule pressure.']
 };
 const i=state==='go'?0:state==='check'?1:2,lead=t(ar[domain][i],en[domain][i]);
 const top=memo.strongest;
 if(!top)return t('ماكو عوامل محسوبة كافية لمصادر هذا المؤشر؛ ما نطلع توصية من المتوسط الافتراضي.','The source categories lack calculated evidence; default averages do not justify a recommendation.');
 const factors=memo.supportFactor&&memo.challengeFactor?[memo.supportFactor,memo.challengeFactor]:[top];
 const basis=''; // Exact contacts are available in the calculation-evidence section, never in this decision summary.
 const limit=!memo.complete?t(' بعض مصادر المؤشر غير متاحة.',' Some source categories lack evidence.'):memo.sensitive?t(' الترجيح حساس لاستبعاد جرم واحد.',' The balance is sensitive to removing one transiting body.'):'';
 const story=signalStory({category:evidenceCategory(top),score:50,tier:'C',tone:'neutral',factors:[top]},data?.natal,active.known,lang);
 // The Go card first explains the actual factor in human terms. Mathematical proof remains visible,
 // but a derived index alone must never be mistaken for measured success or another person's desire.
 return lead+' '+(story?story.good+' '+story.action+' ':'')+limit;
}
/** Shared gauge markup for both Go Mode and Travel Mode; colors, spacing
 * and optional calculation details must remain identical by construction. */
function indicatorGaugeCard(m:MetricResult,travelId?:string){
 const label=t(m.ar,m.en);
 return '<div class="metric-card '+(travelId?'mx-travel-metric ':'')+gaugeLevel(m.value)+'" data-indicator-id="'+m.id+'"'+
  (travelId?' data-travel-metric="'+travelId+'"':'')+'>'+
  '<small>'+label+'</small>'+
  '<b>'+m.value+'<em>/100</em></b>'+
  '<div class="meter" role="progressbar" aria-label="'+esc(label)+'" aria-valuemin="1" aria-valuemax="99" aria-valuenow="'+m.value+'"><i style="width:'+m.value+'%"></i></div>'+
  '<details><summary>'+t('طريقة الحساب','Derivation')+'</summary><code>'+esc(m.formula)+'</code></details>'+
  '</div>';
}
function goModePage(){
 const indicators=derivedMetrics(data!.scores),go=goModes(indicators),r=data!,decisions=resolveDecisions(r.evidence,r.signals);
 const names:Record<GoDomain,[string,string]>={work:['العمل','Work'],social:['التواصل الاجتماعي','Social'],relationships:['العلاقات','Relationships'],travel:['السفر','Travel']};
 const gauges=todayQuickGauges(r,true);
 const goCards='<section class="panel mx-go-mode-decisions">'+
  '<div class="go-grid">'+go.map(d=>{const memo=reviewGoMode(d,indicators,decisions),state=memo.state;return '<div class="go-card '+state+' '+gaugeLevel(d.value)+'"><small>GO MODE</small><h3>'+t(...names[d.domain])+'</h3><strong>'+d.value+'<em>/100</em></strong><p class="go-decision">'+mxGoNarrative(d.domain,state,memo)+'</p></div>'}).join('')+'</div>'+
  '</section>';
 const allIndicators='<section class="panel mx-go-mode-indicators"><div class="metrics-grid">'+
  indicators.map(m=>indicatorGaugeCard(m)).join('')+
  '</div></section>';
 return '<div class="mx-go-mode-page" data-section="go">'+gauges+goCards+allIndicators+'</div>';
}
/** Simple glyphs that correspond to the exact travel domains and keep the
 * same single-icon layout as the four quick Go Mode gauges. */
function travelSymbol(id:string){
 const icons:Record<string,string>={
  dating:'♥',newpeople:'✦',social:'☷',attraction:'✧',romance:'♡',chemistry:'◇',
  sexuality:'♥',desire:'✧',nightlife:'☾',travel:'✈',risk:'⚑',sleep:'◔'
 };
 return icons[id]??'✦';
}
/** Travel Mode is a concise Philippines-focused selection of the same live
 * twelve calculated indicators, not a new probability model. */
function travelModePage(){
 const groups=travelMetricsByGroup(derivedMetrics(data!.scores));
 const sections=groups.map(group=>
  '<section class="panel mx-travel-group" data-travel-group="'+group.id+'">'+
  (group.id==='social'?'':'<div class="section-title"><h2>'+t(group.titleAr,group.titleEn)+'</h2>'+tag(group.rows.length+' '+t('مؤشرات','indicators'))+'</div>')+
  '<div class="mx-focus-metrics mx-travel-grid">'+group.rows.map(({id,metric})=>quickGaugeCard(metric,travelSymbol(id),undefined,id)).join('')+'</div></section>'
 ).join('');
 return '<div class="mx-travel-mode-page mx-quick-gauges" data-section="travelmode">'+
  sections+
  '</div>';
}
function asteroidsPage(){
 const count=mountedAsteroidCount(),positions=count?namedAsteroidPositions(asteroidSwissRuntime(),selected):[];
 const map=new Map(positions.map(p=>[p.id,p]));
 const filtered=asteroidCategory==='all'?namedAsteroids:namedAsteroids.filter(a=>a.areas.includes(asteroidCategory as Category));
 const contacts=positions.length?namedAsteroidContacts(positions,targets(data!.natal).filter(p=>active.known||!['Moon','Ascendant','MC'].includes(p.id)),selected):[];
 const activated=new Map<string,typeof contacts[number]>();
 for(const contact of contacts)if(!activated.has(contact.transit.id))activated.set(contact.transit.id,contact);
 return '<div class="section-title"><div><span class="eyebrow">MX ASTRO · ASTEROID STORIES</span><h2>'+t('الكويكبات: شنو تعني إلك؟','Asteroids: what do these themes mean?')+'</h2></div></div>'+
 '<section class="panel asteroid-intro"><h2>'+t('تفسير مختلف لكل كويكب','A unique reading for every asteroid')+'</h2><p>'+t('كل كويكب إله معنى مختلف ونصيحة واقعية بسطرين. التفسير يعتمد على دلالته التقليدية، وإذا انحسب اتصال قريب من خارطتك نذكره بصورة مبسطة. مو قراءة لأفكار الغير، وماكو رقم يضمن وقوع حدث.','Each asteroid has its own short symbolic theme and useful action. If a close birth-chart contact is actually calculated, it is explained in plain language. These are not private thoughts or event predictions.')+'</p><div class="button-row"><button class="primary" id="load-named-asteroids" '+(asteroidLoading?'disabled':'')+'>'+(asteroidLoading?t('جار تحميل الحسابات…','Loading calculations…'):count===56?t('حدّث حسابات الكويكبات','Refresh asteroid calculations'):t('فعّل حساباتي للكويكبات الـ56','Calculate my 56 asteroid positions'))+'</button><button class="secondary" data-go="time">'+t('غيّر وقت القراءة','Change reading time')+'</button></div><small id="asteroid-progress" role="status">'+(asteroidProgress?esc(asteroidProgress):count+' / 56 '+t('مواقع فلكية متاحة للحساب','ephemerides currently loaded'))+'</small>'+(asteroidFailures.length?'<details><summary>'+t('بعض البيانات غير متاحة؛ شوف التفاصيل','Some data is unavailable; see details')+'</summary>'+asteroidFailures.map(x=>'<p>'+esc(x.name)+': '+esc(x.reason)+'</p>').join('')+'</details>':'')+'</section>'+
 '<section class="panel"><div class="section-title"><h2>'+t('المعاني والتأثيرات الرمزية','Symbolic meanings and practical takeaways')+'</h2><label class="heat-label">'+t('اختار المجال','Filter by theme')+' <select id="asteroid-category"><option value="all">'+t('الكل','All')+'</option>'+categories.map(c=>'<option value="'+c+'" '+(asteroidCategory===c?'selected':'')+'>'+cat(c)+'</option>').join('')+'</select></label></div><div class="asteroids-grid reading-asteroids">'+filtered.map(a=>{const point=map.get(a.name),near=activated.get(a.name),r=asteroidReading(a,near,lang==='en');return '<article class="asteroid-item meaning-card"><div class="meaning-head"><h3>'+esc(a.name)+'</h3><span class="'+(near?'reading-active':'reading-neutral')+'">'+(near?t('نشط رمزياً بخارطتك','Close natal contact'):t('معنى رمزي','Symbolic theme'))+'</span></div><p>'+esc(r.theme)+'</p><p class="advice-action">'+esc(r.action)+'</p>'+(near?'<details><summary>'+t('أساس القراءة','Reading basis')+'</summary><small>'+esc(r.emphasis)+'</small></details>':'')+(point?'<details><summary>'+t('الموضع المحسوب','Actual ephemeris position')+'</summary><small>MPC '+a.number+' · '+signName(point.longitude)+' · '+(point.longitude%30).toFixed(3)+'°</small></details>':'')+'</article>'}).join('')+'</div></section>'+
 (contacts.length?'<details class="panel asteroid-technical"><summary>'+t('الاتصالات المحسوبة مع خارطة الميلاد (للتدقيق فقط)','Calculated natal aspects (advanced details)')+' · '+contacts.length+'</summary><div class="eclipse-contacts">'+contacts.slice(0,60).map(e=>'<span><b>'+esc(e.transit.id)+' → '+esc(planet(e.natal.id))+'</b> '+aspect(e.angle)+' · '+e.orb.toFixed(2)+'°</span>').join('')+'</div></details>':'');
}
const eclipseCountryNames=new Map<string,string>();
const eclipseCountryPending=new Set<string>();
/** Look up a land country for the greatest-solar-eclipse point. No country is invented for ocean points. */
function refreshEclipseCountryNames(){
 if(screen!=='eclipses')return;
 root.querySelectorAll<HTMLElement>('[data-eclipse-geo]').forEach(node=>{
  const coords=node.dataset.eclipseGeo!,parts=coords.split(',').map(Number);
  if(parts.length!==2||!parts.every(Number.isFinite))return;
  const key=(lang==='ar'?'ar':'en')+':'+coords;
  const cached=eclipseCountryNames.get(key);
  if(cached!==undefined){if(cached)node.textContent=cached;return}
  if(eclipseCountryPending.has(key))return;
  eclipseCountryPending.add(key);
  const url='https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=3&addressdetails=1&lat='+encodeURIComponent(parts[0])+'&lon='+encodeURIComponent(parts[1])+'&accept-language='+(lang==='ar'?'ar':'en');
  fetch(url,{signal:AbortSignal.timeout(9000)}).then(r=>r.ok?r.json():null).then(result=>{
   const address=result?.address;
   const country=typeof address?.country==='string'?address.country:typeof address?.ocean==='string'?address.ocean:typeof address?.sea==='string'?address.sea:'';
   // Cache empty / ocean and failed responses too: never flood a public geocoder.
   eclipseCountryNames.set(key,country);
   if(country)root.querySelectorAll<HTMLElement>('[data-eclipse-geo]').forEach(el=>{if(el.dataset.eclipseGeo===coords)el.textContent=country});
  }).catch(()=>{eclipseCountryNames.set(key,'')}).finally(()=>{eclipseCountryPending.delete(key)});
 });
}
function eclipsesPage(){
 try{
  const eclipses=getRealEclipses();
  const kind=(e:ConfirmedEclipse)=>e.kind==='solar'?t('كسوف الشمس','Solar eclipse'):t('خسوف القمر','Lunar eclipse');
  const subtype=(e:ConfirmedEclipse)=>({total:t('كلي','Total'),annular:t('حلقي','Annular'),hybrid:t('هجين','Hybrid'),partial:t('جزئي','Partial'),penumbral:t('شبه الظل','Penumbral'),unknown:t('غير محدد','Unclassified')} as Record<string,string>)[e.type];
  const time=(at:Date)=>dateText(at,{weekday:'short',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const stage=(label:string,at:Date|null)=>'<div class="eclipse-stage '+(at?'':'not-available')+'"><small>'+label+'</small>'+(at?'<time datetime="'+at.toISOString()+'">'+time(at)+'</time>':'<span>—</span>')+'</div>';
  const countdown=(e:ConfirmedEclipse)=>{
   const parts=eclipseCountdownParts(Date.now(),+e.maximum);
   const fields=([['months',t('شهر','MONTHS')],['days',t('يوم','DAYS')],['hours',t('ساعة','HOURS')],['minutes',t('دقيقة','MINUTES')],['seconds',t('ثانية','SECONDS')]] as const);
   return '<div class="eclipse-countdown" data-eclipse-to="'+(+e.maximum)+'" role="timer" aria-label="'+t('المتبقي حتى ذروة الكسوف أو الخسوف','Time until eclipse maximum')+'"><div class="eclipse-countdown-heading"><span class="eclipse-countdown-dot" aria-hidden="true"></span>'+t('المتبقي حتى الذروة','COUNTDOWN TO MAXIMUM')+'</div><div class="eclipse-countdown-grid">'+fields.map(([unit,label])=>'<div class="eclipse-countdown-unit"><span class="eclipse-countdown-number" data-eclipse-unit="'+unit+'">'+String(parts[unit]).padStart(2,'0')+'</span><small>'+label+'</small></div>').join('')+'</div></div>';
  };
  return '<div class="confirmed-eclipses eclipse-premium-grid">'+eclipses.map((e,i)=>{
    const solar=e.kind==='solar';
    const status=eclipseEventPhase(e,Date.now()),bounds=eclipseEventBounds(e);
    const place=solar
     ?e.globalCoordinates
      ?'<div class="eclipse-geography"><span>'+t('موقع أعظم الكسوف عالمياً','Greatest global solar eclipse point')+'</span><strong data-eclipse-geo="'+e.globalCoordinates.lat.toFixed(4)+','+e.globalCoordinates.lon.toFixed(4)+'">'+e.globalCoordinates.lat.toFixed(2)+'°, '+e.globalCoordinates.lon.toFixed(2)+'°</strong><small>'+t('الدولة إذا كانت نقطة الذروة على اليابسة؛ وقد تكون فوق البحر','Country if the maximum falls on land; it may be over the ocean')+'</small></div>'
      :'<div class="eclipse-geography"><span>'+t('موقع أعظم الكسوف','Greatest-eclipse location')+'</span><strong>'+t('الموقع غير متاح حسابياً','Location is unavailable')+'</strong></div>'
     :(()=>{
      const moon=sunMoonState(e.maximum);
      const countries=lunarViewingCountries(e.maximum,moon.moonLongitude,moon.moonLatitude);
      return '<div class="eclipse-geography"><span>'+t('دول يكون القمر مرتفعاً فيها وقت الذروة','Sample countries with high Moon elevation at maximum')+'</span><strong>'+esc(countries.map(c=>lang==='ar'?c.ar:c.en).join(' · ')||t('مناطق الرؤية غير متاحة','Viewing regions unavailable'))+'</strong><small>'+t('الرؤية تمتد إلى بلدان أكثر؛ مو دولة واحدة فقط، وتعتمد على الجو والأفق','The eclipse spans more countries; visibility also depends on weather and horizon')+'</small></div>';
     })();
    return '<section class="panel eclipse-premium '+(solar?'eclipse-solar':'eclipse-lunar')+' eclipse-'+status+'" data-eclipse-start="'+bounds.start+'" data-eclipse-end="'+bounds.end+'"><div class="eclipse-premium-head"><div class="eclipse-icon-art '+(solar?'sun':'moon')+'">'+(solar?'<svg viewBox="0 0 80 80"><defs><radialGradient id="sunflare"><stop stop-color="#ffdba1"/><stop offset="1" stop-color="#bc773c"/></radialGradient></defs><circle cx="40" cy="40" r="29" fill="url(#sunflare)" opacity=".2"/><circle cx="40" cy="40" r="18" fill="#f3be74"/><circle cx="44" cy="38" r="17" fill="#1e2239"/></svg>':'<svg viewBox="0 0 80 80"><defs><linearGradient id="moonshade"><stop stop-color="#d7c2fa"/><stop offset="1" stop-color="#7460a8"/></linearGradient></defs><circle cx="40" cy="40" r="24" fill="url(#moonshade)"/><circle cx="47" cy="37" r="23" fill="#181f39" opacity=".7"/></svg>')+'</div><div><span class="eyebrow">'+(solar?'SOLAR ECLIPSE':'LUNAR ECLIPSE')+'</span><h2>'+kind(e)+'</h2></div><span class="eclipse-type">'+subtype(e)+'</span></div>'+place+'<div class="eclipse-maximum"><span>'+t('وقت الذروة','GLOBAL MAXIMUM')+'</span><time datetime="'+e.maximum.toISOString()+'">'+time(e.maximum)+'</time><small>'+esc(active.zone)+'</small></div>'+countdown(e)+'<div class="eclipse-live-countdown" data-eclipse-end-timer="'+bounds.end+'" role="timer" aria-label="'+t('الوقت الباقي لنهاية الحدث','Time until the eclipse ends')+'"><div class="eclipse-live-title">'+t('الحدث جارٍ الآن · الوقت المتبقي للنهاية','LIVE ECLIPSE · TIME UNTIL END')+'</div><div class="eclipse-live-grid">'+([['hours',t('ساعة','HOURS')],['minutes',t('دقيقة','MINUTES')],['seconds',t('ثانية','SECONDS')]] as const).map(([unit,label])=>'<div class="eclipse-live-unit"><span data-live-unit="'+unit+'">00</span><small>'+label+'</small></div>').join('')+'</div></div>'+ '<p class="eclipse-narrative">'+(solar?t('بكسوف الشمس يمر القمر بين الأرض والشمس. رمزياً بالتنجيم ممكن تستعمل هالمرحلة حتى تراجع اتجاهك أو بداية مشروع، لكن ما نعتبرها دليلاً على حدث شخصي مؤكد. لا تنظر للشمس من دون نظارات كسوف معتمدة.','In a solar eclipse, the Moon passes between Earth and Sun. In astrology it can prompt reflection on new directions, but does not predict a personal event. Never observe the Sun without certified eclipse viewers.'):t('بخسوف القمر يمر القمر بظل الأرض. بالتفسير الرمزي ممكن يكون مناسبة لمراجعة موقف عاطفي أو قرار مؤجل، مو دليل أن علاقة راح تنتهي أو شخص راح يرجع. الرؤية تعتمد على مدينتك ووجود القمر فوق الأفق.','In a lunar eclipse, the Moon crosses Earth’s shadow. Its traditional symbolism offers a reason to reflect on feelings or delayed decisions, not a prediction of a breakup or someone’s return. Visibility depends on your location and whether the Moon is above the horizon.'))+'</p><details class="eclipse-steps"><summary>'+t('أوقات بداية ونهاية المراحل','Start and end of eclipse phases')+' ▿</summary><div class="eclipse-phase-grid">'+stage(t('بداية الحدث','First contact'),e.contacts.first)+stage(t('بداية المرحلة الوسطى','Second contact'),e.contacts.second)+stage(t('نهاية المرحلة الوسطى','Third contact'),e.contacts.third)+stage(t('نهاية الحدث','Last contact'),e.contacts.fourth)+'</div></details><button class="secondary eclipse-open-time" data-eclipse-at="'+(+e.maximum)+'">'+t('افتح الذروة في آلة الزمن','Explore this moment in Time Machine')+' →</button></section>'
   }).join('')+'</div>'+
   '<div class="eclipse-actions"><button id="check-local-eclipses" class="secondary">'+t('تحقق من رؤية المدينة المحفوظة','Check visibility from saved city')+'</button></div>'+
   '<details class="panel eclipse-secondary"><summary>'+t('الفحص الأولي للمحاق والبدر وقرب العقدة','Preliminary new/full Moon node scan')+'</summary>'+lunarPhaseScreen()+'</details>';
 }catch(e){return '<section class="panel"><h2>'+t('تعذر حساب الكسوف والخسوف','Eclipse calculation unavailable')+'</h2><p class="alert">'+esc(String(e))+'</p></section>'}
}
function lunarPhaseScreen(){
 try{
  const items=getLunations(),near=items.filter(x=>x.nearNode);
  return `<div class="section-title"><div><span class="eyebrow">LUNATION ROOT SCAN · 90 DAYS</span><h2>${t('المحاق والبدر وفحص مواسم الكسوف','New & full Moon: eclipse-season screening')}</h2></div>${tag(t('حساب أولي فقط','Preliminary screening'),'violet')}</div><section class="panel"><h2>${t('شنو يحسب المحرك؟','What the engine calculates')}</h2><p>${t('يحسب وقت اقتران الشمس والقمر (المحاق) أو مقابلتهما (البدر) من Swiss Ephemeris، ويفحص عرض القمر الكسوفي وقتها. إذا العرض 2° أو أقل نعلّم الموعد قريب من مستوى العقدة، مو نؤكد حدوث كسوف أو خسوف.','Computes geocentric tropical Sun–Moon conjunction (new Moon) and opposition (full Moon) from Swiss Ephemeris, then samples lunar ecliptic latitude. Values within ±2° are flagged as near-node lunations, NOT confirmed eclipses.')}</p><p class="subtle">${t('هاي معلومات عن المحاق والبدر وقرب العقدة فقط، مستقلة عن حساب الكسوف المؤكد المعروض فوق.','This is only phase and node-proximity screening, separate from the verified eclipse calculations above.')}</p><div class="receipt">${tag(items.length+' '+t('اقترانات ومقابلات','lunations'))}${tag(near.length+' '+t('قريبة من العقدة للفحص','near-node candidates'))}</div></section><section class="panel"><h2>${t('التواريخ القادمة خلال 90 يوم','Upcoming 90-day phase events')}</h2><div class="lunation-events">${items.length?items.map(e=>`<div class="lunation-item"><div><b>${e.phase==='new'?t('☀ محاق · اقتران','☀ New Moon · conjunction'):t('☾ بدر · مقابلة','☾ Full Moon · opposition')}</b><p>${dateText(e.at)}</p><small>${t('عرض القمر الكسوفي','Moon ecliptic latitude')}: ${e.moonLatitude.toFixed(3)}° · ${e.nearNode?t('قريب من العقدة (ليس كسوفاً مؤكداً)','Near node (NOT a confirmed eclipse)'):t('بعيد نسبياً عن العقدة','Not near node by this screening')}</small></div><button class="secondary" data-lunation-at="${+e.at}">${t('افتح اللحظة','Inspect moment')} ↗</button></div>`).join(''):`<p>${t('لا توجد لحظات محاق أو بدر ضمن النافذة المختارة.','No new/full Moon roots found in the selected window.')}</p>`}</div></section>`;
 }catch(e){return `<section class="panel"><h2>${t('تعذر فحص المحاق والبدر','Lunation scan unavailable')}</h2><p class="alert">${esc(String(e))}</p></section>`}
}

/** Today is in the active profile's time zone, not UTC or the PC's arbitrary locale. */
function astroCalendarToday(){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:active.zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const number=(type:string)=>parts.find(p=>p.type===type)?.value??'';
 return number('year')+'-'+number('month')+'-'+number('day');
}
function initializeAstroCalendar(){
 const today=astroCalendarToday(),version=JSON.stringify([active,today]);
 if(version===calendarVersion)return;
 calendarVersion=version;calendarAnchor=today;calendarDays=astroCalendarDays(today);
 calendarSnapshots.clear();calendarFailures.clear();calendarNatal=null;calendarCursor=0;calendarGeneration++;calendarRunning=false;calendarSelected=today;
}
function astroCalendarDetail(iso:string){
 const snap=calendarSnapshots.get(iso);
 if(calendarFailures.has(iso))return '<p class="alert">'+t('حساب هذا اليوم غير متاح: ','Calculation unavailable for this day: ')+esc(calendarFailures.get(iso))+'</p>';
 if(!snap)return '<div class="astro-day-compact-empty"><b>'+esc(iso)+'</b><span>'+t('دا تنحسب مواضع هذا اليوم…','Calculating this day…')+'</span></div>';
 const {value,color,at}=snap;
 const date=new Intl.DateTimeFormat('en-US',{timeZone:active.zone,weekday:'short',day:'numeric',month:'short',year:'numeric',numberingSystem:'latn'}).format(at);
 const grade=color==='green'?t('مرتفع','High'):color==='yellow'?t('متوسط','Moderate'):t('منخفض','Low');
 const factor=(e:typeof snap.strongestSupport,kind:'good'|'check',hour:number|null)=>e?
  '<span class="astro-compact-aspect '+kind+'"><span>'+(kind==='good'?t('✦ داعمة','✦ Favorable'):t('◇ متحدية','◇ Challenging'))+'</span><b>'+esc(planet(e.transit.id))+' '+aspect(e.angle)+' '+esc(planet(e.natal.id))+'</b><small dir="ltr">'+e.orb.toFixed(2)+'° · '+String(hour??12).padStart(2,'0')+':00</small></span>':'';
 const contacts=factor(snap.strongestSupport,'good',snap.strongestSupportHour)+factor(snap.strongestChallenge,'check',snap.strongestChallengeHour);
 const theme=(e:typeof snap.strongestSupport):string=>{
  if(!e)return '';
  const topics:Record<string,[string,string]>={
   Sun:['ثقتك بنفسك وقراراتك','identity and priorities'],
   Moon:['راحتك وردّة فعلك','comfort and emotional reactions'],
   Mercury:['الحچي والرسائل والتفاهم','conversation and communication'],
   Venus:['التقارب والتقدير','affection and values'],
   Mars:['المبادرة والجهد','initiative and effort'],
   Jupiter:['التوسع وتعلّم الجديد','learning and expansion'],
   Saturn:['المسؤولية والالتزام','responsibility and commitments'],
   Uranus:['التغيير والتجربة','change and experimentation'],
   Neptune:['التوقعات والوضوح','expectations and clarity'],
   Pluto:['الحدود والتغيير العميق','boundaries and deliberate change']
  };
  const topic=topics[e.natal.id]??['أولوياتك','personal priorities'];
  return lang==='ar'?topic[0]:topic[1];
 };
 const easier=theme(snap.strongestSupport),challenging=theme(snap.strongestChallenge);
 const dayMeaning=easier&&challenging?
  t('بموضوع '+easier+' عندك مجال للتعامل بهدوء وبخطوة واضحة، لكن '+challenging+' يحتاج مراجعة التفاصيل قبل الحسم. مثال: إذا تنتظر جواب أو قرار، جهّز البديل وتأكد من المعطيات بدل الاستعجال.',
    'The sky samples emphasize '+easier+' as an easier symbolic theme, while '+challenging+' calls for care. Real actions matter more than the color.'):
  easier?t('الجانب الأبرز رمزياً يخص '+easier+'. جرّب خطوة صغيرة وقيّم نتيجتها بالواقع.','The strongest symbolic theme involves '+easier+'. Try a small step and evaluate the result in real life.'):
  challenging?t('الحساب يركز على '+challenging+'. راجع التفاصيل؛ هذا مو معناه اليوم كله سيّئ.','The chart highlights '+challenging+'. Review the details; this does not make the whole day bad.'):
  t('ماكو اتصال قوي يبرر قصة شخصية لهاليوم، والرقم وحده ما يخبرك شنو راح يصير.','No strong aspect justifies a personal story; the index alone cannot predict what will happen.');
 return '<div class="astro-day-compact-head"><div class="astro-day-compact-title"><span class="astro-day-kicker">'+t('مؤشر رمزي · 3 أوقات','Symbolic index · 3 checkpoints')+'</span><h3 dir="ltr">'+esc(date)+'</h3><small>'+t('خلاصة مبنية على ثلاث مراجعات للوقت المختار','Summary based on three checkpoints during the selected day')+'</small></div><div class="astro-day-main-score astro-'+color+'"><b>'+value+'<small>/100</small></b><span>'+grade+'</span></div></div>'+
  '<p class="astro-day-context">'+esc(dayMeaning)+'</p><details class="astro-day-compact-aspects"><summary>'+t('التفاصيل الحسابية','Calculation details')+'</summary>'+(contacts||'<span class="astro-compact-no-aspect">'+t('ماكو عامل قريب مهيمن بهالوقت.','No dominant nearby factor.')+'</span>')+'</details>'+
  '<div class="astro-day-compact-footer"><small>'+t('الفحص: 04 / 12 / 20 · المدى ','Checks: 04 / 12 / 20 · range ')+snap.minimum+'–'+snap.maximum+' · '+t('مؤشر رمزي مو تنبؤ','Symbolic index, not a forecast')+'</small><button type="button" class="secondary astro-day-open-time" data-calendar-open="'+(+at)+'">'+t('لقطة الظهر بآلة الزمن','Noon snapshot in Time Machine')+' ↗</button></div>';
}
function calendarColorLabel(color:AstroCalendarRating['color']){
 return color==='green'?t('مرتفع · 71–99','High · 71–99'):color==='yellow'?t('متوسط · 31–70','Moderate · 31–70'):t('منخفض · 1–30','Low · 1–30');
}
function astroCalendarPage(){
 initializeAstroCalendar();
 const months=new Map<string,AstroCalendarDay[]>();
 for(const day of calendarDays){const items=months.get(day.monthKey)??[];items.push(day);months.set(day.monthKey,items)}
 const weekdays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
 const legend=(color:AstroCalendarRating['color'])=>'<span class="astro-legend-item"><i class="astro-legend-dot astro-'+color+'"></i>'+calendarColorLabel(color)+'</span>';
 const header='<div class="astro-cal-toolbar"><div class="astro-cal-toolbar-left"><span class="astro-eyebrow">☽  CELESTIAL INDEX</span><div class="astro-legend">'+(['green','yellow','red'] as const).map(legend).join('')+'</div></div><div class="astro-cal-meta"><span>✦ '+calendarDays.length+' DAYS</span><span>◷ '+esc(active.zone)+'</span><span id="astro-calendar-progress" role="status">'+calendarSnapshots.size+'/'+calendarTargetDays()+' '+t('محسوب فعلياً','verified')+'</span></div></div>';
 const groups=[...months.entries()].map(([key,days])=>{
  const initial=days[0],title=new Intl.DateTimeFormat('en-US',{timeZone:'UTC',month:'long',year:'numeric',numberingSystem:'latn'}).format(new Date(Date.UTC(initial.year,initial.month-1,1)));
  const blanks=Array.from({length:initial.weekday},()=>'<span class="astro-cal-blank" aria-hidden="true"></span>').join('');
  return '<section class="astro-cal-month panel"><div class="astro-cal-month-head"><span>✦</span><h3>'+esc(title)+'</h3><small>'+String(initial.month).padStart(2,'0')+'/'+initial.year+'</small></div><div class="astro-cal-weekdays">'+weekdays.map(x=>'<span>'+x+'</span>').join('')+'</div><div class="astro-cal-days">'+blanks+days.map(d=>{
   const v=calendarSnapshots.get(d.iso),color=v?.color??(calendarFailures.has(d.iso)?'unavailable':'pending'),selected=d.iso===calendarSelected,today=d.iso===calendarAnchor;
   const text=v?calendarColorLabel(v.color):calendarFailures.has(d.iso)?t('حساب غير متاح','Calculation unavailable'):t('قيد الحساب','Calculating');
   return '<button class="astro-cal-day astro-'+color+(selected?' is-selected':'')+(today?' is-today':'')+'" type="button" data-calendar-date="'+d.iso+'" aria-pressed="'+(selected?'true':'false')+'" aria-label="'+d.iso+' · '+text+(v?' · '+v.value+'/100':'')+'" title="'+text+'"><span class="astro-cal-number">'+d.day+'</span><small class="astro-cal-index">'+(v?v.value:'·')+'</small></button>'
  }).join('')+'</div></section>';
 }).join('');
 return header+'<section class="panel astro-calendar-detail" id="astro-calendar-detail" aria-live="polite">'+astroCalendarDetail(calendarSelected)+'</section><div class="astro-cal-months">'+groups+'</div>';
}
/** Incrementally calculate three verified local-time checkpoints per day. DOM cells are patched
 * in place, so chart navigation, scrolling and month positions are not reset. */
function calendarTargetDays():number{
 if(uiMode==='pro'||calendarExpanded)return calendarDays.length;
 const first=calendarDays[0]?.monthKey;
 if(!first)return 0;
 let second='';
 for(let i=0;i<calendarDays.length;i++){
  if(calendarDays[i].monthKey===first)continue;
  if(!second)second=calendarDays[i].monthKey;
  if(calendarDays[i].monthKey!==second)return i;
 }
 return calendarDays.length;
}
function startCalendarWork(){
 if(calendarRunning||!ready||screen!=='calendar'||!calendarDays.length||calendarCursor>=calendarTargetDays())return;
 calendarRunning=true;
 const generation=calendarGeneration;
 const tick=()=>{
  if(generation!==calendarGeneration)return;
  if(screen!=='calendar'||document.visibilityState==='hidden'){calendarRunning=false;return}
  const limit=Math.min(calendarTargetDays(),calendarCursor+2);
  for(;calendarCursor<limit;calendarCursor++){
   const day=calendarDays[calendarCursor];
   try{
    const at=zonedInstant(day.iso+'T12:00',active.zone);
    const natal=calendarNatal??(calendarNatal=chart(birthInstant(active),active));
    const samples=CALENDAR_SAMPLE_HOURS.map(hour=>{
     const label=day.iso+'T'+String(hour).padStart(2,'0')+':00';
     const sampledAt=hour===12?at:zonedInstant(label,active.zone);
     if(localValue(sampledAt,active.zone).slice(0,16)!==label)throw Error('Local astronomical sample differs from expected time: '+label);
     const current=chart(sampledAt,active,false,false);
     return {hour,evidence:calendarMomentEvidence(current,natal,sampledAt,active.known)};
    });
    const rating=calendarDaySynthesis(samples);
    calendarSnapshots.set(day.iso,{...rating,at});
    const el=root.querySelector<HTMLButtonElement>('[data-calendar-date="'+day.iso+'"]');
    if(el){
     el.classList.remove('astro-pending');
     el.classList.add('astro-'+rating.color);
     el.setAttribute('aria-label',day.iso+' · '+calendarColorLabel(rating.color)+' · '+rating.value+'/100 · '+t('المدى اليومي','day range')+' '+rating.minimum+'–'+rating.maximum);
     el.title=calendarColorLabel(rating.color)+' · '+rating.value+'/100 · '+rating.minimum+'–'+rating.maximum;
     const index=el.querySelector('.astro-cal-index');if(index)index.textContent=String(rating.value);
    }
    if(calendarSelected===day.iso){const area=root.querySelector<HTMLElement>('#astro-calendar-detail');if(area)area.innerHTML=astroCalendarDetail(day.iso);bindCalendarDayButtons()}
   }catch(e){const message=String(e);calendarFailures.set(day.iso,message);const cell=root.querySelector<HTMLButtonElement>('[data-calendar-date="'+day.iso+'"]');if(cell){cell.classList.remove('astro-pending');cell.classList.add('astro-unavailable');cell.title=t('حساب غير متاح: ','Calculation unavailable: ')+message;cell.setAttribute('aria-label',day.iso+' · '+cell.title)}if(calendarSelected===day.iso){const area=root.querySelector<HTMLElement>('#astro-calendar-detail');if(area)area.innerHTML='<p class="alert">'+t('تعذر تدقيق حساب هذا اليوم. لا نعرض لوناً مختلقاً. ','This day could not be verified, so no invented fortune color is shown. ')+esc(message)+'</p>'}console.warn('Daily ephemeris unavailable',day.iso,e)}
  }
  const progress=root.querySelector('#astro-calendar-progress');
  if(progress)progress.textContent=calendarSnapshots.size+'/'+calendarTargetDays()+' '+t('محسوب فعلياً','verified')+(calendarFailures.size?' · '+calendarFailures.size+' '+t('غير متاح','unavailable'):'');
  if(calendarCursor<calendarTargetDays())setTimeout(tick,20);
  else calendarRunning=false;
 };
 setTimeout(tick,10);
}
function bindCalendarDayButtons(){
 root.querySelectorAll<HTMLButtonElement>('[data-calendar-open]').forEach(btn=>btn.onclick=()=>{
  const at=new Date(Number(btn.dataset.calendarOpen));
  navigate('time');updateTime(at);
 });
}
function bindAstroCalendar(){
 root.querySelectorAll<HTMLButtonElement>('[data-calendar-date]').forEach(button=>button.onclick=()=>{
  calendarSelected=button.dataset.calendarDate!;
  root.querySelectorAll<HTMLElement>('[data-calendar-date]').forEach(cell=>{
   cell.classList.toggle('is-selected',cell.dataset.calendarDate===calendarSelected);
   cell.setAttribute('aria-pressed',String(cell.dataset.calendarDate===calendarSelected));
  });
  const details=root.querySelector<HTMLElement>('#astro-calendar-detail');
  if(details){details.innerHTML=astroCalendarDetail(calendarSelected);bindCalendarDayButtons();details.scrollIntoView({behavior:'smooth',block:'nearest'})}
 });
 bindCalendarDayButtons();
}

function moonAspectNarrative(event:LunarWindow['events'][number]){
 const topics:Record<string,[string,string,string,string]>={
  Sun:['قرار يخص ثقتك بنفسك','a decision about identity','إذا محتار، وضّح أولويتك قبل الجواب.','If unsure, clarify your priority before responding.'],
  Mercury:['حوار أو خبر يحتاج فهم','a conversation needing clarity','إذا الكلام مبهم، اسأل بدل ما تفترض.','If wording is vague, ask instead of assuming.'],
  Venus:['التقارب والتقدير','affection and appreciation','خلي الاهتمام واضح وخفيف وشوف الرد الحقيقي.','Express interest gently and assess the real response.'],
  Mars:['المبادرة وردّة الفعل','initiative and reactions','اختار فعل محسوب بدل رد قد تندم عليه.','Choose a measured step instead of reacting impulsively.'],
  Jupiter:['التوسع والتعلم','growth and learning','راجع التفاصيل قبل الوعد بشي أكبر.','Check the details before making big commitments.'],
  Saturn:['الالتزام والمسؤولية','commitment and responsibilities','حدد حدودك والمطلوب منك قبل الموافقة.','Define your limits and the task before agreeing.']
 };
 const item=topics[event.target]??['موضوع يحتاج انتباه','a topic worth attention','خلّي الواقع هو المعيار.','Use reality as the yardstick.'];
 const tension=event.angle===90||event.angle===180;
 return t('اليوم راقب '+item[0]+'. '+(tension?'قد تتزاحم عندك أولويتان؛ لا تحسم وأنت مستعجل. ':'تگدر تتعامل وياه بخطوة هادئة. ')+item[2],
  'Pay attention to '+item[1]+'. '+(tension?'Two priorities may pull against each other; avoid rushing. ':'A measured approach may help. ')+item[3]);
}
function moonMomentNarrative(window:LunarWindow){
 const future=window.events.find(e=>+e.time>+selected);
 if(window.isVoid)return t('خلّي هالفترة للأعمال البسيطة ومراجعة التفاصيل إذا يفيدك. ما معناها أن اليوم سيّئ، ولا تحدد مصير أي قرار.','Use this interval for routine tasks and reviewing details; it does not make the day bad or determine your decisions.');
 return future?moonAspectNarrative(future):
  t('ماكو موضوع إضافي قوي بهالوقت حتى ننسب إله حدث من خيالنا. اعتمد على الوقائع قبل أي قرار.','No additional strong theme stands out. Use actual circumstances when deciding.');
}

function moonSignLiveHtml(sign:number,r:Report):string{
 const lines=moonHumanReading(sign,r,active.known,lang);
 return lines.map((line,i)=>'<p class="mx-moon-sign-line'+(i===4?' mx-moon-personal':'')+'"><span aria-hidden="true">'+(i===4?'✧':'◦')+'</span>'+esc(line)+'</p>').join('');
}
function updateLiveMoonSign(now:number){
 if(screen!=='lunar'||liveTimePinned||document.visibilityState==='hidden')return;
 const minute=Math.floor(now/60000);
 if(minute===moonNarrativeLastMinute)return;
 moonNarrativeLastMinute=minute;
 const at=new Date(now),r=getReport(at),moon=r.current.points.find(pt=>pt.id==='Moon');
 if(!moon)return;
 const sign=Math.floor((((moon.longitude%360)+360)%360)/30);
 const box=root.querySelector<HTMLElement>('#mx-moon-sign-reading');
 if(!box||Number(box.dataset.moonSign)!==sign){selected=at;recalculate();refreshLiveBody(now);return}
 const html=moonSignLiveHtml(sign,r);
 if(box.innerHTML!==html)box.innerHTML=html;
}

function lunarUiIcon(type:'moon'|'void'|'entered'|'next'|'voc-start'|'voc-end'){
 const paths={
  moon:'<path d="M20.5 14A8.5 8.5 0 0 1 9.7 3.2 8.5 8.5 0 1 0 20.5 14Z"/><path d="M18 3.5v5m-2.5-2.5h5" stroke-width="1.3"/>',
  void:'<circle cx="12" cy="12" r="7.4" stroke-dasharray="1.2 3.2"/><circle cx="12" cy="12" r="2.1"/>',
  entered:'<circle cx="12" cy="12" r="7.5"/><path d="m8.5 12 2.5 2.5 5-5"/>',
  next:'<circle cx="12" cy="12" r="7.5"/><path d="m9 14 5-5m-4.2 0H14v4.2"/>',
  'voc-start':'<circle cx="12" cy="12" r="7.5" stroke-dasharray="3 3"/><path d="M12 7.5v5l3 2"/>',
  'voc-end':'<path d="M5 12a7 7 0 0 1 12-4m2 4a7 7 0 0 1-12 4"/><path d="m15 5 2 3-3 1m-5 10-2-3 3-1"/>'
 };
 return '<svg class="mx-lunar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">'+paths[type]+'</svg>';
}

/** Ring data is derived exclusively from computed Moon timing boundaries. */
function lunarGaugeMarkup(kind:'moon'|'voc',start:Date,end:Date,signStart:Date=start){
 const label=kind==='moon'?t('المتبقي حتى البرج القادم','Until next sign'):t('المتبقي حتى بداية خلو المسار','Until VOC begins');
 return '<div class="mx-lunar-gauge" data-lunar-gauge="'+kind+'" data-gauge-start="'+(+start)+'" data-gauge-end="'+(+end)+'" data-gauge-sign-start="'+(+signStart)+'">'+
  '<div class="mx-lunar-gauge-ring" role="progressbar" aria-label="'+esc(label)+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">'+
  '<svg viewBox="0 0 76 76" aria-hidden="true" focusable="false"><circle class="mx-lunar-gauge-track" cx="38" cy="38" r="30"/><circle class="mx-lunar-gauge-progress" cx="38" cy="38" r="30"/></svg><strong data-gauge-percent>—</strong></div>'+
  '<div class="mx-lunar-gauge-copy"><span data-gauge-label>'+label+'</span><strong data-gauge-time>—</strong></div></div>';
}
function lunarPage(){
 try{
  const w=moonWindow(),last=w.lastAspect,when=w.isVoid?w.ingressAt:w.vocStartsAt;
  const date=(at:Date)=>dateText(at,{weekday:'short',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const tile=(label:string,at:Date,cls:string,symbol:'entered'|'next'|'voc-start'|'voc-end')=>'<div class="premium-time-tile '+cls+'"><div class="time-tile-top"><span class="mx-lunar-tile-icon">'+lunarUiIcon(symbol)+'</span><small>'+label+'</small></div><time datetime="'+at.toISOString()+'">'+date(at)+'</time><span class="time-tile-zone">'+esc(active.zone)+'</span></div>';
  const lastLabel=last?moonAspectNarrative(last):t('ماكو موضوع إضافي مهيمن بهالفترة.','No additional dominant theme in this interval.');
  return '<div class="lunar-premium-grid"><section class="panel lunar-premium-card"><div class="lunar-card-heading"><span class="lunar-emblem" aria-hidden="true">'+lunarUiIcon('moon')+'</span><div><small>'+t('موقع القمر الحالي · بث حي','CURRENT MOON SIGN · LIVE')+'</small><h2>'+signName(w.sign*30)+'</h2></div></div>'+lunarGaugeMarkup('moon',w.enteredAt,w.ingressAt)+'<div class="mx-moon-sign-reading" id="mx-moon-sign-reading" data-moon-sign="'+w.sign+'">'+moonSignLiveHtml(w.sign,data!)+'</div><div class="premium-time-pair">'+tile(t('دخل البرج الحالي','Entered current sign'),w.enteredAt,'lunar-muted','entered')+tile(t('يدخل البرج القادم','Next sign ingress'),w.ingressAt,'lunar-teal','next')+'</div></section>'+
   '<section class="panel lunar-premium-card mx-voc-status '+(w.isVoid?'is-voc':'is-clear')+'" data-voc-start="'+(+w.vocStartsAt)+'" data-voc-end="'+(+w.ingressAt)+'"><div class="lunar-card-heading"><span class="lunar-emblem violet" aria-hidden="true">'+lunarUiIcon('void')+'</span><div><small>VOID OF COURSE</small><h2>'+ (w.isVoid?t('القمر خالي المسار الآن','Moon is void-of-course'):t('القمر ماشي عدل','Moon is on course'))+'</h2></div><span class="lunar-state">'+(w.isVoid?t('فعّال','Active'):t('غير فعّال','Not active'))+'</span></div><div class="mx-lunar-live-row"><span class="mx-lunar-live-indicator"><i></i>'+(liveTimePinned?t('وقت مختار','SELECTED TIME'):'LIVE')+'</span><span class="mx-lunar-countdown" data-voc-countdown></span></div>'+lunarGaugeMarkup('voc',w.vocStartsAt,w.ingressAt,w.enteredAt)+'<p>'+t('إذا عندك قرار مهم، راجع ظروفه ومعلوماته الفعلية. التوقيت يساعدك ترتب، مو يقرر عنك.','For important decisions, check the actual facts first. Timing helps with planning, not predicting results.')+'</p><div class="premium-time-pair">'+tile(t('بداية خلو المسار','VOC begins'),w.vocStartsAt,'lunar-violet','voc-start')+tile(t('نهاية خلو المسار','VOC ends'),w.ingressAt,'lunar-gold','voc-end')+'</div></section></div>'+
   '<section class="panel lunar-advice-card"><div class="lunar-advice-head"><div><span class="eyebrow">MX EYE · EXPLAINED TIMING</span><h2>'+t('شنو معناه بهاللحظة؟','How to use this timing')+'</h2></div><span class="lunar-advice-badge">'+(w.isVoid?t('خلو المسار فعّال','Void-of-course active'):t('القمر يتحرك باتجاه اتصالاته','Moon approaching aspects'))+'</span></div><p class="mx-lunar-explained">'+moonMomentNarrative(w)+'</p><div class="lunar-last-aspect"><small>'+t('آخر اتصال دقيق قبل الانتقال','Last exact major aspect')+'</small><strong>'+lastLabel+'</strong>'+(last?'<time datetime="'+last.time.toISOString()+'">'+date(last.time)+'</time>':'')+'</div><div class="button-row"><button id="export-lunar-calendar" class="primary">'+(w.isVoid?t('أضف موعد انتقال القمر للتقويم','Add next ingress to calendar'):t('أضف بداية خلو المسار للتقويم','Add VOC start to calendar'))+'</button><button class="secondary" data-go="time">'+t('افتح آلة الزمن','Open Time Machine')+'</button></div><small>'+t('تذكير التقويم: ','Calendar reminder: ')+date(when)+'</small></section>'+
   '<section class="panel lunar-timeline"><div class="section-title"><div><span class="eyebrow">EXACT EPHEMERIS · MEANING</span><h2>'+t('شنو يتغير خلال هالفترة؟','How the timing themes change')+'</h2></div></div><p class="mx-lunar-timeline-lead">'+t('الأوقات أدناه لحظات فلكية دقيقة محسوبة، والنص يشرح معناها الرمزي بلغة سهلة. الأحداث الماضية مكتوب عليها «صار»، والقادمة «قادم».','Times below are calculated exact astronomical contacts with a plain-language symbolic explanation. Past and upcoming events are marked.')+'</p><div class="premium-timeline">'+(w.events.length?w.events.map(e=>'<div class="timeline-entry '+(+e.time<=+selected?'mx-aspect-past':'mx-aspect-upcoming')+'"><span class="timeline-dot"></span><div><b>'+moonAspectNarrative(e)+'</b><span class="mx-aspect-phase">'+(+e.time<=+selected?t('صار بالفعل','Already exact'):t('قادم','Upcoming'))+'</span><time datetime="'+e.time.toISOString()+'">'+date(e.time)+'</time><details class="mx-lunar-aspect-story"><summary>'+t('الدليل الحسابي','Calculation details')+'</summary>'+planet(e.transit)+' · '+aspect(e.angle)+' · '+planet(e.target)+'</details></div></div>').join(''):'<p>'+t('ماكو زاوية كلاسيكية دقيقة ضمن التعريف المحدد.','No exact classical aspects under the chosen convention.')+'</p>')+'</div><details><summary>'+t('طريقة الحساب الفلكي','Astronomical calculation convention')+'</summary><p>'+t('يستخدم آخر زاوية رئيسية دقيقة للقمر مع الشمس أو عطارد أو الزهرة أو المريخ أو المشتري أو زحل، حتى لحظة دخوله البرج التالي.','Uses the last exact major aspect of the Moon to the Sun, Mercury, Venus, Mars, Jupiter or Saturn until its next sign ingress.')+'</p></details></section>';
 }catch(e){return '<section class="panel"><h2>'+t('تعذر حساب القمر','Moon calculation unavailable')+'</h2><p class="alert">'+esc(String(e))+'</p></section>'}
}
function timePage(){return `<section class="panel time-controls mx-time-compact"><div><span class="eyebrow">TIME MACHINE</span><h2>${t('اختار لحظة… واستكشف مدارها','Choose a moment. Explore its orbit.')}</h2><p>${t('كل المواضع والاتصالات تنحسب من جديد للتاريخ اللي تختاره.','Positions and contacts are recalculated for your selected date.')}</p></div><form id="time-form"><label>${t('التاريخ والوقت','Date & time')}<input required name="moment" id="time-input" type="datetime-local" min="1800-01-01T00:00" max="2399-12-31T23:59" value="${localValue(selected,active.zone)}"></label><small>${esc(active.zone)}</small><button class="primary">${t('استكشف اللحظة','Explore moment')} ↗</button></form><div class="quick-times">${[-24,-6,6,24,168].map(h=>`<button class="chip" data-shift="${h}">${h>0?'+':''}${h} ${t('ساعة','h')}</button>`).join('')}<button class="chip" data-now>${t('هسّه','Now')}</button></div></section>${scoresHTML(data!)}<div class="chart-layout"><section class="panel large-wheel">${wheel(data!.natal,data!.current)}<p>${dateText(selected,{dateStyle:'full',timeStyle:'short'})}</p></section><section class="panel"><h2>${t('إشارات هاللحظة','Signals at this moment')}</h2><div class="signal-list compact">${data!.signals.slice(0,4).map(signalCard).join('')}</div></section></div>${heatmapUI()}`}
function evidencePage(){
 const r=data!,review=reviewEvidence(r.evidence);
 const mood=review.contradictory?t('إشارات متعاكسة: لا تتسرع بقرار واحد','Mixed signals: avoid a one-sided decision'):review.tone==='supportive'?t('أكو عناصر داعمة واضحة، لكن النتائج تعتمد على أفعالك','Supportive themes exist, but choices still matter'):review.tone==='challenging'?t('الوضع يدعو للتأني ومراجعة التفاصيل','The moment suggests slowing down and checking details'):t('ماكو عامل مهيمن واضح ضمن القراءة','No dominant theme stands out clearly');
 const resolutions=resolveDecisions(r.evidence,r.signals);
 const sections=distinctPriority(rankPrioritySignals({signals:r.signals,natal:r.natal,knownBirthTime:active.known,complete:r.complete}),6,copy);
 const narrative=sections.map(({signal:s})=>{const c=copy(s),digest=resolutions.find(d=>d.category===s.category)!;
 const strongest=[...s.factors].sort((a,b)=>b.weight-a.weight)[0];
 const why=strongest?t('السبب الفلكي: ','Astrological reason: ')+planet(strongest.transit.id)+' '+aspect(strongest.angle)+' '+planet(strongest.natal.id)+'؛ '+(strongest.applying?t('الاتصال يقترب من الاكتمال.','the contact is approaching.'):t('الاتصال يبتعد حالياً عن الدقة.','the contact is currently moving away from exactness.')):t('ماكو اتصال فلكي قوي لهذا المجال.','No strong contact for this area.');
 return '<article class="narrative-evidence"><div class="narrative-heading"><span>'+categoryLabels[s.category][2]+'</span><h3>'+cat(s.category)+'</h3><b class="reading-level '+gaugeLevel(s.score)+'">'+s.score+'</b></div><h3>'+esc(c.title)+'</h3><p>'+esc(c.good)+'</p><p class="advice-action"><strong>'+t('شنو تسوي: ','What to do: ')+'</strong>'+esc(c.action)+'</p><p class="advice-caution">'+esc(c.careful)+'</p><small>'+esc(why)+'</small>'+'<p class="decision-line '+(digest.mixed?'decision-mixed':'')+'">'+decisionExplanation(digest,lang==='ar')+'</p></article>'}).join('');
 return '<section class="panel insight-lead"><h2>'+mood+'</h2><p>'+t('هاي قراءة رمزية تربط كل فكرة باتصال محسوب، وبعدها تنطيك نصيحة عملية. لا تعتبر الدرجة وعد بحدث أو معرفة لنوايا شخص آخر.','These symbolic readings tie each theme to a calculated contact and a practical action, not an event guarantee or access to another person’s mind.')+'</p><button class="secondary" id="export-report">'+t('نزّل تفاصيل الحساب إذا تحتاجها','Export technical calculation details')+'</button></section>'+
 '<div class="narrative-grid">'+(narrative||'<section class="panel">'+t('الاتصالات الحالية قليلة؛ اختار لحظة ثانية من آلة الزمن لقراءة مختلفة.','Few current contacts; select another moment in Time Machine.')+'</section>')+'</div>'+
 '<details class="panel evidence-technical"><summary>'+t('للمهتمين: الأرقام والزوايا الفلكية التفصيلية','For advanced users: detailed positions and aspect geometry')+'</summary><div class="eclipse-contacts">'+r.evidence.map(e=>'<span><b>'+esc(technical(e))+'</b></span>').join('')+'</div></details>';
}
function zoneChoices(current:string){
 const world=typeof Intl.supportedValuesOf==='function'?Intl.supportedValuesOf('timeZone'):[];
 return [...new Set(['Asia/Baghdad','Asia/Manila','America/Denver','Europe/Istanbul','Asia/Jakarta','Etc/UTC',current,...world])].sort((a,b)=>a.localeCompare(b));
}
function profileForm(p:Profile,isNew=false){
 const choices=zoneChoices(p.zone).map(z=>'<option value="'+esc(z)+'" '+(z===p.zone?'selected':'')+'>'+esc(z.replaceAll('_',' '))+'</option>').join('');
 return '<form id="profile-form" class="profile-form" data-place-selected="'+(isNew?'no':'yes')+'"><input name="id" type="hidden" value="'+esc(p.id)+'"><input name="isNew" type="hidden" value="'+isNew+'">'+
 '<div class="form-grid"><label>'+t('الاسم','Name')+'<input name="name" required maxlength="80" value="'+esc(p.name)+'"></label><label>'+t('نوع الملف','Profile type')+'<select name="kind">'+(['self','dating','work','friend','family'] as const).map((k,i)=>'<option value="'+k+'" '+(k===p.kind?'selected':'')+'>'+t(['ملفي الشخصي','علاقة عاطفية','عمل','صديق','عائلة'][i],['My profile','Dating','Work','Friend','Family'][i])+'</option>').join('')+'</select></label>'+
 '<label>'+t('الجنس','Gender')+'<select name="sex"><option value="" '+(!p.sex?'selected':'')+'>'+t('اختار الجنس','Select gender')+'</option><option value="male" '+(p.sex==='male'?'selected':'')+'>Male</option><option value="female" '+(p.sex==='female'?'selected':'')+'>Female</option></select></label>'+
 '<label>'+t('تاريخ الولادة','Birth date')+'<input name="date" type="date" required min="1800-01-01" max="2399-12-31" value="'+esc(p.date)+'" lang="en"></label><label>'+t('وقت الولادة','Birth time')+'<input name="time" type="time" required value="'+esc(p.time)+'" lang="en"></label>'+
 '<label class="checkbox"><input name="known" type="checkbox" '+(p.known?'checked':'')+'>'+t('وقت الولادة معروف','Birth time is known')+'</label>'+
 '<div class="place-picker"><label>'+t('اختار مدينة أو محافظة الولادة من أي مكان بالعالم','Find your birth city or province worldwide')+'<input type="search" id="place-search" autocomplete="off" value="'+esc(p.city)+'" placeholder="'+t('اكتب بغداد، Manila، Denver…','Type Baghdad, Manila, Denver…')+'"></label><p class="subtle">'+t('اختار نتيجة من القائمة؛ المنطقة الزمنية وخطوط الموقع تنحفظ أوتوماتيكياً.','Choose a result below; the timezone and location coordinates are filled automatically.')+'</p><button type="button" class="secondary detailed-search" id="place-detailed">'+t('بحث تفصيلي عن شارع أو مكان أو محافظة','Detailed search: street, landmark or province')+'</button><small class="geocoding-credit">Open-Meteo / © OpenStreetMap contributors</small><div id="place-results" class="place-results" role="listbox" aria-live="polite"></div><input type="hidden" name="city" value="'+esc(p.city)+'"><input type="hidden" name="lat" value="'+p.lat+'"><input type="hidden" name="lon" value="'+p.lon+'"><div id="chosen-place" class="chosen-place">'+(isNew?t('اختار مدينة حتى تكتمل بيانات المكان.','Select a city to confirm its coordinates.'):esc(p.city))+'</div></div>'+
 '<label class="timezone-field">'+t('المنطقة الزمنية التاريخية — اختار من القائمة','Historical time zone — select from list')+'<select name="zone" id="timezone-list" required>'+choices+'</select><small>'+t('تتغير تلقائياً لما تختار المدينة، وتكدر تصححها من القائمة.','Automatically set from the chosen city. You can also change it here.')+'</small></label></div>'+
 '<button class="primary" type="submit">'+t('حفظ الملف','Save profile')+'</button><p class="form-error" role="alert"></p></form>';
}
function journalPanel(person:Profile){
 const rows=readJournal().filter(x=>x.personId===person.id).sort((a,b)=>b.at.localeCompare(a.at));
 const summary=summarizeJournal(rows);
 const label=(e:JournalEntry)=>({message:t('رسالة','Message'),call:t('اتصال','Call'),meeting:t('لقاء','Meeting'),note:t('ملاحظة','Note')} as Record<InteractionKind,string>)[e.kind];
 const sentiment=(e:JournalEntry)=>({positive:t('إيجابي','Positive'),neutral:t('عادي','Neutral'),difficult:t('صعب','Difficult')} as Record<Outcome,string>)[e.outcome];
 return '<section class="panel journal-panel"><h2>'+t('سجل التفاعل الحقيقي','Real-world interaction history')+' · '+esc(person.name)+'</h2>'+
 '<p>'+t('هذا سجل خاص داخل متصفحك وغير مشفّر هنا، ولا ينرسل إلى Ai. قارن تجاربك الحقيقية بالمؤشر الرمزي فقط للفحص الشخصي، مو لقياس احتمال نجاح العلاقات.','This is an unencrypted private browser log, never sent to Ai. Compare actual experiences with symbolic indices for personal review, not predictive success probabilities.')+'</p>'+
 '<form id="journal-form" class="journal-form"><label>'+t('نوع التفاعل','Interaction')+
 '<select name="kind"><option value="message">'+t('رسالة','Message')+'</option><option value="call">'+t('مكالمة','Call')+'</option><option value="meeting">'+t('لقاء','Meeting')+'</option><option value="note">'+t('ملاحظة','Note')+'</option></select></label>'+
 '<label>'+t('النتيجة التي لاحظتها فعلاً','Observed outcome')+
 '<select name="outcome"><option value="neutral">'+t('عادي','Neutral')+'</option><option value="positive">'+t('إيجابي','Positive')+'</option><option value="difficult">'+t('صعب','Difficult')+'</option></select></label>'+
 '<label class="journal-text">'+t('ملاحظة قصيرة','Short note')+'<textarea name="note" maxlength="500" rows="3" required placeholder="'+t('شنو صار فعلاً؟ بدون افتراض مشاعر الطرف الآخر','What actually happened? Avoid assumptions about anyone’s private feelings')+'"></textarea></label>'+
 '<button class="primary" type="submit">'+t('سجّل التفاعل','Save observation')+'</button></form>'+
 '<div class="journal-stat"><b>'+summary.total+' '+t('تفاعلات مسجلة','logged interactions')+'</b><span>'+t('إيجابي','Positive')+': '+summary.positive+' · '+t('عادي','Neutral')+': '+summary.neutral+' · '+t('صعب','Difficult')+': '+summary.difficult+'</span></div>'+
 (summary.observedIndexCount>=2?'<p class="journal-calibration">'+t('المؤشر الرمزي المتوسط وقت الملاحظات الإيجابية','Mean symbolic index during positive observations')+': '+(summary.positiveMeanIndex??t('لا يوجد','None'))+' · '+t('وقت الملاحظات الصعبة','During difficult observations')+': '+(summary.difficultMeanIndex??t('لا يوجد','None'))+' <small>'+t('عينة شخصية صغيرة ومنتقاة ذاتياً، لا تثبت صحة التنجيم أو القدرة على التنبؤ.','Small self-selected sample; does not validate astrology or predictive power.')+'</small></p>':'')+
 '<div class="journal-rows">'+(rows.length?rows.slice(0,40).map(e=>'<article class="journal-entry"><div><b>'+label(e)+' · '+sentiment(e)+'</b><small>'+esc(dateText(new Date(e.at)))+'</small><p>'+esc(e.note)+'</p>'+(e.symbolicIndex!==null?'<small>'+t('مؤشر رمزي مسجل','Logged symbolic index')+': '+e.symbolicIndex+'/100</small>':'')+'</div><button class="text-button danger" data-journal-delete="'+esc(e.id)+'">'+t('حذف','Delete')+'</button></article>').join(''):'<p>'+t('ماكو أحداث مسجلة بعد.','No interactions logged yet.')+'</p>')+'</div></section>';
}
function relationshipWindowUI(person:Profile){
 try{
  const match=compatibility(active,person),period=relationshipWindows(selected,match.dimensions,at=>getReport(at).scores,21);
  const cards=(kind:'message'|'date')=>bestWindows(period,kind,3).map(day=>{
   const advice=kind==='message'?t('جرب رسالة واحدة واضحة، وراقب الرد الحقيقي بدون إلحاح.','Send one clear message and respect the actual reply.'):t('اقترح لقاء بسيط بمكان مناسب، وخلي الموافقة متبادلة.','Offer a simple meeting and leave the choice mutual.');
   return '<article class="relation-window '+gaugeLevel(day[kind])+'"><div class="relation-heading"><b>'+dateText(day.day,{weekday:'short',day:'numeric',month:'short'})+'</b><strong>'+day[kind]+'</strong></div><p>'+advice+'</p><div class="button-row"><button class="secondary" data-relationship-time="'+(+day.day)+'">'+t('افتح اليوم','Inspect day')+'</button><button class="text-button" data-relationship-calendar="'+(+day.day)+'" data-relationship-kind="'+kind+'">'+t('تذكير بالتقويم','Calendar reminder')+'</button></div></article>';
  }).join('');
  return '<section class="panel relationship-calendar"><span class="eyebrow">MX ASTRO · 21 DAYS</span><h2>'+t('نوافذ التواصل واللقاءات لهذا الشخص','Communication and meeting planning windows')+'</h2><p>'+t('هاي الأيام من حركة كواكبك ومؤشر التوافق الرمزي. مو قراءة لمشاعر الطرف الثاني أو توفره أو موافقته. أي خطوة تحتاج تواصل مباشر واحترام الرد.','These days combine your transits and symbolic compatibility, not the other person’s wishes, availability or consent.')+'</p><h3>'+t('أيام تراسل بيها','Days to consider a message')+'</h3><div class="relation-window-grid">'+cards('message')+'</div>'+(match.romantic?'<h3>'+t('أيام تقترح موعد','Days to propose a date')+'</h3><div class="relation-window-grid">'+cards('date')+'</div>':'')+'</section>';
 }catch(e){return '<p class="alert">'+esc(String(e))+'</p>'}
}
function relationshipFocus(person:Profile,c:ReturnType<typeof compatibility>){
 const brief=relationshipBrief(c.evidence);
 const peopleMeaning={attraction:humanPartner(brief.attractionContact,'attraction'),sexual:humanPartner(brief.sexualContact,'sexual'),harmony:humanPartner(brief.harmonyContact,'harmony'),challenge:humanPartner(brief.challengeContact,'challenge')};
 const text=(v:{ar:string;en:string})=>esc(t(v.ar,v.en));
 const romantic=person.kind==='dating'||person.kind==='friend';
 const card=(icon:string,labelAr:string,labelEn:string,title:string,meaning:string,advice:string)=>
  '<article class="mx-brief-card"><small>'+icon+' '+t(labelAr,labelEn)+'</small><h3>'+title+'</h3><p>'+meaning+'</p>'+(advice?'<p class="mx-brief-advice">'+advice+'</p>':'')+'</article>';
 const attraction=romantic?
  '<article class="mx-brief-card mx-brief-sexual"><small>♥ '+t('الجاذبية والجنس','ATTRACTION & SEX')+'</small>'+
   '<h3>'+t('الانجذاب والكيمياء الجنسية','Attraction & sexual chemistry')+'</h3>'+
   '<div class="mx-brief-fact"><b>'+t('الجاذبية','Attraction')+'</b><p>'+text(peopleMeaning.attraction)+'</p></div>'+
   '<div class="mx-brief-fact"><b>'+t('الجنس','Sexual chemistry')+'</b><p>'+text(peopleMeaning.sexual)+'</p></div></article>':'';
 const harmony=card('✦','أقوى انسجام','MAIN HARMONY',text(brief.harmonyTitle),text(peopleMeaning.harmony),text(brief.harmonyAction));
 const challenge=card('◇','أبرز تحدّي','MAIN CHALLENGE',text(brief.challengeTitle),text(peopleMeaning.challenge),text(brief.challengeAction));
 return '<section class="panel mx-partner-focus mx-relationship-brief"><div class="mx-brief-head"><h2>'+t('خلاصة العلاقة','Relationship snapshot')+'</h2>'+
  '<small>'+esc(active.name)+' × '+esc(person.name)+'</small></div>'+
  '<div class="mx-brief-grid'+(romantic?'':' mx-brief-nonromantic')+'">'+attraction+harmony+challenge+'</div>'+
  (!active.known||!person.known?'<p class="mx-brief-footnote">'+t('وقت الولادة ناقص لبعض الحسابات.','Some birth-time details are unavailable.')+'</p>':'')+'</section>';
}
function peoplePage(){
 const others=profiles.filter(p=>p.id!==active.id),partner=others.find(p=>p.id===compareId);
 let analysis='',focusSummary='';
 if(partner){
  const c=compatibility(active,partner),indices=getReport(selected).scores,insights=partnerInsights(c.dimensions,{love:indices.love,communication:indices.communication,energy:indices.energy},c.romantic);
  focusSummary=uiMode==='simple'?relationshipFocus(partner,c):'';
  const title=(k:string)=>t(({attraction:'الجاذبية',sexual:'الكيمياء الحميمية',emotional:'القرب العاطفي',communication:'التفاهم بالكلام',stability:'الاستمرارية',conflict:'هدوء الخلافات'} as Record<string,string>)[k],({attraction:'Attraction',sexual:'Intimate chemistry',emotional:'Emotional closeness',communication:'Communication',stability:'Steadiness',conflict:'Conflict resilience'} as Record<string,string>)[k]);
  const gauge=(value:number)=>'<span class="gauge '+gaugeLevel(value)+'"><b>'+value+'</b><small>/100</small><i style="width:'+value+'%"></i></span>';
  const classic=Object.entries(c.dimensions).filter(([k])=>c.romantic||!['attraction','sexual'].includes(k)).map(([k,v])=>{const n=k==='conflict'?100-v:v;return '<div class="partner-score"><span>'+title(k)+'</span>'+gauge(n)+'</div>'}).join('');
  const extended=insights.map(x=>'<article class="partner-insight '+gaugeLevel(x.score)+'"><div class="partner-insight-head"><h3>'+t(x.arTitle,x.enTitle)+'</h3>'+gauge(x.score)+'</div><p>'+(lang==='ar'?partnerArabic(x.arText,partner.sex):x.enText)+'</p><p class="advice-action"><b>'+t('التصرف المفيد: ','Useful next step: ')+'</b>'+(lang==='ar'?partnerArabic(x.arAction,partner.sex):x.enAction)+'</p></article>').join('');
  analysis='<section class="panel partner-overview"><div class="section-title"><div><span class="eyebrow">MX ASTRO · SYNASTRY</span><h2>'+esc(active.name)+' × '+esc(partner.name)+'</h2></div><div class="big-score '+gaugeLevel(c.overall)+'">'+c.overall+'<small>/100</small></div></div><h3>'+t('خلاصة العلاقة اليوم','Today’s relationship snapshot')+'</h3>'+(partner.known?'':'<p class="alert">'+t('وقت ميلاد هذا الشخص مو معروف؛ بعض الاتصالات مستبعدة من الحساب.','Birth time is unknown; some lunar and angle contacts are excluded.')+'</p>')+'<div class="dimension-grid clear-gauges">'+classic+'</div></section>'+
 (c.romantic?'<section class="panel intimacy-section"><div class="section-title"><div><span class="eyebrow">LOVE · DATING · CHEMISTRY</span><h2>'+t('تفاصيل القرب والمواعيد والانسجام','Dating, intimacy and communication insights')+'</h2></div></div><div class="partner-insights-grid">'+extended+'</div></section>':'')+
 '<details class="panel synastry-technical"><summary>'+t('التفاصيل الحسابية الفلكية للمتخصصين','Advanced mathematical aspect details')+' · '+c.evidence.length+'</summary>'+c.evidence.map(e=>'<p class="technical">'+planet(e.first.id)+' · '+aspect(e.angle)+' · '+planet(e.second.id)+' — '+e.orb.toFixed(3)+'°</p>').join('')+'</details>';
 }
 if(partner&&uiMode==='simple'){
  analysis=focusSummary+
   '<details class="panel mx-partner-deep"><summary>'+t('شوف مؤشرات التوافق والتفاصيل المتقدمة','Expand all compatibility indicators and technical details')+'</summary>'+analysis+'</details>';
 }
 return '<div class="section-title"><button class="primary" id="add-person">＋ '+t('إضافة شخص','Add person')+'</button></div><div class="people-grid">'+(others.map(p=>'<section class="panel person-card"><span class="person-avatar">'+esc(p.name.slice(0,1))+'</span><h3>'+esc(p.name)+'</h3><p>'+esc(p.city)+' · '+esc(p.date)+' · '+(p.sex==='female'?'Female':p.sex==='male'?'Male':t('غير محدد','Unspecified'))+'</p><small>'+ (p.known?t('وقت ولادة معروف','Known birth time'):t('وقت الولادة مو معروف','Birth time unknown')) +'</small><div><button class="secondary" data-compare="'+esc(p.id)+'">'+t('قراءة العلاقة','Relationship insights')+' ↗</button><button class="text-button" data-edit="'+esc(p.id)+'">'+t('تعديل','Edit')+'</button></div></section>').join('')||'<section class="panel empty"><h2>'+t('أضف شخصاً لقراءة العلاقة','Add someone to explore your compatibility')+'</h2><button class="secondary" id="add-first">＋ '+t('إضافة شخص','Add person')+'</button></section>')+'</div>'+analysis+(partner?(uiMode==='simple'?'<details class="panel mx-partner-deep"><summary>'+t('التوقيت والسجل الشخصي','Timing windows and private journal')+'</summary>'+relationshipWindowUI(partner)+journalPanel(partner)+'</details>':relationshipWindowUI(partner)+journalPanel(partner)):'');
}

function aiPayload(){const contacts=(r:Report)=>r.evidence.map(e=>({transit:e.transit.id,natal:e.natal.id,angle:e.angle,orb:e.orb,applying:e.applying}));const current=contacts(data!);const asteroidContacts=mountedAsteroidCount()>0?namedAsteroidContacts(namedAsteroidPositions(asteroidSwissRuntime(),selected),targets(data!.natal).filter(p=>active.known||!['Moon','Ascendant','MC'].includes(p.id)),selected).slice(0,8).map(e=>({transit:e.transit.id,natal:e.natal.id,angle:e.angle,orb:e.orb,applying:e.applying})):[];const eclipseEvents=(()=>{try{return getRealEclipses().filter(e=>e.type!=='unknown'&&+e.maximum>=+selected&&+e.maximum<=+selected+100*86400000).slice(0,2).map(e=>({kind:e.kind,type:e.type,maximum:e.maximum.toISOString()}))}catch{return []}})();return {eclipseEvents,grammaticalGender:active.sex??null,extendedEvidence:asteroidContacts,comparison:{hour:optionalComparison(current,()=>contacts(getReport(new Date(+selected-3600000)))),day:optionalComparison(current,()=>contacts(getReport(new Date(+selected-86400000))))},language:lang,model:'qwen3',question:t('احچيلي مباشرة شنو أهم موضوع أراجعه هسه وليش، وبمثال من الحياة وخطوة عملية. بلا أسماء كواكب أو زوايا أو حسابات.','Speak directly to me about the most relevant everyday issue, why it matters, a realistic example and one action. No astronomical jargon.'),calculatedAt:selected.toISOString(),indices:data!.scores,evidence:narrativeEvidence(data!.evidence).map(e=>({id:e.id,transit:e.transit.id,natal:e.natal.id,angle:e.angle,orb:e.orb,applying:e.applying,weight:e.weight})),rules:'Translate the calculated evidence into a human situation, a plausible conditional example and one useful action. Never expose planet names, angles, zodiac names, degrees, orbs, dates inferred from aspects, or numerical interpretation details. Do not invent outcomes or private feelings. Use natural Iraqi Arabic for ar, English for en.'}}
function changeSummary(){const c=aiPayload().comparison;const strongest=[...data!.evidence].sort((a,b)=>b.weight-a.weight).slice(0,2);return `<section class="change-summary" aria-label="${t('مقارنة الوقت','Time comparison')}"><h3>${t('الدليل المباشر','Calculated evidence')}</h3>${strongest.map(e=>`<p>${esc(technical(e))}</p>`).join('')}<h3>${t('شنو تغيّر فعلياً؟','What actually changed?')}</h3>${(['hour','day'] as const).map(period=>{const d=c[period];if(!d)return `<p>${period==='hour'?t('الساعة السابقة غير متاحة؛ لا نفترض ثبات الاتصالات.','The previous hour is unavailable; no stability is assumed.'):t('اليوم السابق غير متاح؛ لا نفترض ثبات الاتصالات.','The previous day is unavailable; no stability is assumed.')}</p>`;return `<p><b>${period==='hour'?t('عن الساعة السابقة','Since the previous hour'):t('عن اليوم السابق','Since the previous day')}</b><span>${d.stable?t('ماكو فروقات بالاتصالات المحسوبة تتجاوز حد العرض.','No calculated contact changes exceed the display threshold.'):t(d.totals.changed+' اتصالات تغيّر قربها أو اتجاهها؛ '+d.totals.entered+' دخلت هامش الحساب و'+d.totals.exited+' غادرته.',d.totals.changed+' contacts changed orb or direction; '+d.totals.entered+' entered and '+d.totals.exited+' left the configured orbs.')}</span></p><details><summary>${t('اعرض فروقات الزوايا','Show angular changes')}</summary>${d.changed.length?d.changed.map(e=>{const [tr,na,a]=e.contact.split(':');return `<p class="orb-change">${esc(planet(tr))} · ${aspect(Number(a))} · ${esc(planet(na))}<span dir="ltr">${e.orbBefore.toFixed(3)}° → ${e.orbNow.toFixed(3)}°</span><small>${e.applying?t('حالياً يقترب من الدقة','Currently applying'):t('حالياً يبتعد عن الدقة','Currently separating')}</small></p>`}).join(''):t('ماكو فروقات تتجاوز حد العرض ضمن الاتصالات المشتركة.','No changes above display precision among shared contacts.')}<small>${t('الدخول والمغادرة محسوبان من كل الاتصالات ضمن الأورب المحدد؛ المعروض لحد 12 مثال من كل نوع.','Entry and exit use all contacts within configured orbs; up to 12 examples of each change type are shown.')}</small></details>`}).join('')}<small>${t('المقارنة لكل الاتصالات المحسوبة؛ حد تغيّر الفارق 0.02°. التفسير رمزي.','Comparison covers all calculated contacts; orb change threshold 0.02°. Interpretation is symbolic.')}</small></section>`}
function aiPage(){return '<section class="panel mx-qwen-live" aria-label="Ai" aria-live="polite"><div class="mx-qwen-live-copy" id="qwen-live-copy">'+qwenLiveMarkup()+'</div></section>'}
function qwenLiveMarkup(){
 if(aiAnswer){
  const summary=conciseInterpretation(aiAnswer,4);
  const visible='<p class="mx-qwen-paragraph">'+esc(summary.brief)+'</p>';
  const expanded=summary.condensed?'<details class="mx-ai-expanded"><summary>'+t('اقرأ التحليل الكامل','Read full analysis')+'</summary><p class="mx-qwen-paragraph">'+esc(summary.full)+'</p></details>':'';
  return (aiAnswerAt?'<small class="subtle">'+t('محسوب لـ: ','Calculated for: ')+esc(dateText(new Date(aiAnswerAt)))+'</small>':'')+visible+expanded;
 }
 return '<p class="mx-qwen-placeholder">'+esc(aiErrorMessage||(!aiConnection.checked?t('جار فحص الاتصال بـ Ai…','Checking Ai connection…'):!aiConnection.configured?t('خدمة Ai غير مفعّلة حالياً.','Ai is not currently configured.'):t('جار إعداد القراءة المباشرة من Ai…','Preparing the live Ai reading…')))+'</p>';
}
function updateLiveQwenCard(){
 if(screen!=='ai')return;
 const area=root.querySelector<HTMLElement>('#qwen-live-copy');
 if(!area)return;
 const html=qwenLiveMarkup();
 if(area.innerHTML!==html)area.innerHTML=html;
}
function liveQwenScope(){return JSON.stringify([active,lang,liveTimePinned?selected.toISOString():'live'])}
/** Actual calculated evidence changes trigger refreshed explanations. Five-minute
 * request spacing limits Workers AI usage; no requests run for a hidden AI page.
 */
function liveQwenSignature():string{
 return JSON.stringify([liveQwenScope(),data!.scores,narrativeEvidence(data!.evidence).map(e=>[
  e.id,e.transit.id,e.natal.id,e.angle,Math.round(e.orb*100)/100,e.applying,Math.round(e.weight*100)/100
 ])]);
}
async function refreshLiveQwen(force=false){
 if(!ready||!data||screen!=='ai'||document.visibilityState==='hidden')return;
 const now=Date.now(),minute=Math.floor(now/60000);
 if(!force&&minute===aiLastCheckMinute&&liveQwenScope()===aiScope)return;
 aiLastCheckMinute=minute;
 if(!liveTimePinned&&Math.abs(now-+selected)>30000){selected=new Date(now);recalculate()}
 const scope=liveQwenScope(),signature=liveQwenSignature();
 if(scope!==aiScope){
  aiScope=scope;aiAnswer='';aiAnswerAt='';aiResponseSignature='';aiErrorMessage='';aiBusy=false;aiNextRequestAt=0;
  aiRequestId++;updateLiveQwenCard();
 }
 if(!aiConnection.checked){updateLiveQwenCard();return}
 if(!aiConnection.configured){
  aiErrorMessage=t('خدمة Ai غير مفعّلة حالياً.','Ai is not currently configured.');
  updateLiveQwenCard();return;
 }
 if(aiBusy||signature===aiResponseSignature||now<aiNextRequestAt)return;
 const payload=aiPayload(),requestId=++aiRequestId;
 aiBusy=true;aiNextRequestAt=now+AI_MIN_INTERVAL_MS;
 aiErrorMessage='';updateLiveQwenCard();
 try{
  const response=await fetch('/api/explain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(60000)});
  if(!response.headers.get('content-type')?.includes('application/json'))throw Error(t('تعذّر الاتصال بمحرك Ai.','Ai service returned an invalid response.'));
  const result=await response.json();
  if(!response.ok)throw Error(typeof result.error==='string'?result.error:'Ai unavailable');
  if(typeof result.explanation!=='string'||!result.explanation.trim())throw Error('Ai returned no explanation');
  if(requestId!==aiRequestId||scope!==liveQwenScope())return;
  aiAnswer=distinctParagraphs(result.explanation);aiAnswerAt=payload.calculatedAt;
  aiResponseSignature=signature;aiErrorMessage='';
 }catch(e){
  if(requestId!==aiRequestId||scope!==liveQwenScope())return;
  if(!aiAnswer)aiErrorMessage=String(e);
 }finally{
  if(requestId===aiRequestId){aiBusy=false;updateLiveQwenCard()}
 }
}
function moonPushSchedule():MoonPushEvent[]{
 const now=Date.now(),seen=new Set<string>(),events:MoonPushEvent[]=[];
 if(!eyeSettings.moon)return [];
 for(let i=0;i<24;i++){
  try{
   const current=new Date(now+i*86400000),window=lunarWindow(current,d=>chart(d,active,false,false).points);
   for(const [kind,date] of [['voc',window.vocStartsAt],['ingress',window.ingressAt]] as const){
    const at=date.toISOString(),id=kind+at;
    if(+date>now+60000&&+date<now+30*86400000&&!seen.has(id)){seen.add(id);events.push({kind,at})}
   }
  }catch{}
 }
 return events.sort((a,b)=>a.at.localeCompare(b.at)).slice(0,80);
}
function settingsPage(){return `<div class="settings-layout"><section class="panel"><div class="section-title"><h2>${t('ملفي الشخصي','My profile')}</h2>${tag(t('محلي فقط','Local only'),'cyan')}</div>${profileForm(active)}</section><div><section class="panel"><h2>${t('اللغة والمظهر','Language & appearance')}</h2><div class="setting-row"><span>${t('لغة الواجهة','Interface language')}</span><button class="secondary" id="settings-language">${lang==='ar'?'English':'العراقي'}</button></div><div class="setting-row"><label for="clock-format">${t('نظام الساعة','Clock format')}</label><select id="clock-format"><option value="24" ${clockFormat==='24'?'selected':''}>24-hour · 23:45</option><option value="12" ${clockFormat==='12'?'selected':''}>12-hour · 11:45 PM</option></select></div><div class="setting-row"><span>${t('المظهر','Appearance')}</span><b>${t('ليلي · MX Astro','Dark · MX Astro')}</b></div></section><section class="panel"><h2>${t('بياناتك تحت سيطرتك','Your data, your control')}</h2><p>${t('الملفات محفوظة بـ localStorage بهذا المتصفح. النسخة الاحتياطية JSON مو مشفرة؛ احتفظ بيها بمكان خاص.','Profiles are stored in this browser’s localStorage. JSON backups are unencrypted; keep them private.')}</p><div class="button-row"><button class="secondary" id="backup">${t('تصدير نسخة احتياطية','Export backup')}</button><label class="secondary file-label">${t('استيراد نسخة','Import backup')}<input type="file" accept="application/json,.json" id="restore"></label></div><div class="secure-backup"><h3>${t("نسخة احتياطية مشفّرة","Encrypted backup")}</h3><p>${t("أدخل كلمة سر قوية من 12 حرف على الأقل. يتشفّر الملف بـAES-256-GCM على جهازك، وكلمة السر ما تنرسل للسيرفر ولا تنحفظ. إذا نسيتها ما نكدر نسترجع النسخة. بيانات المتصفح الاعتيادية تبقى غير مشفّرة.","Enter a strong passphrase of at least 12 characters. The export is AES-256-GCM encrypted on your device; the passphrase is neither uploaded nor saved. A lost passphrase cannot be recovered. Normal browser storage remains unencrypted.")}</p><label class="secure-password">${t("كلمة سر النسخة المشفّرة","Encrypted backup passphrase")}<input id="secure-passphrase" type="password" minlength="12" maxlength="256" autocomplete="new-password" placeholder="${t("12 حرف على الأقل","At least 12 characters")}"></label><div class="button-row"><button class="secondary" id="secure-backup">${t("تصدير مشفّر","Export encrypted")}</button><label class="secondary file-label">${t("استيراد ملف مشفّر","Import encrypted")}<input id="secure-restore" type="file" accept=".json,application/json"></label></div></div><section class="vault-settings"><h3>${t('خزنة محلية مشفّرة · AES-256','Encrypted local vault · AES-256')}</h3><p>${vaultOpened()?t('الخزنة مفعّلة: ملفاتك وسجل علاقاتك محفوظة مشفّرة على هذا الجهاز، وكلمة السر مطلوبة بكل فتح جديد. إذا نسيتها لا يمكن استرجاع البيانات.','Vault enabled: profiles and private journal are stored encrypted at rest on this device. You must unlock on each new page load; losing your password means losing access.'):t('فعّل حماية بيانات هذا المتصفح نفسه، مو بس النسخ الاحتياطية. التفعيل يشفّر الملفات وسجل العلاقات ويتحقق من فكها قبل إزالة النسخ العادية. احتفظ بنسخة احتياطية مشفّرة قبل التفعيل.','Protect the browser data itself, not just exported backups. Migration encrypts and verifies before deleting legacy plaintext. Export an encrypted backup before enabling.')}</p>${!isVaultConfigured()?'<label class="secure-password">'+t('كلمة سر الخزنة · 12 حرف على الأقل','Vault passphrase · minimum 12 characters')+'<input id="vault-password" type="password" minlength="12" maxlength="256" autocomplete="new-password"></label><button class="secondary" id="vault-enable">'+t('فعّل التشفير المحلي','Enable encrypted local storage')+'</button>':'<span class="vault-enabled-indicator">'+t('التشفير المحلي فعّال','At-rest encryption enabled')+'</span>'}</section><section class="mx-sync-panel"><h3>${t('المزامنة المشفّرة بين الآيفون والكمبيوتر','Encrypted iPhone & computer sync')}</h3><p>${t('الملفات والسجل يتشفّرون على جهازك بكلمة سر ما تنرسل للسيرفر. أنشئ رمز مشاركة عشوائي وانسخه للجهاز الثاني، واستعمل نفس كلمة السر هناك. المزامنة تبدأ بإجراء منك، ولا تشتغل تلقائياً بالخلفية.','Profiles and journal are encrypted on your device with a passphrase never sent to the server. Create a random sync code, copy it to your other device and use the same passphrase there. Sync is manual, not automatic background sync.')}</p><label class="secure-password">${t('رمز الاتصال بين الأجهزة، احفظه بمكان خاص','Private cross-device connection code')}<textarea id="sync-code" rows="3" autocomplete="off" spellcheck="false" placeholder="${t('أنشئ رمز أو الصق رمز جهازك الثاني','Create or paste your other device’s code')}">${esc(syncCode)}</textarea></label><div class="button-row"><button class="secondary" id="sync-new">${t('أنشئ رمز جديد','Create new sync code')}</button><button class="secondary" id="sync-copy">${t('انسخ الرمز','Copy code')}</button><button class="secondary" id="sync-test">${t('افحص اتصال السيرفر','Check server connection')}</button></div><label class="secure-password">${t('كلمة سر تشفير النسخة المشتركة · 12 حرف على الأقل','Shared encryption passphrase · at least 12 characters')}<input type="password" id="sync-passphrase" minlength="12" maxlength="256" autocomplete="new-password"></label><div class="button-row"><button class="primary" id="sync-upload">${t('ارفع النسخة المشفّرة','Upload encrypted version')}</button><button class="secondary" id="sync-download">${t('نزّل وادمج النسخة المشفّرة','Download and merge encrypted version')}</button></div><small>${t('مهم: احتفظ بالرمز وكلمة السر منفصلين. فقدانهم يعني عدم القدرة على استرجاع النسخة. قبل رفع تعديل جديد من جهاز ثاني، نزّل آخر نسخة أولاً حتى ما تنمسح تغييراتك.','Important: keep the connection code and passphrase separate. They cannot be recovered. Download and merge the latest version before uploading from another device to prevent overwrites.')}</small></section><button class="text-button danger" id="delete-profile">${t('حذف الملف الحالي','Delete current profile')}</button></section><section class="panel"><h2>${t('نصّب MX Astro','Install MX Astro')}</h2><p>${t('على الآيفون: Safari ← مشاركة ← إضافة إلى الشاشة الرئيسية. بعد أول تحميل كامل، الحسابات تشتغل بدون إنترنت.','On iPhone: Safari → Share → Add to Home Screen. After the first complete load, calculations work offline.')}</p><button id="install" class="secondary">${t('التثبيت على الجهاز','Install on device')}</button></section><section class="panel"><div class="section-title"><h2>${t("MX Eye · تنبيهات المتصفح","MX Eye · Browser alerts")}</h2>${tag(eyeSettings.enabled?t("مفعّل","Enabled"):t("متوقف","Off"))}</div><p>${t("تنبيهات أثناء فتح الموقع فقط: دخول القمر، بداية خلو المسار، مراجعة كل ساعة أو كل يوم. على الآيفون تنبيهات الخلفية تحتاج تثبيت PWA وخدمة Web Push مستقلة. للتنبيه والنظام مغلق، استخدم تصدير الموعد إلى التقويم.","Alerts work while this page is open: Moon ingress/VOC and optional hourly/daily check-ins. Background iPhone alerts require an installed PWA and separate Web Push infrastructure. For reminders with the site closed, export events to your device calendar.")}</p><button class="secondary" id="eye-toggle">${eyeSettings.enabled?t("إيقاف MX Eye","Disable MX Eye"):t("تشغيل MX Eye","Enable MX Eye")}</button><div class="eye-options"><label><input type="checkbox" data-eye="moon" ${eyeSettings.moon?"checked":""}>${t("تنبيه القمر قبل 15 دقيقة","Moon alerts 15 minutes early")}</label><label><input type="checkbox" data-eye="hourly" ${eyeSettings.hourly?"checked":""}>${t("تذكير كل ساعة أثناء فتح الصفحة","Hourly check-in while page is open")}</label><label><input type="checkbox" data-eye="daily" ${eyeSettings.daily?"checked":""}>${t("مراجعة يومية الساعة 8 صباحاً حسب منطقتك الزمنية","Daily 8 AM check-in in your selected time zone")}</label></div><div class="push-settings-panel"><h3>${t('MX Eye · إشعارات الخلفية','MX Eye · Background Web Push')}</h3><p>${t('على الآيفون: ثبّت MX Astro على الشاشة الرئيسية وافتحه من الأيقونة. يحتاج اتصال بالإنترنت، إذن الإشعارات، اشتراك جهازك، وقاعدة D1 ومجدول Cloudflare مفعّلين. يُرسل فقط منطقتك الزمنية وأوقات أحداث القمر، مو اسمك أو تاريخ ميلادك.','On iPhone, install MX Astro on the Home Screen and launch the icon. Requires internet, notification permission, device subscription, and an active D1-backed Cloudflare scheduler. Only your timezone and upcoming Moon event times are stored, never your name or birth date.')}</p><div class="button-row"><button class="secondary" id="push-status">${t('تحقق من خدمة الخلفية','Check push service')}</button><button class="primary" id="push-subscribe">${t('تفعيل / تحديث تنبيهات الخلفية','Enable / update background push')}</button><button class="secondary" id="push-test">${t('إشعار تجريبي','Send test push')}</button><button class="text-button danger" id="push-unsubscribe">${t('إلغاء اشتراك هذا الجهاز','Unsubscribe this device')}</button></div><small>${t('الجدولة الخلفية كل 15 دقيقة تقريباً. إشعارات القمر القادمة تتجدد من الصفحة، لذلك افتحها دورياً لتجديد جدول الأسابيع القادمة.','Background delivery checks every 15 minutes. Upcoming Moon events are refreshed when you open the app and resubscribe; renew them periodically.')}</small></div></section></div></div>`}
function bind(){root.querySelectorAll<HTMLButtonElement>('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go!));
 if(screen==='eclipses')refreshEclipseCountryNames();

 on('focus-refine-peak',()=>{
  const area=root.querySelector<HTMLElement>('#focus-peak-result'),button=root.querySelector<HTMLButtonElement>('#focus-refine-peak'),f=data?.signals[0]?.factors?.slice().sort((a,b)=>b.weight-a.weight)[0];
  if(!area||!button||!f)return;button.disabled=true;area.textContent=t('جاري تدقيق لحظات الاتصال من بيانات الكواكب…','Checking exact contacts against ephemeris…');
  setTimeout(()=>{
   try{
    const result=refineNatalTransit(f,selected,at=>chart(at,active,true,false).points,21);
    const future=result.events.filter(e=>+e.time>=+selected).sort((a,b)=>+a.time-+b.time);
    area.textContent=future.length
     ?t('أقرب ذروة مؤكدة حسابياً ضمن 21 يوم: ','Next verified exact peak within 21 days: ')+dateText(future[0].time)
     :t('ما انوجد عبور دقيق قادم خلال 21 يوم. ما نعرض ساعة تخمينية.','No exact future crossing found within 21 days; no estimated time is shown.');
   }catch(e){area.textContent=t('التوقيت الدقيق غير متاح: ','Exact timing unavailable: ')+String(e)}
   finally{button.disabled=false}
  },10);
 });

 root.querySelectorAll<HTMLButtonElement>('[data-ui-mode]').forEach(b=>b.onclick=()=>{uiMode=b.dataset.uiMode==='pro'?'pro':'simple';localStorage.setItem('mx.uiMode',uiMode);render()});
 root.querySelectorAll<HTMLButtonElement>('[data-partner-peak]').forEach(button=>button.onclick=()=>{
 const person=profiles.find(p=>p.id===button.dataset.partnerPeak);
 const area=button.nextElementSibling as HTMLElement|null;
 if(!person||!area||!ready)return;
 const instant=new Date(+selected),profilesToCheck=[active,person];
 button.disabled=true;area.textContent=t('دا أتحقق من زوايا دقيقة لكل خارطة…','Verifying exact contacts against both natal charts…');
 setTimeout(()=>{
  const lines:string[]=[];
  for(const owner of profilesToCheck){
   try{
    const r=report(owner,instant),entry=rankPrioritySignals({signals:r.signals,natal:r.natal,knownBirthTime:owner.known,complete:r.complete}).find(x=>x.factor.applying);
    if(!entry){lines.push(esc(owner.name)+': '+t('لا يوجد اتصال مقترب محسوب','No calculated applying contact'));continue}
    const result=refineNatalTransit(entry.factor,instant,at=>chart(at,owner,true,false).points,21);
    const first=result.events.filter(e=>+e.time>=+instant).sort((a,b)=>+a.time-+b.time)[0];
    lines.push(esc(owner.name)+': '+(first?dateText(first.time):t('ماكو ذروة دقيقة قادمة ضمن 21 يوم','No exact future peak in 21 days')));
   }catch(e){lines.push(esc(owner.name)+': '+t('التحقق غير متاح','Verification unavailable'))}
  }
  if(!root.contains(button)||button.dataset.partnerPeak!==person.id)return;
  area.innerHTML=lines.map(line=>'<p>'+line+'</p>').join('');
  button.disabled=false;
 },30);
});
 
 on('calendar-expand',()=>{calendarExpanded=!calendarExpanded;root.querySelector('.mx-calendar-compact')?.classList.toggle('is-expanded',calendarExpanded);const button=root.querySelector<HTMLButtonElement>('#calendar-expand');if(button)button.textContent=calendarExpanded?t('إظهار شهرين','Show two months'):t('إظهار كل الأشهر','Show all months');const p=root.querySelector('#astro-calendar-progress');if(p)p.textContent=calendarSnapshots.size+'/'+calendarTargetDays()+' '+t('محسوب فعلياً','verified');if(calendarExpanded&&!calendarRunning)startCalendarWork()});
 const expandSky=()=>{if(!data)return;showDialog('<div class="mx-expanded-sky"><span class="eyebrow">✦ MX ASTRO · LIVE SKY</span><h2>'+t('سماء اللحظة · الدائرة المكبرة','Current sky · Expanded wheel')+'</h2><time class="mx-expanded-sky-time" datetime="'+new Date().toISOString()+'">'+dateText(new Date(),{dateStyle:'full',timeStyle:'medium'})+'</time><div class="mx-expanded-wheel">'+wheel(data.current)+'</div><div class="mx-expanded-sky-notes">'+t('مواضع فلكية محسوبة بالزودياك الاستوائي. معانيها تنجيمية رمزية.','Calculated tropical zodiac positions; interpretations are astrological symbolism.')+'</div></div>');liveSkyLastTick=Date.now();updateLiveSkyWheel(liveSkyLastTick);tickLiveClocks(liveSkyLastTick);};
 on('expand-sky-wheel',expandSky);on('expand-sky-wheel-link',expandSky);
 if(screen==='calendar')bindAstroCalendar();
 root.querySelectorAll<HTMLButtonElement>('[data-signal]').forEach(b=>b.onclick=()=>showSignal(Number(b.dataset.signal)));
 root.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>b.onclick=()=>{filter=b.dataset.category as Category;navigate('signals')});
 root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter as typeof filter;render()});
 root.querySelectorAll<HTMLButtonElement>('[data-chart]').forEach(b=>b.onclick=()=>{chartMode=b.dataset.chart!;render()});
 root.querySelectorAll<HTMLButtonElement>('[data-soul-category]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.soulCategory);const entry=soulCategories[id-1];if(!entry)return;soulCategory=id;soulTopic=entry.topics[0].id;render();root.querySelector('#soul-reading')?.scrollIntoView({behavior:'smooth',block:'start'})});
 root.querySelectorAll<HTMLButtonElement>('[data-soul-topic]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.soulTopic);if(!Number.isInteger(id)||id<1||id>200)return;soulCategory=Math.ceil(id/8);soulTopic=id;render();root.querySelector('#soul-reading')?.scrollIntoView({behavior:'smooth',block:'start'})});
 root.querySelectorAll<HTMLButtonElement>('[data-soul-scroll]').forEach(b=>b.onclick=()=>root.querySelector('#soul-reading')?.scrollIntoView({behavior:'smooth',block:'start'}));
 const soulPerson=root.querySelector<HTMLSelectElement>('#soul-person-select');if(soulPerson)soulPerson.onchange=()=>{soulPersonId=soulPerson.value;soulCategory=1;soulTopic=1;soulQuery='';render()};
 const searchSoul=root.querySelector<HTMLInputElement>('#soul-search');if(searchSoul)searchSoul.oninput=()=>{const current=searchSoul.value,pos=searchSoul.selectionStart;soulQuery=current;render();const next=root.querySelector<HTMLInputElement>('#soul-search');next?.focus({preventScroll:true});if(next&&pos!==null)next.setSelectionRange(pos,pos)};
 on('soul-ai',async()=>{
  let key='';
  try{
   const {person,natal}=soulViewProfile(),topic=soulTopics.find(x=>x.id===soulTopic);
   if(!topic)throw Error('Invalid Soul topic');
   key=soulAIKey(person,topic.id);soulAIActive=key;soulAIBusy=true;soulAIError='';render();
   const reading=soulReading(natal,topic,{knownTime:person.known});
   if(reading.basisStatus!=='available')throw Error(t('البيانات غير كافية لهالموضوع؛ ما نطلب استنتاج من Ai بلا أساس.','Insufficient evidence for this topic; Ai inference is disabled.'));
   const evidence=reading.basis;
   const response=await fetch('/api/soul',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topicId:topic.id,language:lang,birthTimeKnown:person.known,evidence}),signal:AbortSignal.timeout(65000)});
   const result=await response.json();
   if(!response.ok)throw Error(result.error||'Ai structured response unavailable');
   if(result.topicId!==topic.id||typeof result.summary!=='string'||!Array.isArray(result.strengths))throw Error('Invalid Soul AI response');
   if(key===soulAIKey(person,topic.id)){
    soulAIResults.set(key,result as SoulAI);if(soulAIResults.size>24)soulAIResults.delete(soulAIResults.keys().next().value!);
   }
  }catch(e){if(key===soulAIActive)soulAIError=String(e)}
  finally{soulAIBusy=false;if(chartMode==='details')render()}
 });
 root.querySelectorAll<HTMLButtonElement>('[data-soul-save]').forEach(b=>b.onclick=()=>{const p=profiles.find(x=>x.id===soulPersonId)??active;if(p.kind!=='self')return;const text=root.querySelector<HTMLTextAreaElement>('#soul-personal-answer')?.value??'';try{sessionStorage.setItem('mx.soul.discovery.v1:'+p.id+':'+soulTopic,text.slice(0,1500));toast(t('انحفظت ملاحظتك لهالجلسة بس','Your note is saved for this session only'))}catch{toast(t('التخزين الخاص مو متاح بهذا المتصفح','Session storage is unavailable'))}});
 root.querySelectorAll<HTMLButtonElement>('[data-soul-clear]').forEach(b=>b.onclick=()=>{const p=profiles.find(x=>x.id===soulPersonId)??active;try{sessionStorage.removeItem('mx.soul.discovery.v1:'+p.id+':'+soulTopic)}catch{}const ta=root.querySelector<HTMLTextAreaElement>('#soul-personal-answer');if(ta)ta.value=''});

 root.querySelectorAll<HTMLButtonElement>('[data-shift]').forEach(b=>b.onclick=()=>updateTime(new Date(+selected+Number(b.dataset.shift)*3600000)));
 root.querySelectorAll<HTMLButtonElement>('[data-heat-at]').forEach(b=>b.onclick=()=>updateTime(new Date(Number(b.dataset.heatAt))));
 root.querySelectorAll<HTMLButtonElement>('[data-relationship-time]').forEach(b=>b.onclick=()=>{navigate('time');updateTime(new Date(Number(b.dataset.relationshipTime)))});
 root.querySelectorAll<HTMLButtonElement>('[data-relationship-calendar]').forEach(b=>b.onclick=()=>{try{const at=new Date(Number(b.dataset.relationshipCalendar));if(+at<Date.now())throw Error(t('هذا الوقت مضى.','This time has passed.'));const mode=b.dataset.relationshipKind,person=profiles.find(p=>p.id===compareId);const ics=calendarEvent({id:'mx-relationship-'+mode+'-'+(+at),start:at,end:new Date(+at+30*60000),title:'MX Astro: '+(mode==='date'?'Consider a date':'Consider a message'),description:'Symbolic reminder only; not a prediction. '+(person?.name??'')});calendarDownload(ics,'mx-astro-relationship.ics');toast(t('صار ملف تذكير التقويم جاهز','Calendar reminder prepared'))}catch(e){toast(String(e))}});
 root.querySelectorAll<HTMLButtonElement>('[data-year-at]').forEach(b=>b.onclick=()=>{const date=new Date(Number(b.dataset.yearAt));navigate('time');updateTime(date)});
 root.querySelectorAll<HTMLButtonElement>('[data-lunation-at]').forEach(b=>b.onclick=()=>{navigate('time');updateTime(new Date(Number(b.dataset.lunationAt)))});
 root.querySelectorAll<HTMLButtonElement>('[data-eclipse-at]').forEach(b=>b.onclick=()=>{navigate('time');updateTime(new Date(Number(b.dataset.eclipseAt)))});
 on('check-local-eclipses',()=>{try{const events=confirmedEclipses(new Date(),1,{lat:active.lat,lon:active.lon},true);const rows=events.map(e=>`<div class="eclipse-local-row"><b>${e.kind==='solar'?t('كسوف','Solar'):t('خسوف','Lunar')} · ${dateText(e.maximum)}</b><p>${!e.local?t('الدالة المحلية غير متاحة','Local API unavailable'):e.local.visible?t('مرئي هندسياً من الإحداثيات المحفوظة','Geometrically visible from saved coordinates'):t('غير مرئي من هذه الإحداثيات','Not visible from these coordinates')}</p>${e.local?.maximum?`<small>${t('ذروة الحدث محلياً','Local maximum')}: ${dateText(e.local.maximum)}</small>`:''}</div>`).join('');showDialog(`<h2>${t('نتيجة الرؤية من الإحداثيات المحفوظة','Visibility from saved coordinates')}</h2><p>${esc(active.city)} · ${active.lat.toFixed(3)}, ${active.lon.toFixed(3)}</p><p>${t('هذه إحداثيات ملف الميلاد، مو GPS الحالي؛ نتائج الرؤية مشروطة بصحة الإحداثيات وخط الأفق وحالة الطقس.','This is the saved birth location, not live GPS. Visibility assumes accurate coordinates and unobstructed horizon; weather is not modeled.')}</p>${rows}`)}catch(err){toast(String(err))}});
 on('load-named-asteroids',async()=>{if(asteroidLoading)return;asteroidLoading=true;asteroidFailures=[];asteroidProgress=t('جار تجهيز ملفات Swiss…','Preparing Swiss asteroid ephemerides…');render();try{const result=await loadNamedAsteroids(asteroidSwissRuntime(),progress=>{asteroidProgress=progress.ready+' / '+progress.total+' '+t('تم تحميلها','files ready')+' · '+progress.failed+' '+t('فشلت','failed');const el=root.querySelector('#asteroid-progress');if(el)el.textContent=asteroidProgress});asteroidFailures=result.failed;asteroidProgress=result.ready+' / 56 '+t('ملفات محمّلة ومفحوصة','loaded and verified files')}catch(e){asteroidProgress=t('خطأ تحميل البيانات: ','Ephemeris loading error: ')+String(e)}finally{asteroidLoading=false;render()}});
 const astSelect=root.querySelector<HTMLSelectElement>('#asteroid-category');if(astSelect)astSelect.onchange=()=>{const v=astSelect.value;if(v==='all'||categories.includes(v as Category)){asteroidCategory=v as Category|'all';render()}};
 const spanSelect=root.querySelector<HTMLSelectElement>('#heat-span');if(spanSelect)spanSelect.onchange=()=>{const span=Number(spanSelect.value);if(span===30||span===90||span===365){heatmapSpan=span;render()}};
 const heatSelect=root.querySelector<HTMLSelectElement>('#heat-category');if(heatSelect)heatSelect.onchange=()=>{const value=heatSelect.value;if(value==='average'||categories.includes(value as Category)){heatmapCategory=value as Category|'average';render()}};
 root.querySelectorAll<HTMLButtonElement>('[data-now]').forEach(b=>b.onclick=()=>updateTime(new Date(),false));
 root.querySelectorAll<HTMLButtonElement>('[data-compare]').forEach(b=>b.onclick=()=>{try{compareId=b.dataset.compare!;render()}catch(e){toast(String(e))}});
 root.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(b=>b.onclick=()=>editProfile(profiles.find(p=>p.id===b.dataset.edit)!));
 on('tools',()=>{showDialog(`<h2>${t('استكشف أكثر','Explore more')}</h2>${nav(primaryRoutes)}<div class="mx-tools-extra">${nav(['signals','asteroids','lunar','eclipses','advanced','evidence','ai'])}</div>`);root.querySelectorAll<HTMLButtonElement>('dialog [data-go]').forEach(b=>b.onclick=()=>{closeDialog();navigate(b.dataset.go!)});});
 const clockSelect=root.querySelector<HTMLSelectElement>('#clock-format');if(clockSelect)clockSelect.onchange=()=>{clockFormat=clockSelect.value==='12'?'12':'24';localStorage.setItem('mx.clockFormat',clockFormat);render()};
 on('language',()=>{setLang(lang==='ar'?'en':'ar');aiAnswer='';render()});on('settings-language',()=>{setLang(lang==='ar'?'en':'ar');aiAnswer='';render()});
 on('refresh',()=>{cache.clear();updateTime(new Date(),false);toast(t('تحدّثت الحسابات','Calculations refreshed'))});
 const select=root.querySelector<HTMLSelectElement>('#active-profile');if(select)select.onchange=()=>{if(screen==='chart'){if(!profiles.some(p=>p.id===select.value))return;soulPersonId=select.value;render();return}active=profiles.find(p=>p.id===select.value)!;localStorage.setItem('mx.active',active.id);compareId='';cache.clear();recalculate();render()};
 const tf=root.querySelector<HTMLFormElement>('#time-form');if(tf)tf.onsubmit=e=>{e.preventDefault();try{updateTime(zonedInstant(String(new FormData(tf).get('moment')),active.zone))}catch(err){toast(t('الوقت غير صالح أو ملتبس بسبب التوقيت الصيفي.','Invalid or ambiguous local time. Check daylight saving transitions.'))}};
 const newPerson=()=>editProfile({...defaultProfile,id:crypto.randomUUID(),name:'',date:'',time:'12:00',known:false,kind:'friend',sex:undefined},true);on('add-person',newPerson);on('add-first',newPerson);
 const journalForm=root.querySelector<HTMLFormElement>('#journal-form');if(journalForm)journalForm.onsubmit=e=>{e.preventDefault();try{const person=profiles.find(p=>p.id===compareId);if(!person)throw Error('Select a profile first');const f=new FormData(journalForm),now=new Date();const demo=active.id==='demo'&&active.date==='2000-01-01'&&active.city==='Greenwich';const domain:Category=person.kind==='dating'?'love':'communication';const entry:JournalEntry={id:crypto.randomUUID(),personId:person.id,at:now.toISOString(),kind:String(f.get('kind')) as InteractionKind,outcome:String(f.get('outcome')) as Outcome,note:String(f.get('note')??'').trim(),symbolicIndex:demo?null:getReport(now).scores[domain],indexDomain:demo?null:domain};checkJournal(entry);const all=readJournal();writeJournal([...all.slice(-249),entry]);render();toast(t('انحفظ سجل التفاعل','Observation saved'))}catch(err){toast(String(err))}};
 root.querySelectorAll<HTMLButtonElement>('[data-journal-delete]').forEach(b=>b.onclick=()=>{const id=b.dataset.journalDelete;if(!id)return;showDialog(`<h2>${t('حذف الملاحظة؟','Delete observation?')}</h2><button id="confirm-journal-delete" class="primary">${t('نعم احذف','Confirm delete')}</button>`);root.querySelector<HTMLButtonElement>('#confirm-journal-delete')!.onclick=()=>{writeJournal(readJournal().filter(x=>x.id!==id));closeDialog();render()}})
 bindProfileForm(root);on('export-report',()=>download({schema:2,calculationVersion:CALCULATION_VERSION,conventions:{zodiac:'tropical',frame:'geocentric',houses:active.known&&data?.natal.cusps.length===12?'Placidus':'omitted',birthTimeKnown:active.known,timeZone:active.zone,calendarCheckpoints:[...CALENDAR_SAMPLE_HOURS],exactTimes:'numerical root search only',indices:'symbolic, not calibrated event probabilities'},sourcePortCommit:'5f9b1990f5f2ad154ee325e68fd229666b80ff5a',engine:engineVersion,notice:notice(),report:data},'mx-astro-calculation.json'));
 on('backup',()=>download({schema:1,exportedAt:new Date().toISOString(),profiles,journal:readJournal()},'mx-astro-private-backup.json'));
 on('push-status',async()=>{try{const state=await getPushStatus();toast(state.configured?(state.schedulerEnabled?t('خدمة الخلفية مفعّلة من السيرفر','Background push server and scheduler active'):t('الاشتراك موجود لكن مجدول الإرسال مو مفعّل بعد','Subscription backend exists but scheduled sending is not confirmed')):t('خدمة الخلفية بعد تحتاج ربط D1 ومفاتيح VAPID بـCloudflare','Cloudflare D1 and VAPID keys are not connected'))}catch(e){toast(String(e))}});
 on('push-subscribe',async()=>{try{
  if(!pushAvailableOnThisDevice())throw Error(t('هذا المتصفح ما يدعم Web Push. على الآيفون افتح أيقونة الموقع من الشاشة الرئيسية.','Web Push unsupported; on iPhone open the installed Home Screen app.'));
  const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
  if(permission!=='granted')throw Error(t('إذن الإشعارات مرفوض','Notifications permission denied'));
  const schedule=moonPushSchedule();
  const response=await subscribeBackgroundPush(eyeSettings,active.zone,schedule);
  eyeSettings={...eyeSettings,enabled:true};saveEyeSettings(eyeSettings);
  toast(response.schedulerEnabled?t('تنبيهات الخلفية اشتركت. استعمل إشعار التجربة للتحقق من جهازك.','Background subscription saved. Send a test to verify this device.'):t('تم حفظ الاشتراك لكن إرسال الخلفية يحتاج تفعيل المجدول','Subscribed, but the background scheduler is not enabled yet'));
  render();
 }catch(e){toast(String(e))}});
 on('push-test',async()=>{try{const response=await sendBackgroundPushTest();toast(response.sent?t('انرسل اختبار حقيقي لخدمة الإشعارات','A real Web Push test was sent'):t('الاختبار ما تأكد','Push test unconfirmed'))}catch(e){toast(String(e))}});
 on('push-unsubscribe',async()=>{try{const response=await unsubscribeBackgroundPush();toast(response.remotelyRemoved===false?t('انلغى اشتراك المتصفح؛ إلغاء تسجيل السيرفر يتطلب اتصال','Unsubscribed browser; server record could not be removed now'):t('انلغى اشتراك تنبيهات الخلفية لهذا الجهاز','This device unsubscribed from background alerts'))}catch(e){toast(String(e))}});
 on('eye-toggle',async()=>{const disabling=eyeSettings.enabled;eyeSettings={...eyeSettings,enabled:!eyeSettings.enabled};saveEyeSettings(eyeSettings);if(disabling&&backgroundPushOptedIn()){try{const off=await unsubscribeBackgroundPush();if(!off.remotelyRemoved)toast(t('تنبيهات الجهاز توقفت؛ يحتاج اتصال لحذف الاشتراك من السيرفر.','Local notifications stopped; reconnect to remove the remote subscription.'))}catch(e){toast(String(e))}}if(eyeSettings.enabled&&typeof Notification!=='undefined'&&Notification.permission==='default'){try{await Notification.requestPermission()}catch{}}render();void runEyeCheck()});
 for(const field of root.querySelectorAll<HTMLInputElement>('[data-eye]'))field.onchange=()=>{const key=field.dataset.eye;if(key==='moon'||key==='hourly'||key==='daily'){eyeSettings={...eyeSettings,[key]:field.checked};saveEyeSettings(eyeSettings);if(backgroundPushOptedIn()&&eyeSettings.enabled&&ready)void refreshBackgroundPushIfNeeded(eyeSettings,active.zone,moonPushSchedule(),0).catch(e=>toast(String(e)))}};
 const syncField=root.querySelector<HTMLTextAreaElement>('#sync-code');if(syncField)syncField.oninput=()=>{syncCode=syncField.value.trim()};
 on('sync-new',()=>{if(syncCode&&!confirm(t('رح تغيّر رمز الاتصال الحالي. تأكد محتفظ بالقديم إذا عندك بيانات مرفوعة عليه.','This replaces the current connection code. Keep the previous one if data is synced to it.')))return;syncCode=createSyncCode();render();toast(t('انعمل رمز اتصال جديد، انسخه وخزّنه','New private sync code created. Copy and store it safely'))});
 on('sync-copy',async()=>{try{parseSyncCode(syncCode);await navigator.clipboard.writeText(syncCode);toast(t('انسخ الرمز للجهاز الثاني بدون كلمة السر','Connection code copied; share the passphrase separately'))}catch(e){toast(String(e))}});
 on('sync-test',async()=>{const status=await syncStatus();toast(status.configured?t('قاعدة المزامنة متصلة ومهيأة','Secure sync database is connected'):t('المزامنة السحابية تحتاج ربط MX_SYNC_DB من Cloudflare','Cloudflare D1 binding MX_SYNC_DB is not configured'))});
 on('sync-upload',async()=>{try{parseSyncCode(syncCode);const pass=root.querySelector<HTMLInputElement>('#sync-passphrase')?.value??'';if(vaultOpened())await flushVault();const rev=syncRevisions.get(syncCode)??0;const result=await uploadEncrypted(syncCode,pass,rev,{schema:1,exportedAt:new Date().toISOString(),profiles,journal:readJournal()});syncRevisions.set(syncCode,result.revision);const input=root.querySelector<HTMLInputElement>('#sync-passphrase');if(input)input.value='';toast(t('ارتفعت النسخة مشفّرة فقط. رقم النسخة: ','Encrypted backup uploaded. Version: ')+result.revision)}catch(e){toast(String(e))}});
 on('sync-download',async()=>{try{parseSyncCode(syncCode);const pass=root.querySelector<HTMLInputElement>('#sync-passphrase')?.value??'';const result=await downloadEncrypted(syncCode,pass);const restored=parseBackup(JSON.stringify(result.payload));const journal=parseJournalBackup((result.payload as any)?.journal,new Set(restored.map(x=>x.id)));const mergedProfiles=[...new Map([...restored,...profiles].map(p=>[p.id,p])).values()];if(mergedProfiles.length>100)throw Error('Merge would exceed 100 profiles');const mergedJournal=[...new Map([...journal,...readJournal()].map(e=>[e.id,e])).values()];if(mergedJournal.length>250)throw Error('Merge would exceed 250 journal entries');if(!confirm(t('النسخة موجودة: '+restored.length+' ملف و'+journal.length+' سجل. تريد تدمجها ويا ملفات هذا الجهاز؟ الملفات الموجودة ما تنحذف.','Remote backup contains '+restored.length+' profiles and '+journal.length+' notes. Merge into this device, preserving existing data?')))return;saveProfiles(mergedProfiles);writeJournal(mergedJournal);profiles=mergedProfiles;syncRevisions.set(syncCode,result.revision);const input=root.querySelector<HTMLInputElement>('#sync-passphrase');if(input)input.value='';toast(t('تم دمج النسخة المشفرة بدون مسح بيانات هذا الجهاز','Encrypted backup merged without discarding existing local data'));render()}catch(e){toast(String(e))}});
 on('vault-enable',async()=>{try{if(isVaultConfigured())return;const field=root.querySelector<HTMLInputElement>('#vault-password');const pass=field?.value??'';if(!confirm(t('راح تتشفّر الملفات والسجل، وتحتاج كلمة السر كل مرة تفتح الموقع. سوّيت نسخة احتياطية مشفّرة؟','Your browser profiles and journal will be encrypted. Every visit will require this passphrase. Do you have a separate encrypted backup?')))return;await setupVault(pass,profiles,readJournal());if(field)field.value='';toast(t('الخزنة المشفّرة تفعّلت بنجاح','Local encrypted vault enabled'));render()}catch(e){toast(String(e))}});
 on('secure-backup',async()=>{try{const field=root.querySelector<HTMLInputElement>('#secure-passphrase');const password=field?.value??'';const wrapped=await encryptBackup({schema:1,exportedAt:new Date().toISOString(),profiles,journal:readJournal()},password);download(wrapped,'mx-astro-encrypted-backup.json');if(field)field.value='';toast(t('انحفظت النسخة المشفّرة','Encrypted backup exported'))}catch(e){toast(String(e))}});
 const protectedInput=root.querySelector<HTMLInputElement>('#secure-restore');if(protectedInput)protectedInput.onchange=async()=>{try{
  const file=protectedInput.files?.[0];if(!file)return;if(file.size>1500000)throw Error('Encrypted backup is too large');
  const field=root.querySelector<HTMLInputElement>('#secure-passphrase');const password=field?.value??'';
  const raw=JSON.parse(await file.text());const decrypted=await decryptBackup(raw,password);const restored=parseBackup(JSON.stringify(decrypted));const restoredJournal=parseJournalBackup((decrypted as {journal?:unknown}).journal,new Set(restored.map(p=>p.id)));if(field)field.value='';
  showDialog(`<h2>${t('استيراد نسخة مشفّرة','Import encrypted backup')}</h2><p>${restored.length} ${t('ملف. هل تريد استبدال بياناتك الحالية؟','profiles. Replace existing browser profiles?')}</p><button class="primary" id="confirm-secure-restore">${t('نعم، استبدل','Confirm replacement')}</button>`);
  root.querySelector<HTMLButtonElement>('#confirm-secure-restore')!.onclick=()=>{saveProfiles(restored);writeJournal(restoredJournal);profiles=restored;active=profiles.find(p=>p.kind==='self')??profiles[0];localStorage.setItem('mx.active',active.id);cache.clear();moonCache=null;selected=new Date();closeDialog();recalculate();render();toast(t('تم استيراد النسخة المشفّرة','Encrypted backup imported'))};
 }catch(e){toast(t('فشل فك تشفير النسخة: ','Could not decrypt backup: ')+String(e))}};
 const restore=root.querySelector<HTMLInputElement>('#restore');if(restore)restore.onchange=async()=>{try{const file=restore.files?.[0];if(!file)return;if(file.size>1000000)throw Error('Backup too large');const rawText=await file.text();const restored=parseBackup(rawText);const restoredJournal=parseJournalBackup(JSON.parse(rawText).journal,new Set(restored.map(p=>p.id)));showDialog(`<h2>${t('استيراد النسخة','Import backup')}</h2><p>${restored.length} ${t('ملف. راح نستبدل الملفات الحالية بهالنسخة.','profiles. This replaces your current profiles.')}</p><button class="primary" id="confirm-restore">${t('استبدال الملفات','Replace profiles')}</button>`);document.querySelector<HTMLButtonElement>('#confirm-restore')!.onclick=()=>{saveProfiles(restored);writeJournal(restoredJournal);profiles=restored;active=profiles.find(p=>p.kind==='self')??profiles[0];cache.clear();closeDialog();recalculate();render();toast(t('تم الاستيراد','Backup imported'))}}catch(e){toast(t('النسخة غير صالحة: ','Invalid backup: ')+String(e))}};
 on('delete-profile',()=>{if(profiles.length===1)return toast(t('لازم يبقى ملف واحد على الأقل.','Keep at least one profile.'));showDialog(`<h2>${t('حذف الملف؟','Delete profile?')}</h2><p>${esc(active.name)}</p><button id="confirm-delete" class="primary">${t('حذف من هالمتصفح','Delete from this browser')}</button>`);document.querySelector<HTMLButtonElement>('#confirm-delete')!.onclick=()=>{writeJournal(readJournal().filter(x=>x.personId!==active.id));profiles=profiles.filter(p=>p.id!==active.id);saveProfiles(profiles);active=profiles.find(p=>p.kind==='self')??profiles[0];cache.clear();closeDialog();recalculate();render()}});
 on('export-lunar-calendar',()=>{try{const w=moonWindow();const moment=w.isVoid?w.ingressAt:w.vocStartsAt;if(+moment<Date.now())return toast(t('هذا الموعد مضى. اختار وقت حالي أو مستقبلي.','That event is in the past. Select a current or future moment.'));const ics=calendarEvent({id:'mx-lunar-'+(+moment),start:moment,end:w.isVoid?new Date(+moment+15*60000):w.ingressAt,title:w.isVoid?'MX Astro: Moon enters next sign':'MX Astro: Moon VOC begins',description:'Swiss Ephemeris calculation; classical six-planet convention. Symbolic astrological timing.'});calendarDownload(ics,'mx-astro-moon.ics');toast(t('تم تجهيز ملف التقويم للتنبيه','Calendar reminder file prepared'))}catch(e){toast(String(e))}});
 on('install',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null}else toast(t('استخدم قائمة المتصفح ← تثبيت التطبيق، أو مشاركة ← إضافة إلى الشاشة الرئيسية على الآيفون.','Use your browser menu → Install app, or Share → Add to Home Screen on iPhone.'))});
}
function on(id:string,action:()=>void){const e=root.querySelector<HTMLElement>('#'+id);if(e)e.onclick=action}
function bindProfileForm(scope:ParentNode){
 const form=scope.querySelector<HTMLFormElement>('#profile-form');if(!form)return;
 const input=form!.querySelector<HTMLInputElement>('#place-search')!,options=form!.querySelector<HTMLDivElement>('#place-results')!;
 const chosen=form!.querySelector<HTMLDivElement>('#chosen-place')!,zone=form!.querySelector<HTMLSelectElement>('[name=zone]')!;
 let token=0,searchDelay=0;
 async function findPlaces(detailed=false){
  const query=input.value.trim(),request=++token;
  options.innerHTML='';if(query.length<2)return;
  options.textContent=t('دا أدوّر على المدن…','Searching for places…');
  try{
   const response=await fetch('/api/places?q='+encodeURIComponent(query)+(detailed?'&detailed=1':''),{signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error(t('خدمة المدن غير متاحة حالياً.','City search is temporarily unavailable.'));
   const payload=await response.json() as {results?:{name:string;label:string;lat:number;lon:number;zone:string}[]};
   if(request!==token)return;
   const matches=payload.results??[];
   options.innerHTML=matches.length?'':t('ما لقيت مكان مطابق، جرّب اسم المحافظة أو الاسم بالإنكليزي.','No matching place. Try the province or English spelling.');
   for(const city of matches){
    const item=document.createElement('button');item.type='button';item.className='place-option';item.textContent=city.label+' · '+city.zone;item.setAttribute('role','option');
    item.onclick=()=>{
     form!.querySelector<HTMLInputElement>('[name=city]')!.value=city.label;
     form!.querySelector<HTMLInputElement>('[name=lat]')!.value=String(city.lat);
     form!.querySelector<HTMLInputElement>('[name=lon]')!.value=String(city.lon);
     if(![...zone.options].some(o=>o.value===city.zone)){const o=new Option(city.zone,city.zone);zone.add(o)}
     zone.value=city.zone;form!.dataset.placeSelected='yes';input.value=city.label;chosen.textContent=city.label+' · '+city.zone;
     options.innerHTML='';form!.querySelector('.form-error')!.textContent='';
    };options.appendChild(item);
   }
  }catch(e){if(request===token)options.textContent=String(e)}
 }
 input.addEventListener('input',()=>{form!.dataset.placeSelected='no';chosen.textContent=t('اختار مكان من نتائج البحث','Choose a result to confirm the location');window.clearTimeout(searchDelay);searchDelay=window.setTimeout(findPlaces,350)});
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();window.clearTimeout(searchDelay);void findPlaces()}});
 const detailed=form!.querySelector<HTMLButtonElement>('#place-detailed');if(detailed)detailed.onclick=()=>{window.clearTimeout(searchDelay);void findPlaces(true)};
 form.onsubmit=e=>{e.preventDefault();try{
  if(form!.dataset.placeSelected!=='yes')throw Error(t('اختار المدينة من النتائج حتى تنحط الإحداثيات تلقائياً.','Choose a city from search results so coordinates are set automatically.'));
  const f=new FormData(form);const p=validateProfile({id:String(f.get('id')),name:String(f.get('name')).trim(),date:String(f.get('date')),time:String(f.get('time')),zone:String(f.get('zone')).trim(),lat:Number(f.get('lat')),lon:Number(f.get('lon')),city:String(f.get('city')).trim(),known:f.get('known')==='on',kind:String(f.get('kind')) as Profile['kind'],sex:(f.get('sex')||undefined) as Profile['sex']});
  const next=profiles.some(i=>i.id===p.id)?profiles.map(i=>i.id===p.id?p:i):[...profiles,p];
  if(!next.some(p=>p.kind==='self'))throw Error(t('لازم يبقى ملف شخصي واحد على الأقل.','Keep at least one My profile.'));
  saveProfiles(next);profiles=next;if(active.id===p.id)active=p.kind==='self'?p:profiles.find(p=>p.kind==='self')!;
  cache.clear();closeDialog();recalculate();render();toast(t('انحفظ الملف والمنطقة الزمنية والموقع','Profile, location and timezone saved'));
 }catch(err){form!.querySelector('.form-error')!.textContent=String(err)}};
}
function showDialog(html:string){const d=root.querySelector<HTMLDialogElement>('#detail')!;d.querySelector('#dialog-content')!.innerHTML=`<button id="close-dialog" class="icon-button close" aria-label="${t('إغلاق','Close')}">×</button>${html}`;d.querySelector<HTMLButtonElement>('#close-dialog')!.onclick=closeDialog;d.showModal()}
function closeDialog(){root.querySelector<HTMLDialogElement>('#detail')?.close()}
function editProfile(p:Profile,isNew=false){showDialog(`<h2>${isNew?t('إضافة شخص','Add person'):t('تعديل الملف','Edit profile')}</h2>${profileForm(p,isNew)}${!isNew?`<button id="remove-person" class="text-button danger">${t('حذف الملف','Delete profile')}</button>`:''}`);bindProfileForm(root.querySelector('dialog')!);const remove=root.querySelector<HTMLButtonElement>('#remove-person');if(remove)remove.onclick=()=>{if(p.kind==='self'&&profiles.filter(p=>p.kind==='self').length===1)return toast(t('لازم يبقى ملف شخصي واحد.','Keep one My profile.'));showDialog(`<h2>${t('حذف الملف؟','Delete profile?')}</h2><p>${esc(p.name)}</p><button id="confirm-remove" class="primary">${t('حذف من هالمتصفح','Delete from this browser')}</button>`);root.querySelector<HTMLButtonElement>('#confirm-remove')!.onclick=()=>{profiles=profiles.filter(i=>i.id!==p.id);saveProfiles(profiles);if(active.id===p.id)active=profiles.find(p=>p.kind==='self')!;compareId='';cache.clear();closeDialog();recalculate();render();toast(t('انحذف الملف','Profile deleted'))}}}
function showSignal(i:number){const s=data!.signals[i],text=copy(s),review=reviewSignal(s);showDialog(`<span class="eyebrow">${cat(s.category)} · ${tone(s)}</span><h2>${text.title}</h2><div class="detail-score">${s.score}<small>/100 · Tier ${s.tier}</small></div><div class="direct-advice"><p><b>${t('الزين','Good')}</b>${text.good}</p><p><b>${t('انتبه','Watch out')}</b>${text.careful}</p><p><b>${t('سوي هالشي','Do this')}</b>${text.action}</p></div>${review.contradictory?`<p class="intel-audit">${t('تنبيه: توجد إشارات داعمة ومتحدية معاً، فلا تعتبر اتجاه النصيحة مؤكداً.','Both supportive and challenging contacts coexist; this is not a confident one-sided reading.')}</p>`:''}<h3>${t('الدليل المحسوب','Calculated evidence')}</h3>${s.factors.map(e=>`<div class="evidence-line"><p>${technical(e)}</p><small>${t('الوزن','Weight')}: ${e.weight.toFixed(4)} · ${t('أقصى أورب','Maximum orb')}: ${e.maximumOrb}°</small>${e.exact?`<small>${t('تقدير الذروة الخطي','Linear peak estimate')}: ${dateText(new Date(e.exact),{dateStyle:'medium',timeStyle:'short'})}</small>`:''}</div>`).join('')}<div class="precision-tool"><button class="secondary" id="refine-signal">${t('دقق أقوى اتصال بحساب الحركة الفعلية','Refine strongest contact from sampled ephemeris')} ↗</button><p class="subtle">${t('البحث يدقق اتصالاً واحداً ضمن ±21 يوم من الوقت المختار، وقد لا يجد ذروة ضمن النافذة. يختلف عن التقدير الخطي.','Searches one contact over a ±21-day window. An exact hit may not occur in that window. This differs from linear estimation.')}</p><div id="precision-result" role="status"></div></div>`);const button=root.querySelector<HTMLButtonElement>('#refine-signal');if(button)button.onclick=()=>{const area=root.querySelector('#precision-result');const first=s.factors[0];if(!area||!first)return;button.disabled=true;area.textContent=t('دا أحسب ذروة الاتصال…','Refining exact contact…');try{const result=refineNatalTransit(first,selected,at=>chart(at,active,true,false).points,21);area.innerHTML=result.nearest?`<p><b>${t('الذروة الفلكية الأقرب ضمن نافذة البحث','Nearest exact astronomical contact in search window')}: ${dateText(result.nearest.time)}</b></p><small>${result.events.length} ${t('لحظات دقيقة تم إيجادها (بحد تقريبي دقيقة واحدة)','exact crossings (about one-minute search tolerance)')}</small>`:`<p>${t('ماكو ذروة دقيقة خلال ±21 يوم. ما تم تخمين موعد.','No exact crossing within ±21 days; no time was invented.')}</p>`}catch(e){area.textContent=t('تعذر حساب الذروة: ','Could not refine contact: ')+String(e)}finally{button.disabled=false}}}
function toast(message:string){clearTimeout(toastTimer);const el=root.querySelector('#toast');if(el){el.textContent=message;el.classList.add('visible');toastTimer=setTimeout(()=>el.classList.remove('visible'),6500)}}
function recalculate(){if(!ready)return;try{data=getReport();error=''}catch(e){data=undefined;error=String(e);aiAnswer='';aiAnswerAt='';aiRequestId++;aiBusy=false}}
function updateTime(at:Date,pin=true){const before=selected;try{const r=getReport(at);selected=at;liveTimePinned=pin;data=r;error='';aiAnswer='';aiAnswerAt='';aiRequestId++;aiBusy=false;if(screen==='ai'){aiResponseSignature='';aiLastCheckMinute=-1;aiNextRequestAt=0}render()}catch(e){selected=before;toast(String(e))}}

/** Clock updates reuse the rendered shell; edits, scroll and navigation state are retained. */

/** Keep countdown rings in sync without rerendering, scrolling, or losing focus. */
function updateLunarGauge(kind:'moon'|'voc',now:number){
 const el=root.querySelector<HTMLElement>('[data-lunar-gauge="'+kind+'"]');if(!el)return;
 const start=Number(el.dataset.gaugeStart),end=Number(el.dataset.gaugeEnd),signStart=Number(el.dataset.gaugeSignStart);
 if(!Number.isFinite(now)||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return;
 const phase=kind==='voc'?vocPhase(start,end,now):'active';
 const a=kind==='voc'&&phase==='upcoming'?signStart:start;
 const b=kind==='voc'&&phase==='upcoming'?start:end;
 const percentage=phase==='elapsed'?0:remainingPercent(a,b,now),rounded=Math.round(percentage);
 const label=kind==='moon'?t('المتبقي حتى البرج القادم','Until next sign'):phase==='active'
  ?t('المتبقي حتى نهاية خلو المسار','Until VOC ends')
  :phase==='upcoming'?t('المتبقي حتى بداية خلو المسار','Until VOC begins'):t('انتهى خلو المسار','VOC ended');
 const remaining=Math.max(0,Math.ceil((b-now)/1000));
 const timer=[Math.floor(remaining/3600),Math.floor(remaining%3600/60),remaining%60].map(n=>String(n).padStart(2,'0')).join(':');
 const pct=el.querySelector<HTMLElement>('[data-gauge-percent]'),lbl=el.querySelector<HTMLElement>('[data-gauge-label]');
 const tm=el.querySelector<HTMLElement>('[data-gauge-time]'),ring=el.querySelector<SVGCircleElement>('.mx-lunar-gauge-progress');
 const bar=el.querySelector<HTMLElement>('[role="progressbar"]');
 if(pct&&pct.textContent!==rounded+'%')pct.textContent=rounded+'%';
 if(lbl&&lbl.textContent!==label)lbl.textContent=label;
 if(tm&&tm.textContent!==timer)tm.textContent=timer;
 if(ring)ring.style.strokeDashoffset=String(60*Math.PI*(1-percentage/100));
 if(bar){bar.setAttribute('aria-label',label);bar.setAttribute('aria-valuenow',String(rounded))}
}
function updateLiveVocClock(now:number):boolean{
 updateLunarGauge('moon',now);updateLunarGauge('voc',now);
 const card=root.querySelector<HTMLElement>('.mx-voc-status');
 if(!card)return false;
 const start=Number(card.dataset.vocStart),end=Number(card.dataset.vocEnd);
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return false;
 const phase=vocPhase(start,end,now);
 if(phase==='elapsed'||card.classList.contains('is-voc')!==(phase==='active'))return true;
 const left=vocRemaining(start,end,now),parts=[Math.floor(left/3600),Math.floor(left%3600/60),left%60];
 const countdown=card.querySelector<HTMLElement>('[data-voc-countdown]');
 if(countdown){
  const txt=(phase==='active'?t('ينتهي خلال','Ends in'):t('يبدأ خلال','Begins in'))+' · '+parts.map(n=>String(n).padStart(2,'0')).join(':');
  if(countdown.textContent!==txt)countdown.textContent=txt;
 }
 return false;
}

/** Reconcile live markup without replacing stable wheels, expanded details,
 * scroll containers or touched controls. Replacing innerHTML would reset zoom. */
function reconcileLiveNode(current:Node,incoming:Node,preserveLiveWheels=false):void{
 if(current.nodeType!==incoming.nodeType||current.nodeName!==incoming.nodeName){
  current.parentNode?.replaceChild(incoming.cloneNode(true),current);return;
 }
 if(current.nodeType===Node.TEXT_NODE||current.nodeType===Node.COMMENT_NODE){
  if(current.nodeValue!==incoming.nodeValue)current.nodeValue=incoming.nodeValue;
  return;
 }
 if(current.nodeType!==Node.ELEMENT_NODE)return;
 const element=current as Element,next=incoming as Element;
 // Only the ephemeris ticker updates SVGs; keep the last computed live
 // position through slower narrative ticks to prevent visual rewind.
 if(preserveLiveWheels&&element.matches('svg.chart-wheel'))return;
 const keepOpen=element.tagName==='DETAILS'&&element.hasAttribute('open');
 const keepWheelStyle=element.matches('svg.chart-wheel')?element.getAttribute('style'):null;
 for(const attr of Array.from(element.attributes)){
  if(!next.hasAttribute(attr.name)&&!(attr.name==='style'&&keepWheelStyle!==null))element.removeAttribute(attr.name);
 }
 for(const attr of Array.from(next.attributes)){
  if(attr.name==='style'&&keepWheelStyle!==null)continue;
  if(element.getAttribute(attr.name)!==attr.value)element.setAttribute(attr.name,attr.value);
 }
 if(keepOpen)element.setAttribute('open','');
 const currentChildren=Array.from(element.childNodes),nextChildren=Array.from(next.childNodes);
 for(let i=0;i<Math.max(currentChildren.length,nextChildren.length);i++){
  const oldChild=currentChildren[i],newChild=nextChildren[i];
  if(!oldChild){if(newChild)element.appendChild(newChild.cloneNode(true));continue}
  if(!newChild){oldChild.parentNode?.removeChild(oldChild);continue}
  reconcileLiveNode(oldChild,newChild,preserveLiveWheels);
 }
}
function reconcileLiveHTML(current:Element,html:string,preserveLiveWheels=false){
 const template=document.createElement('template');
 template.innerHTML=html;
 const next=template.content.firstElementChild;
 if(next)reconcileLiveNode(current,next,preserveLiveWheels);
}
/** Exact Swiss-Ephemeris positions are recalculated frequently even while a
 * sky wheel is enlarged. The existing SVG element is retained during updates. */
function updateLiveSkyWheel(now:number){
 if(!ready||liveTimePinned||document.visibilityState==='hidden')return;
 const small=root.querySelector<SVGElement>('.sky-card svg.chart-wheel');
 const todayWheel=screen==='today'?root.querySelector<SVGElement>('.mx-today-sky svg.chart-wheel'):null;
 const enlarged=root.querySelector<SVGElement>('#detail[open] .mx-expanded-wheel svg.chart-wheel');
 const chartWheel=screen==='chart'&&chartMode!=='natal'&&chartMode!=='details'
  ?root.querySelector<SVGElement>('.chart-layout svg.chart-wheel'):null;
 if(!small&&!todayWheel&&!enlarged&&!chartWheel)return;
 try{
  const at=new Date(now),sky=chart(at,active,true);
  if(small||todayWheel||enlarged){
   const html=wheel(sky);
   if(small)reconcileLiveHTML(small,html);
   if(todayWheel)reconcileLiveHTML(todayWheel,html);
   if(enlarged)reconcileLiveHTML(enlarged,html);
  }
  if(chartWheel){
   const owner=chartOwnerProfile();
   const current=owner.id===active.id?sky:chart(at,owner,true);
   const natal=chartMode==='overlay'?(owner.id===active.id?data!.natal:chart(birthInstant(owner),owner)):null;
   reconcileLiveHTML(chartWheel,chartMode==='overlay'&&natal?wheel(natal,current):wheel(current));
  }
  // Stamp the completed Swiss Ephemeris refresh on every visible wheel, including
  // a modal left open on iOS or desktop. This is the calculation time, not a label.
  for(const element of [small,todayWheel,enlarged,chartWheel]){
   if(element)element.setAttribute('data-sky-calculated-at',at.toISOString());
  }
 }catch(e){console.warn('Live sky wheel update unavailable',e)}
}
/** A seconds clock independent of the Swiss Ephemeris and narrative DOM update.
 * Continue while the sky is enlarged on any visible tab; no fake ephemeris. */
function tickEclipseCountdowns(now:number){
 if(screen!=='eclipses')return;
 root.querySelectorAll<HTMLElement>('.eclipse-premium[data-eclipse-start][data-eclipse-end]').forEach(card=>{
  const start=Number(card.dataset.eclipseStart),end=Number(card.dataset.eclipseEnd);
  if(!Number.isFinite(start)||!Number.isFinite(end))return;
  const phase=now>=end?'finished':now>=start?'live':start-now<=21600000?'warning':'upcoming';
  for(const status of ['upcoming','warning','live','finished'])
   card.classList.toggle('eclipse-'+status,phase===status);
 });
 root.querySelectorAll<HTMLElement>('.eclipse-countdown[data-eclipse-to]').forEach(tile=>{
  const target=Number(tile.dataset.eclipseTo);
  if(!Number.isFinite(target))return;
  const parts=eclipseCountdownParts(now,target);
  for(const unit of ['months','days','hours','minutes','seconds'] as const){
   const el=tile.querySelector<HTMLElement>('[data-eclipse-unit="'+unit+'"]');
   const value=String(parts[unit]).padStart(2,'0');
   if(el&&el.textContent!==value)el.textContent=value;
  }
 });
 root.querySelectorAll<HTMLElement>('.eclipse-live-countdown[data-eclipse-end-timer]').forEach(tile=>{
  const end=Number(tile.dataset.eclipseEndTimer);
  if(!Number.isFinite(end))return;
  const parts=eclipseEndHms(now,end);
  for(const unit of ['hours','minutes','seconds'] as const){
   const el=tile.querySelector<HTMLElement>('[data-live-unit="'+unit+'"]');
   const value=String(parts[unit]).padStart(2,'0');
   if(el&&el.textContent!==value)el.textContent=value;
  }
 });
}
function tickLiveClocks(now:number){
 if(document.visibilityState==='hidden')return;
 tickEclipseCountdowns(now);
 if(liveTimePinned)return;
 const at=new Date(now),display=dateText(at,{dateStyle:'full',timeStyle:'medium'});
 const header=root.querySelector<HTMLElement>('#live-page-clock');
 if(header&&header.textContent!==display)header.textContent=display;
 for(const el of root.querySelectorAll<HTMLTimeElement>('.mx-today-sky-time,#detail[open] .mx-expanded-sky-time')){
  if(el.textContent!==display)el.textContent=display;
  const iso=at.toISOString();
  if(el.dateTime!==iso)el.dateTime=iso;
 }
}
function refreshLiveBody(now:number){
 const focused=document.activeElement as HTMLElement|null;
 const editing=focused&&root.contains(focused)&&(focused.matches('input,textarea,select,[contenteditable="true"]')||focused.isContentEditable);
 // Keep unfinished inputs intact. Viewing the sky enlarged must not
 // pause calculations and indicators on the underlying dashboard.
 if(editing)return false;
 const region=root.querySelector<HTMLElement>('#live-view-body');
 if(!region||error){render();return true}
 const scrollX=window.scrollX,scrollY=window.scrollY;
 const html=content();
 reconcileLiveHTML(region,'<div id="live-view-body">'+html+'</div>',true);
 bind();
 liveLastRender=now;
 if(screen==='lunar')updateLiveVocClock(now);
 if(Math.abs(scrollY-window.scrollY)>4)window.scrollTo({left:scrollX,top:scrollY,behavior:'instant'});
 return true;
}
function refreshLiveView(force=false){
 if(!ready||!data||document.visibilityState==='hidden')return;
 const now=Date.now(),minute=Math.floor(now/60000);
 // Lightweight seconds ticker always runs first, including with sky enlarged.
 tickLiveClocks(now);
 liveMinute=minute;
 if(screen==='calendar'){
  if(astroCalendarToday()!==calendarAnchor){
   selected=new Date(now);recalculate();render();return;
  }
  if(!calendarRunning&&calendarCursor<calendarTargetDays())startCalendarWork();
  return;
 }
 if(!liveTimePinned&&(force||now-liveSkyLastTick>=LIVE_SKY_INTERVAL_MS)){
  liveSkyLastTick=now;updateLiveSkyWheel(now);
 }
 if(liveTimePinned)return; // Explicit Time Machine instants stay fixed.
 const boundary=screen==='lunar'&&updateLiveVocClock(now);
 if(screen==='lunar'&&!boundary)updateLiveMoonSign(now);
 const cadence=LIVE_CONTENT_INTERVAL_MS[screen]??30000;
 // Settings fields are user-owned state, not an ephemeral sky calculation.
 if(screen==='settings')return;
 if(!(force||boundary||now-liveLastRender>=cadence))return;
 const focused=document.activeElement as HTMLElement|null;
 if(focused&&root.contains(focused)&&(focused.matches('input,textarea,select,[contenteditable="true"]')||focused.isContentEditable))return;
 try{
  const at=new Date(now),fresh=getReport(at);
  selected=at;data=fresh;error='';
  if(screen==='ai'){
   void refreshLiveQwen(force);
   liveLastRender=now;
   return;
  }
  refreshLiveBody(now);
 }catch(e){console.warn('Live calculations unavailable; keeping last valid view',e)}
}

function navigate(value:string){screen=labels[value]?value:'today';if(!liveTimePinned||screen==='today'||screen==='ai'){liveTimePinned=false;selected=new Date();recalculate()}location.hash=screen;render();if(screen==='ai'&&!aiConnection.checked)void refreshAIConnection();window.scrollTo({top:0,behavior:'instant'})}
window.addEventListener('hashchange',()=>{const value=location.hash.slice(1);if(labels[value]&&value!==screen){screen=value;if(!liveTimePinned||screen==='today'||screen==='ai'){liveTimePinned=false;selected=new Date();recalculate()}render();if(screen==='ai'&&!aiConnection.checked)void refreshAIConnection()}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
render();
initEngine().then(v=>{engineVersion=v;ready=true;recalculate();render();void refreshAIConnection();if('serviceWorker' in navigator&&import.meta.env.PROD){navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(reg=>{if(document.visibilityState==='visible')void reg.update().catch(()=>{});if(backgroundPushOptedIn()&&eyeSettings.enabled)void refreshBackgroundPushIfNeeded(eyeSettings,active.zone,moonPushSchedule()).catch(e=>console.warn('Background push renewal unavailable',e))}).catch(()=>toast(t('تعذر تفعيل العمل بدون إنترنت.','Offline support could not be activated.')))}}).catch(e=>{error=t('تعذر تحميل المحرك الفلكي: ','Could not load the calculation engine: ')+String(e);render()});
setInterval(()=>refreshLiveView(),1000);
window.addEventListener('focus',()=>refreshLiveView(true));
function eyeClock(now:Date,zone:string):EyeClock{
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const part=(name:string)=>parts.find(p=>p.type===name)?.value??'';
 return {date:[part('year'),part('month'),part('day')].join('-'),hour:Number(part('hour')),minute:Number(part('minute'))};
}
async function deliverEyeEvent(event:EyeEvent){
 const message=lang==='ar'?event.ar:event.en;
 try{if(typeof Notification!=='undefined'&&Notification.permission==='granted'&&'serviceWorker' in navigator){const reg=await navigator.serviceWorker.getRegistration();if(reg){await reg.showNotification(message,{body:t('موعد محسوب · افتح MX Astro للتفاصيل','Calculated timing · open MX Astro for details'),tag:event.id,icon:'/icon.svg'});return}}}catch{}
 toast(message);
}
async function runEyeCheck(){
 if(!ready||!eyeSettings.enabled||document.visibilityState!=='visible')return;
 const now=new Date();let moon:LunarWindow|null=null;
 if(eyeSettings.moon){try{if(!eyeCached||+now>=+eyeCached.result.ingressAt||+now-eyeCached.checked>2*3600000)eyeCached={checked:+now,result:lunarWindow(now,d=>chart(d,active,false,false).points)};moon=eyeCached.result}catch{moon=null}}
 let sent:string[]=[];try{const parsed=JSON.parse(localStorage.getItem('mx.orbit.eye.sent.v1')??'[]');if(Array.isArray(parsed))sent=parsed.filter((s:unknown)=>typeof s==='string').slice(-100)}catch{}
 for(const event of dueEyeEvents(now,eyeClock(now,active.zone),moon,eyeSettings)){
  if(sent.includes(event.id))continue;sent.push(event.id);localStorage.setItem('mx.orbit.eye.sent.v1',JSON.stringify(sent.slice(-100)));await deliverEyeEvent(event);
 }
}
setInterval(()=>{void runEyeCheck()},60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){refreshLiveView(true);void runEyeCheck();if(ready&&backgroundPushOptedIn()&&eyeSettings.enabled)void refreshBackgroundPushIfNeeded(eyeSettings,active.zone,moonPushSchedule()).catch(e=>console.warn('Background push refresh unavailable',e))}});
