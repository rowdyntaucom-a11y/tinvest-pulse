import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{WORLD_EXPLORATION_LANDMARKS,resolveWorldLandmark}from'../src/dna/worldExploration.ts';import{WORLD_VIEW_HEIGHT,WORLD_VIEW_WIDTH}from'../src/dna/worldCamera.ts';
assert.deepEqual(WORLD_EXPLORATION_LANDMARKS.map(x=>x.id),['workshop','wanderer','mine','settlement']);
assert.equal(new Set(WORLD_EXPLORATION_LANDMARKS.map(x=>x.id)).size,WORLD_EXPLORATION_LANDMARKS.length);
for(const item of WORLD_EXPLORATION_LANDMARKS){assert.ok(item.x>=0&&item.x<=WORLD_VIEW_WIDTH);assert.ok(item.y>=0&&item.y<=WORLD_VIEW_HEIGHT);assert.ok(item.description.length>40)}
assert.equal(resolveWorldLandmark('wanderer')?.label,'Странник');assert.equal(resolveWorldLandmark('unknown'),null);
const stage=readFileSync(new URL('../src/dna/V3WorldSessionStage.tsx',import.meta.url),'utf8');
assert.match(stage,/data-world-exploration="v3"/);assert.match(stage,/aria-label="Исследовать точки живого мира"/);assert.match(stage,/aria-pressed=\{landmark===item\.id\}/);assert.match(stage,/aria-expanded=\{landmark===item\.id\}/);assert.match(stage,/aria-controls="v3-world-landmark-detail"/);assert.match(stage,/id="v3-world-landmark-detail"/);assert.match(stage,/role="status"/);assert.match(stage,/aria-live="polite"/);assert.match(stage,/setLandmark\(null\)/);assert.ok((stage.match(/width:44,height:44/g)??[]).length>=2);assert.match(stage,/data-world-landmark-edge/);assert.match(stage,/projectWorldPointToScreen/);assert.match(stage,/clampWorldMarkerToViewport/);assert.match(stage,/focus=\{focus\}/);
const world=readFileSync(new URL('../src/dna/worldExploration.ts',import.meta.url),'utf8');assert.doesNotMatch(stage+"\n"+world,/\bxp\b|expectedYield|portfolioValue|\bbuy\b|\bsell\b|финанс/i);
console.log('v3 DNA world exploration: ok');
