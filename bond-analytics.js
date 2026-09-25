'use strict';

const {
  moneyValue,
  bondDirtyPriceRub,
  marketYieldPct,
  cashflowYield,
  modifiedDuration,
  maturityBucket,
}=require('./bond-analytics-core');

module.exports=function registerBondAnalytics(app,deps={}){
  const{tbankRequest,buildDashboard}=deps;
  const INSTRUMENTS='tinkoff.public.invest.api.contract.v1.InstrumentsService/';
  const MARKET='tinkoff.public.invest.api.contract.v1.MarketDataService/';
  const CACHE_MS=5*60*1000;
  const LAST_GOOD_TTL_MS=7*24*60*60*1000;
  let cache=null,lastGood=null;

  const round=(value,digits=2)=>Number.isFinite(Number(value))?Number(Number(value).toFixed(digits)):null;
  const safeDate=value=>{if(!value)return null;const d=value instanceof Date?value:new Date(value);return Number.isFinite(d.getTime())?d:null};
  const yearsBetween=(a,b)=>(b-a)/31557600000;
  const classify=asset=>{
    const type=String(asset?.instrumentType||asset?.type||'').toLowerCase();
    const symbol=String(asset?.ticker||asset?.name||'').toUpperCase();
    return type.includes('bond')||symbol.startsWith('SU')||symbol.startsWith('RU000A')||symbol.includes('ОФЗ')||symbol.includes('ОБЛИГАЦ');
  };
  const idFor=asset=>asset?.figi
    ?{idType:'INSTRUMENT_ID_TYPE_FIGI',id:asset.figi,instrumentId:asset.figi}
    :asset?.instrumentUid
      ?{idType:'INSTRUMENT_ID_TYPE_UID',id:asset.instrumentUid,instrumentId:asset.instrumentUid}
      :asset?.instrumentId
        ?{idType:'INSTRUMENT_ID_TYPE_ID',id:asset.instrumentId,instrumentId:asset.instrumentId}
        :null;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  async function call(method,body,tries=3){
    let error;
    for(let attempt=0;attempt<tries;attempt++){
      try{return await tbankRequest(method,body)}
      catch(err){error=err;if(attempt<tries-1)await sleep(250*(attempt+1))}
    }
    throw error;
  }

  async function readMarketYield(instrumentId){
    try{
      const response=await call(MARKET+'GetMarketValues',{
        instrumentId:[instrumentId],
        values:['INSTRUMENT_VALUE_YIELD'],
      },2);
      return marketYieldPct(response,instrumentId);
    }catch(_){
      return null;
    }
  }

  async function detail(asset,now){
    const id=idFor(asset);
    if(!id)throw Error('No instrument identifier');

    const response=await call(INSTRUMENTS+'BondBy',{idType:id.idType,id:id.id});
    const bond=response?.instrument||response?.bond||response||{};
    const maturity=safeDate(bond.maturityDate||bond.maturity_date);
    const quantity=Math.max(0,Number(asset.quantity)||0);
    const nominal=moneyValue(bond.nominal||bond.initialNominal)||1000;
    const aci=moneyValue(bond.aciValue||bond.aci_value);
    const cleanPricePct=Number(asset.currentPrice);
    const dirtyPrice=bondDirtyPriceRub(cleanPricePct,nominal,aci);
    const currentValue=dirtyPrice!=null?quantity*dirtyPrice:Math.max(0,Number(asset.currentValue??asset.value)||0);

    let coupons=[];
    const horizon=maturity&&maturity>now
      ?maturity
      :new Date(Date.UTC(now.getUTCFullYear()+30,now.getUTCMonth(),now.getUTCDate()));
    try{
      const couponResponse=await call(INSTRUMENTS+'GetBondCoupons',{
        instrumentId:id.instrumentId,
        from:now.toISOString(),
        to:horizon.toISOString(),
      },2);
      coupons=(couponResponse?.events||[])
        .map(item=>({
          date:safeDate(item.couponDate||item.coupon_date),
          amount:moneyValue(item.payOneBond||item.pay_one_bond),
        }))
        .filter(item=>item.date&&item.date>now&&item.amount>=0);
    }catch(_){}

    const flows=coupons.map(item=>({
      t:Math.max(.0001,yearsBetween(now,item.date)),
      amount:item.amount,
    }));
    if(maturity&&maturity>now)flows.push({
      t:Math.max(.0001,yearsBetween(now,maturity)),
      amount:nominal,
    });

    const floating=Boolean(bond.floatingCouponFlag??bond.floating_coupon_flag);
    const amortizing=Boolean(bond.amortizationFlag??bond.amortization_flag);
    const perpetual=Boolean(bond.perpetualFlag??bond.perpetual_flag);
    const simpleFixed=!floating&&!amortizing&&!perpetual&&maturity&&maturity>now&&flows.length>0;

    const directYieldPct=await readMarketYield(id.instrumentId);
    let ytmPct=Number.isFinite(directYieldPct)?directYieldPct:null;
    let ytmSource=ytmPct==null?null:'T_BANK_MARKET_VALUE';

    if(ytmPct==null&&simpleFixed&&dirtyPrice!=null){
      const solved=cashflowYield(dirtyPrice,flows);
      if(Number.isFinite(solved)){
        ytmPct=solved*100;
        ytmSource='CASHFLOW_FALLBACK';
      }
    }

    const yieldDecimal=ytmPct==null?null:ytmPct/100;
    const duration=simpleFixed&&yieldDecimal!=null?modifiedDuration(yieldDecimal,flows):null;
    const yearsToMaturity=maturity?Math.max(0,yearsBetween(now,maturity)):null;

    return{
      ticker:asset.ticker||bond.ticker||asset.name||id.id,
      name:asset.name||bond.name||asset.ticker||id.id,
      quantity:round(quantity,4),
      currentValue:round(currentValue,2),
      cleanPricePct:Number.isFinite(cleanPricePct)?round(cleanPricePct,4):null,
      dirtyPriceRub:round(dirtyPrice,2),
      nominalRub:round(nominal,2),
      aciPerBondRub:round(aci,2),
      maturityDate:maturity?.toISOString()||null,
      yearsToMaturity:yearsToMaturity==null?null:round(yearsToMaturity,2),
      ytmPct:ytmPct==null?null:round(ytmPct,2),
      ytmSource,
      modifiedDuration:duration==null?null:round(duration,2),
      couponCount:coupons.length,
      floating,
      amortizing,
      perpetual,
      modelConfidence:ytmSource==='T_BANK_MARKET_VALUE'&&Number.isFinite(duration)?'HIGH':ytmPct!=null?'MEDIUM':'LOW',
    };
  }

  function rateScenario(total,duration,deltaPp){
    if(!(total>0)||!Number.isFinite(duration))return{deltaPp,pricePct:null,rub:null};
    const pricePct=-duration*deltaPp;
    return{deltaPp,pricePct:round(pricePct,2),rub:round(total*pricePct/100,2)};
  }

  function buildMaturityBuckets(items){
    const labels={'0-3':'≤ 3 лет','3-7':'3–7 лет','7-15':'7–15 лет','15+':'15+ лет',unknown:'Нет даты'};
    const map=new Map();
    for(const item of items){
      const key=maturityBucket(item.yearsToMaturity);
      map.set(key,(map.get(key)||0)+(Number(item.currentValue)||0));
    }
    return['0-3','3-7','7-15','15+','unknown'].map(key=>({
      key,label:labels[key],value:round(map.get(key)||0,2),
    })).filter(row=>row.value>0);
  }

  async function build(){
    if(!tbankRequest||!buildDashboard)throw Error('Bond analytics dependencies unavailable');
    const now=new Date();
    const dashboard=await buildDashboard();
    const assets=(Array.isArray(dashboard?.assets)?dashboard.assets:dashboard?.portfolio?.assets||[]).filter(asset=>classify(asset)&&Number(asset.quantity)>0);

    const items=[];
    const errors=[];
    for(const asset of assets){
      try{items.push(await detail(asset,now))}
      catch(error){errors.push({ticker:asset.ticker||asset.name||'—',error:error.message||String(error)})}
    }

    const total=items.reduce((sum,item)=>sum+(Number(item.currentValue)||0),0);
    const yieldModeled=items.filter(item=>Number.isFinite(item.ytmPct));
    const durationModeled=items.filter(item=>Number.isFinite(item.modifiedDuration));
    const yieldValue=yieldModeled.reduce((sum,item)=>sum+(Number(item.currentValue)||0),0);
    const durationValue=durationModeled.reduce((sum,item)=>sum+(Number(item.currentValue)||0),0);
    const weightedYtm=yieldValue
      ?yieldModeled.reduce((sum,item)=>sum+(Number(item.currentValue)||0)*item.ytmPct,0)/yieldValue
      :null;
    const weightedDuration=durationValue
      ?durationModeled.reduce((sum,item)=>sum+(Number(item.currentValue)||0)*item.modifiedDuration,0)/durationValue
      :null;

    const maturities=items.filter(item=>Number.isFinite(item.yearsToMaturity));
    const maturityValue=maturities.reduce((sum,item)=>sum+(Number(item.currentValue)||0),0);
    const weightedMaturity=maturityValue
      ?maturities.reduce((sum,item)=>sum+(Number(item.currentValue)||0)*item.yearsToMaturity,0)/maturityValue
      :null;
    const largest=[...items].sort((a,b)=>(Number(b.currentValue)||0)-(Number(a.currentValue)||0))[0];

    for(const item of items)item.weightPct=total?round(item.currentValue/total*100,1):0;

    return{
      version:'8.0.0',
      source:'T_BANK_BOND_BY+GET_BOND_COUPONS+GET_MARKET_VALUES',
      generatedAt:now.toISOString(),
      summary:{
        bondCapital:round(total,2),
        issues:items.length,
        largestTicker:largest?.ticker||null,
        largestWeightPct:largest?.weightPct??null,
        weightedYtmPct:round(weightedYtm,2),
        weightedModifiedDuration:round(weightedDuration,2),
        weightedMaturityYears:round(weightedMaturity,2),
        yieldCoveragePct:total?round(yieldValue/total*100,1):0,
        durationCoveragePct:total?round(durationValue/total*100,1):0,
        maturityCoveragePct:total?round(maturityValue/total*100,1):0,
      },
      maturityBuckets:buildMaturityBuckets(items),
      rateScenarios:[-2,-1,1,2].map(delta=>rateScenario(durationValue,weightedDuration,delta)),
      items,
      coverage:{requested:assets.length,resolved:items.length,yieldModeled:yieldModeled.length,durationModeled:durationModeled.length,errors},
      note:'YTM prefers T-Bank INSTRUMENT_VALUE_YIELD. Duration is modeled only for fixed, non-amortizing, non-perpetual bonds with confirmed future coupon cashflows.',
    };
  }

  const usable=data=>Number(data?.summary?.bondCapital)>0&&Number(data?.summary?.issues)>0;
  function remember(data){if(usable(data))lastGood={...data,_savedAt:Date.now()}}
  function stale(reason){
    if(!lastGood)return null;
    const saved=Number(lastGood._savedAt)||Date.parse(lastGood.generatedAt)||0;
    if(saved&&Date.now()-saved>LAST_GOOD_TTL_MS)return null;
    const{_savedAt,...data}=lastGood;
    return{...data,version:'8.0.0',stale:true,available:true,warning:reason||'Temporary incomplete T-Bank response',staleAgeMinutes:saved?round((Date.now()-saved)/60000,0):null};
  }
  async function obtain(){
    if(cache&&Date.now()-cache.createdAt<CACHE_MS)return cache.data;
    try{
      const data=await build();
      if(usable(data)){
        cache={createdAt:Date.now(),data};
        remember(data);
        return data;
      }
      return stale('Temporary incomplete T-Bank response')||data;
    }catch(error){
      const old=stale(error.message||'Temporary bond analytics error');
      if(old)return old;
      throw error;
    }
  }

  async function getBondDuration(){
    try{
      const data=await obtain();
      const value=Number(data?.summary?.weightedModifiedDuration);
      return Number.isFinite(value)&&value>0?value:Number(lastGood?.summary?.weightedModifiedDuration)||null;
    }catch(_){
      return Number(lastGood?.summary?.weightedModifiedDuration)||null;
    }
  }
  if(deps&&typeof deps==='object')deps.getBondDuration=getBondDuration;

  app.get('/api/shield/bonds',async(req,res)=>{
    res.setHeader('Cache-Control','no-store');
    try{
      const data=await obtain();
      if(usable(data))return res.json({...data,available:true});
      return res.status(503).json({...data,version:'8.0.0',available:false,error:'Bond data temporarily incomplete'});
    }catch(error){
      const old=stale(error.message||'Temporary bond analytics error');
      if(old)return res.json(old);
      return res.status(503).json({version:'8.0.0',available:false,error:error.message||'Bond analytics unavailable'});
    }
  });
};
