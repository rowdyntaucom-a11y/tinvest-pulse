'use strict';

function numberValue(value){
  const n=Number(value);
  return Number.isFinite(n)?n:null;
}

function moneyValue(value){
  if(value==null)return 0;
  if(typeof value==='number')return Number.isFinite(value)?value:0;
  if(typeof value==='string')return Number(value)||0;
  const units=Number(value.units??value.unit??0);
  const nano=Number(value.nano??value.nanos??0);
  return (Number.isFinite(units)?units:0)+(Number.isFinite(nano)?nano:0)/1e9;
}

function bondDirtyPriceRub(cleanPricePct,nominal,aci){
  const clean=numberValue(cleanPricePct),nom=numberValue(nominal),accrued=numberValue(aci)??0;
  if(!(clean>0)||!(nom>0))return null;
  const value=nom*clean/100+Math.max(0,accrued);
  return Number.isFinite(value)&&value>0?value:null;
}

function marketYieldPct(response,instrumentId){
  const rows=Array.isArray(response?.instruments)?response.instruments:[];
  const wanted=String(instrumentId||'').trim();
  const row=rows.find(item=>{
    const ids=[item?.instrumentUid,item?.instrument_uid,item?.figi,item?.ticker&&item?.classCode?item.ticker+'_'+item.classCode:null,item?.ticker&&item?.class_code?item.ticker+'_'+item.class_code:null]
      .filter(Boolean).map(String);
    return !wanted||ids.includes(wanted);
  })||rows[0]||null;
  const values=Array.isArray(row?.values)?row.values:[];
  const hit=values.find(item=>{
    const type=String(item?.type??'').toUpperCase();
    return type==='7'||type.includes('INSTRUMENT_VALUE_YIELD')||type==='YIELD';
  });
  if(!hit)return null;
  const value=moneyValue(hit.value);
  return Number.isFinite(value)&&value>-100&&value<1000?value:null;
}

function cashflowYield(price,flows){
  if(!(price>0)||!Array.isArray(flows)||!flows.length)return null;
  const npv=y=>flows.reduce((sum,item)=>sum+item.amount/Math.pow(1+y,item.t),0)-price;
  let lo=-.95,hi=3,flo=npv(lo),fhi=npv(hi);
  if(!Number.isFinite(flo)||!Number.isFinite(fhi)||flo*fhi>0)return null;
  for(let i=0;i<100;i++){
    const mid=(lo+hi)/2,fm=npv(mid);
    if(Math.abs(fm)<1e-9)return mid;
    if(flo*fm<=0){hi=mid;fhi=fm}else{lo=mid;flo=fm}
  }
  return(lo+hi)/2;
}

function modifiedDuration(yieldDecimal,flows){
  if(!Number.isFinite(yieldDecimal)||yieldDecimal<=-.999||!Array.isArray(flows)||!flows.length)return null;
  let weighted=0,pv=0;
  for(const item of flows){
    const value=item.amount/Math.pow(1+yieldDecimal,item.t);
    pv+=value;
    weighted+=item.t*value;
  }
  return pv>0?(weighted/pv)/(1+yieldDecimal):null;
}

function maturityBucket(years){
  if(!Number.isFinite(years))return'unknown';
  if(years<=3)return'0-3';
  if(years<=7)return'3-7';
  if(years<=15)return'7-15';
  return'15+';
}

module.exports={moneyValue,bondDirtyPriceRub,marketYieldPct,cashflowYield,modifiedDuration,maturityBucket};
