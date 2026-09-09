'use strict';

// v7.16.8 — deterministic analytics snapshot.
// Analytics must not change merely because a live dashboard refresh rebuilt the
// same historical window. We freeze a completed-history signature and only
// publish a new calculation when that signature changes.
module.exports=function registerAnalyticsStable(app,{buildDashboard}={}){
 const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN;
 const sd=a=>{if(a.length<2)return NaN;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))};
 const median=a=>{const b=a.filter(Number.isFinite).sort((x,y)=>x-y);if(!b.length)return NaN;const i=Math.floor(b.length/2);return b.length%2?b[i]:(b[i-1]+b[i])/2};
 const rnd=(n,d=4)=>Number.isFinite(n)?+n.toFixed(d):null;
 const ts=x=>{const v=x?.date??x?.time??x?.timestamp??x?.datetime??x?.ts;const t=typeof v==='number'?(v<1e12?v*1000:v):Date.parse(v);return Number.isFinite(t)?t:null};
 let last=null,lastSig='';
 function normalized(d){
  const src=Array.isArray(d?.history?.points)?d.history.points:[];
  const a=src.map((x,i)=>({i,t:ts(x),p:+x?.portfolio,m:+x?.imoex})).filter(x=>x.p>0&&x.m>0);
  // The newest point is live/intraday and is the main source of metric jitter.
  // Use completed points only; if timestamps are absent we still drop the final
  // mutable point. This makes all analytics cards share one fixed window.
  return a.length>2?a.slice(0,-1):a;
 }
 function calc(d){
  const pts=normalized(d),p=[],m=[],gaps=[];let badValue=0,outlier=0;
  for(let i=1;i<pts.length;i++){
   const a=pts[i-1],b=pts[i];if(a.t&&b.t&&b.t>a.t)gaps.push((b.t-a.t)/86400000);
   const x=b.p/a.p-1,y=b.m/a.m-1;
   if(!Number.isFinite(x)||!Number.isFinite(y)){badValue++;continue}
   if(Math.abs(x)>.12||Math.abs(y)>.12){outlier++;continue}
   p.push(x);m.push(y);
  }
  const n=p.length,raw=Math.max(0,pts.length-1),dropped=badValue+outlier,med=median(gaps),hasTiming=Number.isFinite(med)&&med>0;
  const ann=hasTiming?Math.max(12,Math.min(252,Math.round(365.25/med))):(n<60?52:n<180?126:252);
  const mu=mean(p),vol=sd(p)*Math.sqrt(ann),neg=p.map(x=>Math.min(0,x)),down=Math.sqrt(mean(neg.map(x=>x*x)))*Math.sqrt(ann),rf=(+d?.cbr?.rate||0)/100;
  const sh=vol?((mu*ann)-rf)/vol:NaN,so=down?((mu*ann)-rf)/down:NaN,mp=mean(p),mm=mean(m),sp=sd(p),sm=sd(m);
  const cov=n>4?p.reduce((s,x,i)=>s+(x-mp)*(m[i]-mm),0)/(n-1):NaN,v=n>4?m.reduce((s,x)=>s+(x-mm)**2,0)/(n-1):NaN,beta=v?cov/v:NaN,corr=sp&&sm?cov/(sp*sm):NaN;
  const active=p.map((x,i)=>x-m[i]),te=sd(active)*Math.sqrt(ann),ir=te?(mean(active)*ann)/te:NaN;
  let synth=100,peak=100,dd=0;for(const x of p){synth*=1+x;peak=Math.max(peak,synth);dd=Math.min(dd,synth/peak-1)}
  const quality=n<20?'CAUTION':dropped>Math.max(2,raw*.15)?'CAUTION':'OK';
  return{version:'7.16.8',source:'COMPLETED_HISTORY_LOCK',sample:n,rawSample:raw,dropped,droppedReasons:{badValue,outlier},medianIntervalDays:hasTiming?rnd(med,2):null,annualization:ann,annualizationSource:hasTiming?'TIMESTAMPS':'FALLBACK_SAMPLE_SIZE',sharpe:rnd(sh),sortino:rnd(so),volatility:rnd(vol),downsideRisk:rnd(down),beta:rnd(beta),correlation:rnd(corr),maxDrawdown:rnd(dd),trackingError:rnd(te),informationRatio:rnd(ir),dataQuality:quality,note:`Стабильный ряд ${n}/${raw}; исключено ${dropped}; последняя live-точка не участвует.`};
 }
 app.get('/api/shield/analytics-stable',async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  try{
   const d=await buildDashboard(),pts=normalized(d);
   const sig=pts.map(x=>`${x.t||x.i}:${x.p.toFixed(6)}:${x.m.toFixed(6)}`).join('|');
   if(!last||sig!==lastSig){last=calc(d);lastSig=sig}
   res.json(last);
  }catch(e){if(last)return res.json({...last,stale:true});res.status(500).json({available:false,error:e?.message||'Analytics unavailable'})}
 });
};
