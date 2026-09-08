'use strict';

module.exports = function registerBondAnalytics(app, deps = {}) {
  const { tbankRequest, buildDashboard } = deps;
  const INSTRUMENTS = 'tinkoff.public.invest.api.contract.v1.InstrumentsService/';
  const CACHE_MS = 5 * 60 * 1000;
  let cache = null;
  let lastGood = null;

  const round = (v, d = 2) => Number.isFinite(Number(v)) ? Number(Number(v).toFixed(d)) : null;
  const moneyValue = v => {
    if (v == null) return 0;
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (typeof v === 'string') return Number(v) || 0;
    const units = Number(v.units ?? v.unit ?? 0) || 0;
    const nano = Number(v.nano ?? v.nanos ?? 0) || 0;
    return units + nano / 1e9;
  };
  const safeDate = v => { if (!v) return null; const d = v instanceof Date ? v : new Date(v); return Number.isFinite(d.getTime()) ? d : null; };
  const yearsBetween = (a,b)=>(b.getTime()-a.getTime())/31557600000;

  function classify(a){const t=String(a?.instrumentType||a?.type||'').toLowerCase();const s=String(a?.ticker||a?.name||'').toUpperCase();return t.includes('bond')||s.startsWith('SU')||s.startsWith('RU000A')||s.includes('ОФЗ')||s.includes('ОБЛИГАЦ');}
  function idFor(a){if(a?.figi)return{idType:'INSTRUMENT_ID_TYPE_FIGI',id:a.figi,instrumentId:a.figi};if(a?.instrumentUid)return{idType:'INSTRUMENT_ID_TYPE_UID',id:a.instrumentUid,instrumentId:a.instrumentUid};if(a?.instrumentId)return{idType:'INSTRUMENT_ID_TYPE_ID',id:a.instrumentId,instrumentId:a.instrumentId};return null;}
  function eventDate(row){return safeDate(row?.eventDate||row?.event_date||row?.date||row?.maturityDate||row?.maturity_date||row?.realPayDate||row?.real_pay_date);}
  function cashflowYield(price,flows){if(!(price>0)||!flows.length)return null;const npv=y=>flows.reduce((s,x)=>s+x.amount/Math.pow(1+y,x.t),0)-price;let lo=-.95,hi=3,flo=npv(lo),fhi=npv(hi);if(!Number.isFinite(flo)||!Number.isFinite(fhi)||flo*fhi>0)return null;for(let i=0;i<90;i++){const mid=(lo+hi)/2,fm=npv(mid);if(!Number.isFinite(fm))return null;if(Math.abs(fm)<1e-8)return mid;if(flo*fm<=0){hi=mid;fhi=fm}else{lo=mid;flo=fm}}return(lo+hi)/2;}
  function durations(price,y,flows){if(!(price>0)||!Number.isFinite(y)||y<=-.999||!flows.length)return{macaulay:null,modified:null};let weighted=0,pv=0;for(const x of flows){const value=x.amount/Math.pow(1+y,x.t);pv+=value;weighted+=x.t*value}if(!(pv>0))return{macaulay:null,modified:null};const macaulay=weighted/pv;return{macaulay,modified:macaulay/(1+y)}}

  async function bondDetails(asset,now){
    const ident=idFor(asset);if(!ident)throw new Error('No instrument identifier');
    const metaResp=await tbankRequest(`${INSTRUMENTS}BondBy`,{idType:ident.idType,id:ident.id});const bond=metaResp?.instrument||metaResp?.bond||metaResp||{};let maturity=safeDate(bond?.maturityDate||bond?.maturity_date);
    if(!maturity){try{const to=new Date(now);to.setUTCFullYear(to.getUTCFullYear()+40);const ev=await tbankRequest(`${INSTRUMENTS}GetBondEvents`,{instrumentId:ident.instrumentId,from:now.toISOString(),to:to.toISOString(),type:'EVENT_TYPE_MTY'});const rows=Array.isArray(ev?.events)?ev.events:[];maturity=rows.map(eventDate).filter(Boolean).sort((a,b)=>a-b)[0]||null}catch(_){}}
    const horizon=maturity&&maturity>now?maturity:new Date(Date.UTC(now.getUTCFullYear()+30,now.getUTCMonth(),now.getUTCDate()));let coupons=[];
    try{const c=await tbankRequest(`${INSTRUMENTS}GetBondCoupons`,{instrumentId:ident.instrumentId,from:now.toISOString(),to:horizon.toISOString()});coupons=(Array.isArray(c?.events)?c.events:[]).map(row=>({date:safeDate(row?.couponDate||row?.coupon_date),amount:moneyValue(row?.payOneBond||row?.pay_one_bond)})).filter(x=>x.date&&x.date>now&&x.amount>=0).sort((a,b)=>a.date-b.date)}catch(_){}
    const qty=Math.max(0,Number(asset?.quantity)||0),value=Math.max(0,Number(asset?.currentValue??asset?.value??0)||0),pricePerBond=qty>0?value/qty:0,nominal=moneyValue(bond?.nominal||bond?.initialNominal||bond?.initial_nominal)||1000;
    const floating=Boolean(bond?.floatingCouponFlag??bond?.floating_coupon_flag),amortizing=Boolean(bond?.amortizationFlag??bond?.amortization_flag),perpetual=Boolean(bond?.perpetualFlag??bond?.perpetual_flag);
    const flows=coupons.map(x=>({t:Math.max(.0001,yearsBetween(now,x.date)),amount:x.amount}));if(maturity&&maturity>now&&!perpetual){const t=Math.max(.0001,yearsBetween(now,maturity)),existing=flows.find(x=>Math.abs(x.t-t)<1/365);if(existing)existing.amount+=nominal;else flows.push({t,amount:nominal})}flows.sort((a,b)=>a.t-b.t);
    let ytm=null,mac=null,mod=null;const canModel=!floating&&!amortizing&&!perpetual&&maturity&&flows.length&&pricePerBond>0;if(canModel){ytm=cashflowYield(pricePerBond,flows);const dur=durations(pricePerBond,ytm,flows);mac=dur.macaulay;mod=dur.modified}
    const years=maturity?Math.max(0,yearsBetween(now,maturity)):null;
    return{ticker:asset?.ticker||bond?.ticker||asset?.name||ident.id,name:asset?.name||bond?.name||asset?.ticker||ident.id,figi:asset?.figi||bond?.figi||null,quantity:round(qty,4),currentValue:round(value,2),maturityDate:maturity?maturity.toISOString():null,yearsToMaturity:round(years,2),nominal:round(nominal,2),couponPerYear:Number(bond?.couponQuantityPerYear??bond?.coupon_quantity_per_year)||null,floatingCoupon:floating,amortizing,perpetual,ytmPct:ytm==null?null:round(ytm*100,2),macaulayDuration:mac==null?null:round(mac,2),modifiedDuration:mod==null?null:round(mod,2),modelConfidence:canModel&&Number.isFinite(ytm)&&Number.isFinite(mod)?'MEDIUM':'LOW',modelNote:canModel?'YTM и дюрация оценены по текущей стоимости позиции, номиналу и будущим купонам T-Bank.':(floating?'Плавающий купон: статическая YTM-модель не применяется.':amortizing?'Амортизационный выпуск: упрощённая YTM-модель отключена.':perpetual?'Бессрочный выпуск: сроковая модель не применяется.':'Недостаточно данных для YTM/дюрации.')};
  }
  function buildBuckets(items,total){const rows=[{key:'0-2',label:'0–2 года',min:0,max:2,value:0},{key:'2-5',label:'2–5 лет',min:2,max:5,value:0},{key:'5-10',label:'5–10 лет',min:5,max:10,value:0},{key:'10+',label:'10+ лет',min:10,max:Infinity,value:0}];for(const x of items){if(!Number.isFinite(x.yearsToMaturity))continue;const b=rows.find(r=>x.yearsToMaturity>=r.min&&x.yearsToMaturity<r.max);if(b)b.value+=Number(x.currentValue)||0}return rows.map(r=>({key:r.key,label:r.label,value:round(r.value,2),weightPct:total?round(r.value/total*100,1):0}))}
  function scenario(total,duration,deltaPp){if(!(total>0)||!Number.isFinite(duration))return{deltaPp,pricePct:null,rub:null};const pct=-duration*(deltaPp/100)*100;return{deltaPp,pricePct:round(pct,2),rub:round(total*pct/100,2)}}
  async function build(){
    if(!tbankRequest||!buildDashboard)throw new Error('Bond analytics dependencies unavailable');const now=new Date(),d=await buildDashboard();const assets=(Array.isArray(d?.assets)?d.assets:(Array.isArray(d?.portfolio?.assets)?d.portfolio.assets:[])).filter(a=>classify(a)&&Number(a?.quantity)>0),errors=[],items=[];
    for(let i=0;i<assets.length;i+=3){const batch=assets.slice(i,i+3),result=await Promise.all(batch.map(async a=>{try{return await bondDetails(a,now)}catch(e){errors.push({ticker:a?.ticker||a?.name||'—',error:e?.message||String(e)});return null}}));items.push(...result.filter(Boolean))}
    const total=items.reduce((s,x)=>s+(Number(x.currentValue)||0),0);for(const x of items)x.weightPct=total?round((Number(x.currentValue)||0)/total*100,1):0;items.sort((a,b)=>(a.maturityDate?new Date(a.maturityDate).getTime():Infinity)-(b.maturityDate?new Date(b.maturityDate).getTime():Infinity));
    const modeled=items.filter(x=>Number.isFinite(x.modifiedDuration)&&Number.isFinite(x.ytmPct)),modeledValue=modeled.reduce((s,x)=>s+(Number(x.currentValue)||0),0),weightedDuration=modeledValue?modeled.reduce((s,x)=>s+(Number(x.currentValue)||0)*Number(x.modifiedDuration),0)/modeledValue:null,weightedYtm=modeledValue?modeled.reduce((s,x)=>s+(Number(x.currentValue)||0)*Number(x.ytmPct),0)/modeledValue:null,withMaturity=items.filter(x=>Number.isFinite(x.yearsToMaturity)),maturityValue=withMaturity.reduce((s,x)=>s+(Number(x.currentValue)||0),0),weightedMaturity=maturityValue?withMaturity.reduce((s,x)=>s+(Number(x.currentValue)||0)*Number(x.yearsToMaturity),0)/maturityValue:null,largest=[...items].sort((a,b)=>(Number(b.currentValue)||0)-(Number(a.currentValue)||0))[0]||null;
    return{version:'7.10.1',source:'TBANK_REAL_BOND_DATA',generatedAt:now.toISOString(),summary:{bondCapital:round(total,2),issues:items.length,largestTicker:largest?.ticker||null,largestWeightPct:largest?.weightPct??null,weightedYtmPct:round(weightedYtm,2),weightedModifiedDuration:round(weightedDuration,2),weightedMaturityYears:round(weightedMaturity,2),modeledCoveragePct:total?round(modeledValue/total*100,1):0,maturityCoveragePct:total?round(maturityValue/total*100,1):0},maturityBuckets:buildBuckets(items,total),rateScenarios:[scenario(total,weightedDuration,-2),scenario(total,weightedDuration,-1),scenario(total,weightedDuration,1),scenario(total,weightedDuration,2)],items,coverage:{requested:assets.length,resolved:items.length,modeled:modeled.length,errors},note:'Сценарии ставки — приближение через модифицированную дюрацию. При временно неполном ответе T-Bank последняя валидная модель сохраняется.'};
  }
  function isGood(data){return Number(data?.summary?.bondCapital)>0&&Number(data?.summary?.issues)>0&&Number.isFinite(Number(data?.summary?.weightedModifiedDuration))&&Number(data?.summary?.modeledCoveragePct)>0;}
  app.get('/api/shield/bonds',async(req,res)=>{res.setHeader('Cache-Control','no-store');try{if(cache&&Date.now()-cache.createdAt<CACHE_MS)return res.json(cache.data);const data=await build();if(!isGood(data)){if(lastGood)return res.json({...lastGood,stale:true,warning:'Temporary incomplete T-Bank bond response; serving last valid analytics.'});throw new Error('Incomplete bond analytics response')};cache={createdAt:Date.now(),data};lastGood=data;res.json(data)}catch(err){if(lastGood)return res.json({...lastGood,stale:true,warning:err?.message||'Temporary bond analytics error'});res.status(500).json({version:'7.10.1',available:false,error:err?.message||'Bond analytics unavailable'})}});
};
