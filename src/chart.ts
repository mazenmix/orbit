import {normalize,distance,angles,type Point} from './math.ts';
import {signSymbols,planet,t} from './i18n.ts';
import type {Chart} from './engine.ts';
export function wheel(chart:Chart,transit?:Chart){
 const center=210,asc=chart.asc??0;const xy=(lon:number,r:number)=>{const a=(180-lon+asc)*Math.PI/180;return [center+Math.cos(a)*r,center-Math.sin(a)*r]};
 const line=(a:number[],b:number[],attrs='')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" ${attrs}/>`;
 let svg=`<svg viewBox="0 0 420 420" role="img" aria-label="${t('الخارطة الفلكية المحسوبة','Calculated astrology chart')}" class="chart-wheel"><defs><radialGradient id="space"><stop stop-color="#171b32"/><stop offset="1" stop-color="#0d111f"/></radialGradient></defs><circle cx="210" cy="210" r="200" fill="url(#space)" stroke="#34384f"/>`;
 for(const r of [190,158,138,104])svg+=`<circle cx="210" cy="210" r="${r}" fill="none" stroke="#34384f" stroke-opacity=".75"/>`;
 for(let deg=0;deg<360;deg+=2)svg+=line(xy(deg,deg%10===0?184:188),xy(deg,193),`stroke="${deg%30===0?'#8d83ff':'#444963'}" stroke-width="${deg%30===0?1.3:.5}"`);
 for(let i=0;i<12;i++){svg+=line(xy(i*30,158),xy(i*30,190),'stroke="#4f486f"');const p=xy(i*30+15,174);svg+=`<text x="${p[0]}" y="${p[1]+6}" fill="${i%3===0?'#aaa2ff':'#8a92b3'}" text-anchor="middle" font-size="20">${signSymbols[i]}</text>`}
 chart.cusps.forEach((lon,i)=>{svg+=line(xy(lon,104),xy(lon,158),`stroke="${i%3===0?'#6de0d6':'#404960'}" stroke-opacity=".6"`);const p=xy(normalize(lon+normalize(chart.cusps[(i+1)%12]-lon)/2),148);svg+=`<text x="${p[0]}" y="${p[1]+3}" text-anchor="middle" fill="#6e7897" font-size="9">${i+1}</text>`});
 for(let i=0;i<chart.points.length;i++)for(let j=i+1;j<chart.points.length;j++){const a=chart.points[i],b=chart.points[j],sep=distance(a.longitude,b.longitude),angle=angles.find(x=>Math.abs(sep-x)<=4);if(angle===undefined)continue;svg+=line(xy(a.longitude,102),xy(b.longitude,102),`stroke="${angle===60||angle===120?'#64d4cf':angle===0?'#a29aff':'#c76b8f'}" stroke-width=".7" stroke-opacity=".42"`)}
 const points=(items:Point[],r:number,color:string)=>items.map((p,i)=>{const near=items.filter((q,j)=>j<i&&distance(p.longitude,q.longitude)<12).length;const pos=xy(p.longitude,r-near*15),tick=xy(p.longitude,135);return line(tick,xy(p.longitude,r-9),'stroke="#6b7592" stroke-width=".6"')+`<text x="${pos[0]}" y="${pos[1]+5}" fill="${color}" text-anchor="middle" font-size="17"><title>${planet(p.id)} ${p.longitude.toFixed(4)}°</title>${p.symbol}</text>`}).join('');
 svg+=points(chart.points,122,'#d1c5ff');if(transit)svg+=points(transit.points,201,'#6ee5d9');
 if(chart.asc!==null){const p=xy(chart.asc,154);svg+=`<text x="${p[0]}" y="${p[1]-5}" fill="#74e7d9" text-anchor="middle" font-size="9">ASC</text>`}
 svg+=`<circle cx="210" cy="210" r="24" fill="#101423" stroke="#504677"/><text x="210" y="215" text-anchor="middle" fill="#c5b8ff" font-size="13" letter-spacing="2">MX</text></svg>`;return svg;
}
