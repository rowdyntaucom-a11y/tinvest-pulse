'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'server-core.js'), 'utf8');

assert.match(source, /app\.get\('\/api\/operations-summary'/);
for (const token of [
  "contractVersion: '2.0'",
  'fetchedAt: new Date().toISOString()',
  'id: op.id || op.operationId || null',
  'instrumentUid: op.instrumentUid || null',
  'quantity: op.quantity ?? null',
  'observedFrom:',
  'observedTo:',
  'possiblyTruncated: rows.length >= rowCap',
  'rowCap = 10 * 1000'
]) {
  assert.ok(source.includes(token), token);
}

console.log('operations summary contract regression: ok');
