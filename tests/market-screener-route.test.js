const assert=require("node:assert/strict");
const test=require("node:test");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","server-core.js"),"utf8");

test("public market screener route is independent of broker credentials",()=>{
 assert.match(source,/app\.get\('\/api\/market-screener'/);
 assert.match(source,/engines\/stock\/markets\/shares\/boards\/TQBR\/securities\.json/);
 assert.match(source,/normalizeMoexScreener/);
 assert.match(source,/source: 'MOEX ISS'/);
 assert.match(source,/board: 'TQBR'/);
});

test("screener contract requests factual trading fields",()=>{
 for(const field of["LASTTOPREVPRICE","VALTODAY_RUR","VOLTODAY","NUMTRADES","OPEN","HIGH","LOW","LISTLEVEL"]){
  assert.ok(source.includes(field),field+" missing");
 }
});
