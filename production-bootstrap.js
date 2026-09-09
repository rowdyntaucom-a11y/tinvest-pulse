const fs=require('fs');
const path=require('path');
const pub=path.join(__dirname,'public');
const htmlPath=path.join(pub,'index.html');
const uniqueName='dna-game-l1.js';
let html=fs.readFileSync(htmlPath,'utf8');
// Production invariant: ONE WORLD -> ONE RENDERER -> ONE UPDATE LOOP.
// v840 is also a full scene renderer (not merely a controller), so it must be
// stripped together with all later historical worlds. v841 stays: it only
// owns the DNA open/close wiring and financial level synchronisation.
const rendererNames=['v840','v850','v860','v870','v960','v1021','version-lock','dna-world-v1021-final','dna-world-v1021-single','dna-game-l1'];
for(const name of rendererNames){
  const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp('<script\\b[^>]*\\bsrc\\s*=\\s*["\\\'][^"\\\']*\\/'+escaped+'\\.js(?:\\?[^"\\\']*)?["\\\'][^>]*>\\s*<\\/script>','gi'),'');
}
html=html.replace('</body>',`<script src="/${uniqueName}?build=1030-game-l1-r2"></script></body>`);
fs.writeFileSync(htmlPath,html);
require('./server.js');
