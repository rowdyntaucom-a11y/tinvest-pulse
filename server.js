const fs = require('fs');
const path = require('path');

// Render service currently starts `node server.js` directly.
// Keep the original application server byte-for-byte in server-core.js and
// use this tiny entrypoint only to prepare the DNA WORLD HTML before Express
// serves public/index.html.
const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// ONE WORLD -> ONE RENDERER -> ONE UPDATE LOOP.
// v800 is kept because it creates the Investor DNA shell/button/profile UI.
// v841 is kept because it syncs live portfolio values and open/close wiring.
// Every historical scene renderer is removed from the production HTML.
const legacy = /\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:v840|v850|v860|v870|v960|v1021|version-lock|dna-world-v1021-final|dna-world-v1021-single|dna-game-l1|dna-world-polish-v106)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi;
html = html.replace(legacy, '');
html = html.replace('</body>', '<script src="/dna-game-l1.js?build=1050-living-production"></script><script src="/dna-world-polish-v106.js?build=1061-polish-fix"></script></body>');
fs.writeFileSync(htmlPath, html);
process.env.TINVEST_BUILD = '10.6.1';

require('./server-core.js');