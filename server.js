const fs = require('fs');
const path = require('path');
const Module = require('module');

// Render starts `node server.js`. Keep server-core.js as the canonical app and
// apply only narrow production guards here so the stable dashboard path is not
// blocked by history/metadata enrichment.
const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// ONE WORLD -> ONE RENDERER -> ONE UPDATE LOOP.
const legacy = /\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:v840|v850|v860|v870|v960|v1021|version-lock|dna-world-v1021-final|dna-world-v1021-single|dna-game-l1|dna-world-polish-v106|dna-game-art-v107|dna-pixel-v108|dna-pixel-v109|dna-game-world-v110|dna-lighting-v111|dna-cinematic-v112|dna-daynight-v113|dna-market-weather-v114|dna-weather-alive-v115|dna-art-detail-v116|dna-environment-v117|dna-lights-life-v118|dna-foundation-v119|dna-game-quality-v120)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi;
html = html.replace(legacy, '');
const dnaBuild = '1200-game-quality-l1';
const dna = '<script src="/dna-daynight-v113.js?rev='+dnaBuild+'"></script><script src="/dna-market-weather-v114.js?rev='+dnaBuild+'"></script><script src="/dna-weather-alive-v115.js?rev='+dnaBuild+'"></script><script src="/dna-art-detail-v116.js?rev='+dnaBuild+'"></script><script src="/dna-environment-v117.js?rev='+dnaBuild+'"></script><script src="/dna-lights-life-v118.js?rev='+dnaBuild+'"></script><script src="/dna-foundation-v119.js?rev='+dnaBuild+'"></script><script src="/dna-game-quality-v120.js?rev='+dnaBuild+'"></script>';
const historyLoader = '<script src="/history-loader-v1191.js?rev=1192-resilient-history"></script>';
// Final owner for the two visible DNA version labels.
const versionLock = `<script>(function(){const V='v12.0.0';function lock(){document.querySelectorAll('*').forEach(function(el){if(el.children.length) return;const t=el.textContent||'';if(/INVESTOR DNA\\s*·\\s*v\\d+\\.\\d+\\.\\d+/i.test(t))el.textContent=t.replace(/v\\d+\\.\\d+\\.\\d+/i,V);if(/(?:FOUNDATION WORKS|LIGHTS & DETAIL|LIGHTS & LIFE|LIVING MARKET)\\s*·\\s*v\\d+\\.\\d+\\.\\d+/i.test(t))el.textContent=t.replace(/v\\d+\\.\\d+\\.\\d+/i,V);});}lock();setTimeout(lock,250);setTimeout(lock,1000);window.addEventListener('tinvest:dashboard-live',lock);window.addEventListener('tinvest:history-ready',lock);})();</script>`;
html = html.replace('</body>', dna + historyLoader + versionLock + '</body>');
fs.writeFileSync(htmlPath, html);
process.env.TINVEST_BUILD = '12.0.0';

// Stable live-dashboard behaviour: live portfolio data never waits for
// per-instrument metadata or historical candle reconstruction.
const corePath = path.join(__dirname, 'server-core.js');
let core = fs.readFileSync(corePath, 'utf8');
core = core.replace(/\n  \/\/ Enrich a small number of positions with instrument names\.[\s\S]*?\n  const portfolioValue =/, '\n  // Production: portfolio payload already contains everything needed for the live dashboard.\n  // Instrument-name enrichment is deliberately skipped here to avoid T-Bank 429 bursts.\n  const portfolioValue =');
core = core.replace(/\n  let history = \{ available: false, points: \[\], reason: 'not_built' \};\n  try \{\n    history = await buildPortfolioHistory\(account\.id, executed, firstInvestment, portfolioValue\);\n  \} catch \(err\) \{\n    console\.warn\('Portfolio history build failed:', err\.message\);\n  \}/, "\n  // History is intentionally detached from the live dashboard response.\n  // /api/history-debug is requested independently by history-loader-v1191.js.\n  const history = { available: false, points: [], reason: 'deferred' };");

const mod = new Module(corePath, module);
mod.filename = corePath;
mod.paths = Module._nodeModulePaths(path.dirname(corePath));
mod._compile(core, corePath);