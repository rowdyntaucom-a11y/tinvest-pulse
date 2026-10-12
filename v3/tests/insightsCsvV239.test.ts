import test from "node:test";
import assert from "node:assert/strict";
import {insightsToCsv,insightsComparisonToCsv} from "../src/analysis/insightsCsvV232.ts";
const rows=[{group:"Результат",label:"Убыток",value:-12.5,unit:"pct" as const},{group:"Результат",label:"Плюс",value:5,unit:"rub" as const}];
test("negative numbers remain numeric in exported CSV",()=>{const csv=insightsToCsv(rows,"Портфель","2026-10-12");assert.match(csv,/;"-12\\.5";"%"/);assert.doesNotMatch(csv,/'-12\\.5/)});
test("comparison exports negative deltas and genuine BOM",()=>{const csv=insightsComparisonToCsv(rows,"Портфель",{date:"2026-10-11",metrics:{"Убыток":3,"Плюс":10}},"2026-10-12");assert.equal(csv.charCodeAt(0),0xFEFF);assert.match(csv,/;"-15\\.5";"п\\.п\\."/);assert.match(csv,/;"-5";"₽"/)});
test("untrusted spreadsheet formulas in account names are neutralized",()=>{const csv=insightsToCsv(rows,"=HYPERLINK(\"evil\")","2026-10-12");assert.match(csv,/'=HYPERLINK/)});
