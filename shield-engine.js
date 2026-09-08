'use strict';

module.exports = function registerShieldEngine(app, deps = {}) {
  const { buildDashboard } = deps;
  const clamp = (n,a,b) => Math.max(a, Math.min(b,n));
  const mean = a => a.length ? a.reduce((s,x)=>s+x,0)/a.length : NaN;
  const sd = a => {
    if(a.length < 2) return NaN;
    const m = mean(a);
    return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1));
  };
  const round = (n,d=4) => Number.isFinite(n) ? Number(n.toFixed(d)) : null;

  function classify(a){
    const t=String(a?.instrumentType||a?.type||'').toLowerCase();
    const s=String(a?.ticker||a?.name||'').toUpperCase();
    if(t.includes('bond')||s.startsWith('SU')||s.startsWith('RU000A')||s.includes('ОФЗ')||s.includes('ОБЛИГАЦ'))return'bond';
    if(t.includes('etf')||t.includes('fund')||t.includes('currency')||s.includes('TMON')||s.includes('LQDT'))return'reserve';
    return'stock';
  }

  function strategySnapshot(d){
    const assets=Array.isArray(d?.assets)?d.assets:(Array.isArray(d?.portfolio?.assets)?d.portfolio.assets:[]);
    let stocks=0,bonds=0,reserve=0;
    for(const a of assets){
      const v=Math.max(0,Number(a?.currentValue??a?.value??a?.marketValue??0)||0);
      const c=classify(a);
      if(c==='bond')bonds+=v;else if(c==='reserve')reserve+=v;else stocks+=v;
    }
    const total=stocks+bonds+reserve || Math.max(0,Number(d?.portfolio?.value)||0);
    return {stocks,bonds,reserve,total};
  }

  function strategyResult(d,targetStocks,contribution){
    const s=strategySnapshot(d), investable=s.stocks+s.bonds || s.total;
    const target=clamp(Number(targetStocks)||50,10,90);
    const c=Math.max(0,Number(contribution)||0), t=target/100;
    const desiredStocks=(investable+c)*t;
    const buyStocks=clamp(desiredStocks-s.stocks,0,c), buyBonds=c-buyStocks;
    const after=investable+c;
    const currentStocks=investable?s.stocks/investable*100:0;
    const currentBonds=investable?s.bonds/investable*100:0;
    const gap=currentStocks-target;
    const afterStocks=after?(s.stocks+buyStocks)/after*100:0;
    const afterBonds=after?(s.bonds+buyBonds)/after*100:0;
    return {
      version:'7.4.1', targetStocks:target, targetBonds:100-target,
      currentStocks:round(currentStocks,2), currentBonds:round(currentBonds,2), gapPp:round(gap,2),
      score:Math.round(clamp(100-Math.abs(gap)*4,0,100)), contribution:round(c,2),
      buyStocks:round(buyStocks,2), buyBonds:round(buyBonds,2), afterStocks:round(afterStocks,2), afterBonds:round(afterBonds,2),
      advice:Math.abs(gap)<1?'Портфель почти в цели. Новое пополнение распределяем так, чтобы удержать стратегию.':gap>0?'Акций выше цели. Следующее пополнение смещаем в облигации — без продаж.':'Облигаций выше цели. Следующее пополнение смещаем в акции — без продаж.'
    };
  }

  function pairedReturns(d){
    const pts=Array.isArray(d?.history?.points)?d.history.points:[];
    const p=[],m=[];
    for(let i=1;i<pts.length;i++){
      const pa=Number(pts[i-1]?.portfolio),pb=Number(pts[i]?.portfolio),ma=Number(pts[i-1]?.imoex),mb=Number(pts[i]?.imoex);
      if(pa>0&&pb>0)p.push(pb/pa-1);
      if(ma>0&&mb>0)m.push(mb/ma-1);
    }
    return {p,m,pts};
  }
  function downside(a){const neg=a.map(x=>Math.min(0,x));return Math.sqrt(mean(neg.map(x=>x*x)));}
  function maxDD(vals){let peak=-Infinity,dd=0;for(const v of vals){if(v>peak)peak=v;if(peak>0)dd=Math.min(dd,v/peak-1);}return dd;}
  function beta(p,m){const n=Math.min(p.length,m.length);if(n<3)return NaN;const pp=p.slice(-n),mm=m.slice(-n),mp=mean(pp),mi=mean(mm),cov=pp.reduce((s,x,i)=>s+(x-mp)*(mm[i]-mi),0)/(n-1),v=mm.reduce((s,x)=>s+(x-mi)**2,0)/(n-1);return v?cov/v:NaN;}
  function corr(p,m){const n=Math.min(p.length,m.length);if(n<3)return NaN;const pp=p.slice(-n),mm=m.slice(-n),mp=mean(pp),mi=mean(mm),sp=sd(pp),sm=sd(mm);if(!sp||!sm)return NaN;return pp.reduce((s,x,i)=>s+(x-mp)*(mm[i]-mi),0)/((n-1)*sp*sm);}
  function explain(k,v){
    if(k==='sharpe')return !Number.isFinite(v)?'Недостаточно истории':v>=1?'Доходность хорошо компенсирует риск':v>=0.4?'Компенсация риска умеренная':'Риск пока оплачивается слабо';
    if(k==='sortino')return !Number.isFinite(v)?'Недостаточно истории':v>=1?'Просадки компенсируются доходностью':'Downside-риск заметен';
    if(k==='beta')return !Number.isFinite(v)?'Недостаточно истории':v>1.1?'Портфель чувствительнее рынка':v<0.8?'Портфель спокойнее рынка':'Чувствительность близка к IMOEX';
    if(k==='drawdown')return Math.abs(v)<=.1?'Просадка контролируемая':'Просадка требует внимания';
    return '';
  }
  function analyticsResult(d){
    const {p,m,pts}=pairedReturns(d),ann=252,mu=mean(p),vol=sd(p)*Math.sqrt(ann),down=downside(p)*Math.sqrt(ann),rf=Number(d?.cbr?.rate||0)/100;
    const sharpe=vol?((mu*ann)-rf)/vol:NaN,sortino=down?((mu*ann)-rf)/down:NaN,b=beta(p,m),c=corr(p,m);
    const vals=pts.map(x=>Number(x?.portfolio)).filter(x=>x>0),dd=maxDD(vals);
    const n=Math.min(p.length,m.length);
    const active=n>=2?p.slice(-n).map((x,i)=>x-m.slice(-n)[i]):[];
    const te=active.length>=2?sd(active)*Math.sqrt(ann):NaN;
    const ir=(n>=2&&te)?(mean(p.slice(-n))-mean(m.slice(-n)))*ann/te:NaN;
    return {version:'7.4.1',sample:p.length,sharpe:round(sharpe),sortino:round(sortino),volatility:round(vol),downsideRisk:round(down),beta:round(b),correlation:round(c),maxDrawdown:round(dd),trackingError:round(te),informationRatio:round(ir),explain:{sharpe:explain('sharpe',sharpe),sortino:explain('sortino',sortino),beta:explain('beta',b),drawdown:explain('drawdown',dd)},note:'Метрики рассчитаны на сервере по доступной истории портфеля. На короткой истории они могут быть нестабильны.'};
  }

  app.get('/api/shield/strategy', async (req,res)=>{
    try{
      const d=await buildDashboard();
      res.setHeader('Cache-Control','no-store');
      res.json(strategyResult(d,req.query.target,req.query.contribution));
    }catch(err){res.status(500).json({available:false,error:err?.message||'Strategy unavailable'});}
  });

  app.get('/api/shield/analytics', async (req,res)=>{
    try{
      const d=await buildDashboard();
      res.setHeader('Cache-Control','no-store');
      res.json(analyticsResult(d));
    }catch(err){res.status(500).json({available:false,error:err?.message||'Analytics unavailable'});}
  });
};
