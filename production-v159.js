const fs=require('fs');
const path=require('path');
const Module=require('module');
const basePath=path.join(__dirname,'production-v158.js');
let src=fs.readFileSync(basePath,'utf8');

const marker="const coreCompile='const mod=new Module(corePath,module);';";
if(!src.includes(marker))throw new Error('v15.9: v15.8 core compile marker changed');

// Keep the injected source as data, then JSON-encode it into production-v158.
// This avoids nested-template escaping differences between local validation and
// the Node runtime that compiles the v15.8 wrapper on Render.
const assetHistoryInjectedCode=String.raw`
const assetHistoryMarker="\napp.get('*', (req, res) => {";
if(!core.includes(assetHistoryMarker))throw new Error('QVANIX v2: asset history route marker changed');
const assetHistoryCode=[
 "const qvanixAssetHistoryCache={expiresAt:0,payload:null};",
 "async function qvanixGetDailyCandles(instrumentId,from,to){",
 "  const data=await tbankRequest('tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles',{from,to,interval:'CANDLE_INTERVAL_DAY',instrumentId});",
 "  const rows=Array.isArray(data?.candles)?data.candles:[];",
 "  const byDate=new Map();",
 "  for(const candle of rows){",
 "    const date=String(candle?.time||'').slice(0,10);",
 "    const value=quotationValue(candle?.close);",
 "    if(date&&Number.isFinite(value)&&value>0)byDate.set(date,value);",
 "  }",
 "  return [...byDate.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,value])=>({date,value}));",
 "}",
 "app.get('/api/asset-history',async(req,res)=>{",
 "  try{",
 "    const now=Date.now();",
 "    if(qvanixAssetHistoryCache.payload&&qvanixAssetHistoryCache.expiresAt>now)return res.json(qvanixAssetHistoryCache.payload);",
 "    const accountsResponse=await getAccounts();",
 "    const account=selectAccount(accountsResponse);",
 "    if(!account?.id)return res.status(404).json({version:'1.0',available:false,series:[],error:'No open account'});",
 "    const portfolio=await getPortfolio(account.id);",
 "    const ranked=(Array.isArray(portfolio?.positions)?portfolio.positions:[])",
 "      .map(p=>({raw:p,instrumentId:p?.instrumentUid||p?.figi||null,figi:p?.figi||null,instrumentType:p?.instrumentType||'',value:moneyValue(p?.quantity)*moneyValue(p?.currentPrice)}))",
 "      .filter(x=>x.instrumentId&&Number.isFinite(x.value)&&x.value>0)",
 "      .sort((a,b)=>b.value-a.value)",
 "      .slice(0,6);",
 "    const to=new Date();",
 "    const from=new Date(to.getTime()-365*24*60*60*1000);",
 "    const fromIso=from.toISOString();",
 "    const toIso=to.toISOString();",
 "    const series=[];",
 "    for(let i=0;i<ranked.length;i+=3){",
 "      const chunk=ranked.slice(i,i+3);",
 "      const rows=await Promise.all(chunk.map(async item=>{",
 "        try{",
 "          let meta=null;",
 "          if(item.figi){try{meta=await getInstrumentMeta(item.figi,item.instrumentType)}catch(metaError){}}",
 "          const points=await qvanixGetDailyCandles(item.instrumentId,fromIso,toIso);",
 "          const key=String(meta?.ticker||item.raw?.ticker||item.instrumentId);",
 "          const label=String(meta?.ticker||meta?.name||item.raw?.ticker||item.instrumentId);",
 "          return {key,label,instrumentId:item.instrumentId,points,source:'T-Bank GetCandles'};",
 "        }catch(error){",
 "          return {key:String(item.raw?.ticker||item.instrumentId),label:String(item.raw?.ticker||item.instrumentId),instrumentId:item.instrumentId,points:[],source:'T-Bank GetCandles',error:'history unavailable'};",
 "        }",
 "      }));",
 "      series.push(...rows);",
 "    }",
 "    const payload={version:'1.0',available:series.filter(x=>x.points.length>=2).length>0,from:fromIso.slice(0,10),to:toIso.slice(0,10),requested:ranked.length,availableSeries:series.filter(x=>x.points.length>=2).length,series,source:'T-Bank GetCandles',cacheSeconds:900};",
 "    qvanixAssetHistoryCache.payload=payload;",
 "    qvanixAssetHistoryCache.expiresAt=now+900000;",
 "    res.setHeader('Cache-Control','private, max-age=300');",
 "    return res.json(payload);",
 "  }catch(error){",
 "    console.warn('QVANIX asset history failed:',error?.message||error);",
 "    return res.status(502).json({version:'1.0',available:false,series:[],error:'asset history unavailable'});",
 "  }",
 "});",
 ""
].join('\n');
core=core.replace(assetHistoryMarker,'\n'+assetHistoryCode+assetHistoryMarker);
`;

const bridge=`const assetHistoryBridge=${JSON.stringify(assetHistoryInjectedCode)};\n`;
src=src.replace(marker,bridge+marker);
const oldCompose='src=src.replace(coreCompile,benchmarkBridge+bondMetaBridge+v2Bridge+coreCompile);';
const newCompose='src=src.replace(coreCompile,benchmarkBridge+bondMetaBridge+assetHistoryBridge+v2Bridge+coreCompile);';
if(!src.includes(oldCompose))throw new Error('v15.9: v15.8 bridge composition changed');
src=src.replace(oldCompose,newCompose);

const mod=new Module(basePath,module);
mod.filename=basePath;
mod.paths=Module._nodeModulePaths(__dirname);
mod._compile(src,basePath);
