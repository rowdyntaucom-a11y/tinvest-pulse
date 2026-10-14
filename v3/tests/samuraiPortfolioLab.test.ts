import assert from"node:assert/strict";
import test from"node:test";
import{readFileSync}from"node:fs";

const analysis=readFileSync(new URL("../src/analysis/V3Analysis.tsx",import.meta.url),"utf8");
const toolbox=readFileSync(new URL("../src/analysis/V3AnalysisToolbox.tsx",import.meta.url),"utf8");
const lab=readFileSync(new URL("../src/analysis/V3PortfolioLab.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/samurai/SamuraiFailClosedAtlas.tsx",import.meta.url),"utf8");
const api=readFileSync(new URL("../src/analysis/strategyLabApi.ts",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/samuraiPortfolioLab.css",import.meta.url),"utf8");

test("Samurai defaults to factual reports while isolated strategy lab mathematics stay regression-tested",()=>{
 assert.match(analysis,/sam-analysis-tools/);
 assert.doesNotMatch(toolbox,/V3PortfolioLab/);
 assert.doesNotMatch(toolbox,/Лаборатория/);
 assert.match(toolbox,/V3BondIntelligenceWorkspace/);
 assert.match(toolbox,/V3PortfolioReportDepth/);
 assert.match(atlas,/Отчёты/);
});

test("Portfolio Lab compares two user-authored strategies without choosing a winner",()=>{
 assert.match(lab,/Сценарий A/);
 assert.match(lab,/Сценарий B/);
 assert.match(lab,/Победитель не выбирается/);
 assert.match(lab,/compareStrategyScenarios/);
 assert.doesNotMatch(lab,/лучший сценарий|победитель:/i);
});

test("historical lab uses explicit total-return benchmark codes and methodology",()=>{
 assert.match(lab,/MCFTR/);
 assert.match(lab,/RGBITR/);
 assert.match(lab,/ежемесячное восстановление целевых весов/);
 assert.match(api,/strategy-lab-history/);
});

test("Portfolio Lab keeps a mobile Samurai layout",()=>{
 assert.match(css,/sam-lab__history-grid/);
 assert.match(css,/@media\(max-width:430px\)/);
});
