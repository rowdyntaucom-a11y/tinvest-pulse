const fs = require('fs');
const path = require('path');
const Module = require('module');

const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// DNA WORLD v14.1.6: emergency restore of fast live dashboard after history API rate-limit storm.
const legacy = /\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:v840|v850|v860|v870|v960|v1021|version-lock|dna-world-v1021-final|dna-world-v1021-single|dna-game-l1|dna-world-polish-v106|dna-game-art-v107|dna-pixel-v108|dna-pixel-v109|dna-game-world-v110|dna-lighting-v111|dna-cinematic-v112|dna-daynight-v113|dna-market-weather-v114|dna-weather-alive-v115|dna-art-detail-v116|dna-environment-v117|dna-lights-life-v118|dna-foundation-v119|dna-game-quality-v120|dna-characters-depth-v121|dna-character-art-v122|dna-game-art-v123|dna-art-direction-v124|dna-game-art-v125|dna-scene-composition-v126|dna-depth-underground-v127|dna-game-art-v128|dna-character-material-v129|dna-art-reset-v130|dna-scene-composition-v131|dna-material-architecture-v132|dna-art-clarity-v133|dna-character-world-art-v134|dna-scene-hierarchy-v135|dna-visual-story-v136|dna-clean-scene-v137|dna-world-engine-v138|dna-world-engine-v139|dna-world-engine-v140|dna-world-engine-v141)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi;
html = html.replace(legacy, '');
html = html.replace(/\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/history-loader-v1191\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi, '');

const dnaBuild = '1416-live-first';
const dna = '<script src="/dna-world-engine-v141.js?rev='+dnaBuild+'"></script>';
const versionLock = `<script>(function(){const V='v14.1.6';function lock(){document.querySelectorAll('*').forEach(function(el){if(el.children.length)return;const t=el.textContent||'';if(/INVESTOR DNA\\s*·\\s*v\\d+\\.\\d+\\.\\d+/i.test(t))el.textContent=t.replace(/v\\d+\.\\d+\.\\d+/i,V);});}lock();setTimeout(lock,250);setTimeout(lock,1000);window.addEventListener('tinvest:dashboard-live',lock);})();</script>`;
html = html.replace('</body>', dna + versionLock + '</body>');
fs.writeFileSync(htmlPath, html);
process.env.TINVEST_BUILD = '14.1.6';

const corePath = path.join(__dirname, 'server-core.js');
let core = fs.readFileSync(corePath, 'utf8');
core = core.replace(/\n  \/\/ Enrich a small number of positions with instrument names\.[\s\S]*?\n  const portfolioValue =/, '\n  // Production: portfolio payload already contains everything needed for the live dashboard.\n  // Instrument-name enrichment is deliberately skipped here to avoid T-Bank 429 bursts.\n  const portfolioValue =');
core = core.replace(/\n  let history = \{ available: false, points: \[\], reason: 'not_built' \};\n  try \{\n    history = await buildPortfolioHistory\(account\.id, executed, firstInvestment, portfolioValue\);\n  \} catch \(err\) \{\n    console\.warn\('Portfolio history build failed:', err\.message\);\n  \}/, "\n  // Keep history off the critical live-dashboard path. Full rebuild currently\n  // bursts T-Bank metadata/candle requests and can trigger HTTP 429.\n  const history = { available: false, points: [], reason: 'rate_limit_guard' };");

const mod = new Module(corePath, module);
mod.filename = corePath;
mod.paths = Module._nodeModulePaths(path.dirname(corePath));
mod._compile(core, corePath);