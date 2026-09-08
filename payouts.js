'use strict';

const registerPayoutCalendar = require('./payouts-core');
const registerShieldEngine = require('./shield-engine');
const registerBondAnalytics = require('./bond-analytics');
const registerWhatIfEngine = require('./whatif-engine');

module.exports = function registerServerModules(app, deps) {
  registerPayoutCalendar(app, deps);
  registerShieldEngine(app, { buildDashboard: deps?.buildDashboard });
  registerBondAnalytics(app, { tbankRequest: deps?.tbankRequest, buildDashboard: deps?.buildDashboard });
  registerWhatIfEngine(app, { buildDashboard: deps?.buildDashboard });
};
