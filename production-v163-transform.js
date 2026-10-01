'use strict';

const DASHBOARD_IDENTITY_MARKER = "    figi: p.figi,\n    ticker: p.ticker || p.instrumentUid || p.figi,";
const DASHBOARD_IDENTITY_REPLACEMENT = "    figi: p.figi,\n    instrumentUid: p.instrumentUid || null,\n    ticker: p.ticker || p.instrumentUid || p.figi,";

const ASSET_FUNDAMENTALS_TEMPLATE_MARKER = "const assetFundamentalsInjectedCode=String.raw`\nconst assetFundamentalsMarker=";

function injectDashboardInstrumentUid(source) {
  if (typeof source !== 'string' || !source.includes(ASSET_FUNDAMENTALS_TEMPLATE_MARKER)) {
    throw new Error('v16.3: asset fundamentals template marker changed');
  }

  const prelude = [
    'const dashboardIdentityMarker=' + JSON.stringify(DASHBOARD_IDENTITY_MARKER) + ';',
    'const dashboardIdentityNative="    instrumentUid: p.instrumentUid || null,";',
    "if(core.includes(dashboardIdentityMarker)){core=core.replace(dashboardIdentityMarker," + JSON.stringify(DASHBOARD_IDENTITY_REPLACEMENT) + ");}",
    "else if(!core.includes(dashboardIdentityNative))throw new Error('QVANIX v2: dashboard identity marker changed');",
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
  injectDashboardInstrumentUid,
};
