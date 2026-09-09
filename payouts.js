'use strict';

const registerPayoutCalendar = require('./payouts-core');
const registerShieldEngine = require('./shield-engine');
const registerBondAnalytics = require('./bond-analytics');
const registerWhatIfEngine = require('./whatif-engine');
const registerAnalyticsIntegrity = require('./analytics-integrity');
const registerAnalyticsStable = require('./analytics-stable');

module.exports = function registerServerModules(app, deps) {
  registerPayoutCalendar(app, deps);
  registerShieldEngine(app, { buildDashboard: deps?.buildDashboard });
  registerAnalyticsIntegrity(app, { buildDashboard: deps?.buildDashboard });
  registerAnalyticsStable(app, { buildDashboard: deps?.buildDashboard });
  const bondDeps={ tbankRequest: deps?.tbankRequest, buildDashboard: deps?.buildDashboard };
  registerBondAnalytics(app, bondDeps);
  registerWhatIfEngine(app, { buildDashboard: deps?.buildDashboard, getBondDuration: (...args)=>bondDeps.getBondDuration?.(...args) });
};
