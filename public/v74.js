(()=>{
 const $=id=>document.getElementById(id);
 let loading=false,last=null;
 const fmt=n=>Number.isFinite(Number(n))?Number(n).toFixed(2).replace('.',','):'—';
 const pct=n=>Number.isFinite(Number(n))?(Number(n)*100).toFixed(2).replace('.',',')+'%':'—';
 function render(x){
  if(!x)return;last=x;
  $('anSharpe').textContent=fmt(x.sharpe);$('anSortino').textContent=fmt(x.sortino);$('anVol').textContent=pct(x.volatility);$('anDown').textContent=pct(x.downsideRisk);$('anBeta').textContent=fmt(x.beta);$('anCorr').textContent=fmt(x.correlation);$('anDD').textContent=pct(x.maxDrawdown);$('anTE').textContent=pct(x.trackingError);$('anIR').textContent=fmt(x.informationRatio);$('anSample').textContent=(x.sample??0)+' наблюд.';
  $('anExplain').innerHTML=`<b>ЧТО ГОВОРЯТ ЦИФРЫ</b><span>Sharpe: ${x.explain?.sharpe||'—'}.</span><span>Sortino: ${x.explain?.sortino||'—'}.</span><span>Beta: ${x.explain?.beta||'—'}.</span><span>Просадка: ${x.explain?.drawdown||'—'}.</span>`;
  const badge=$('hubAnalytics');if(badge)badge.textContent=`SERVER · RISK ${pct(x.volatility)}`;
 }
 async function load(force=false){
  if(loading)return;if(last&&!force){render(last);return}loading=true;
  try{const r=await fetch('/api/shield/analytics?t='+Date.now(),{cache:'no-store'}),d=await r.json();if(!r.ok)throw new Error(d?.error||`HTTP ${r.status}`);render(d)}catch(e){console.warn('analytics shield',e);if($('anExplain'))$('anExplain').innerHTML='<b>АНАЛИТИКА НЕДОСТУПНА</b><span>'+String(e.message||e)+'</span>'}finally{loading=false}
 }
 function open(){document.body.classList.remove('strategy-active','pro-active','pulse-active');document.body.classList.add('analytics-active');$('analyticsView')?.setAttribute('aria-hidden','false');load(true)}
 function close(){document.body.classList.remove('analytics-active');$('analyticsView')?.setAttribute('aria-hidden','true')}
 function install(){
  const h=document.querySelector('.top');if(!h)return setTimeout(install,100);if($('analyticsView'))return;
  const v=document.createElement('section');v.id='analyticsView';v.className='analyticsView';v.setAttribute('aria-hidden','true');v.innerHTML=`<div class="anTop"><div><b>ANALYTICS <i>ENGINE</i></b><small>SERVER-SIDE RISK INTELLIGENCE · v7.4.2</small></div><button id="anClose">↩ ОБЗОР</button></div><div class="anLead"><small>КЛЮЧЕВОЙ ВОПРОС</small><strong>ОПРАВДАН ЛИ РИСК?</strong><p>Ключевые формулы считаются на сервере. Браузер получает только готовый результат.</p></div><div class="anGrid"><div><small>SHARPE</small><b id="anSharpe">—</b><span>доходность / общий риск</span></div><div><small>SORTINO</small><b id="anSortino">—</b><span>доходность / downside</span></div><div><small>VOLATILITY</small><b id="anVol">—</b><span>годовая волатильность</span></div><div><small>DOWNSIDE RISK</small><b id="anDown">—</b><span>только плохие колебания</span></div><div><small>BETA vs IMOEX</small><b id="anBeta">—</b><span>чувствительность к рынку</span></div><div><small>CORRELATION</small><b id="anCorr">—</b><span>связь с IMOEX</span></div></div><div class="anRisk"><div><small>MAX DRAWDOWN</small><b id="anDD">—</b></div><div><small>TRACKING ERROR</small><b id="anTE">—</b></div><div><small>INFORMATION RATIO</small><b id="anIR">—</b></div><em id="anSample">—</em></div><div class="anExplain" id="anExplain">Загрузка защищённой аналитики…</div><div class="anNote">Метрики рассчитаны по доступной истории. На короткой истории Sharpe, Sortino и Beta могут быть нестабильны — это диагностика, не прогноз.</div>`;h.after(v);
  const s=document.createElement('style');s.textContent=`.analyticsView{display:none}.analytics-active .phone{grid-template-rows:auto minmax(0,1fr)!important}.analytics-active .phone>.hero,.analytics-active .phone>.grid2,.analytics-active .phone>.chartCard,.analytics-active .phone>.bottomGrid,.analytics-active .phone>footer,.analytics-active .phone>.proView,.analytics-active .phone>.strategyView{display:none!important}.analytics-active .analyticsView{display:block!important;padding:14px 20px 18px;overflow:hidden;color:#dce9e6}.anTop{display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:10px}.anTop b{font-size:18px;letter-spacing:2px}.anTop i{font-style:normal;color:var(--accent)}.anTop small{display:block;font-size:6px;letter-spacing:1.4px;color:#72817d}.anTop button{background:transparent;border:1px solid rgba(84,246,197,.3);color:var(--accent);border-radius:14px;padding:7px 11px;font-size:7px}.anLead{margin-top:12px;padding:14px;border-left:2px solid var(--accent);background:rgba(84,246,197,.035)}.anLead small,.anGrid small,.anRisk small{font-size:6px;letter-spacing:1.1px;color:#73847f}.anLead strong{display:block;color:var(--accent);font-size:23px}.anLead p{font-size:7px;color:#8b9a96}.anGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.anGrid>div{border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:10px;min-height:68px}.anGrid b{display:block;font-size:18px;color:#fff}.anGrid span{font-size:5.5px;color:#64736f}.anRisk{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:9px;position:relative}.anRisk>div{border:1px solid rgba(84,246,197,.18);border-radius:13px;padding:9px}.anRisk b{display:block;color:var(--accent);font-size:14px}.anRisk em{position:absolute;right:0;bottom:-13px;font-size:5px;color:#687873}.anExplain{margin-top:21px;border:1px solid rgba(84,246,197,.2);border-radius:16px;padding:12px;display:grid;gap:5px}.anExplain b{color:var(--accent);font-size:8px;letter-spacing:1px}.anExplain span{font-size:7px;color:#96a7a2}.anNote{margin-top:9px;font-size:6px;line-height:1.45;color:#65746f}@media(max-width:560px){.anGrid{grid-template-columns:repeat(2,1fr)}.anLead strong{font-size:20px}}`;document.head.appendChild(s);$('anClose').onclick=close;window.__openAnalytics=open;load(false)
 }
 install();
})();

(()=>{
 const $=id=>document.getElementById(id),num=v=>Number(v),f1=v=>Number.isFinite(num(v))?num(v).toFixed(1).replace('.',','):'—',rub=v=>Number.isFinite(num(v))?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(num(v))+' ₽':'—';
 let busy=false,last=null;
 function set(id,v){const e=$(id);if(e)e.textContent=v}
 function bar(id,v){const e=$(id);if(e)e.style.width=Math.max(0,Math.min(100,num(v)||0))+'%'}
 function paint(x){window.__shieldDNA=x;
  if(!x||x.source!=='SERVER_SHIELD')return;last=x;
  set('pulseScore',String(x.score??'—'));set('pulseCoreStatus',x.coreStatus||'SERVER');set('pulseDiagnosisTitle',x.diagnosis?.title||'—');set('pulseDiagnosisText',x.diagnosis?.text||'—');
  set('pulseBalanceScore',String(x.scores?.balance??'—'));set('pulseRiskScore',String(x.scores?.risk??'—'));set('pulseFlowScore',String(x.scores?.flow??'—'));
  set('riskScore',String(x.scores?.risk??'—'));set('riskLabel',x.risk?.label||'—');set('riskDrawdown',Number.isFinite(num(x.risk?.drawdown))?'−'+f1(x.risk.drawdown)+'%':'—');set('riskConcentration',Number.isFinite(num(x.risk?.largestWeight))?f1(x.risk.largestWeight)+'%':'—');set('riskWhale',x.risk?.largestTicker||'—');
  set('flowState',(x.scores?.flow??0)>=70?'ACTIVE':(x.scores?.flow??0)>=45?'STABLE':'LOW');set('flowMonthly',rub(x.flow?.monthly));set('flowYield',Number.isFinite(num(x.flow?.yieldPct))?f1(x.flow.yieldPct)+'%':'—');bar('flowBar',x.scores?.flow);set('flowDaily',rub(x.flow?.daily));set('flowAnnual',rub(x.flow?.annual));
  set('allocationState',Math.abs((num(x.allocation?.stocks)||0)-((num(x.allocation?.bonds)||0)+(num(x.allocation?.reserve)||0)))<8?'ПОЧТИ 50 / 50':'БАЛАНС СМЕЩЁН');set('allocStocks',f1(x.allocation?.stocks)+'%');set('allocBonds',f1(x.allocation?.bonds)+'%');set('allocReserve',f1(x.allocation?.reserve)+'%');bar('allocStocksBar',x.allocation?.stocks);bar('allocBondsBar',x.allocation?.bonds);bar('allocReserveBar',x.allocation?.reserve);
  set('fieldCount',(x.portfolio?.assets??'—')+' АКТИВОВ');set('dnaVerdict',x.verdict||'—');
  [['dnaBalance2','dnaBalanceVal2','balance'],['dnaConcentration2','dnaConcentrationVal2','concentration'],['dnaStability2','dnaStabilityVal2','stability'],['dnaIncome2','dnaIncomeVal2','flow'],['dnaGrowth2','dnaGrowthVal2','growth'],['dnaDivers2','dnaDiversVal2','diversification']].forEach(([b,t,k])=>{bar(b,x.scores?.[k]);set(t,String(x.scores?.[k]??'—'))});
  set('pulseCommandText','SERVER DNA · TAP CORE ↻ RESCAN');
  const foot=document.querySelector('.pulseFooterBar span:first-child');if(foot)foot.innerHTML='<b>LIVE</b> · DNA SERVER LOCKED';
 }
 async function load(){if(busy)return;busy=true;try{const r=await fetch('/api/shield/dna?t='+Date.now(),{cache:'no-store'}),d=await r.json();if(!r.ok)throw new Error(d?.error||`HTTP ${r.status}`);paint(d)}catch(e){console.warn('DNA shield',e);if(last)paint(last)}finally{busy=false}}
 function install(){const b=$('pulseBtn'),core=$('scoreRing');if(!b)return setTimeout(install,100);b.addEventListener('click',()=>setTimeout(load,80));core?.addEventListener('click',()=>setTimeout(load,80));load()}
 install();
})();
