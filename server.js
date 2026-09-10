const fs = require('fs');
const path = require('path');
const Module = require('module');

const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// DNA WORLD v14.1.8: stable Level 1. History has one isolated bootstrap after app.js.
const legacy = /\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:v840|v850|v860|v870|v960|v1021|version-lock|dna-world-v1021-final|dna-world-v1021-single|dna-game-l1|dna-world-polish-v106|dna-game-art-v107|dna-pixel-v108|dna-pixel-v109|dna-game-world-v110|dna-lighting-v111|dna-cinematic-v112|dna-daynight-v113|dna-market-weather-v114|dna-weather-alive-v115|dna-art-detail-v116|dna-environment-v117|dna-lights-life-v118|dna-foundation-v119|dna-game-quality-v120|dna-characters-depth-v121|dna-character-art-v122|dna-game-art-v123|dna-art-direction-v124|dna-game-art-v125|dna-scene-composition-v126|dna-depth-underground-v127|dna-game-art-v128|dna-character-material-v129|dna-art-reset-v130|dna-scene-composition-v131|dna-material-architecture-v132|dna-art-clarity-v133|dna-character-world-art-v134|dna-scene-hierarchy-v135|dna-visual-story-v136|dna-clean-scene-v137|dna-world-engine-v138|dna-world-engine-v139|dna-world-engine-v140|dna-world-engine-v141)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi;
html = html.replace(legacy, '');
html = html.replace(/\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/history-loader-v1191\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi, '');

const dnaBuild = '1418-isolated-history';
const dna = '<script src="/dna-world-engine-v141.js?rev='+dnaBuild+'"></script>';
const versionLock = `<script>(function(){const V='v14.1.8';function lock(){document.querySelectorAll('*').forEach(function(el){if(el.children.length)return;const t=el.textContent||'';if(/INVESTOR DNA\\s*·\\s*v\\d+\\.\\d+\\.\\d+/i.test(t))el.textContent=t.replace(/v\\d+\\.\\d+\\.\\d+/i,V);});}lock();setTimeout(lock,250);setTimeout(lock,1000);window.addEventListener('tinvest:dashboard-live',lock);window.addEventListener('tinvest:history-ready',lock);})();</script>`;
html = html.replace('</body>', dna + versionLock + '</body>');
fs.writeFileSync(htmlPath, html);
process.env.TINVEST_BUILD = '14.1.8';

// Patch the proven app owner. The previous replacement targeted a minified string
// that does not exist in current app.js, so history never started. Inject a direct
// bootstrap immediately after the existing load() call instead.
const appPath = path.join(__dirname, 'public', 'app.js');
let appJs = fs.readFileSync(appPath, 'utf8');
if (!appJs.includes('function loadIsolatedHistoryV1418')) {
  appJs += `\n\n// v14.1.8 — isolated history bootstrap; LIVE dashboard remains independent.\nfunction loadIsolatedHistoryV1418(){\n  if(window.__TIN_HISTORY_1418)return;\n  window.__TIN_HISTORY_1418=true;\n  const empty=document.getElementById('chartEmpty');\n  if(empty){empty.textContent='История загружается…';empty.style.display='flex';}\n  const x=new XMLHttpRequest();\n  x.open('GET','/api/history-debug?v=14.1.8&t='+Date.now(),true);\n  x.timeout=90000;\n  x.onload=function(){\n    try{\n      const p=JSON.parse(x.responseText||'null');\n      if(x.status>=200&&x.status<300&&p&&p.ok&&p.history&&p.history.available){\n        if(typeof dashboardData!=='undefined'&&dashboardData){dashboardData.history=p.history;render(dashboardData);}\n        window.dispatchEvent(new CustomEvent('tinvest:history-ready',{detail:{points:(p.history.points||[]).length}}));\n        return;\n      }\n    }catch(_){}\n    window.__TIN_HISTORY_1418=false;\n    if(empty){empty.textContent='История временно недоступна';empty.style.display='flex';}\n  };\n  x.onerror=x.ontimeout=function(){window.__TIN_HISTORY_1418=false;if(empty){empty.textContent='История временно недоступна';empty.style.display='flex';}};\n  x.send(null);\n}\nsetTimeout(loadIsolatedHistoryV1418,3500);\n`;
  fs.writeFileSync(appPath, appJs);
}

const corePath = path.join(__dirname, 'server-core.js');
let core = fs.readFileSync(corePath, 'utf8');
core = core.replace(/\n  \/\/ Enrich a small number of positions with instrument names\.[\s\S]*?\n  const portfolioValue =/, '\n  // Production: portfolio payload already contains everything needed for the live dashboard.\n  // Instrument-name enrichment is deliberately skipped here to avoid T-Bank 429 bursts.\n  const portfolioValue =');
core = core.replace(/const HISTORY_CACHE_TTL_MS = 5 \* 60 \* 1000;/, 'const HISTORY_CACHE_TTL_MS = 30 * 60 * 1000;');
core = core.replace(/\n  let history = \{ available: false, points: \[\], reason: 'not_built' \};\n  try \{\n    history = await buildPortfolioHistory\(account\.id, executed, firstInvestment, portfolioValue\);\n  \} catch \(err\) \{\n    console\.warn\('Portfolio history build failed:', err\.message\);\n  \}/, "\n  const history = { available: false, points: [], reason: 'deferred' };");

// Keep the v14.1.7 rate-limit-safe history builder already present in server-core
// after runtime transformation. It is isolated behind /api/history-debug and cannot
// block /api/dashboard.

const mod = new Module(corePath, module);
mod.filename = corePath;
mod.paths = Module._nodeModulePaths(path.dirname(corePath));
mod._compile(core, corePath);