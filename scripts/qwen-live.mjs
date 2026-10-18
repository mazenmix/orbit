const site='https://mxastro.pages.dev';
const cases=[
 {topicId:1,language:'ar',evidence:[{planet:'Sun',longitude:9.1,sign:0,house:7,retrograde:false,angle:null},{planet:'Moon',longitude:109,sign:3,house:10,retrograde:false,angle:null}]},
 {topicId:105,language:'ar',evidence:[{planet:'Venus',longitude:43,sign:1,house:7,retrograde:false,angle:null},{planet:'Moon',longitude:111,sign:3,house:10,retrograde:false,angle:null}]}
];
const summaries=[];
for(const [index,data] of cases.entries()){
 const res=await fetch(site+'/api/soul',{method:'POST',headers:{Origin:site,'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(44000)});
 const result=await res.json().catch(()=>({error:'Non-JSON response'}));
 console.log('QWEN3 LIVE',index+1,'HTTP',res.status,'TOPIC',data.topicId,JSON.stringify(res.ok?{summary:result.summary?.slice(0,210),deep:result.detailedAnalysis?.slice(0,300),strengths:result.strengths,practical:result.practicalInsights,quality:result.quality}:{error:result.error}).slice(0,1000));
 if(!res.ok)throw Error('Live Qwen3 failed: '+res.status+' '+result.error);
 if(!['source-grounded-model','verified-editorial-fallback'].includes(result.quality))throw Error('Live AI output did not pass source verification');
 if(index===1&&/عطارد|Mercury|الجدي|Capricorn/i.test(result.detailedAnalysis||''))throw Error('Invented natal placement escaped evidence validator');
 if(typeof result.summary!=='string'||!Array.isArray(result.practicalInsights)||result.practicalInsights.length===0||result.astrologicalEvidence?.length!==2)throw Error('Incomplete model reply');
 summaries.push(result.summary.toLowerCase().replace(/\s+/g,''));
}
if(summaries[0]===summaries[1])throw Error('Different topics returned identical live Qwen3 summaries');
console.log('LIVE QWEN3 VERIFIED: two distinct structured, evidenced replies.');
