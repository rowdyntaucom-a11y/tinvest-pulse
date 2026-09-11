const fs = require('fs');
const path = require('path');
const Module = require('module');

const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// v14.22.0 — DNA CHARACTER LIFE: detailed Figma sprites + visible work cycles + livelier mine; finance/history unchanged.
const legacy = /\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:v840|v850|v860|v870|v960|v1021|version-lock|dna-world-v1021-final|dna-world-v1021-single|dna-game-l1|dna-world-polish-v106|dna-game-art-v107|dna-pixel-v108|dna-pixel-v109|dna-game-world-v110|dna-lighting-v111|dna-cinematic-v112|dna-daynight-v113|dna-market-weather-v114|dna-weather-alive-v115|dna-art-detail-v116|dna-environment-v117|dna-lights-life-v118|dna-foundation-v119|dna-game-quality-v120|dna-characters-depth-v121|dna-character-art-v122|dna-game-art-v123|dna-art-direction-v124|dna-game-art-v125|dna-scene-composition-v126|dna-depth-underground-v127|dna-game-art-v128|dna-character-material-v129|dna-art-reset-v130|dna-scene-composition-v131|dna-material-architecture-v132|dna-art-clarity-v133|dna-character-world-art-v134|dna-scene-hierarchy-v135|dna-visual-story-v136|dna-clean-scene-v137|dna-world-engine-v138|dna-world-engine-v139|dna-world-engine-v140|dna-world-engine-v141|dna-game-assets-v147|dna-art-scene-v148|dna-motion-hotfix-v14170|dna-world-runtime-v14180)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi;
html=html.replace(legacy,'').replace(/\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:history-loader-v1191|history-chart-v142)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi,'');
const art='<script src="/dna-art-scene-v148.js?rev=14220"></script>',assets='<script src="/dna-game-assets-v147.js?rev=14220"></script>',dna='<script src="/dna-world-engine-v141.js?rev=14220"></script>',runtime='<script src="/dna-world-runtime-v14180.js?rev=14220"></script>',history='<script src="/history-chart-v142.js?rev=14220"></script>';
const versionLock=`<script>(function(){const V='v14.22.0';function lock(){document.querySelectorAll('*').forEach(function(el){if(el.children.length)return;const t=el.textContent||'';if(/INVESTOR DNA\\s*·\\s*v\\d+\\.\\d+\\.\\d+/i.test(t))el.textContent=t.replace(/v\\d+\\.\\d+\\.\\d+/i,V);});document.querySelectorAll('.dnBadge').forEach(function(b){const t=b.textContent||'';if(/GAME ASSETS|FOUNDATION WORKS|DNA ART|RESOURCES|MINEWORKS|CLEAN ART|ART REBUILD/i.test(t))b.innerHTML='<i></i> CHARACTER LIFE · '+V+' · 11/11';});}lock();setTimeout(lock,250);setTimeout(lock,1000);})();</script>`;
html=html.replace('</body>',history+art+assets+dna+runtime+versionLock+'</body>');fs.writeFileSync(htmlPath,html);process.env.TINVEST_BUILD='14.22.0';

const corePath=path.join(__dirname,'server-core.js');let core=fs.readFileSync(corePath,'utf8');
core=core.replace(/\n  \/\/ Enrich a small number of positions with instrument names\.[\s\S]*?\n  const portfolioValue =/,'\n  // Live dashboard stays lightweight; history owns its own refresh.\n  const portfolioValue =');
core=core.replace(/const HISTORY_CACHE_TTL_MS = 5 \* 60 \* 1000;/,'const HISTORY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;');
core=core.replace(/\n  let history = \{ available: false, points: \[\], reason: 'not_built' \};\n  try \{\n    history = await buildPortfolioHistory\(account\.id, executed, firstInvestment, portfolioValue\);\n  \} catch \(err\) \{\n    console\.warn\('Portfolio history build failed:', err\.message\);\n  \}/,"\n  const history = { available:false, points:[], reason:'deferred' };");
core=core.replace(/async function getMoexHistory\(from, to\) \{[\s\S]*?\n\}\n\nfunction cbrHttpsRequest/,`async function getMoexHistory(from,to){ return []; }\n\nfunction cbrHttpsRequest`);
core=core.replace(/async function buildPortfolioHistory\(accountId, operations, firstInvestment, portfolioValue\) \{[\s\S]*?\n\}\n\nasync function getMoex\(\) \{/,`async function buildPortfolioHistory(accountId, operations, firstInvestment, portfolioValue) {
 if(!firstInvestment?.date)return{available:false,points:[],reason:'no_start_date'};const cacheKey=String(accountId||'default')+':v1473';const cached=HISTORY_CACHE.get(cacheKey);if(cached&&Date.now()-cached.createdAt<HISTORY_CACHE_TTL_MS)return cached.data;
 const from=new Date(firstInvestment.date),to=new Date(),ops=Array.isArray(operations)?operations:[],ids=new Map();for(const op of ops)if(op?.figi&&(securityQuantityDelta(op)||/BUY|SELL/.test(String(op.type||''))))ids.set(op.figi,{id:op.instrumentUid||op.figi,type:String(op.instrumentType||'')});
 const maps=new Map();for(const[figi,info]of ids){let cs=[];try{cs=await getDailyCandles(info.id,from,to)}catch(e){console.warn('History candle '+figi+': '+e.message)}const map=new Map();for(const c of cs||[]){let v=quotationValue(c.close);if(info.type.toUpperCase().includes('BOND'))v=v/100*1000;if(v>0)map.set(dateKey(c.time),v)}maps.set(figi,map);await new Promise(r=>setTimeout(r,220))}
 const dates=businessDates(from,to),sorted=[...ops].map(o=>({...o,_date:safeDate(o.date)})).filter(o=>o._date&&o._date>=from).sort((a,b)=>a._date-b._date);let cash=0,i=0;const qty=new Map(),raw=[];for(const day of dates){const end=new Date(day);end.setUTCHours(23,59,59,999);while(i<sorted.length&&sorted[i]._date<=end){const o=sorted[i++],t=String(o.type||'').toUpperCase();cash+=/BUY|SELL|PRIMARY_ORDER/.test(t)?signedTradeCash(o):signedHistoricalCash(o);const d=securityQuantityDelta(o);if(d)qty.set(o.figi,(qty.get(o.figi)||0)+d)}let sec=0;for(const[figi,q]of qty){const map=maps.get(figi);if(!map||!q)continue;const key=dateKey(day);let price=map.get(key);if(price==null){const prior=[...map].filter(([k])=>k<=key).pop();price=prior&&prior[1]}if(price>0)sec+=q*price}const value=cash+sec;if(value>0)raw.push({date:dateKey(day),value})}
 const tk=dateKey(to);if(!raw.length||raw.at(-1).date!==tk)raw.push({date:tk,value:portfolioValue});else raw.at(-1).value=portfolioValue;if(raw.length<2)return{available:false,points:[],reason:'insufficient_history'};const flows=new Map();for(const o of sorted)if(isExternalCashOperation(o)){const k=dateKey(o._date);flows.set(k,(flows.get(k)||0)+signedHistoricalCash(o))}let idx=100;const points=[{date:raw[0].date,portfolio:100,imoex:null}],valuePoints=raw.map(x=>({date:x.date,value:Number(x.value.toFixed(2))})),investedPoints=[];let invested=0;for(const d of dates){const k=dateKey(d);invested+=flows.get(k)||0;investedPoints.push({date:k,value:Number(Math.max(0,invested).toFixed(2))})}for(let j=1;j<raw.length;j++){const base=raw[j-1].value+(flows.get(raw[j].date)||0);if(base>0){const r=raw[j].value/base;if(r>.2&&r<5)idx*=r}points.push({date:raw[j].date,portfolio:Number(idx.toFixed(4)),imoex:null})}
 const result={available:true,startDate:points[0].date,endDate:points.at(-1).date,points,valuePoints,investedPoints,method:'portfolio_snapshot_v1473',benchmark:{symbol:'IMOEX',available:false,source:'deferred'}};HISTORY_CACHE.set(cacheKey,{createdAt:Date.now(),data:result});return result;
}

async function getMoex() {`);

const DNA_ART_REMOTE='https://cdn.openart.ai/openart-uploads/production/2026-09/create-image/hKZ2IytfR0LUReIZ7bbF/1000009980_1789042382851_6d988178.webp';
core=core.replace(/\napp\.get\('\*', \(req, res\) => \{/,`\nlet DNA_ART_CACHE=null;
let DNA_ART_TYPE='image/webp';
let DNA_ART_ERROR=null;
let DNA_ART_FETCHING=null;
const DNA_ART_REMOTE=${JSON.stringify(DNA_ART_REMOTE)};
function fetchDnaArtUrl(url,hops=0){
 return new Promise((resolve,reject)=>{
  let settled=false;
  const req=https.get(url,{headers:{'User-Agent':'Mozilla/5.0 TInvestPulse/14.16.0','Accept':'image/avif,image/webp,image/*,*/*;q=0.8'}},r=>{
   if(r.statusCode>=300&&r.statusCode<400&&r.headers.location&&hops<5){r.resume();settled=true;return resolve(fetchDnaArtUrl(new URL(r.headers.location,url).toString(),hops+1));}
   if(r.statusCode!==200){r.resume();settled=true;return reject(new Error('HTTP '+r.statusCode));}
   const chunks=[];let size=0;
   r.on('data',chunk=>{size+=chunk.length;if(size>8*1024*1024){settled=true;req.destroy(new Error('DNA art exceeds 8MB'));return;}chunks.push(chunk);});
   r.on('end',()=>{if(settled)return;settled=true;resolve({buffer:Buffer.concat(chunks),type:r.headers['content-type']||'image/webp'});});
  });
  req.setTimeout(15000,()=>req.destroy(new Error('DNA art timeout')));
  req.on('error',err=>{if(settled)return;settled=true;reject(err);});
 });
}
function ensureDnaArt(){
 if(DNA_ART_CACHE)return Promise.resolve(DNA_ART_CACHE);
 if(DNA_ART_FETCHING)return DNA_ART_FETCHING;
 DNA_ART_FETCHING=fetchDnaArtUrl(DNA_ART_REMOTE).then(({buffer,type})=>{if(!buffer||buffer.length<10000)throw new Error('DNA art payload too small');DNA_ART_CACHE=buffer;DNA_ART_TYPE=type;DNA_ART_ERROR=null;console.log('Legacy DNA art v14.8.6 cached',buffer.length,type);return buffer;}).catch(err=>{DNA_ART_ERROR=err.message;console.warn('Legacy DNA art proxy failed:',err.message);throw err;}).finally(()=>{DNA_ART_FETCHING=null;});
 return DNA_ART_FETCHING;
}
app.get('/api/dna-art/status',(req,res)=>{res.setHeader('Cache-Control','no-store');res.json({ok:true,version:'14.22.0',build:'14.22.0',source:'figma-character-life',path:'/assets/dna-world/l1/figma-pixel-v14190.svg',overlay:'/assets/dna-world/l1/depth-material-v14210.svg'});});
app.get('/dna-art-v148.webp',async(req,res)=>{try{const buffer=await ensureDnaArt();res.setHeader('Content-Type',DNA_ART_TYPE);res.setHeader('Cache-Control','public, max-age=21600, immutable');res.setHeader('Content-Length',String(buffer.length));res.end(buffer);}catch(err){res.status(502).type('text/plain').send('Legacy DNA art unavailable');}});

app.get('*', (req, res) => {`);

core=core.replace(/\nstart\(\);\s*$/,`\nstart();\nsetTimeout(async()=>{try{const a=selectAccount(await getAccounts());if(!a?.id)return;const [ops,p]=await Promise.all([getOperations(a.id),getPortfolio(a.id)]);const first=ops.filter(isExternalCashOperation).map(o=>({date:safeDate(o.date),amount:operationCash(o)})).filter(x=>x.date&&x.amount>0).sort((x,y)=>x.date-y.date)[0];await buildPortfolioHistory(a.id,ops,first,moneyValue(p?.totalAmountPortfolio));console.log('History snapshot v1473 warmed');}catch(e){console.warn('History warmup deferred:',e.message)}},12000);\n`);
const mod=new Module(corePath,module);mod.filename=corePath;mod.paths=Module._nodeModulePaths(path.dirname(corePath));mod._compile(core,corePath);