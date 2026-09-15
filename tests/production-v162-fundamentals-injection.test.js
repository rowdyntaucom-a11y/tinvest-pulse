const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'production-v162.js'), 'utf8');
const start = source.indexOf('const assetFundamentalsInjectedCode=String.raw`');
const end = source.indexOf('\nconst bridges=', start);

assert.notEqual(start, -1, 'asset fundamentals runtime bridge must exist');
assert.notEqual(end, -1, 'asset fundamentals runtime bridge boundary must exist');

const block = source.slice(start, end);

// The bridge is injected through two runtime compilation layers. A second
// backslash here survives those layers as literal "\\n" text in server-core.js
// and makes Node fail at startup even though `node --check production-v162.js`
// itself succeeds. Keep this contract aligned with the already proven v162
// asset-history / transaction-marker / instrument-badge bridges.
assert.ok(block.includes("].join('\\n');"), 'generated route lines must join with one escaped newline');
assert.ok(block.includes("core=core.replace(assetFundamentalsMarker,'\\n'+assetFundamentalsCode+assetFundamentalsMarker);"), 'generated route insertion must use one escaped newline');
assert.ok(!block.includes("].join('\\\\n');"), 'must not double-escape generated route newlines');
assert.ok(!block.includes("assetFundamentalsMarker,'\\\\n'+assetFundamentalsCode"), 'must not double-escape route insertion newline');

console.log('production-v162 fundamentals injection escaping regression: ok');
