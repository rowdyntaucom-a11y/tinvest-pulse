const fs = require('fs');
const path = require('path');

// Render service currently starts `node server.js` directly.
// Keep the original application server byte-for-byte in server-core.js and
// use this tiny entrypoint only to prepare the DNA WORLD HTML before Express
// serves public/index.html.
const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// ONE WORLD -> ONE RENDERER -> ONE UPDATE LOOP.
// Stable financial core stays untouched; DNA evolution happens inside the existing renderer/layers.
const legacy = /\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:v840|v850|v860|v870|v960|v1021|version-lock|dna-world-v1021-final|dna-world-v1021-single|dna-game-l1|dna-world-polish-v106|dna-game-art-v107|dna-pixel-v108|dna-pixel-v109|dna-game-world-v110|dna-lighting-v111|dna-cinematic-v112|dna-daynight-v113|dna-market-weather-v114|dna-weather-alive-v115|dna-art-detail-v116|dna-environment-v117|dna-lights-life-v118|dna-foundation-v119)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi;
html = html.replace(legacy, '');
const dnaBuild = '1190-label-owner-607083c';
html = html.replace('</body>', '<script src="/dna-daynight-v113.js?rev='+dnaBuild+'"></script><script src="/dna-market-weather-v114.js?rev='+dnaBuild+'"></script><script src="/dna-weather-alive-v115.js?rev='+dnaBuild+'"></script><script src="/dna-art-detail-v116.js?rev='+dnaBuild+'"></script><script src="/dna-environment-v117.js?rev='+dnaBuild+'"></script><script src="/dna-lights-life-v118.js?rev='+dnaBuild+'"></script><script src="/dna-foundation-v119.js?rev='+dnaBuild+'"></script></body>');
fs.writeFileSync(htmlPath, html);
process.env.TINVEST_BUILD = '11.9.0';

require('./server-core.js');