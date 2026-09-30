import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const core=readFileSync(new URL("../src/core/SnowballCore.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/snowballCore.css",import.meta.url),"utf8");

test("result screen distinguishes portfolio result, open-position P/L and payouts",()=>{
  assert.match(core,/Результат с учётом вводов\/выводов/);
  assert.match(core,/P\/L открытых позиций/);
  assert.match(core,/Общий результат/);
  assert.match(core,/Получено выплат/);
  assert.match(core,/стоимость минус чистые внешние денежные потоки/);
  assert.match(core,/брокерского P\/L по текущим позициям/);
  assert.match(core,/не обязаны складываться/);
});

test("portfolio sorting and rows label broker position P/L explicitly",()=>{
  assert.match(core,/По P\/L позиций/);
  assert.match(core,/sb-asset-pnl/);\n  assert.match(core,/P\/L позиции/);
  assert.doesNotMatch(core,/>Текущий P\/L</);
});

test("result truth layer remains readable on narrow phones",()=>{
  assert.match(css,/\.sb-result-truth\{display:grid/);
  assert.match(css,/\.sb-result-truth article:first-child\{grid-column:1\/-1\}/);
  assert.match(css,/\.sb-result-method/);
});
