const fs=require('fs');
const path=require('path');
const pub=path.join(__dirname,'public');
const htmlPath=path.join(pub,'index.html');
const src=path.join(pub,'v960.js');
const uniqueName='dna-world-v1021-single.js';
const unique=path.join(pub,uniqueName);
if(fs.existsSync(src))fs.copyFileSync(src,unique);
let html=fs.readFileSync(htmlPath,'utf8');
// DNA World has accumulated several historical renderer scripts. Remove every
// renderer generation from the delivered HTML and append exactly one owner.
const rendererNames=['v850','v860','v870','v960','v1021','version-lock','dna-world-v1021-final','dna-world-v1021-single'];
for(const name of rendererNames){
  const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp('<script\\b[^>]*\\bsrc\\s*=\\s*["\\\'][^"\\\']*\\/'+escaped+'\\.js(?:\\?[^"\\\']*)?["\\\'][^>]*>\\s*<\\/script>','gi'),'');
}
html=html.replace('</body>',`<script src="/${uniqueName}?build=1021-single-89912"></script></body>`);
fs.writeFileSync(htmlPath,html);
require('./server.js');
