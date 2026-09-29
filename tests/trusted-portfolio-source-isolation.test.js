'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const repoRoot=path.join(__dirname,'..');
const core=fs.readFileSync(path.join(repoRoot,'server-core.js'),'utf8');
const portfolioApi=fs.readFileSync(path.join(repoRoot,'v2/src/lib/portfolioApi.ts'),'utf8');
const preview=fs.readFileSync(path.join(repoRoot,'v3/preview-server.cjs'),'utf8');
const serverBase=fs.readFileSync(path.join(repoRoot,'server-base.js'),'utf8');

assert.match(core,/const \[portfolio, operations\] = await Promise\.all/);
assert.match(core,/qvanixDashboardOptional\(getMoex\(\), 'MOEX'\)/);
assert.match(core,/qvanixDashboardOptional\(getCbrMacro\(\), 'CBR'\)/);
assert.match(core,/timeoutMs=2500/);
assert.doesNotMatch(core,/const \[portfolio, operations, moex, cbr\] = await Promise\.all/);
assert.match(core,/sourceHealth:\s*\{/);
assert.match(core,/brokerPortfolio: true/);
assert.match(core,/moex: moexResult\.status === 'fulfilled'/);
assert.match(core,/cbr: cbrResult\.status === 'fulfilled'/);
assert.match(core,/QVANIX_DASHBOARD_OK/);
assert.match(core,/BROKER_ACCOUNT_UNAVAILABLE/);
assert.match(core,/openedDate: account\.openedDate \|\| account\.openDate \|\| null/);
assert.match(core,/accessLevel: account\.accessLevel \|\| null/);

assert.match(portfolioApi,/PORTFOLIO_NORMALIZATION_VERSION = '1\.4'/);
assert.match(portfolioApi,/normaliseAccountContext\(account\)/);
assert.doesNotMatch(portfolioApi,/loadAccountContext\(/);
assert.match(portfolioApi,/AbortController/);
assert.match(portfolioApi,/20_000/);
assert.match(portfolioApi,/dashboard timeout/);

assert.match(preview,/isDashboard=req\.url\.split\("\?"\)\[0\]==="\/api\/dashboard"/);
assert.match(preview,/delays=isDashboard\?\[0,900\]/);
assert.match(preview,/attemptTimeoutMs=isDashboard\?12000:18000/);
assert.match(preview,/QVANIX_DASHBOARD_PROXY/);

assert.match(serverBase,/QVANIX_DASHBOARD_WARMUP/);
assert.match(serverBase,/const d=await buildDashboard\(\)/);
assert.match(serverBase,/brokerPortfolio:d\?\.sourceHealth\?\.brokerPortfolio===true/);
assert.doesNotMatch(serverBase,/QVANIX_DASHBOARD_WARMUP[^\n]*portfolio\.value[^\n]*JSON\.stringify\(\{[^}]*value:/);

console.log('trusted portfolio source isolation regression: ok');


assert.match(core,/OPERATIONS_CACHE_TTL_MS = 5 \* 60 \* 1000/);
assert.match(core,/OPERATIONS_REFRESH_AFTER_MS = 60 \* 1000/);
assert.match(core,/const OPERATIONS_CACHE = new Map\(\)/);
assert.match(core,/if \(cached\?\.inFlight\) return cached\.inFlight/);
assert.match(core,/QVANIX_OPERATIONS_REFRESHED/);
assert.match(serverBase,/\}\},1500\);/);
assert.match(serverBase,/History snapshot v1473 warmed/);


assert.match(core,/ACCOUNTS_CACHE_TTL_MS = 60 \* 1000/);
assert.match(core,/if \(ACCOUNTS_CACHE\.inFlight\) return ACCOUNTS_CACHE\.inFlight/);
assert.match(core,/PORTFOLIO_CACHE_TTL_MS = 15 \* 1000/);
assert.match(core,/const PORTFOLIO_CACHE = new Map\(\)/);
assert.match(core,/if \(cached\?\.inFlight\) return cached\.inFlight/);
