import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";
const ui=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");

test("untrusted portfolio does not render fake empty portfolio controls",()=>{
 assert.match(ui,/Портфель появится после подтверждения источника/);
 assert.match(ui,/не показывает нули и пустую структуру как реальные данные/);
 assert.match(ui,/!trusted\?<NoDataPanel/);
});

test("untrusted analytics does not expose zero-position KPIs as facts",()=>{
 assert.match(ui,/Аналитика ждёт данные портфеля/);
 assert.match(ui,/не рассчитываются из пустой заглушки/);
});

test("retry affordances stay compact on mobile",()=>{
 assert.match(css,/\.sb-alert button\{min-height:32px/);
 assert.match(css,/font:700 9px\/1\.1 system-ui!important/);
 assert.match(css,/\.sb-no-data/);
 assert.match(css,/min-height:40px/);
});
