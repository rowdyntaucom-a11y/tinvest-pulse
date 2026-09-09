const fs=require('fs');
const path=require('path');
const pub=path.join(__dirname,'public');
const htmlPath=path.join(pub,'index.html');
const uniqueName='dna-game-l1.js';
let html=fs.readFileSync(htmlPath,'utf8');
// Production invariant: ONE WORLD -> ONE RENDERER -> ONE UPDATE LOOP.
// Strip every historical DNA renderer and the current game renderer before
// appending one cache-busted owner at the end of body.
const rendererNames=['v850','v860','v870','v960','v1021','version-lock','dna-world-v1021-final','dna-world-v1021-single','dna-game-l1'];
for(const name of rendererNames){
  const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp('<script\\b[^>]*\\bsrc\\s*=\\s*["\\\'][^"\\\']*\\/'+escaped+'\\.js(?:\\?[^"\\\']*)?["\\\'][^>]*>\\s*<\\/script>','gi'),'');
}
html=html.replace('</body>',`<script src="/${uniqueName}?build=1030-game-l1"></script></body>`);
fs.writeFileSync(htmlPath,html);
require('./server.js');
