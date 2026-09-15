const assert = require('node:assert/strict');
const { registerApiNotFound } = require('../api-route-policy.js');

let route = null;
registerApiNotFound({ all(pattern, handler) { route = { pattern, handler }; } });
assert.equal(route.pattern, '/api/*');
const headers = {};
const response = { setHeader(key, value) { headers[key] = value; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
route.handler({ path: '/api/does-not-exist' }, response);
assert.equal(response.code, 404);
assert.equal(headers['Cache-Control'], 'no-store');
assert.deepEqual(response.body, { ok: false, error: 'API route not found', path: '/api/does-not-exist' });
assert.doesNotMatch(JSON.stringify(response.body), /<!doctype|<html/i);
assert.throws(() => registerApiNotFound(null), /Express app/);
console.log('API route policy regression: ok');
