const fs = require('fs');
const path = require('path');
const Module = require('module');

const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// DNA WORLD v14.1.7: keep Level 1 stable; history is detached and rate-limit safe.
const legacy = /\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(?:v840|v850|v860|v870|v960|v1021|version-lock|dna-world-v1021-final|dna-world-v1021-single|dna-game-l1|dna-world-polish-v106|dna-game-art-v107|dna-pixel-v108|dna-pixel-v109|dna-game-world-v110|dna-lighting-v111|dna-cinematic-v112|dna-daynight-v113|dna-market-weather-v114|dna-weather-alive-v115|dna-art-detail-v116|dna-environment-v117|dna-lights-life-v118|dna-foundation-v119|dna-game-quality-v120|dna-characters-depth-v121|dna-character-art-v122|dna-game-art-v123|dna-art-direction-v124|dna-game-art-v125|dna-scene-composition-v126|dna-depth-underground-v127|dna-game-art-v128|dna-character-material-v129|dna-art-reset-v130|dna-scene-composition-v131|dna-material-architecture-v132|dna-art-clarity-v133|dna-character-world-art-v134|dna-scene-hierarchy-v135|dna-visual-story-v136|dna-clean-scene-v137|dna-world-engine-v138|dna-world-engine-v139|dna-world-engine-v140|dna-world-engine-v141)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi;
html = html.replace(legacy, '');
html = html.replace(/\s*<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/history-loader-v1191\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi, '');

const dnaBuild = '1417-safe-history';
const dna = '<script src="/dna-world-engine-v141.js?rev='+dnaBuild+'"></script>';
const versionLock = `<script>(function(){const V='v14.1.7';function lock(){document.querySelectorAll('*').forEach(function(el){if(el.children.length)return;const t=el.textContent||'';if(/INVESTOR DNA\\s*·\\s*v\\d+\\.\\d+\\.\\d+/i.test(t))el.textContent=t.replace(/v\\d+\\.\\d+\\.\\d+/i,V);if(/(?:FOUNDATION WORKS|LIGHTS & DETAIL|LIGHTS & LIFE|LIVING MARKET)\\s*·\\s*v\\d+\\.\\d+\\.\\d+/i.test(t))el.textContent=t.replace(/v\\d+\\.\\d+\\.\\d+/i,V);});}lock();setTimeout(lock,250);setTimeout(lock,1000);window.addEventListener('tinvest:dashboard-live',lock);window.addEventListener('tinvest:history-ready',lock);})();</script>`;
html = html.replace('</body>', dna + versionLock + '</body>');
fs.writeFileSync(htmlPath, html);
process.env.TINVEST_BUILD = '14.1.7';

// Patch app.js at runtime so history starts from the same code path that already
// proved it can load /api/dashboard on mobile. No separate loader script remains.
const appPath = path.join(__dirname, 'public', 'app.js');
let appJs = fs.readFileSync(appPath, 'utf8');
if (!appJs.includes('function loadDetachedHistoryV1417')) {
  appJs = appJs.replace(
    "render(d);try{localStorage.setItem('tinvest:lastDashboard'",
    "render(d);setTimeout(loadDetachedHistoryV1417,1200);try{localStorage.setItem('tinvest:lastDashboard'"
  );
  appJs += `\n\n// v14.1.7 — history is started from the proven live-dashboard owner.\nfunction loadDetachedHistoryV1417(){\n  if(window.__TIN_HISTORY_REQUESTED)return;\n  window.__TIN_HISTORY_REQUESTED=true;\n  const empty=document.getElementById('chartEmpty');\n  if(empty){empty.textContent='История загружается…';empty.style.display='flex';}\n  const x=new XMLHttpRequest();\n  x.open('GET','/api/history-debug?v=14.1.7&t='+Date.now(),true);\n  x.timeout=90000;\n  x.onreadystatechange=function(){\n    if(x.readyState!==4)return;\n    if(x.status>=200&&x.status<300){\n      try{\n        const p=JSON.parse(x.responseText||'null');\n        if(p&&p.ok&&p.history&&p.history.available){\n          window.__TIN_HISTORY=p.history;\n          if(typeof dashboardData!=='undefined'&&dashboardData){dashboardData.history=p.history;render(dashboardData);}\n          window.dispatchEvent(new CustomEvent('tinvest:history-ready',{detail:{points:(p.history.points||[]).length}}));\n          return;\n        }\n      }catch(_){}\n    }\n    window.__TIN_HISTORY_REQUESTED=false;\n    if(empty){empty.textContent='История временно недоступна';empty.style.display='flex';}\n  };\n  x.onerror=x.ontimeout=function(){window.__TIN_HISTORY_REQUESTED=false;if(empty){empty.textContent='История временно недоступна';empty.style.display='flex';}};\n  x.send(null);\n}\n`;
  fs.writeFileSync(appPath, appJs);
}

const corePath = path.join(__dirname, 'server-core.js');
let core = fs.readFileSync(corePath, 'utf8');
core = core.replace(/\n  \/\/ Enrich a small number of positions with instrument names\.[\s\S]*?\n  const portfolioValue =/, '\n  // Production: portfolio payload already contains everything needed for the live dashboard.\n  // Instrument-name enrichment is deliberately skipped here to avoid T-Bank 429 bursts.\n  const portfolioValue =');
core = core.replace(/const HISTORY_CACHE_TTL_MS = 5 \* 60 \* 1000;/, 'const HISTORY_CACHE_TTL_MS = 30 * 60 * 1000;');
// Keep heavy history out of /api/dashboard.
core = core.replace(/\n  let history = \{ available: false, points: \[\], reason: 'not_built' \};\n  try \{\n    history = await buildPortfolioHistory\(account\.id, executed, firstInvestment, portfolioValue\);\n  \} catch \(err\) \{\n    console\.warn\('Portfolio history build failed:', err\.message\);\n  \}/, "\n  const history = { available: false, points: [], reason: 'deferred' };");

// Replace the old metadata-heavy history builder. Historical candles are now
// requested sequentially using operation instrument IDs; bond nominal is inferred
// from actual trade cash/price when possible. This removes the metadata burst that
// produced HTTP 429 while preserving a real daily TWR history.
core = core.replace(/async function buildPortfolioHistory\(accountId, operations, firstInvestment, portfolioValue\) \{[\s\S]*?\n\}\n\nasync function getMoex\(\) \{/, `async function buildPortfolioHistory(accountId, operations, firstInvestment, portfolioValue) {
  if (!firstInvestment?.date) return { available:false, points:[], reason:'no_start_date' };
  const cacheKey = String(accountId || 'default') + ':4.1-safe';
  const cached = HISTORY_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < HISTORY_CACHE_TTL_MS) return cached.data;

  const from = new Date(firstInvestment.date), to = new Date();
  const ops = Array.isArray(operations) ? operations : [];
  const instruments = new Map();
  for (const op of ops) {
    if (!op?.figi) continue;
    const delta = securityQuantityDelta(op);
    const t = String(op?.type || '').toUpperCase();
    if (!delta && !t.includes('BUY') && !t.includes('SELL')) continue;
    const instrumentType = String(op.instrumentType || '');
    const instrumentId = op.instrumentUid || op.figi;
    let nominal = null;
    if (instrumentType.toUpperCase().includes('BOND')) {
      const price = quotationValue(op?.price), qty = operationQuantity(op), cash = Math.abs(operationCash(op));
      const inferred = price > 0 && qty > 0 && cash > 0 ? cash / qty / (price / 100) : 0;
      if (inferred >= 100 && inferred <= 100000) nominal = inferred;
    }
    const prev = instruments.get(op.figi);
    instruments.set(op.figi, { instrumentType: instrumentType || prev?.instrumentType || '', instrumentId: instrumentId || prev?.instrumentId || op.figi, nominal: nominal || prev?.nominal || null });
  }

  const candleMaps = new Map();
  for (const [figi, info] of instruments.entries()) {
    let candles=[];
    try { candles = await getDailyCandles(info.instrumentId, from, to); } catch (err) { console.warn('History candles skipped for '+figi+': '+err.message); }
    const type = String(info.instrumentType || '').toUpperCase();
    const nominal = Number(info.nominal) || (type.includes('BOND') ? 1000 : 0);
    const map = new Map();
    for (const candle of (candles || [])) {
      const key = dateKey(candle.time), close = quotationValue(candle.close);
      if (!key || !Number.isFinite(close) || close <= 0) continue;
      map.set(key, type.includes('BOND') && nominal > 0 ? close / 100 * nominal : close);
    }
    candleMaps.set(figi, { map, type });
    await new Promise(r => setTimeout(r, 180));
  }

  const dates = businessDates(from, to);
  if (!dates.length) return { available:false, points:[], reason:'no_dates' };
  const sortedOps = [...ops].map(op=>({ ...op, _date:safeDate(op.date) })).filter(op=>op._date && op._date>=from).sort((a,b)=>a._date-b._date);
  const qty = new Map(); let cash=0, opIndex=0; const raw=[];
  for (const day of dates) {
    const end=new Date(day); end.setUTCHours(23,59,59,999);
    while (opIndex<sortedOps.length && sortedOps[opIndex]._date<=end) {
      const op=sortedOps[opIndex++], type=String(op?.type||'').toUpperCase();
      if (type.includes('BUY') || type.includes('SELL') || type==='OPERATION_TYPE_DELIVERY_BUY' || type==='OPERATION_TYPE_DELIVERY_SELL' || type==='OPERATION_TYPE_PRIMARY_ORDER') cash += signedTradeCash(op); else cash += signedHistoricalCash(op);
      const delta=securityQuantityDelta(op); if(delta) qty.set(op.figi,(qty.get(op.figi)||0)+delta);
    }
    let securities=0;
    for (const [figi,quantity] of qty.entries()) {
      if(!quantity) continue; const info=candleMaps.get(figi); if(!info) continue;
      let price=info.map.get(dateKey(day));
      if(price==null){const prior=[...info.map.entries()].filter(([k])=>k<=dateKey(day)).sort((a,b)=>a[0].localeCompare(b[0])).pop();price=prior?.[1]??null;}
      if(price!=null&&Number.isFinite(price)) securities+=quantity*price;
    }
    const value=cash+securities; if(Number.isFinite(value)&&value>0) raw.push({date:dateKey(day),value});
  }
  const todayKey=dateKey(to); if(!raw.length||raw[raw.length-1].date!==todayKey)raw.push({date:todayKey,value:portfolioValue});else raw[raw.length-1].value=portfolioValue;
  if(raw.length<2) return { available:false, points:[], reason:'insufficient_price_history' };

  const externalByDay=new Map();
  for(const op of sortedOps){if(!isExternalCashOperation(op))continue;const key=dateKey(op._date);externalByDay.set(key,(externalByDay.get(key)||0)+signedHistoricalCash(op));}
  let index=100; const points=[{date:raw[0].date,portfolio:100}];
  const valuePoints=raw.map(x=>({date:x.date,value:Number(x.value.toFixed(2))}));
  const investedPoints=[]; let investedTotal=0;
  for(const day of dates){const key=dateKey(day);investedTotal+=externalByDay.get(key)||0;investedPoints.push({date:key,value:Number(Math.max(0,investedTotal).toFixed(2))});}
  for(let i=1;i<raw.length;i++){const prev=raw[i-1],cur=raw[i],flow=externalByDay.get(cur.date)||0,base=prev.value+flow;if(base>0&&cur.value>0){const daily=cur.value/base;if(daily>0.2&&daily<5)index*=daily;}points.push({date:cur.date,portfolio:Number(index.toFixed(4))});}
  const moex=await getMoexHistory(from,to), moexMap=new Map(moex.map(x=>[x.date,x.value])), firstMoex=moex.find(x=>x.value>0)?.value||null;
  for(const p of points){const m=moexMap.get(p.date);p.imoex=firstMoex&&m?Number((m/firstMoex*100).toFixed(4)):null;}
  const result={available:points.length>=2,startDate:points[0]?.date||null,endDate:points[points.length-1]?.date||null,points,valuePoints,investedPoints,method:'daily_twr_safe_sequential_candles_v41'};
  HISTORY_CACHE.set(cacheKey,{createdAt:Date.now(),data:result}); return result;
}

async function getMoex() {`);

const mod = new Module(corePath, module);
mod.filename = corePath;
mod.paths = Module._nodeModulePaths(path.dirname(corePath));
mod._compile(core, corePath);