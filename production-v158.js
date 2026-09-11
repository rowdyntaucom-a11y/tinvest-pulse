const fs=require('fs');
const path=require('path');
const Module=require('module');
const serverPath=path.join(__dirname,'server-base.js');
let src=fs.readFileSync(serverPath,'utf8');
// v15.8: one static world renderer plus one lightweight compositor runtime. No legacy DNA timers/observers loaded.
src=src.replace('dna-world-cinematic-v151)\\.js','dna-world-cinematic-v151|dna-life-v152|dna-world-v153|dna-life-v153|dna-perf-v154|global-perf-v155|dna-evolution-v156|dna-mobile-safe-v157|dna-single-v158)\\.js');
const oldDecl='const art=\'<script src="/dna-art-scene-v148.js?rev=14310"></script>\',assets=\'<script src="/dna-game-assets-v147.js?rev=14310"></script>\',dna=\'<script src="/dna-world-engine-v141.js?rev=14310"></script>\',runtime=\'<script src="/dna-world-runtime-v14180.js?rev=14310"></script>\',preview=\'<script src="/dna-level-preview-v14290.js?rev=14310"></script>\',levelworld=\'<script src="/dna-level-worlds-v14310.js?rev=1500"></script>\',master=\'<script src="/dna-world-master-v150.js?rev=1510"></script>\',cinematic=\'<script src="/dna-world-cinematic-v151.js?rev=1510"></script>\',history=\'<script src="/history-chart-v142.js?rev=14310"></script>\';';
const newDecl='const assets=\'<script src="/dna-game-assets-v147.js?rev=1580"></script>\',preview=\'<script src="/dna-level-preview-v14290.js?rev=1580"></script>\',world=\'<script src="/dna-world-v153.js?rev=1580"></script>\',single=\'<script src="/dna-single-v158.js?rev=1580"></script>\',history=\'<script src="/history-chart-v142.js?rev=1580"></script>\';';
if(!src.includes(oldDecl))throw new Error('v15.8: base injection declaration changed');
src=src.replace(oldDecl,newDecl);
src=src.replace("const V='v15.1.0'","const V='v15.8.0'");
src=src.replace("b.innerHTML='<i></i> CINEMATIC WORLD · '+V+' · 11/11'","b.innerHTML='<i></i> SINGLE RUNTIME · '+V+' · 11/11'");
const oldBody="html=html.replace('</body>',history+art+assets+dna+runtime+preview+levelworld+master+cinematic+versionLock+'</body>');fs.writeFileSync(htmlPath,html);process.env.TINVEST_BUILD='15.1.0';";
const newBody="html=html.replace('</body>',history+assets+preview+world+single+versionLock+'</body>');fs.writeFileSync(htmlPath,html);process.env.TINVEST_BUILD='15.8.0';";
if(!src.includes(oldBody))throw new Error('v15.8: base body injection changed');
src=src.replace(oldBody,newBody);
src=src.replace("version:'15.1.0',build:'15.1.0',source:'cinematic-world'","version:'15.8.0',build:'15.8.0',source:'single-runtime-performance'");

// v2 bridge: server-base compiles server-core at runtime, so inject the isolated
// React/Pixi build before the legacy wildcard route without changing v1 pages.
const v2Bridge=`core=core.replace("\\napp.get('*', (req, res) => {",\`\\nconst V2_DIST=path.join(__dirname,'v2','dist');
app.use('/v2',express.static(V2_DIST,{etag:true,maxAge:'10m'}));
app.get(['/v2','/v2/*'],(req,res)=>res.sendFile(path.join(V2_DIST,'index.html')));
\\napp.get('*', (req, res) => {\`);\n`;
const coreCompile='const mod=new Module(corePath,module);';
if(!src.includes(coreCompile))throw new Error('v15.8: core compile marker changed');
src=src.replace(coreCompile,v2Bridge+coreCompile);

const mod=new Module(serverPath,module);mod.filename=serverPath;mod.paths=Module._nodeModulePaths(__dirname);mod._compile(src,serverPath);
