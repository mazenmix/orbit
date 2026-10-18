/** Detect copied passages even when one section wraps them in extra prose.
 * This is a repetition check, not a test of scientific or semantic validity. */
export function repeatedSoulPassage(sections:readonly string[]):boolean{
 const seen=new Set<string>(),whole=new Set<string>();
 for(const section of sections){
  const words=section.normalize('NFKC').toLocaleLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/);
  const normalized=words.join(' ');
  if(whole.has(normalized))return true;
  whole.add(normalized);
  const own=new Set<string>();
  for(let i=0;i<=words.length-8;i++){
   const phrase=words.slice(i,i+8).join(' ');
   if(phrase.length>=35){if(seen.has(phrase)||own.has(phrase))return true;own.add(phrase)}
  }
  for(const phrase of own)seen.add(phrase);
 }
 return false;
}
