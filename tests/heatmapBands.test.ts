import test from 'node:test';
import assert from 'node:assert/strict';
import {heatmapBand} from '../src/heatmapBands.ts';
test('heatmap colors respect exact inclusive 0-25 26-45 46-65 66-100 thresholds',()=>{
 for(const [number,band] of [[0,'red'],[25,'red'],[26,'orange'],[45,'orange'],[46,'yellow'],[65,'yellow'],[66,'green'],[100,'green']] as const)
  assert.equal(heatmapBand(number),band,'score '+number);
 assert.equal(heatmapBand(25.5),'orange');
 assert.equal(heatmapBand(45.5),'yellow');
 assert.equal(heatmapBand(65.5),'green');
});
test('heatmap scores are clamped and not silently colored when nonnumeric',()=>{
 assert.equal(heatmapBand(-5),'red');assert.equal(heatmapBand(130),'green');
 assert.throws(()=>heatmapBand(Number.NaN),/Invalid heatmap score/);
});
