'use strict';

module.exports = function registerWhatIfEngine(app, deps = {}) {
  const { buildDashboard } = deps;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const round=(v,d=2)=>Number.isFinite(Number(v))?Number(Number(v).toFixed(d)):null;
  function classify(a){
    const t=String(a?.instrumentType||a?.type||'').toLowerCase();
    const s=String(a?.ticker||a?.name||'').toUpperCase();
    if(t.includes('bond')||s.startsWith('SU')||s.startsWith('RU000A')||s.includes('ОФЗ')||s.includes('ОБЛИГАЦ'))return'bond';
    if(t.includes('etf')||t.includes('fund')||t.includes('cash')||s.includes('TMON')||s.includes('LQDT'))return'reserve';
    return'stock';
  }
  app.get('/api/shield/whatif',async(req,res)=>{
    try{
      if(!buildDashboard)throw new Error('What If dependencies unavailable');
      const d=await buildDashboard();
      const assets=Array.isArray(d?.assets)?d.assets:(Array.isArray(d?.portfolio?.assets)?d.portfolio.assets:[]);
      let stocks=0,bonds=0,reserve=0;
      for(const a of assets){const v=Math.max(0,Number(a?.currentValue??a?.value??0)||0);const c=classify(a);if(c==='bond')bonds+=v;else if(c==='reserve')reserve+=v;else stocks+=v;}
      const start=stocks+bonds+reserve||Math.max(0,Number(d?.portfolio?.value)||0);
      const contribution=clamp(Number(req.query.contribution)||0,0,100000000);
      const marketShock=clamp(Number(req.query.marketShock)||0,-80,80);
      const rateShift=clamp(Number(req.query.rateShift)||0,-10,10);
      const targetStocks=clamp(Number(req.query.target)||50,10,90);
      const duration=clamp(Number(req.query.duration)||0,0,30);
      const investable=stocks+bonds;
      const target=targetStocks/100;
      const desiredStocks=(investable+contribution)*target;
      const buyStocks=clamp(desiredStocks-stocks,0,contribution);
      const buyBonds=contribution-buyStocks;
      let s2=stocks+buyStocks,b2=bonds+buyBonds,r2=reserve;
      const stockEffect=s2*(marketShock/100);
      const bondPricePct=duration>0?-duration*(rateShift/100)*100:0;
      const bondEffect=b2*(bondPricePct/100);
      s2+=stockEffect;b2+=bondEffect;
      const total=s2+b2+r2;
      const investableAfter=s2+b2||1;
      const stockPct=s2/investableAfter*100,bondPct=b2/investableAfter*100;
      const gap=stockPct-targetStocks;
      const scenarioPnl=total-(start+contribution);
      res.setHeader('Cache-Control','no-store');
      res.json({
        version:'7.7',source:'SERVER_WHAT_IF',inputs:{contribution:round(contribution),marketShock:round(marketShock),rateShift:round(rateShift),targetStocks:round(targetStocks),duration:round(duration)},
        before:{capital:round(start),stocks:round(stocks),bonds:round(bonds),reserve:round(reserve),stocksPct:round(investable?stocks/investable*100:0,1),bondsPct:round(investable?bonds/investable*100:0,1)},
        buys:{stocks:round(buyStocks),bonds:round(buyBonds)},
        effects:{stocksRub:round(stockEffect),bondsRub:round(bondEffect),bondPricePct:round(bondPricePct)},
        after:{capital:round(total),scenarioPnl:round(scenarioPnl),stocks:round(s2),bonds:round(b2),reserve:round(r2),stocksPct:round(stockPct,1),bondsPct:round(bondPct,1),gapPp:round(gap,1)},
        verdict:Math.abs(gap)<=1?'ЦЕЛЬ УДЕРЖАНА':gap>0?'ПОСЛЕ СЦЕНАРИЯ АКЦИЙ ВЫШЕ ЦЕЛИ':'ПОСЛЕ СЦЕНАРИЯ ОБЛИГАЦИЙ ВЫШЕ ЦЕЛИ',
        note:duration>0?'Ставочный сценарий использует модифицированную дюрацию из Bond Analytics. Это приближение, не прогноз.':'Ставочный эффект не применён: дюрация недоступна.'
      });
    }catch(err){res.status(500).json({version:'7.7',available:false,error:err?.message||'What If unavailable'});}
  });
};
