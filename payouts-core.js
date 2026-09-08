'use strict';

module.exports = function registerPayoutCalendar(app, deps) {
  const { tbankRequest, buildDashboard, getAccounts, selectAccount, getOperations, isIncomeOperation, operationCash } = deps || {};
  const INSTRUMENTS = 'tinkoff.public.invest.api.contract.v1.InstrumentsService/';
  const CACHE_MS = 60 * 1000;
  let cache = null;

  function moneyValue(v) {
    if (v == null) return 0;
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (typeof v === 'string') { const n=Number(v); return Number.isFinite(n)?n:0; }
    const units=Number(v.units ?? v.unit ?? 0), nano=Number(v.nano ?? v.nanos ?? 0);
    return (Number.isFinite(units)?units:0)+(Number.isFinite(nano)?nano:0)/1e9;
  }
  function quantityValue(v){
    if(v==null)return 0;if(typeof v==='number'||typeof v==='string')return Number(v)||0;
    return moneyValue(v);
  }
  function safeDate(v){if(!v)return null;const d=v instanceof Date?v:new Date(v);return Number.isFinite(d.getTime())?d:null}
  function iso(v){const d=safeDate(v);return d?d.toISOString():null}
  function monthKey(v){const d=safeDate(v);return d?`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`:null}
  function round2(n){return Math.round((Number(n)||0)*100)/100}
  function taxEstimate(g){g=Math.max(0,Number(g)||0);const tax=Math.min(g,2400000)*.13+Math.max(0,g-2400000)*.15;return{gross:g,tax,net:g-tax,rate:g?tax/g*100:13}}
  function eventNet(g){const t=taxEstimate(g);return{gross:round2(t.gross),tax:round2(t.tax),net:round2(t.net),taxRate:round2(t.rate)}}
  function classifyAsset(a){const type=String(a?.instrumentType||a?.type||'').toUpperCase(),ticker=String(a?.ticker||'').toUpperCase(),name=String(a?.name||'').toLowerCase();if(type.includes('BOND')||/^SU\d/.test(ticker)||/^RU000A/.test(ticker)||/офз|облигац/.test(name))return'bond';if(type.includes('SHARE')||type.includes('STOCK'))return'share';return'other'}

  async function fetchAssetSchedule(asset, from, horizon) {
    const kind=classifyAsset(asset), instrumentId=asset?.instrumentUid||asset?.figi||asset?.instrumentId, qty=Math.max(0,quantityValue(asset?.quantity));
    if(!instrumentId||qty<=0||kind==='other')return[];
    // Ask T-Bank for a wider window and filter locally to exact 12M. This avoids partial coupon pages/windows.
    const queryTo=new Date(horizon);queryTo.setUTCMonth(queryTo.getUTCMonth()+12);
    if(kind==='bond'){
      const data=await tbankRequest(`${INSTRUMENTS}GetBondCoupons`,{instrumentId,from:from.toISOString(),to:queryTo.toISOString()});
      const rows=Array.isArray(data?.events)?data.events:[];
      return rows.map(row=>{const date=safeDate(row?.couponDate||row?.coupon_date),per=moneyValue(row?.payOneBond||row?.pay_one_bond),calc=eventNet(per*qty);return{kind:'COUPON',ticker:asset?.ticker||asset?.name||instrumentId,name:asset?.name||asset?.ticker||instrumentId,figi:asset?.figi||null,date:iso(date),recordDate:iso(row?.fixDate||row?.fix_date),quantity:qty,perSecurity:round2(per),currency:row?.payOneBond?.currency||row?.pay_one_bond?.currency||'rub',...calc,confidence:'HIGH',source:'TBANK_COUPON_SCHEDULE'}}).filter(x=>x.date&&x.gross>0);
    }
    const data=await tbankRequest(`${INSTRUMENTS}GetDividends`,{instrumentId,from:from.toISOString(),to:queryTo.toISOString()});
    const rows=Array.isArray(data?.dividends)?data.dividends:[];
    return rows.filter(row=>!/cancel/i.test(String(row?.dividendType||row?.dividend_type||''))).map(row=>{const recordDate=safeDate(row?.recordDate||row?.record_date),paymentDate=safeDate(row?.paymentDate||row?.payment_date),lastBuyDate=safeDate(row?.lastBuyDate||row?.last_buy_date),per=moneyValue(row?.dividendNet||row?.dividend_net),calc=eventNet(per*qty);return{kind:'DIVIDEND',ticker:asset?.ticker||asset?.name||instrumentId,name:asset?.name||asset?.ticker||instrumentId,figi:asset?.figi||null,date:iso(paymentDate||recordDate||lastBuyDate),recordDate:iso(recordDate),lastBuyDate:iso(lastBuyDate),quantity:qty,perSecurity:round2(per),currency:row?.dividendNet?.currency||row?.dividend_net?.currency||'rub',...calc,confidence:paymentDate?'HIGH':'MEDIUM',source:'TBANK_DIVIDEND_SCHEDULE'}}).filter(x=>x.date&&x.gross>0);
  }
  function currentYearActual(ops,now){const year=now.getUTCFullYear(),rows=(Array.isArray(ops)?ops:[]).filter(op=>{const d=safeDate(op?.date);return d&&d.getUTCFullYear()===year&&(!isIncomeOperation||isIncomeOperation(op))}).map(op=>{const d=safeDate(op?.date),cash=Math.abs(operationCash?Number(operationCash(op))||0:moneyValue(op?.payment)),type=String(op?.type||'').toUpperCase(),name=String(op?.name||'').toLowerCase(),kind=type.includes('DIVIDEND')||name.includes('дивид')?'DIVIDEND':type.includes('COUPON')||name.includes('купон')?'COUPON':'INCOME';return{kind,ticker:op?.ticker||op?.figi||op?.name||'—',name:op?.name||op?.ticker||op?.figi||'—',figi:op?.figi||null,date:iso(d),net:round2(cash),gross:null,tax:null,currency:'rub',source:'TBANK_OPERATION',status:'FACT'}}).filter(x=>x.net>0).sort((a,b)=>new Date(b.date)-new Date(a.date));return{year,items:rows,totalNet:round2(rows.reduce((s,x)=>s+x.net,0)),count:rows.length}}
  function buildMonths(now,events){return Array.from({length:12},(_,i)=>{const d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+i,1)),key=monthKey(d),items=events.filter(e=>monthKey(e.date)===key);return{key,year:d.getUTCFullYear(),month:d.getUTCMonth()+1,gross:round2(items.reduce((s,x)=>s+(+x.gross||0),0)),tax:round2(items.reduce((s,x)=>s+(+x.tax||0),0)),net:round2(items.reduce((s,x)=>s+(+x.net||0),0)),count:items.length,items}})}

  async function buildPayouts(){
    const now=new Date(),to=new Date(now);to.setUTCFullYear(to.getUTCFullYear()+1);
    const dashboard=await buildDashboard(),assets=Array.isArray(dashboard?.assets)?dashboard.assets:Array.isArray(dashboard?.portfolio?.assets)?dashboard.portfolio.assets:[],eligible=assets.filter(a=>quantityValue(a?.quantity)>0&&['bond','share'].includes(classifyAsset(a))),future=[],errors=[];
    for(let i=0;i<eligible.length;i+=3){const batch=eligible.slice(i,i+3),rows=await Promise.all(batch.map(async a=>{try{return await fetchAssetSchedule(a,now,to)}catch(err){errors.push({ticker:a?.ticker||a?.figi||'—',error:err?.message||String(err)});return[]}}));future.push(...rows.flat())}
    const seen=new Set(),events=future.filter(e=>String(e.currency||'rub').toLowerCase()==='rub').filter(e=>{const d=safeDate(e.date);return d&&d>=now&&d<=to}).filter(e=>{const k=[e.kind,e.figi||e.ticker,e.date,e.perSecurity,e.quantity].join('|');if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>new Date(a.date)-new Date(b.date));
    let actual={year:now.getUTCFullYear(),items:[],totalNet:0,count:0};try{if(getAccounts&&selectAccount&&getOperations){const account=selectAccount(await getAccounts());if(account?.id)actual=currentYearActual(await getOperations(account.id),now)}}catch(err){errors.push({ticker:'FACT',error:err?.message||String(err)})}
    const gross=round2(events.reduce((s,x)=>s+x.gross,0)),tax=round2(events.reduce((s,x)=>s+x.tax,0)),net=round2(events.reduce((s,x)=>s+x.net,0)),months=buildMonths(now,events),next=events[0]||null;
    return{version:'7.9',generatedAt:now.toISOString(),period:{from:now.toISOString(),to:to.toISOString()},basis:'CURRENT_HOLDINGS_FULL_12M',displayBasis:'GROSS_SCHEDULED_PAYOUTS',actual,forecast:{gross,tax,net,count:events.length},next:next?{...next,days:Math.max(0,Math.ceil((new Date(next.date)-now)/86400000))}:null,months,events,coverage:{eligibleAssets:eligible.length,scheduledEvents:events.length,resolvedAssets:eligible.length-errors.filter(x=>x.ticker!=='FACT').length,errors},note:'Будущие выплаты показываются начисленными (gross), как календарь выплат. НДФЛ показывается отдельно как оценка; net не используется как сумма будущих выплат.'};
  }
  app.get('/api/payouts',async(req,res)=>{try{if(cache&&Date.now()-cache.createdAt<CACHE_MS){res.setHeader('Cache-Control','no-store');return res.json(cache.data)}const data=await buildPayouts();cache={createdAt:Date.now(),data};res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');res.json(data)}catch(err){res.status(500).json({version:'7.9',available:false,error:err?.message||'Payout calendar unavailable'})}});
};
