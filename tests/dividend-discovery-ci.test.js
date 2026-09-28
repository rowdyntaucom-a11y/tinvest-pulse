const assert = require('node:assert/strict');
const test = require('node:test');
const { readFileSync } = require('node:fs');

const v2Workflow = readFileSync('.github/workflows/v2-build.yml', 'utf8');
const v3Workflow = readFileSync('.github/workflows/v3-build.yml', 'utf8');

test('API CI is triggered by both dividend discovery runtime modules', () => {
  for (const modulePath of ['dividend-discovery.js', 'dividend-discovery-core.js']) {
    assert.equal(v2Workflow.split(`- '${modulePath}'`).length - 1, 2, `${modulePath} must trigger PR and main CI`);
  }
  assert.match(v2Workflow, /npm run test:api/);
});

test('Samurai dividend discovery files trigger v3 CI', () => {
  assert.equal(v3Workflow.split("- 'v3/**'").length - 1, 2, 'v3 changes must trigger PR and main CI');
  assert.match(v3Workflow, /npm run build/);
  assert.match(v3Workflow, /npm test/);
});
