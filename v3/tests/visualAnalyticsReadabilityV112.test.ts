import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const history=readFileSync(new URL("../src/home/V3HistorySparkline.tsx",import.meta.url),"utf8");
const historyCss=readFileSync(new URL("../src/history/historyInteraction.css",import.meta.url),"utf8");
const portfolio=readFileSync(new URL("../src/core/CorePortfolioVisualIntelligenceV106.tsx",import.meta.url),"utf8");
const risk=readFileSync(new URL("../src/core/CoreRiskVisualIntelligenceV107.tsx",import.meta.url),"utf8");

test("detailed history exposes readable axes and exact series summaries",()=>{
 assert.match(history,/v3-history-yaxis/);
 assert.match(history,/v3-history-series-summary/);
 assert.match(history,/Максимум/);
 assert.match(history,/Минимум/);
 assert.match(history,/IMOEX/);
 assert.match(historyCss,/grid-template-rows:repeat\(3,1fr\)/);
});

test("portfolio concentration has exact ranked holdings, not just a curve",()=>{
 assert.match(portfolio,/Крупнейшие позиции/);
 assert.match(portfolio,/core-portfolio-visual-v106__ranking/);
 assert.match(portfolio,/rank\.slice\(0,5\)/);
});

test("risk drawdown exposes max drawdown date and distance to peak",()=>{
 assert.match(risk,/Макс\. просадка/);
 assert.match(risk,/До пика/);
 assert.match(risk,/maxPoint/);
});
