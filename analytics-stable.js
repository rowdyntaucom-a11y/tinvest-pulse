'use strict';

// v7.17 — stable completed-history analytics.
// Values are keyed by calendar date. A completed date is accepted once and is
// never rewritten by later dashboard rebuilds during the same server lifetime.
module.exports=function registerAnalyticsStable(app,{buildDashboard}={}){
 const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN;
 const sd=a=>{if(a.length<2)return NaN;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))};
 const median=a=>{const b=a.filter(Number.isFinite).sort((x,y)=>x-y);if(!b.length)return NaN;const i=Math.floor(b.length/2);return b.length%2?b[i]:(b[i-1]+b[i])/2};
 const rnd=(n,d=4)=>Number.isFinite(n)?+n.toFixed(d):null;
 const ts=x=>{const v=x?.date??x?.time??x?.timestamp??x?.datetime??x?.ts;const t=typeof v==='number'?(v<1e12?v*1000:v):Date.parse(v);return Number.isFinite(t)?t:null};
 const day=t=>new Date(t).toISOString().slice(0,10);
 const accepted=new Map(); let last=null,lastSig='';
 function normalized(d){
  const src=Array.isArray(d?.history?.points)?d.history.points:[], byDay=new Map(), noDate=[];
  for(let i=0;i<src.length;i++){const x=src[i],t=ts(x),p=+x?.portfolio,m=+x?.imoex;if(!(p>0&&m>0))continue;if(t)byDay.set(day(t),{i,t,p,m,key:day(t)});else noDate.push({i,t:null,p,m,key:'i'+i})}
  let a=byDay.size?[...byDay.values()].sort((x,y)=>x.t-y.t):noDate;
  // Drop today's/live point. If dates are absent, drop the final mutable point.
  if(a.length>2){const today=day(Date.now());a=a[a.length-1]?.key===today?a.slice(0,-1):a.slice(0,-1)}
  // First observation for a completed date wins. This prevents a live rebuild
  // from rewriting old history and changing Sharpe/Sortino every refresh.
  for(const x of a)if(!accepted.has(x.key))accepted.set(x.key,x);
  return [...accepted.values()].sort((x,y)=>(x.t??x.i)-(y.t??y.i));
 }
 function calc(d,pts){
  const p=[],m=[],gaps=[];let badValue=0,outlier=0;
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];if(a.t&&b.t&&b.t>a.t)gaps.push((b.t-a.t)/86400000);const x=b.p/a.p-1,y=b.m/a.m-1;if(!Number.isFinite(x)||!Number.isFinite(y)){badValue++;continue}if(Math.abs(x)>.12||Math.abs(y)>.12){outlier++;continue}p.push(x);m.push(y)}
  const n=p.length,raw=Math.max(0,pts.length-1),dropped=badValue+outlier,med=median(gaps),hasTiming=Number.isFinite(med)&&med>0;
  const ann=hasTiming?Math.max(12,Math.min(252,Math.round(365.25/med))):(n<60?52:n<180?126:252);
  const mu=mean(p),vol=sd(p)*Math.sqrt(ann),neg=p.map(x=>Math.min(0,x)),down=Math.sqrt(mean(neg.map(x=>x*x)))*Math.sqrt(ann),rf=(+d?.cbr?.rate||0)/100;
  const sh=vol?((mu*ann)-rf)/vol:NaN,so=down?((mu*ann)-rf)/down:NaN,mp=mean(p),mm=mean(m),sp=sd(p),sm=sd(m),cov=n>4?p.reduce((s,x,i)=>s+(x-mp)*(m[i]-mm),0)/(n-1):NaN,v=n>4?m.reduce((s,x)=>s+(x-mm)**2,0)/(n-1):NaN,beta=v?cov/v:NaN,corr=sp&&sm?cov/(sp*sm):NaN;
  const active=p.map((x,i)=>x-m[i]),te=sd(active)*Math.sqrt(ann),ir=te?(mean(active)*ann)/te:NaN;let synth=100,peak=100,dd=0;for(const x of p){synth*=1+x;peak=Math.max(peak,synth);dd=Math.min(dd,synth/peak-1)}
  const quality=n<20?'CAUTION':dropped>Math.max(2,raw*.15)?'CAUTION':'OK';
  return{version:'7.17.0',source:'DATE_IDENTITY_HISTORY_LOCK',sample:n,rawSample:raw,dropped,droppedReasons:{badValue,outlier},medianIntervalDays:hasTiming?rnd(med,2):null,annualization:ann,annualizationSource:hasTiming?'TIMESTAMPS':'FALLBACK_SAMPLE_SIZE',sharpe:rnd(sh),sortino:rnd(so),volatility:rnd(vol),downsideRisk:rnd(down),beta:rnd(beta),correlation:rnd(corr),maxDrawdown:rnd(dd),trackingError:rnd(te),informationRatio:rnd(ir),dataQuality:quality,note:`Фиксированный ряд ${n}/${raw}; исключено ${dropped}; завершённые даты защищены от перезаписи.`};
 }
 app.get('/api/shield/analytics-stable',async(req,res)=>{res.setHeader('Cache-Control','no-store');try{const d=await buildDashboard(),pts=normalized(d),sig=pts.map(x=>`${x.key}:${x.p.toFixed(6)}:${x.m.toFixed(6)}`).join('|');if(!last||sig!==lastSig){last=calc(d,pts);lastSig=sig}res.json(last)}catch(e){if(last)return res.json({...last,stale:true});res.status(500).json({available:false,error:e?.message||'Analytics unavailable'})}});
};