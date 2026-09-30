'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {
  DASHBOARD_IDENTITY_MARKER,
  DASHBOARD_IDENTITY_REPLACEMENT,
  injectDashboardInstrumentUid,
} = require('../production-v163-transform.js');

const repoRoot = path.join(__dirname, '..');
const v162 = fs.readFileSync(path.join(repoRoot, 'production-v162.js'), 'utf8');
const transformedV162 = injectDashboardInstrumentUid(v162);

assert.notEqual(transformedV162, v162, 'v163 must alter the v162 runtime composition source');
assert.match(transformedV162, /dashboardIdentityMarker/);
assert.match(transformedV162, /instrumentUid: p\.instrumentUid \|\| null/);
assert.match(transformedV162, /dashboardIdentityNative/);
assert.match(transformedV162, /else if\(!core\.includes\(dashboardIdentityNative\)\)/);
new vm.Script(transformedV162, { filename: 'production-v162-v163-transformed.js' });

const core = fs.readFileSync(path.join(repoRoot, 'server-core.js'), 'utf8');
assert.match(core, /instrumentUid: p\.instrumentUid \|\| null/, 'server-core dashboard must preserve broker instrumentUid');
assert.match(core, /brand: null/, 'server-core dashboard must expose additive verified brand identity');
assert.match(core, /await enrichPositionsIdentity\(positions\)/, 'server-core dashboard must enrich identity through the canonical metadata boundary');
new vm.Script(core, { filename: 'server-core-current.js' });

console.log('production v163 dashboard identity regression: ok');
