import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const styles=readFileSync('src/peopleCards.css','utf8');
const compact=styles.slice(styles.indexOf('/* Compact People / Synastry layout'));
test('People synastry cards use their own compact design without changing other routes',()=>{
 assert.ok(compact.length>1000);
 assert.match(compact,/#live-view-body \.mx-people-page \.partner-score/);
 assert.match(compact,/#live-view-body \.mx-people-page \.partner-insight/);
 assert.match(compact,/#live-view-body \.mx-people-page \.relation-window/);
 assert.match(compact,/padding:clamp\(9px,0\.95vw,12px\)!important/);
});
test('People desktop fits three gauges, three readings and three meeting windows per row',()=>{
 assert.match(compact,/@media\(min-width:1250px\)/);
 assert.match(compact,/\.partner-insights-grid,[\s\S]*?grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(compact,/#live-view-body \.mx-people-page \.relation-window-grid/);
});
test('Phone readability and full descriptions are retained',()=>{
 assert.match(compact,/@media\(max-width:759px\)/);
 assert.match(compact,/@media\(max-width:350px\)/);
 assert.match(compact,/#live-view-body \.mx-people-page \.relation-window>p\{/);
 assert.match(compact,/#live-view-body \.mx-people-page \.partner-insight \.mx-partner-reading\{/);
 const textStyles=compact.match(/\.mx-partner-reading\{[\s\S]*?\}/)?.[0]??'';
 const windowStyles=compact.match(/\.relation-window>p\{[\s\S]*?\}/)?.[0]??'';
 for(const section of [textStyles,windowStyles]){
   assert.match(section,/max-height:none/);
   assert.match(section,/-webkit-line-clamp:unset/);
 }
 assert.match(compact,/min-height:40px/);
});
