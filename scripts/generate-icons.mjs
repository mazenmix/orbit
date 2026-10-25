import fs from 'node:fs/promises';
import {deflateSync, inflateSync} from 'node:zlib';
import {Buffer} from 'node:buffer';

/** Offline PNG icon generation: no network, dependencies, or image services. */
const root='public';
const source=Buffer.from((await fs.readFile('scripts/brand-icon-source.b64','utf8')).trim(),'base64');
const crcTable=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0});
function crc32(buf){let c=0xffffffff;for(let i=0;i<buf.length;i++)c=crcTable[(c^buf[i])&255]^(c>>>8);return (c^0xffffffff)>>>0}
function chunk(name,bytes){const b=Buffer.alloc(12+bytes.length);b.writeUInt32BE(bytes.length,0);b.write(name,4,4,'ascii');bytes.copy(b,8);b.writeUInt32BE(crc32(b.subarray(4,8+bytes.length)),8+bytes.length);return b}
function decodePng(b){
 if(b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Not PNG');
 let width,height,depth,type,palette,transparent;const idats=[];
 for(let p=8;p<b.length;){const n=b.readUInt32BE(p),name=b.toString('ascii',p+4,p+8),bytes=b.subarray(p+8,p+8+n);p+=12+n;
  if(name==='IHDR'){width=bytes.readUInt32BE(0);height=bytes.readUInt32BE(4);depth=bytes[8];type=bytes[9];if(bytes[12])throw Error('Interlaced PNG unsupported')}
  if(name==='PLTE')palette=bytes;if(name==='tRNS')transparent=bytes;
  if(name==='IDAT')idats.push(bytes);
  if(name==='IEND')break;
 }
 if(depth!==8||![2,3,6].includes(type))throw Error('Only 8-bit RGB, palette, RGBA supported');
 const bpp=type===2?3:type===6?4:1,stride=width*bpp;
 const raw=inflateSync(Buffer.concat(idats));const pixels=new Uint8Array(width*height*4);let pos=0,prev=new Uint8Array(stride);
 for(let y=0;y<height;y++){
  const filter=raw[pos++],row=new Uint8Array(stride);
  for(let x=0;x<stride;x++){
   const v=raw[pos++],a=x>=bpp?row[x-bpp]:0,up=prev[x],ul=x>=bpp?prev[x-bpp]:0;
   if(filter===0)row[x]=v;
   else if(filter===1)row[x]=(v+a)&255;
   else if(filter===2)row[x]=(v+up)&255;
   else if(filter===3)row[x]=(v+Math.floor((a+up)/2))&255;
   else if(filter===4){const p=a+up-ul,da=Math.abs(p-a),db=Math.abs(p-up),dc=Math.abs(p-ul);row[x]=(v+(da<=db&&da<=dc?a:db<=dc?up:ul))&255}
   else throw Error('Invalid PNG filter '+filter);
  }
  for(let x=0;x<width;x++){
   const to=(y*width+x)*4,from=x*bpp;
   if(type===3){const index=row[x];for(let z=0;z<3;z++)pixels[to+z]=palette[index*3+z];pixels[to+3]=transparent?.[index]??255}
   else {pixels[to]=row[from];pixels[to+1]=row[from+1];pixels[to+2]=row[from+2];pixels[to+3]=type===6?row[from+3]:255}
  }
  prev=row;
 }
 return {width,height,pixels};
}
function resizeBilinear({width,height,pixels},size){
 const out=new Uint8Array(size*size*3);
 const sample=(x,y,c)=>pixels[(y*width+x)*4+c];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const px=Math.max(0,Math.min(width-1,(x+.5)*width/size-.5)),py=Math.max(0,Math.min(height-1,(y+.5)*height/size-.5));
  const x0=Math.floor(px),x1=Math.min(width-1,x0+1),fx=px-x0;
  const y0=Math.floor(py),y1=Math.min(height-1,y0+1),fy=py-y0;
  const a=(y*size+x)*3;
  for(let c=0;c<3;c++){
   const v=(1-fy)*((1-fx)*sample(x0,y0,c)+fx*sample(x1,y0,c))+fy*((1-fx)*sample(x0,y1,c)+fx*sample(x1,y1,c));
   out[a+c]=Math.round(v);
  }
 }
 return out;
}
function rgbPng(pixels,size){
 const scan=Buffer.alloc(size*(size*3+1));const width=size*3;
 for(let y=0;y<size;y++){const offset=y*(width+1);scan[offset]=0;Buffer.from(pixels.buffer,pixels.byteOffset+y*width,width).copy(scan,offset+1)}
 const hdr=Buffer.alloc(13);hdr.writeUInt32BE(size,0);hdr.writeUInt32BE(size,4);hdr[8]=8;hdr[9]=2;
 return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',hdr),chunk('IDAT',deflateSync(scan,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
const image=decodePng(source);
if(image.width!==128||image.height!==128)throw Error('Unexpected source dimensions');
for(const [name,size] of [['favicon-32.png',32],['apple-touch-icon.png',180],['mx-astro-eye-192.png',192],['mx-astro-eye-512.png',512]]){
 const result=rgbPng(resizeBilinear(image,size),size);await fs.writeFile(`${root}/${name}`,result);console.log(name,result.length);
}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,${source.toString('base64')}"/></svg>`;
await fs.writeFile(`${root}/icon.svg`,svg);
