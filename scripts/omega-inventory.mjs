/**
 * MX Astro source inventory. Static discovery only: an import/function string
 * cannot prove runtime execution, mathematical correctness or UI quality.
 * Run: node scripts/omega-inventory.mjs [output.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const normalized=(file)=>path.relative(root,file).replaceAll(path.sep,'/');
const walk=(folder)=>fs.readdirSync(folder,{withFileTypes:true})
 .flatMap(entry=>entry.isDirectory()?walk(path.join(folder,entry.name)):[path.join(folder,entry.name)]);
const identifiers=(source,pattern)=>[...source.matchAll(pattern)].map(match=>match[1])
 .filter((value,index,list)=>list.indexOf(value)===index);

export function generateOmegaInventory(){
 const sources=walk(path.join(root,'src')).filter(file=>/\.(?:ts|css)$/.test(file)).sort();
 const tests=walk(path.join(root,'tests')).filter(file=>file.endsWith('.test.ts')).sort();
 const testSources=new Map(tests.map(file=>[normalized(file),fs.readFileSync(file,'utf8')]));
 const modules=sources.map(file=>{
  const source=fs.readFileSync(file,'utf8'),name=normalized(file);
  const imports=identifiers(source,/from\s+['"]([^'"]+)['"]/g)
   .filter(id=>id.startsWith('.'))
   .map(id=>normalized(path.resolve(path.dirname(file),id)));
  const functions=identifiers(source,/\b(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/g);
  const exports=identifiers(source,/\bexport\s+(?:(?:async|default|declare)\s+)*(?:(?:const|let|function|class|type|interface|enum)\s+)([A-Za-z_$][\w$]*)/g);
  const referencedBy=tests.filter(test=>testSources.get(normalized(test)).includes('../'+name))
   .map(normalized);
  return {
   file:name,kind:file.endsWith('.css')?'style':'source',
   lines:source.split('\n').length,
   imports,exportedSymbols:exports,functions,
   directlyReferencedByTests:referencedBy,
   possibleConcerns:{
    numerical:/\b(?:Math\.(?:round|floor|ceil)|score|longitude|latitude|orb)\b/.test(source),
    narratives:/[\u0621-\u064a]/.test(source)&&/(?:narrative|story|meaning|description|summary|advice|t\()/.test(source),
    timestamps:/\b(?:Date|Temporal|Date\.parse|setInterval)\b/.test(source),
    userInterface:/\b(?:innerHTML|<article|<section|data-section|querySelector)\b/.test(source)
   }
  };
 });
 const main=fs.readFileSync(path.join(root,'src/main.ts'),'utf8');
 const content=main.slice(main.indexOf('function content(){'),main.indexOf('function tag(',main.indexOf('function content(){')));
 const routes=identifiers(content,/case\s+['"]([^'"]+)['"]\s*:/g)
  .map(route=>({section:route,dispatchIn:'src/main.ts',handlerSource:
   content.slice(content.indexOf("case '"+route+"'"),content.indexOf("case '"+route+"'")+210).split('break;')[0],
   verifiedAtRuntime:false}));
 return {
  schemaVersion:1,repository:'mazenmix/orbit',
  scope:'static file/function/import inventory; not a certification of runtime coverage',
  counts:{sourceAndStyleModules:modules.length,tests:tests.length,routes:routes.length,
   modulesWithoutDirectTestImport:modules.filter(m=>m.kind==='source'&&m.directlyReferencedByTests.length===0).length},
  routes,modules,testFiles:tests.map(normalized),
  limitations:['Dynamic imports and runtime interactions need separate browser verification',
   'A test importing a module is not equivalent to complete functional coverage',
   'Narrative similarity requires semantic testing beyond static source discovery']
 };
}
const invoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
 const inventory=generateOmegaInventory();
 const out=process.argv[2];
 if(out){fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(inventory,null,2)+'\n','utf8');}
 else process.stdout.write(JSON.stringify(inventory,null,2)+'\n');
}
