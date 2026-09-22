import assert from'node:assert/strict';
import{clampWorldMarkerToViewport,projectWorldPointToScreen,resolveWorldCameraFrame,WORLD_VIEW_HEIGHT,WORLD_VIEW_WIDTH}from'../src/dna/worldCamera.ts';

const portrait=resolveWorldCameraFrame(390,700);
assert.equal(portrait.immersivePortrait,true);
assert.ok(portrait.scale>0.8&&portrait.scale<0.9);
assert.ok(portrait.x<=0&&portrait.x+WORLD_VIEW_WIDTH*portrait.scale>=390);
assert.ok(portrait.y<=0&&portrait.y+WORLD_VIEW_HEIGHT*portrait.scale>=700);

const settlement={x:1357,y:610};
const defaultSettlement=projectWorldPointToScreen(settlement,portrait);
assert.ok(defaultSettlement.x>390,'distant settlement should truthfully project off the default portrait crop');
const edge=clampWorldMarkerToViewport(defaultSettlement,390,700,24);
assert.equal(edge.edge,true);
assert.equal(edge.edgeX,'right');
assert.equal(edge.x,366);

const focused=resolveWorldCameraFrame(390,700,settlement);
const focusedSettlement=projectWorldPointToScreen(settlement,focused);
assert.ok(Math.abs(focusedSettlement.x-195)<0.001,'selected portrait landmark should pan into the camera center');
assert.ok(focused.x<=0&&focused.x+WORLD_VIEW_WIDTH*focused.scale>=390);
assert.ok(focused.y<=0&&focused.y+WORLD_VIEW_HEIGHT*focused.scale>=700);

const landscape=resolveWorldCameraFrame(900,500,settlement);
assert.equal(landscape.immersivePortrait,false);
const worldCenter=projectWorldPointToScreen({x:WORLD_VIEW_WIDTH/2,y:WORLD_VIEW_HEIGHT/2},landscape);
assert.ok(Math.abs(worldCenter.x-450)<0.01);
assert.ok(Math.abs(worldCenter.y-250)<0.01);

console.log('v3 DNA exploration camera: ok');
