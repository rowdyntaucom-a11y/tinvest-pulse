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
new vm.Script(transformedV162, { filename: 'production-v162-v163-transformed.js' });

const core = fs.readFileSync(path.join(repoRoot, 'server-core.js'), 'utf8');
assert.ok(core.includes(DASHBOARD_IDENTITY_MARKER), 'server-core dashboard projection marker must still match');
const generatedCore = core.replace(DASHBOARD_IDENTITY_MARKER, DASHBOARD_IDENTITY_REPLACEMENT);
assert.ok(generatedCore.includes('instrumentUid: p.instrumentUid || null'), 'generated dashboard projection must preserve broker instrumentUid');
new vm.Script(generatedCore, { filename: 'server-core-v163-generated.js' });

console.log('production v163 dashboard identity regression: ok');
