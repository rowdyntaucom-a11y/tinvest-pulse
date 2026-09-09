const fs = require('fs');
const path = require('path');

// Render service currently starts `node server.js` directly.
// Keep the original application server byte-for-byte in server-core.js and
// use this tiny entrypoint only to prepare the DNA WORLD HTML before Express
// serves public/index.html.
const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// ONE WORLD -> ONE RENDERER -> ONE UPDATE LOOP.
// v800 creates the Investor DNA shell; v841 keeps live values/open-close wiring.
// v11.3 remains the single canvas renderer; v11.4 derives portfolio market weather;
// v11.5 adds a lightweight atmospheric FX layer without a competing render loop.
const legacy = /\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:v840|v850|v860|v870|v960|v1021|version-lock|dna-world-v1021-final|dna-world-v1021-single|dna-game-l1|dna-world-polish-v106|dna-game-art-v107|dna-pixel-v108|dna-pixel-v109|dna-game-world-v110|dna-lighting-v111|dna-cinematic-v112|dna-daynight-v113|dna-market-weather-v114|dna-weather-alive-v115)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi;
html = html.replace(legacy, '');
html = html.replace('</body>', '<script src="/dna-daynight-v113.js?build=1150-weather-alive"></script><script src="/dna-market-weather-v114.js?build=1150-weather-alive"></script><script src="/dna-weather-alive-v115.js?build=1150-weather-alive"></script></body>');
fs.writeFileSync(htmlPath, html);
process.env.TINVEST_BUILD = '11.5.0';

require('./server-core.js');