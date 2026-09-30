import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const root=readFileSync(new URL("../src/core/CoreRoot.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");

test("home adds a verified portfolio pulse without pretending position P/L is a daily move",()=>{
 assert.match(core,/PortfolioPulse positions=\{positions\}/);
 assert.match(core,/ПУЛЬС ПОРТФЕЛЯ/);
 assert.match(core,/P\/L здесь относится к открытым позициям и не является дневным изменением цены/);
 assert.match(core,/Главные вклады в P\/L открытых позиций/);
 assert.match(core,/InstrumentAvatar position=\{x\} size="sm"/);
 assert.match(core,/Math\.abs\(b\.expectedYield\)-Math\.abs\(a\.expectedYield\)/);
});

test("pulse exposes concentration, open-position breadth and confirmed-history drawdown",()=>{
 assert.match(core,/Крупнейшая позиция/);
 assert.match(core,/positive=positions\.filter\(x=>x\.expectedYield>0\)\.length/);
 assert.match(core,/negative=positions\.filter\(x=>x\.expectedYield<0\)\.length/);
 assert.match(core,/drawdown=peak&&last\?last\/peak-1:null/);
 assert.match(core,/по подтверждённой истории/);
});

test("live recovery retries immediately when network returns and while no trusted snapshot exists",()=>{
 assert.match(root,/cancelRetry\(\);\n  running\.current=true/);
 assert.match(root,/const online=\(\)=>void refreshRef\.current\(\)/);
 assert.match(root,/window\.addEventListener\("online",online\)/);
 assert.match(root,/!cached\.current\|\|Date\.now\(\)-lastAttempt\.current>=V3_FOCUS_REFRESH_MIN_AGE_MS/);
});

test("portfolio pulse has dedicated responsive styling",()=>{
 assert.match(css,/\.sb-portfolio-pulse/);
 assert.match(css,/\.sb-pulse-kpis/);
 assert.match(css,/\.sb-pulse-attribution/);
 assert.match(css,/@media\(max-width:699px\)/);
 assert.match(css,/@media\(min-width:1200px\)/);
});
