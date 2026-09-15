const fs = require('fs');
const path = require('path');
const Module = require('module');
const { injectDashboardInstrumentUid } = require('./production-v163-transform.js');

const basePath = path.join(__dirname, 'production-v162.js');
const source = fs.readFileSync(basePath, 'utf8');
const patched = injectDashboardInstrumentUid(source);

const mod = new Module(basePath, module);
mod.filename = basePath;
mod.paths = Module._nodeModulePaths(__dirname);
mod._compile(patched, basePath);
