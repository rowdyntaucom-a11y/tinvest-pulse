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
    if(t.includes('bond')||s.startsWith('SU')||s.startsWith('RU000A')||s.includes('ОФЗ')||s.includes('ОБЛИГАЦ')) return 'bond';
    if(t.includes('etf')||t.includes('fund')||t.includes('currency')||t.includes('cash')||s.includes('TMON')||s.includes('LQDT')) return 'reserve';
    return 'stock';
  }

  function assetsOf(d){
    return Array.isArray(d?.assets) ? d.assets : (Array.isArray(d?.portfolio?.assets) ? d.portfolio.assets : []);
  }

  function strategySnapshot(d){
    const assets=assetsOf(d);
    let stocks=0,bonds=0,reserve=0;
    for(const a of assets){
      const v=Math.max(0,Number(a?.currentValue??a?.value??a?.marketValue??0)||0);
      const c=classify(a);
      if(c==='bond') bonds+=v; else if(c==='reserve') reserve+=v; else stocks+=v;
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
      version:'7.4.2', targetStocks:target, targetBonds:100-target,
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
  function maxDD(vals){
  const a=(Array.isArray(vals)?vals:[]).map(Number).filter(v=>Number.isFinite(v)&&v>0);
  if(!a.length)return 0;
  let synthetic=100,peak=100,dd=0;
  for(let i=1;i<a.length;i++){
    const r=a[i]/a[i-1]-1;
    if(!Number.isFinite(r)||Math.abs(r)>.35)continue;
    synthetic*=1+r;peak=Math.max(peak,synthetic);dd=Math.min(dd,synthetic/peak-1);
  }
  return dd;
}
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
    const n=Math.min(p.length,m.length), active=n>=2?p.slice(-n).map((x,i)=>x-m.slice(-n)[i]):[];
    const te=active.length>=2?sd(active)*Math.sqrt(ann):NaN;
    const ir=(n>=2&&te)?(mean(p.slice(-n))-mean(m.slice(-n)))*ann/te:NaN;
    return {version:'7.4.2',sample:p.length,sharpe:round(sharpe),sortino:round(sortino),volatility:round(vol),downsideRisk:round(down),beta:round(b),correlation:round(c),maxDrawdown:round(dd),trackingError:round(te),informationRatio:round(ir),explain:{sharpe:explain('sharpe',sharpe),sortino:explain('sortino',sortino),beta:explain('beta',b),drawdown:explain('drawdown',dd)},note:'Метрики рассчитаны на сервере по доступной истории портфеля. На короткой истории они могут быть нестабильны.'};
  }

  function dnaResult(d){
    const assets=assetsOf(d).filter(a=>(Number(a?.currentValue)||0)>0).sort((a,b)=>(Number(b.currentValue)||0)-(Number(a.currentValue)||0));
    const snap=strategySnapshot(d), total=snap.total||1;
    const stocksPct=snap.stocks/total*100, bondsPct=snap.bonds/total*100, reservePct=snap.reserve/total*100, defensivePct=bondsPct+reservePct;
    const weights=assets.map(a=>(Number(a.currentValue)||0)/total*100);
    const whale=assets[0]||null, whaleWeight=weights[0]||0, top3=weights.slice(0,3).reduce((a,b)=>a+b,0);
    const hhi=weights.reduce((s,w)=>s+(w/100)**2,0), effectiveN=hhi>0?1/hhi:0;
    const concentrationRisk=clamp(Math.round(Math.max(0,whaleWeight-15)*3.1+Math.max(0,top3-55)*1.45),0,100);
    const concentrationScore=100-concentrationRisk;
    const diversificationScore=clamp(Math.round((Math.min(effectiveN,8)/8)*82+Math.min(assets.length,10)*1.8),18,100);
    const balanceGap=Math.abs(stocksPct-defensivePct), balanceScore=clamp(Math.round(100-balanceGap*1.65),0,100);
    const pts=Array.isArray(d?.history?.points)?d.history.points:[], ps=pts.map(x=>Number(x?.portfolio)).filter(v=>v>0), ms=pts.map(x=>Number(x?.imoex)).filter(v=>v>0);
    const p0=ps[0]||100,p1=ps[ps.length-1]||p0,m0=ms[0]||100,m1=ms[ms.length-1]||m0;
    const pReturn=(p1/p0-1)*100,mReturn=(m1/m0-1)*100,activeReturn=pReturn-mReturn;
    const maxDrawdown=Math.abs(maxDD(ps))*100;
    const daily=[];for(let i=1;i<ps.length;i++)if(ps[i-1]>0)daily.push((ps[i]/ps[i-1]-1)*100);
    const dm=mean(daily),vol=daily.length>1?Math.sqrt(daily.reduce((s,x)=>s+(x-dm)**2,0)/(daily.length-1)):0;
    const monthly=Number(d?.passiveIncome?.averageMonthly)||0, incomeYield=total>0?monthly*12/total*100:0;
    const flowScore=clamp(Math.round(30+incomeYield*10+(monthly>0?14:0)),0,100);
    const stabilityScore=clamp(Math.round(68+bondsPct*.28+reservePct*.18-maxDrawdown*3.7-vol*3.2),12,100);
    const growthScore=clamp(Math.round(50+pReturn*2.8+activeReturn*3.4),0,100);
    const dnaBase=balanceScore*.25+concentrationScore*.20+stabilityScore*.20+flowScore*.15+growthScore*.10+diversificationScore*.10;
    const score=clamp(Math.round(dnaBase),0,100);
    const riskScore=clamp(Math.round(concentrationRisk*.42+Math.min(100,maxDrawdown*5)*.28+Math.min(100,balanceGap*2.4)*.20+Math.min(100,vol*12)*.10),0,100);
    let diagnosisTitle='DNA СБАЛАНСИРОВАН', diagnosisText=`Акции ${stocksPct.toFixed(0)}%, защитная часть ${defensivePct.toFixed(0)}%. Крупнейшая позиция — ${whale?.ticker||whale?.name||'—'} ${whaleWeight.toFixed(1).replace('.',',')}%.`;
    if(concentrationRisk>=55){diagnosisTitle='ЯДРО ПЕРЕГРУЖЕНО';diagnosisText=`${whale?.ticker||whale?.name||'Крупнейшая позиция'} занимает ${whaleWeight.toFixed(1).replace('.',',')}%. Это главный структурный риск портфеля.`;}
    else if(balanceScore<60){diagnosisTitle='БАЛАНС СМЕЩЁН';diagnosisText=`Структура сейчас ${stocksPct.toFixed(0)}% акции / ${defensivePct.toFixed(0)}% защитная часть. Баланс заметно отклонён.`;}
    else if(flowScore>=70){diagnosisTitle='ДЕНЕЖНЫЙ ДВИГАТЕЛЬ';diagnosisText=`Пассивный поток ${Math.round(monthly).toLocaleString('ru-RU')} ₽/мес. заметно поддерживает DNA портфеля.`;}
    else if(activeReturn>=2){diagnosisTitle='DNA НАБИРАЕТ ХОД';diagnosisText=`Портфель опережает IMOEX примерно на ${activeReturn.toFixed(1).replace('.',',')} п.п., не ломая базовую структуру.`;}
    const verdict=score>=80?'СИЛЬНЫЙ DNA':score>=65?'СБАЛАНСИРОВАН':score>=50?'РАБОЧИЙ ПРОФИЛЬ':'ТРЕБУЕТ НАСТРОЙКИ';
    return {
      version:'7.4.2',source:'SERVER_SHIELD',score,coreStatus:score>=80?'STRONG':score>=65?'BALANCED':score>=50?'ONLINE':'WATCH',verdict,
      diagnosis:{title:diagnosisTitle,text:diagnosisText},
      scores:{balance:balanceScore,concentration:concentrationScore,stability:stabilityScore,flow:flowScore,growth:growthScore,diversification:diversificationScore,risk:riskScore},
      risk:{label:riskScore>=65?'ВЫСОКИЙ':riskScore>=35?'УМЕРЕННЫЙ':'НИЗКИЙ',drawdown:round(maxDrawdown,2),largestWeight:round(whaleWeight,2),largestTicker:whale?.ticker||whale?.name||'—'},
      allocation:{stocks:round(stocksPct,2),bonds:round(bondsPct,2),reserve:round(reservePct,2)},
      flow:{monthly:round(monthly,2),annual:round(monthly*12,2),daily:round(monthly/30.4375,2),yieldPct:round(incomeYield,2)},
      portfolio:{assets:assets.length,effectivePositions:round(effectiveN,2)},
      note:'DNA Score и диагноз рассчитаны на сервере; клиент получает только результат.'
    };
  }

  app.get('/api/shield/strategy', async (req,res)=>{
    try{const d=await buildDashboard();res.setHeader('Cache-Control','no-store');res.json(strategyResult(d,req.query.target,req.query.contribution));}
    catch(err){res.status(500).json({available:false,error:err?.message||'Strategy unavailable'});}
  });
  app.get('/api/shield/analytics', async (req,res)=>{
    try{const d=await buildDashboard();res.setHeader('Cache-Control','no-store');res.json(analyticsResult(d));}
    catch(err){res.status(500).json({available:false,error:err?.message||'Analytics unavailable'});}
  });
  app.get('/api/shield/dna', async (req,res)=>{
    try{const d=await buildDashboard();res.setHeader('Cache-Control','no-store');res.json(dnaResult(d));}
    catch(err){res.status(500).json({available:false,error:err?.message||'DNA unavailable'});}
  });
};
