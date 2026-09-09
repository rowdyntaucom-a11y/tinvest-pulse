(()=>{
 const $=id=>document.getElementById(id),f=(v,d=2)=>Number.isFinite(+v)?(+v).toFixed(d).replace('.',','):'—';
 let busy=false,last=null,paintedSignature='';
 const set=(id,v)=>{const e=$(id);if(e)e.textContent=v};
 function signature(x){return [x.version,x.sample,x.rawSample,x.dropped,x.sharpe,x.sortino,x.volatility,x.downsideRisk,x.beta,x.correlation,x.maxDrawdown,x.trackingError,x.informationRatio].join('|')}
 function paint(x){
  if(!x)return;const sig=signature(x);if(sig===paintedSignature)return;paintedSignature=sig;last=x;
  set('anSharpe',f(x.sharpe));set('anSortino',f(x.sortino));set('anVol',f((+x.volatility)*100)+'%');set('anDown',f((+x.downsideRisk)*100)+'%');set('anBeta',f(x.beta));set('anCorr',f(x.correlation));set('anDD',f((+x.maxDrawdown)*100)+'%');set('anTE',f((+x.trackingError)*100)+'%');set('anIR',f(x.informationRatio));
  const period=x.medianIntervalDays!=null?' · ~'+f(x.medianIntervalDays,1)+' дн.':' · период fallback';
  set('anSample',(x.sample??0)+' чистых / '+(x.rawSample??0)+' · исключено '+(x.dropped??0)+period+' · LOCK');
  const root=$('analyticsView'),sm=root?.querySelector('.anTop small');if(sm)sm.textContent='SERVER-SIDE RISK INTELLIGENCE · v7.16.8 · HISTORY LOCK';
  const body=$('an20Body');if(body){const q=x.dataQuality==='OK',score=q&&x.sample>=20?Math.max(0,Math.min(100,Math.round(55+(+x.sharpe||0)*12+(+x.sortino||0)*7-Math.abs((+x.maxDrawdown||0)*100)*.7))):null;body.innerHTML='<div class="an20Score"><strong>'+(score??'—')+'</strong><div><b>'+(score==null?'ДАННЫЕ ЕЩЁ СОЗРЕВАЮТ':score>=65?'РИСК ПОД КОНТРОЛЕМ':'РИСК ПОКА НЕ ОПЛАЧЕН')+'</b><p>Фиксированный ряд '+x.sample+'/'+x.rawSample+' · исключено '+x.dropped+(x.medianIntervalDays!=null?' · шаг ~'+f(x.medianIntervalDays,1)+' дн.':' · периодизация fallback')+'.</p></div></div><div class="an20Signals"><div><small>ОБЩИЙ РИСК</small><b>'+f((+x.volatility||0)*100,1)+'%</b></div><div><small>DOWNSIDE</small><b>'+f((+x.downsideRisk||0)*100,1)+'%</b></div><div><small>VS IMOEX</small><b>'+f(x.informationRatio)+'</b></div></div><div class="an20Warn">DATA QUALITY · '+x.dataQuality+' · ANN '+x.annualization+' · COMPLETED HISTORY</div>'}
 }
 async function run(){if(busy)return;const root=$('analyticsView');if(!root)return setTimeout(run,200);busy=true;try{const r=await fetch('/api/shield/analytics-stable?t='+Date.now(),{cache:'no-store'}),x=await r.json();if(!r.ok)throw Error(x?.error||'analytics');paint(x)}catch(e){if(last)paint(last);console.warn('analytics stable',e)}finally{busy=false}}
 function install(){const root=$('analyticsView');if(!root)return setTimeout(install,200);const open=window.__openAnalytics;if(typeof open==='function'&&!open.__stable){const wrapped=function(){open();setTimeout(run,80)};wrapped.__stable=true;window.__openAnalytics=wrapped}run()}
 install();
})();
