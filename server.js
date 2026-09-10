const fs = require('fs');
const path = require('path');
const Module = require('module');

const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// v14.3.3 — cached history + corrected MOEX historical endpoints.
const legacy = /\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:v840|v850|v860|v870|v960|v1021|version-lock|dna-world-v1021-final|dna-world-v1021-single|dna-game-l1|dna-world-polish-v106|dna-game-art-v107|dna-pixel-v108|dna-pixel-v109|dna-game-world-v110|dna-lighting-v111|dna-cinematic-v112|dna-daynight-v113|dna-market-weather-v114|dna-weather-alive-v115|dna-art-detail-v116|dna-environment-v117|dna-lights-life-v118|dna-foundation-v119|dna-game-quality-v120|dna-characters-depth-v121|dna-character-art-v122|dna-game-art-v123|dna-art-direction-v124|dna-game-art-v125|dna-scene-composition-v126|dna-depth-underground-v127|dna-game-art-v128|dna-character-material-v129|dna-art-reset-v130|dna-scene-composition-v131|dna-material-architecture-v132|dna-art-clarity-v133|dna-character-world-art-v134|dna-scene-hierarchy-v135|dna-visual-story-v136|dna-clean-scene-v137|dna-world-engine-v138|dna-world-engine-v139|dna-world-engine-v140|dna-world-engine-v141)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi;
html=html.replace(legacy,'').replace(/\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:history-loader-v1191|history-chart-v142)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi,'');
const dna='<script src="/dna-world-engine-v141.js?rev=1433"></script>',history='<script src="/history-chart-v142.js?rev=1433"></script>';
const versionLock=`<script>(function(){const V='v14.3.3';function lock(){document.querySelectorAll('*').forEach(function(el){if(el.children.length)return;const t=el.textContent||'';if(/INVESTOR DNA\\s*·\\s*v\\d+\\.\\d+\\.\\d+/i.test(t))el.textContent=t.replace(/v\\d+\\.\\d+\\.\\d+/i,V);});}lock();setTimeout(lock,250);setTimeout(lock,1000);})();</script>`;
html=html.replace('</body>',history+dna+versionLock+'</body>');fs.writeFileSync(htmlPath,html);process.env.TINVEST_BUILD='14.3.3';

const corePath=path.join(__dirname,'server-core.js');let core=fs.readFileSync(corePath,'utf8');
core=core.replace(/\n  \/\/ Enrich a small number of positions with instrument names\.[\s\S]*?\n  const portfolioValue =/,'\n  // Live dashboard stays lightweight; history owns its own refresh.\n  const portfolioValue =');
core=core.replace(/const HISTORY_CACHE_TTL_MS = 5 \* 60 \* 1000;/,'const HISTORY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;');
core=core.replace(/\n  let history = \{ available: false, points: \[\], reason: 'not_built' \};\n  try \{\n    history = await buildPortfolioHistory\(account\.id, executed, firstInvestment, portfolioValue\);\n  \} catch \(err\) \{\n    console\.warn\('Portfolio history build failed:', err\.message\);\n  \}/,"\n  const history = { available:false, points:[], reason:'deferred' };");

// Correct MOEX history owner. Primary source is the official historical index route.
// Historical candles, when needed, also live under /history/.../candles.
core=core.replace(/async function getMoexHistory\(from, to\) \{[\s\S]*?\n\}\n\nfunction cbrHttpsRequest/,`async function getMoexHistory(from,to){
 const fromKey=dateKey(from),toKey=dateKey(to);
 const historyUrl=\`${MOEX_BASE}history/engines/stock/markets/index/boards/SNDX/securities/IMOEX.json?from=\${encodeURIComponent(fromKey)}&till=\${encodeURIComponent(toKey)}&iss.meta=off&iss.only=history&history.columns=TRADEDATE,CLOSE\`;
 const r=await safeFetch(historyUrl,{maxTextLength:200000});
 console.log('IMOEX history HTTP v1433 status='+(r.status??'-')+' bytes='+(r.text?.length||0));
 if(r.ok){try{const d=JSON.parse(r.text),b=d?.history,c=b?.columns||[],rows=b?.data||[],di=c.indexOf('TRADEDATE'),ci=c.indexOf('CLOSE');if(di>=0&&ci>=0){const out=rows.map(x=>({date:String(x?.[di]||'').slice(0,10),value:Number(x?.[ci])})).filter(x=>x.date&&Number.isFinite(x.value)&&x.value>0);if(out.length){console.log('IMOEX history parsed v1433 points='+out.length);return out}}}catch(e){console.warn('IMOEX history parse v1433: '+e.message)}}
 const candlesUrl=\`${MOEX_BASE}history/engines/stock/markets/index/boards/SNDX/securities/IMOEX/candles.json?from=\${encodeURIComponent(fromKey)}&till=\${encodeURIComponent(toKey)}&interval=24&iss.meta=off\`;
 const cr=await safeFetch(candlesUrl,{maxTextLength:200000});
 console.log('IMOEX candles HTTP v1433 status='+(cr.status??'-')+' bytes='+(cr.text?.length||0));
 if(cr.ok){try{const d=JSON.parse(cr.text),b=d?.candles,c=b?.columns||[],rows=b?.data||[],di=c.indexOf('begin'),ci=c.indexOf('close');if(di>=0&&ci>=0){return rows.map(x=>({date:String(x?.[di]||'').slice(0,10),value:Number(x?.[ci])})).filter(x=>x.date&&Number.isFinite(x.value)&&x.value>0)}}catch(e){console.warn('IMOEX candles parse v1433: '+e.message)}}
 return [];
}

function cbrHttpsRequest`);

core=core.replace(/async function buildPortfolioHistory\(accountId, operations, firstInvestment, portfolioValue\) \{[\s\S]*?\n\}\n\nasync function getMoex\(\) \{/,`async function buildPortfolioHistory(accountId, operations, firstInvestment, portfolioValue) {
 if(!firstInvestment?.date)return{available:false,points:[],reason:'no_start_date'};const cacheKey=String(accountId||'default')+':v1433';const cached=HISTORY_CACHE.get(cacheKey);if(cached&&Date.now()-cached.createdAt<HISTORY_CACHE_TTL_MS)return cached.data;
 const from=new Date(firstInvestment.date),to=new Date(),ops=Array.isArray(operations)?operations:[],ids=new Map();for(const op of ops)if(op?.figi&&(securityQuantityDelta(op)||/BUY|SELL/.test(String(op.type||''))))ids.set(op.figi,{id:op.instrumentUid||op.figi,type:String(op.instrumentType||'')});
 const maps=new Map();for(const[figi,info]of ids){let cs=[];try{cs=await getDailyCandles(info.id,from,to)}catch(e){console.warn('History candle '+figi+': '+e.message)}const map=new Map();for(const c of cs||[]){let v=quotationValue(c.close);if(info.type.toUpperCase().includes('BOND'))v=v/100*1000;if(v>0)map.set(dateKey(c.time),v)}maps.set(figi,map);await new Promise(r=>setTimeout(r,220))}
 const dates=businessDates(from,to),sorted=[...ops].map(o=>({...o,_date:safeDate(o.date)})).filter(o=>o._date&&o._date>=from).sort((a,b)=>a._date-b._date);let cash=0,i=0;const qty=new Map(),raw=[];for(const day of dates){const end=new Date(day);end.setUTCHours(23,59,59,999);while(i<sorted.length&&sorted[i]._date<=end){const o=sorted[i++],t=String(o.type||'').toUpperCase();cash+=/BUY|SELL|PRIMARY_ORDER/.test(t)?signedTradeCash(o):signedHistoricalCash(o);const d=securityQuantityDelta(o);if(d)qty.set(o.figi,(qty.get(o.figi)||0)+d)}let sec=0;for(const[figi,q]of qty){const map=maps.get(figi);if(!map||!q)continue;const key=dateKey(day);let price=map.get(key);if(price==null){const prior=[...map].filter(([k])=>k<=key).pop();price=prior&&prior[1]}if(price>0)sec+=q*price}const value=cash+sec;if(value>0)raw.push({date:dateKey(day),value})}
 const tk=dateKey(to);if(!raw.length||raw.at(-1).date!==tk)raw.push({date:tk,value:portfolioValue});else raw.at(-1).value=portfolioValue;if(raw.length<2)return{available:false,points:[],reason:'insufficient_history'};const flows=new Map();for(const o of sorted)if(isExternalCashOperation(o)){const k=dateKey(o._date);flows.set(k,(flows.get(k)||0)+signedHistoricalCash(o))}let idx=100;const points=[{date:raw[0].date,portfolio:100}],valuePoints=raw.map(x=>({date:x.date,value:Number(x.value.toFixed(2))})),investedPoints=[];let invested=0;for(const d of dates){const k=dateKey(d);invested+=flows.get(k)||0;investedPoints.push({date:k,value:Number(Math.max(0,invested).toFixed(2))})}for(let j=1;j<raw.length;j++){const base=raw[j-1].value+(flows.get(raw[j].date)||0);if(base>0){const r=raw[j].value/base;if(r>.2&&r<5)idx*=r}points.push({date:raw[j].date,portfolio:Number(idx.toFixed(4))})}
 let moex=[];try{moex=(await getMoexHistory(from,to)).filter(x=>x&&x.date&&Number.isFinite(Number(x.value))&&Number(x.value)>0).map(x=>({date:String(x.date).slice(0,10),value:Number(x.value)})).sort((a,b)=>a.date.localeCompare(b.date))}catch(e){console.warn('IMOEX history failed:',e.message)}
 const firstMoex=moex.length?moex[0].value:null;let mi=0,lastMoex=null;for(const p of points){while(mi<moex.length&&moex[mi].date<=p.date){lastMoex=moex[mi].value;mi++}p.imoex=firstMoex&&lastMoex?Number((lastMoex/firstMoex*100).toFixed(4)):null}
 const result={available:true,startDate:points[0].date,endDate:points.at(-1).date,points,valuePoints,investedPoints,method:'snapshot_history_v1433',benchmark:{symbol:'IMOEX',available:moex.length>1,rawPoints:moex.length,firstDate:moex[0]?.date||null,lastDate:moex.at(-1)?.date||null}};console.log('IMOEX snapshot v1433 points='+moex.length+' first='+(moex[0]?.date||'-')+' last='+(moex.at(-1)?.date||'-'));HISTORY_CACHE.set(cacheKey,{createdAt:Date.now(),data:result});return result;
}

async function getMoex() {`);
core=core.replace(/\nstart\(\);\s*$/,`\nstart();\nsetTimeout(async()=>{try{const a=selectAccount(await getAccounts());if(!a?.id)return;const [ops,p]=await Promise.all([getOperations(a.id),getPortfolio(a.id)]);const first=ops.filter(isExternalCashOperation).map(o=>({date:safeDate(o.date),amount:operationCash(o)})).filter(x=>x.date&&x.amount>0).sort((x,y)=>x.date-y.date)[0];await buildPortfolioHistory(a.id,ops,first,moneyValue(p?.totalAmountPortfolio));console.log('History snapshot v1433 warmed');}catch(e){console.warn('History warmup deferred:',e.message)}},12000);\n`);
const mod=new Module(corePath,module);mod.filename=corePath;mod.paths=Module._nodeModulePaths(path.dirname(corePath));mod._compile(core,corePath);