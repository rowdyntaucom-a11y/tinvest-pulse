'use strict';

const registerPayoutCalendar = require('./payouts-core');
const registerShieldEngine = require('./shield-engine');

module.exports = function registerServerModules(app, deps) {
  registerPayoutCalendar(app, deps);
  registerShieldEngine(app, { buildDashboard: deps?.buildDashboard });
};
