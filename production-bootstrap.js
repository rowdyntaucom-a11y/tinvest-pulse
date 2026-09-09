const fs=require('fs');
const path=require('path');
const pub=path.join(__dirname,'public');
const htmlPath=path.join(pub,'index.html');
let html=fs.readFileSync(htmlPath,'utf8');

// Production invariant: ONE WORLD -> ONE RENDERER -> ONE UPDATE LOOP.
// Strip every historical DNA renderer from the HTML delivered by Express.
// Keep v841: it only wires the DNA button and syncs portfolio values.
const legacy=/\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:v840|v850|v860|v870|v960|v1021|version-lock|dna-world-v1021-final|dna-world-v1021-single|dna-game-l1)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi;
html=html.replace(legacy,'');

// Add exactly one renderer after all application/compatibility scripts.
html=html.replace('</body>','<script src="/dna-game-l1.js?build=1030-exclusive-r6"></script></body>');
fs.writeFileSync(htmlPath,html);
process.env.TINVEST_BUILD='10.3.0-r6';
require('./server.js');
