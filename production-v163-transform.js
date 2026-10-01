'use strict';

const DASHBOARD_IDENTITY_MARKER = "    figi: p.figi,\n    ticker: p.ticker || p.instrumentUid || p.figi,";
const DASHBOARD_IDENTITY_REPLACEMENT = "    figi: p.figi,\n    instrumentUid: p.instrumentUid || null,\n    ticker: p.ticker || p.instrumentUid || p.figi,";

const ASSET_FUNDAMENTALS_TEMPLATE_MARKER = "const assetFundamentalsInjectedCode=String.raw`\nconst assetFundamentalsMarker=";
const HEALTH_VERSION_MARKER = "app.get('/api/version', (req, res) => {\n  res.json({ ok: true, version: '6.0-reactor-pulse-hud' });\n});";
const HEALTH_VERSION_REPLACEMENT = [
  "app.get('/api/healthz', (req, res) => {",
  "  res.setHeader('Cache-Control', 'no-store');",
  "  res.status(200).json({ ok: true, service: 'qvanix-live-api', version: '6.1-runtime-resilience', now: new Date().toISOString() });",
  "});",
  "",
  "app.get('/api/version', (req, res) => {",
  "  res.setHeader('Cache-Control', 'no-store');",
  "  res.json({ ok: true, version: '6.1-runtime-resilience' });",
  "});"
].join("\n");

function injectDashboardInstrumentUid(source) {
  if (typeof source !== 'string' || !source.includes(ASSET_FUNDAMENTALS_TEMPLATE_MARKER)) {
    throw new Error('v16.3: asset fundamentals template marker changed');
  }

  const prelude = [
    'const dashboardIdentityMarker=' + JSON.stringify(DASHBOARD_IDENTITY_MARKER) + ';',
    'const dashboardIdentityNative="    instrumentUid: p.instrumentUid || null,";',
    "if(core.includes(dashboardIdentityMarker)){core=core.replace(dashboardIdentityMarker," + JSON.stringify(DASHBOARD_IDENTITY_REPLACEMENT) + ");}",
    "else if(!core.includes(dashboardIdentityNative))throw new Error('QVANIX v2: dashboard identity marker changed');",
    "if(core.includes(HEALTH_VERSION_MARKER)){core=core.replace(HEALTH_VERSION_MARKER,HEALTH_VERSION_REPLACEMENT);}",
    "else if(!core.includes('/api/healthz'))throw new Error('QVANIX v2: runtime health marker changed');",
  ].join('\n');

  return source.replace(
    ASSET_FUNDAMENTALS_TEMPLATE_MARKER,
    "const assetFundamentalsInjectedCode=String.raw`\n" + prelude + "\nconst assetFundamentalsMarker=",
  );
}

module.exports = {
  ASSET_FUNDAMENTALS_TEMPLATE_MARKER,
  DASHBOARD_IDENTITY_MARKER,
  DASHBOARD_IDENTITY_REPLACEMENT,
  HEALTH_VERSION_MARKER,
  HEALTH_VERSION_REPLACEMENT,
  injectDashboardInstrumentUid,
};
