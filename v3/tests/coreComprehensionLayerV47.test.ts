import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const experience=readFileSync(new URL("../src/core/useCoreExperience.ts",import.meta.url),"utf8");
const onboarding=readFileSync(new URL("../src/core/CoreOnboarding.tsx",import.meta.url),"utf8");
const analytics=readFileSync(new URL("../src/core/CoreAnalyticsDepth.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");
const proCss=readFileSync(new URL("../src/core/lightCoreProTools.css",import.meta.url),"utf8");

test("Core experience mode persists independently of financial data",()=>{
 assert.match(experience,/qvanix\.core\.experience\.v1/);
 assert.match(experience,/CoreExperienceMode="simple"\|"pro"/);
 assert.match(experience,/localStorage\.getItem/);
 assert.match(experience,/localStorage\.setItem/);
 assert.match(core,/data-experience=\{experience\.mode\}/);
 assert.match(core,/Включить профессиональный режим: открыть глубокую аналитику/);assert.match(core,/Включить простой режим: скрыть глубокую аналитику/);
});

test("simple mode keeps professional depth reachable instead of deleting it",()=>{
 assert.match(core,/experience\.mode==="simple"&&<ProGate/);
 assert.match(core,/Открыть Профи →/);
 assert.match(core,/setPortfolioMode\("depth"\)/);
 assert.match(core,/setIncomeMode\("depth"\)/);
 assert.match(core,/setAnalyticsMode\("depth"\)/);
 assert.match(core,/if\(portfolioMode==="depth"\)setPortfolioMode\("structure"\)/);
});

test("first-run onboarding explains trust depth and experience mode",()=>{
 for(const phrase of["Сначала подтверждённые данные","Главный ответ сверху, детали ниже","Выберите привычный уровень","Просто","Профи"])assert.match(onboarding,new RegExp(phrase));
 assert.match(onboarding,/aria-label="Краткое знакомство с QVANIX"/);
 assert.match(core,/trusted&&!experience\.onboardingSeen/);
 assert.match(core,/experience\.reopenOnboarding/);
});

test("professional analytics can explain itself without an LLM",()=>{
 assert.match(analytics,/Объяснить простыми словами/);
 assert.match(analytics,/Что это значит простыми словами/);
 assert.match(analytics,/БЕЗ ЖАРГОНА/);
 assert.match(analytics,/Это пояснение смысла метрик, а не инвестиционный вывод или прогноз/);
 assert.match(proCss,/core-analytics-depth__plain/);
});

test("experience UI is responsive on phone and desktop",()=>{
 assert.match(css,/sb-experience-toggle/);
 assert.match(css,/sb-onboarding-backdrop/);
 assert.match(css,/@media\(max-width:520px\)/);
 assert.match(css,/@media\(min-width:1200px\)/);
 assert.match(css,/sb-pro-gate/);
});
