const fs=require('fs');
const path=require('path');
const Module=require('module');
const basePath=path.join(__dirname,'production-v158.js');
let src=fs.readFileSync(basePath,'utf8');

const marker="const coreCompile='const mod=new Module(corePath,module);';";
if(!src.includes(marker))throw new Error('v16.0: v15.8 core compile marker changed');

// Keep injected source as data and JSON-encode it into production-v158. This
// preserves the validated single-runtime wrapper while adding isolated v2 API
// boundaries before the legacy wildcard route.
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

const transactionMarkersInjectedCode=String.raw`
const transactionMarkerRouteMarker="\napp.get('*', (req, res) => {";
if(!core.includes(transactionMarkerRouteMarker))throw new Error('QVANIX v2: transaction marker route marker changed');
const transactionMarkerCode=[
 "const qvanixTransactionMarkerCache={expiresAt:0,payload:null};",
 "const qvanixMarkerBuyTypes=new Set(['OPERATION_TYPE_BUY','OPERATION_TYPE_DELIVERY_BUY','OPERATION_TYPE_PRIMARY_ORDER']);",
 "const qvanixMarkerSellTypes=new Set(['OPERATION_TYPE_SELL','OPERATION_TYPE_DELIVERY_SELL']);",
 "function qvanixMarkerText(value){const text=typeof value==='string'?value.trim():'';return text||null;}",
 "function qvanixMarkerDate(value){const text=qvanixMarkerText(value);if(!text)return null;const ms=Date.parse(text);return Number.isFinite(ms)?new Date(ms).toISOString():null;}",
 "function qvanixMarkerQuantity(op){const raw=op?.quantity??op?.quantityExecuted;const value=Number(raw);return Number.isFinite(value)&&value>0?value:null;}",
 "app.get('/api/transaction-markers',async(req,res)=>{",
 "  try{",
 "    const now=Date.now();",
 "    if(qvanixTransactionMarkerCache.payload&&qvanixTransactionMarkerCache.expiresAt>now)return res.json(qvanixTransactionMarkerCache.payload);",
 "    const accountsResponse=await getAccounts();",
 "    const account=selectAccount(accountsResponse);",
 "    if(!account?.id)return res.status(404).json({version:'1.0',available:false,markers:[],error:'No open account'});",
 "    const operations=await getOperations(account.id);",
 "    const markers=[];const seen=new Set();let rejected=0;let duplicates=0;",
 "    for(const op of Array.isArray(operations)?operations:[]){",
 "      const id=qvanixMarkerText(op?.id);",
 "      const date=qvanixMarkerDate(op?.date);",
 "      const type=String(op?.type||'').trim().toUpperCase();",
 "      const side=qvanixMarkerBuyTypes.has(type)?'BUY':qvanixMarkerSellTypes.has(type)?'SELL':null;",
 "      const figi=qvanixMarkerText(op?.figi);",
 "      const instrumentUid=qvanixMarkerText(op?.instrumentUid);",
 "      if(!id||!date||!side||(!figi&&!instrumentUid)){rejected+=1;continue;}",
 "      if(seen.has(id)){duplicates+=1;continue;}seen.add(id);",
 "      markers.push({id,date,side,figi,instrumentUid,quantity:qvanixMarkerQuantity(op)});",
 "    }",
 "    markers.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));",
 "    const coverageTo=new Date().toISOString();const coverageFrom=new Date(Date.now()-3650*24*60*60*1000).toISOString();",
 "    const payload={version:'1.0',available:markers.length>0,markers,accepted:markers.length,rejected,duplicates,source:'T-Bank GetOperationsByCursor',semantics:'executed_operation_time_only',priceIncluded:false,coverage:{from:coverageFrom,to:coverageTo,maxPages:10,pageLimit:1000},cacheSeconds:300};",
 "    qvanixTransactionMarkerCache.payload=payload;qvanixTransactionMarkerCache.expiresAt=now+300000;",
 "    res.setHeader('Cache-Control','private, max-age=60');",
 "    return res.json(payload);",
 "  }catch(error){",
 "    console.warn('QVANIX transaction markers failed:',error?.message||error);",
 "    return res.status(502).json({version:'1.0',available:false,markers:[],error:'transaction markers unavailable'});",
 "  }",
 "});",
 ""
].join('\n');
core=core.replace(transactionMarkerRouteMarker,'\n'+transactionMarkerCode+transactionMarkerRouteMarker);
`;

const bridges=`const assetHistoryBridge=${JSON.stringify(assetHistoryInjectedCode)};\nconst transactionMarkersBridge=${JSON.stringify(transactionMarkersInjectedCode)};\n`;
src=src.replace(marker,bridges+marker);
const oldCompose='src=src.replace(coreCompile,benchmarkBridge+bondMetaBridge+v2Bridge+coreCompile);';
const newCompose='src=src.replace(coreCompile,benchmarkBridge+bondMetaBridge+assetHistoryBridge+transactionMarkersBridge+v2Bridge+coreCompile);';
if(!src.includes(oldCompose))throw new Error('v16.0: v15.8 bridge composition changed');
src=src.replace(oldCompose,newCompose);

const mod=new Module(basePath,module);
mod.filename=basePath;
mod.paths=Module._nodeModulePaths(__dirname);
mod._compile(src,basePath);
