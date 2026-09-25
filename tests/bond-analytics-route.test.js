const assert=require("node:assert/strict");
const test=require("node:test");
const fs=require("node:fs");
const path=require("node:path");
const core=fs.readFileSync(path.join(__dirname,"..","server-core.js"),"utf8");
const analytics=fs.readFileSync(path.join(__dirname,"..","bond-analytics.js"),"utf8");

test("server registers verified bond analytics before wildcard",()=>{
 const route=core.indexOf("require('./bond-analytics')(app");
 const wildcard=core.indexOf("app.get('*'");
 assert.ok(route>0);
 assert.ok(wildcard>route);
 assert.match(core,/tbankRequest,[\s\S]*?buildDashboard/);
});

test("bond analytics prefers market yield and gates duration to simple fixed flows",()=>{
 assert.match(analytics,/GetMarketValues/);
 assert.match(analytics,/INSTRUMENT_VALUE_YIELD/);
 assert.match(analytics,/const simpleFixed=!floating&&!amortizing&&!perpetual/);
 assert.match(analytics,/modifiedDuration/);
 assert.match(analytics,/aciValue\|\|bond\.aci_value/);
});
