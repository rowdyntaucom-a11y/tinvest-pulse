'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'..','server-core.js'),'utf8');

for(const token of[
 "async function getMoexIndexHistory(secid, from, to)",
 "getMoexIndexHistory('MCFTR', from, to)",
 "getMoexIndexHistory('RGBITR', from, to)",
 "app.get('/api/strategy-lab-history'",
 "contractVersion: '1.0'",
 "code: 'MCFTR'",
 "code: 'RGBITR'",
 "STRATEGY_LAB_CACHE_TTL_MS"
]){
 assert.ok(source.includes(token),token);
}
assert.match(source,/gross total return/);
assert.match(source,/Russian Government Bond Index Total Return/);
console.log('strategy lab history contract regression: ok');
