import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const workspace=readFileSync(new URL("../src/core/CoreWorkspace.tsx",import.meta.url),"utf8");
const capital=readFileSync(new URL("../src/core/CoreCapitalArchitectureV115.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/core/coreCapitalArchitectureV115.css",import.meta.url),"utf8");

test("v115 replaces circular allocation and legacy structure with exact capital architecture",()=>{
 assert.match(workspace,/CoreCapitalArchitectureV115/);
 assert.match(capital,/Структура капитала/);
 assert.match(capital,/Структура, концентрация и покрытие капитала/);
 assert.match(capital,/Лестница концентрации/);
 assert.match(capital,/Покрытие капитала/);
 assert.match(capital,/Эффективных позиций/);
 assert.match(capital,/1 \/ HHI/);
 assert.match(capital,/neededFor\(rows,target\)/);
 assert.match(capital,/currentValue\/total\*100/);
 assert.doesNotMatch(capital,/<svg|<circle|conic-gradient/);
 assert.match(css,/sb-allocation-card\[data-qv115-replaced="true"\]/);
 assert.match(css,/sb-portfolio-structure\[data-qv115-replaced="true"\]/);
 assert.match(css,/grid-template-columns:1\.2fr \.8fr/);
 assert.match(css,/@media\(max-width:640px\)/);
});
