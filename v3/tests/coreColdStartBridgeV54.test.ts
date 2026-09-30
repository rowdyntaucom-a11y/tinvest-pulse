import test from"node:test";
import assert from"node:assert/strict";
import{readFileSync}from"node:fs";

const preview=readFileSync(new URL("../preview-server.cjs",import.meta.url),"utf8");

test("preview keeps the live API warm while the preview service is active",()=>{
 assert.match(preview,/setInterval\(\(\)=>void probeUpstream\(\),8\*60_000\)/);
 assert.match(preview,/keepAlive\.unref\?\.\(\)/);
 assert.match(preview,/return new Promise\(resolve=>/);
});

test("dashboard and broker recovery tolerate a real Render cold-start window",()=>{
 assert.match(preview,/isDashboard\?\[0,1200,2500,4500,7000,10000,14000,18000\]/);
 assert.match(preview,/isBrokerRecovery\?\[0,900,1800,3200,5200,8000,12000\]/);
 assert.match(preview,/attemptTimeoutMs=isDashboard\?9000:isBrokerRecovery\?7000:18000/);
});
