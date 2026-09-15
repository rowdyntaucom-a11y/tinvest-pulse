const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { registerApiNotFound } = require('../api-route-policy.js');

let route = null;
registerApiNotFound({ all(patterns, handler) { route = { patterns, handler }; } });
assert.deepEqual(route.patterns, ['/api', '/api/*']);
for (const requestPath of ['/api', '/api/', '/api/does-not-exist']) {
  const headers = {};
  const response = { setHeader(key, value) { headers[key] = value; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  route.handler({ path: requestPath }, response);
  assert.equal(response.code, 404);
  assert.equal(headers['Cache-Control'], 'no-store');
  assert.deepEqual(response.body, { ok: false, error: 'API route not found', path: requestPath });
  assert.doesNotMatch(JSON.stringify(response.body), /<!doctype|<html/i);
}
assert.throws(() => registerApiNotFound(null), /Express app/);

// Execute the exact bridge template against the real server-core source. This
// verifies final generated route order rather than only testing the helper.
const production = fs.readFileSync(path.join(__dirname, '..', 'production-v162.js'), 'utf8');
const marker = 'const assetFundamentalsInjectedCode=String.raw`';
const start = production.indexOf(marker);
const end = production.indexOf('\nconst bridges=', start);
assert.notEqual(start, -1);
assert.notEqual(end, -1);
const template = production.slice(start + marker.length, end).replace(/`;\s*$/, '');
const coreSource = fs.readFileSync(path.join(__dirname, '..', 'server-core.js'), 'utf8');
const generated = vm.runInNewContext(`${template}\n;core`, { core: coreSource });
const apiFallback = generated.indexOf("require('./api-route-policy.js').registerApiNotFound(app);");
const spaWildcard = generated.indexOf("app.get('*', (req, res) => {");
assert.ok(apiFallback > -1, 'generated server must register the API JSON fallback');
assert.ok(spaWildcard > -1, 'generated server must retain the SPA wildcard');
assert.ok(apiFallback < spaWildcard, 'API JSON fallback must precede the SPA wildcard');
new vm.Script(generated, { filename: 'generated-server-core.js' });
console.log('API route policy and generated route ordering regression: ok');
