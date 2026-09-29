'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const repoRoot=path.join(__dirname,'..');
const core=fs.readFileSync(path.join(repoRoot,'server-core.js'),'utf8');
const portfolioApi=fs.readFileSync(path.join(repoRoot,'v2/src/lib/portfolioApi.ts'),'utf8');
const preview=fs.readFileSync(path.join(repoRoot,'v3/preview-server.cjs'),'utf8');

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

console.log('trusted portfolio source isolation regression: ok');
