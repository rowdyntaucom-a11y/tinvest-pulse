let chart;
let chartMode='growth';
let dashboardData=null;
const $=id=>document.getElementById(id);
const setText=(id,value)=>{const el=$(id);if(el)el.textContent=value;return el};
const setStyle=(id,prop,value)=>{const el=$(id);if(el)el.style[prop]=value;return el};
const rub=n=>Number.isFinite(Number(n))?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Number(n))+' ₽':'—';
const pct=n=>Number.isFinite(Number(n))?((Number(n)*100).toFixed(1).replace('.',',')+'%'):'—';
const shortDate=d=>d?new Date(d).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'}):'—';

const themes=[
  ['neon','NEON','Кряхти, но расти.'],
  ['emerald','EMERALD','Деньги любят зелень.'],
  ['graphite','GRAPHITE','Тихо едем — богатеем.'],
  ['cyber','CYBER','Купить. Держать. Не паниковать.'],
  ['aurora','AURORA','Рынок шумит. Фонд живёт.']
];
let themeIndex=Math.max(0,themes.findIndex(x=>x[0]===localStorage.getItem('pulseTheme')));
function applyTheme(){const t=themes[themeIndex];document.body.dataset.theme=t[0];setText('styleBtn',t[1]);setText('slogan',t[2]);localStorage.setItem('pulseTheme',t[0]);}
$('styleBtn').addEventListener('click',()=>{themeIndex=(themeIndex+1)%themes.length;applyTheme();});
applyTheme();


// v6.0 LIVE REACTOR — ambient HUD + interactive Pulse signal deck.
function initHud(){
  const box=$('hudParticles'); if(!box || box.childElementCount) return;
  const n=18;
  for(let i=0;i<n;i++){
    const el=document.createElement('i'); el.className='hudParticle';
    const x=4+Math.random()*92, y=10+Math.random()*82;
    el.style.left=x+'%'; el.style.top=y+'%';
    el.style.setProperty('--pd',(5.5+Math.random()*5.5).toFixed(2)+'s');
    el.style.setProperty('--ps',(-Math.random()*7).toFixed(2)+'s');
    el.style.setProperty('--px',(Math.random()*18-9).toFixed(1)+'px');
    el.style.setProperty('--px2',(Math.random()*14-7).toFixed(1)+'px');
    box.appendChild(el);
  }
}
function animateTextNumber(id, finalText, duration=520){
  const el=$(id); if(!el) return;
  const old=Number(el.dataset.numeric);
  const target=Number(finalText);
  if(!Number.isFinite(target)){el.textContent=finalText;return;}
  if(!Number.isFinite(old) || Math.abs(old-target)<0.001){el.textContent=finalText;el.dataset.numeric=String(target);return;}
  const t0=performance.now();
  const tick=now=>{
    const k=clamp((now-t0)/duration,0,1), e=1-Math.pow(1-k,3);
    const n=old+(target-old)*e;
    el.textContent=finalText.includes('₽')?rub(n):finalText.includes('%')?pct(n):Math.round(n).toLocaleString('ru-RU');
    if(k<1)requestAnimationFrame(tick); else {el.textContent=finalText;el.dataset.numeric=String(target);}
  };
  el.classList.remove('value-updated'); void el.offsetWidth; el.classList.add('value-updated');
  requestAnimationFrame(tick);
}
function pulseDataCards(){
  ['profit','profitPct','vsMoex','xirr','monthly','keyRate'].forEach((id,i)=>{
    const el=$(id); if(!el) return;
    setTimeout(()=>{el.classList.remove('value-flash');void el.offsetWidth;el.classList.add('value-flash');},i*55);
  });
  document.querySelectorAll('.mini').forEach((el,i)=>{setTimeout(()=>{el.classList.remove('data-pulse');void el.offsetWidth;el.classList.add('data-pulse');},i*65);});
  const c=document.querySelector('.chartCard'); if(c){c.classList.remove('data-refresh');void c.offsetWidth;c.classList.add('data-refresh');}
}
function positionChartNode(){
  const node=$('chartLiveNode');
  if(!node || !chart || !chart.scales?.y) return;
  const ds=chart.data.datasets?.[0]?.data||[]; let last=null;
  for(let i=ds.length-1;i>=0;i--){if(Number.isFinite(Number(ds[i]))){last=Number(ds[i]);break;}}
  if(last==null)return;
  const y=chart.scales.y.getPixelForValue(last);
  const area=chart.chartArea;
  if(!area)return;
  node.style.left=(area.right/chart.width*100)+'%';
  node.style.top=(y/chart.height*100)+'%';
}
initHud();
window.addEventListener('resize',()=>requestAnimationFrame(positionChartNode));

function cleanSeries(points,key){
  const arr=[];
  for(const p of points){const v=Number(p?.[key]);if(Number.isFinite(v)&&v>0)arr.push({date:p.date,value:v});}
  return arr.length>=2?arr:[];
}
function chartColor(name,fallback){return getComputedStyle(document.body).getPropertyValue(name).trim()||fallback;}
function renderChart(history){
  const points=Array.isArray(history?.points)?history.points:[];
  const portfolio=cleanSeries(points,'portfolio');
  const imoex=cleanSeries(points,'imoex');
  const valuePoints=Array.isArray(history?.valuePoints)?history.valuePoints.filter(x=>Number.isFinite(Number(x.value))).map(x=>({date:x.date,value:Number(x.value)})):[];
  const investedPoints=Array.isArray(history?.investedPoints)?history.investedPoints.filter(x=>Number.isFinite(Number(x.value))).map(x=>({date:x.date,value:Number(x.value)})):[];
  const has=portfolio.length>=2;
  $('chartEmpty').style.display=has?'none':'flex';
  if(chart){chart.destroy();chart=null;}
  if(!has)return;

  const mode=chartMode;
  const labels=portfolio.map(x=>shortDate(x.date));
  let datasets=[];
  if(mode==='growth'){
    const byDate=new Map(imoex.map(x=>[x.date,x.value]));
    datasets=[
      {label:'Портфель',data:portfolio.map(x=>Number(x.value.toFixed(2))),borderColor:chartColor('--accent','#54f6c5'),backgroundColor:'rgba(84,246,197,.07)',borderWidth:2.7,pointRadius:0,tension:.25,fill:true},
      {label:'IMOEX',data:portfolio.map(x=>byDate.has(x.date)?Number(byDate.get(x.date).toFixed(2)):null),borderColor:'#8290a7',borderWidth:1.7,pointRadius:0,tension:.2,spanGaps:true,fill:false}
    ];
    $('chartTitle').textContent='РОСТ КРЯХТЯЩЕГО ФОНДА';
    $('chartSubtitle').textContent='портфель vs IMOEX • старт = 100';
    $('chartBadge').textContent='НЕ СИДИМ';
    $('chartLegend').innerHTML='<i></i> Портфель <em></em> IMOEX <span>100 = старт</span>';
  } else if(mode==='value'){
    const byDate=new Map(valuePoints.map(x=>[x.date,x.value]));
    const inv=new Map(investedPoints.map(x=>[x.date,x.value]));
    datasets=[
      {label:'Стоимость',data:portfolio.map(x=>byDate.has(x.date)?Math.round(byDate.get(x.date)):null),borderColor:chartColor('--accent','#54f6c5'),backgroundColor:'rgba(84,246,197,.08)',borderWidth:2.5,pointRadius:0,tension:.2,spanGaps:true,fill:true},
      {label:'Вложено',data:portfolio.map(x=>inv.has(x.date)?Math.round(inv.get(x.date)):null),borderColor:chartColor('--hot','#8b5cff'),borderDash:[6,5],borderWidth:1.6,pointRadius:0,tension:.15,spanGaps:true,fill:false}
    ];
    $('chartTitle').textContent='СТОИМОСТЬ VS ВЛОЖЕНО';
    $('chartSubtitle').textContent='линия фонда • пунктир — внесено';
    $('chartBadge').textContent='ДЕНЬГИ';
    $('chartLegend').innerHTML='<i></i> Стоимость <em style="background:var(--hot)"></em> Вложено <span>₽</span>';
  } else {
    const byDate=new Map(valuePoints.map(x=>[x.date,x.value]));
    const inv=new Map(investedPoints.map(x=>[x.date,x.value]));
    datasets=[
      {label:'Прибыль',data:portfolio.map(x=>(byDate.has(x.date)&&inv.has(x.date))?Math.round(byDate.get(x.date)-inv.get(x.date)):null),borderColor:chartColor('--accent','#54f6c5'),backgroundColor:'rgba(84,246,197,.08)',borderWidth:2.6,pointRadius:0,tension:.2,spanGaps:true,fill:true}
    ];
    $('chartTitle').textContent='ПРИБЫЛЬ КРЯХТЯЩЕГО ФОНДА';
    $('chartSubtitle').textContent='стоимость − внесено • ₽';
    $('chartBadge').textContent='В ПЛЮСЕ?';
    $('chartLegend').innerHTML='<i></i> Полная прибыль <span>₽</span>';
  }
  chart=new Chart($('chart'),{type:'line',data:{labels,datasets},options:{responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${new Intl.NumberFormat('ru-RU').format(Number(c.parsed.y))}${mode==='growth'?'':' ₽'}`}}},scales:{x:{display:false},y:{grid:{color:'rgba(255,255,255,.07)'},ticks:{color:'#7e8b86',maxTicksLimit:4,callback:v=>mode==='growth'?Number(v).toFixed(0):new Intl.NumberFormat('ru-RU',{notation:'compact',maximumFractionDigits:1}).format(v)}}}}});
}

function render(d){
  dashboardData=d||{};
  const p=dashboardData.portfolio||{};
  const valueText=rub(p.value); const profitText=rub(p.profit);
  animateTextNumber('value',valueText,620);
  animateTextNumber('profit',profitText,480);
  const profitPctText=p.profitPercent==null?'—':pct(p.profitPercent); animateTextNumber('profitPct',profitPctText,430);
  setText('gain',p.profitPercent==null?'—':(p.profitPercent>=0?'+':'')+pct(p.profitPercent));
  const gainEl=setStyle('gain','color',p.profitPercent>=0?'var(--accent)':'#ff6575');
  if(gainEl) gainEl.setAttribute('data-ready','1');
  setText('cagr',p.cagr==null?'—':pct(p.cagr));
  const xirrText=p.xirr==null?'—':pct(p.xirr); animateTextNumber('xirr',xirrText,430);

  const hp=Array.isArray(dashboardData.history?.points)?dashboardData.history.points:[];
  // Compare cumulative returns using the actual plotted series. We intentionally
  // do not require identical date strings because MOEX and T-Bank can serialize
  // the same trading day differently (UTC vs local date).
  const pSeries=hp.map(x=>Number(x?.portfolio)).filter(Number.isFinite).filter(v=>v>0);
  const mSeries=hp.map(x=>Number(x?.imoex)).filter(Number.isFinite).filter(v=>v>0);
  let vs=null;
  if(pSeries.length>=2 && mSeries.length>=2){
    const pReturn=pSeries[pSeries.length-1]/pSeries[0]-1;
    const mReturn=mSeries[mSeries.length-1]/mSeries[0]-1;
    vs=(pReturn-mReturn)*100;
  }
  const vsText=vs==null?'—':`${vs>=0?'+':''}${vs.toFixed(2).replace('.',',')} п.п.`; setText('vsMoex',vsText);
  setStyle('vsMoex','color',vs==null?'#fff':(vs>=0?'var(--accent)':'#ff6575'));
  setText('vsMoexCaption',vs==null?'ждём индекс':(vs>=0?'обгоняем индекс':'отстаём от индекса'));
  const badge=vs==null?'НЕ СИДИМ':(vs>=0?'ОБГОНЯЕМ':'ДОГОНЯЕМ');
  setText('chartBadge',badge);
  setText('dates',`Начало: ${shortDate(p.startDate)} • Сегодня: ${shortDate(new Date())}`);

  const monthly=Number(dashboardData.passiveIncome?.averageMonthly ?? dashboardData.income?.monthly);
  animateTextNumber('monthly',rub(monthly),420);
  animateTextNumber('daily',Number.isFinite(monthly)?rub(monthly/30.4375):'—',420);
  animateTextNumber('annual',Number.isFinite(monthly)?rub(monthly*12):'—',420);

  const c=dashboardData.cbr||{};
  const keyRateText=Number.isFinite(Number(c.rate))&&Number(c.rate)>0?`${Number(c.rate).toFixed(2).replace('.',',')}%`:'—'; setText('keyRate',keyRateText);
  setText('keyRateDate',c.rateDate?`с ${shortDate(c.rateDate)}`:'Банк России');
  setText('nextMeeting',c.nextMeeting?shortDate(c.nextMeeting):'—');

  const g=dashboardData.leaders?.gainers?.[0], l=dashboardData.leaders?.losers?.[0];
  setText('gainer',g?`${g.ticker||g.name} ${g.yieldRub>=0?'+':''}${rub(g.yieldRub)}`:'—');
  setText('loser',l?`${l.ticker||l.name} ${l.yieldRub>=0?'+':''}${rub(l.yieldRub)}`:'—');
  setText('status',`✓ Данные загружены • ${dashboardData.assets?.length||p.assets?.length||0} активов`);
  const statusEl=$('status');if(statusEl)statusEl.className='ok';setText('hudPulseState','SYNC');setTimeout(()=>setText('hudPulseState','LIVE'),420);
  setText('updated',new Date(dashboardData.updatedAt||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}));
  try{renderChart(dashboardData.history||{});requestAnimationFrame(positionChartNode);}catch(err){
    console.error('Chart render error:',err);
    const empty=$('chartEmpty');if(empty){empty.textContent='История временно недоступна';empty.style.display='flex';}
  }
  pulseDataCards();
  if(proMode)proRender(d);
}
document.querySelectorAll('.chartTab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.chartTab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  chartMode=btn.dataset.mode||'growth';
  if(dashboardData){renderChart(dashboardData.history);requestAnimationFrame(positionChartNode);}
}));
async function load(){try{const r=await fetch('/api/dashboard?v=7.11.5&t='+Date.now(),{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||`HTTP ${r.status}`);render(d);try{localStorage.setItem('tinvest:lastDashboard',JSON.stringify({at:Date.now(),data:d}));}catch(_){}}catch(e){console.error(e);let saved=null;try{saved=JSON.parse(localStorage.getItem('tinvest:lastDashboard')||'null');}catch(_){}if(saved?.data){render(saved.data);const age=Math.max(0,Math.round((Date.now()-Number(saved.at||Date.now()))/60000));setText('status',`⚠ Связь потеряна • последний снимок${age?` ${age} мин назад`:''}`);setText('hudPulseState','STALE');const statusEl=$('status');if(statusEl)statusEl.className='err';}else{setText('status','Ошибка связи • повторяем…');setText('hudPulseState','ERR');const statusEl=$('status');if(statusEl)statusEl.className='err';}setTimeout(load,5000);}}


// v6.3 — PRO CAPITAL TERMINAL. This is an alternate presentation of the same live data;
// the original Terminal and Pulse Röntgen views are preserved unchanged.
let proMode=false;
function proPath(values){
  const a=values.map(Number).filter(v=>Number.isFinite(v)&&v>0);
  if(a.length<2)return {path:'',area:''};
  const min=Math.min(...a),max=Math.max(...a),span=Math.max(0.0001,max-min);
  const pts=a.map((v,i)=>{const x=i/(a.length-1)*600;const y=12+(1-(v-min)/span)*126;return [x,y]});
  const path=pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' ');
  return {path,area:path+' L600 148 L0 148 Z',last:pts[pts.length-1]};
}
function proRenderChart(d){
  const pts=Array.isArray(d?.history?.points)?d.history.points:[];
  const p=pts.map(x=>Number(x?.portfolio)).filter(v=>Number.isFinite(v)&&v>0);
  const m=pts.map(x=>Number(x?.imoex)).filter(v=>Number.isFinite(v)&&v>0);
  const pp=proPath(p), mm=proPath(m);
  setAttr('proPortfolioPath','d',pp.path);setAttr('proPortfolioArea','d',pp.area);setAttr('proMoexPath','d',mm.path);
  if(pp.last){setAttr('proChartDot','cx',pp.last[0]);setAttr('proChartDot','cy',pp.last[1]);}
  setText('proChartEnd',p.length?`СЕЙЧАС ${p[p.length-1].toFixed(1).replace('.',',')}`:'СЕЙЧАС —');
}
function setAttr(id,name,value){const el=$(id);if(el)el.setAttribute(name,String(value));return el}
function proRender(d){
  const p=d?.portfolio||{}, pts=Array.isArray(d?.history?.points)?d.history.points:[];
  const ps=pts.map(x=>Number(x?.portfolio)).filter(v=>Number.isFinite(v)&&v>0);
  const ms=pts.map(x=>Number(x?.imoex)).filter(v=>Number.isFinite(v)&&v>0);
  const p0=ps[0]||100,p1=ps[ps.length-1]||p0,m0=ms[0]||100,m1=ms[ms.length-1]||m0;
  const pr=(p1/p0-1)*100,mr=(m1/m0-1)*100,vs=pr-mr;
  const monthly=Number(d?.passiveIncome?.averageMonthly), total=Number(p.value)||0;
  const assets=Array.isArray(d?.assets)?d.assets:(Array.isArray(p.assets)?p.assets:[]);
  const sorted=[...assets].sort((a,b)=>(Number(b.currentValue)||0)-(Number(a.currentValue)||0));
  const top=sorted.slice(0,4), maxVal=Math.max(...top.map(x=>Number(x.currentValue)||0),1);
  const age=p.startDate?Math.max(0,Math.round((Date.now()-new Date(p.startDate).getTime())/86400000)):null;
  const peak=ps.reduce((mx,v)=>Math.max(mx,v),p0); let dd=0; for(const v of ps) if(peak>0) dd=Math.max(dd,(peak-v)/peak*100);
  const incomeYield=Number.isFinite(monthly)&&total>0?monthly*12/total*100:0;
  const flowBar=clamp(Math.round(Math.min(100,incomeYield*14)),10,100);
  const risk=Math.round(clamp(dd*7+(sorted[0]&&total>0?(Number(sorted[0].currentValue)||0)/total*100:0)*.7,5,100));
  setText('proValue',rub(p.value));
  setText('proGain',p.profitPercent==null?'—':`${p.profitPercent>=0?'+':''}${pct(p.profitPercent)}`);
  setStyle('proGain','color',Number(p.profitPercent)>=0?'var(--accent)':'#ff6575');
  setText('proHeroText',pr>=0?'Капитал держит курс и продолжает работать.':'Капитал проходит коррекцию. Система продолжает работать.');
  setText('proProfit',rub(p.profit));setText('proProfitPct',p.profitPercent==null?'—':pct(p.profitPercent));setText('proXirr',p.xirr==null?'—':pct(p.xirr));
  setText('proVsMoex',`${vs>=0?'+':''}${vs.toFixed(2).replace('.',',')} п.п.`);setStyle('proVsMoex','color',vs>=0?'var(--accent)':'#ff6575');setText('proVsText',vs>=0?'обгоняем индекс':'отстаём от индекса');
  setText('proAssetCount',`${assets.length} АКТИВОВ`);setText('proAge',age==null?'—':`${age} ДН.`);setText('proUpdated',`SYNC ${new Date(d?.updatedAt||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}`);
  setText('proChartBadge',vs>=0?'INDEX BEAT':'INDEX CHASE');proRenderChart(d);
  const hold=$('proHoldings');
  if(hold){hold.innerHTML=top.map((a,i)=>{const v=Number(a.currentValue)||0,w=total>0?v/total*100:0,bw=v/maxVal*100;return `<div class="holdingRow"><span>${i===0?'◆':i===1?'◇':i===2?'◈':'○'} ${a.ticker||a.name||'—'}</span><i><em style="width:${bw.toFixed(1)}%"></em></i><b>${w.toFixed(1).replace('.',',')}%</b></div>`}).join('');}
  setText('proHoldingsScore',sorted[0]&&total>0?`${((Number(sorted[0].currentValue)||0)/total*100).toFixed(1).replace('.',',')}% TOP`:'—');
  setText('proMonthly',Number.isFinite(monthly)?rub(monthly):'—');setText('proDaily',Number.isFinite(monthly)?rub(monthly/30.4375):'—');setText('proAnnual',Number.isFinite(monthly)?rub(monthly*12):'—');setText('proFlowState',incomeYield>=5?'STRONG':'ACTIVE');setStyle('proFlowBar','width',flowBar+'%');setText('proFlowSignal',incomeYield>=5?'ПАССИВНЫЙ ДВИГАТЕЛЬ РАБОТАЕТ':'ПОТОК СТАБИЛЬНО ПОДАЁТСЯ');
  const pBar=clamp(p1/(p1+m1)*100,18,82);setStyle('proBattlePortfolio','width',pBar+'%');setStyle('proBattleMoex','width',(100-pBar)+'%');setText('proBattleTitle',vs>=0?'ПОРТФЕЛЬ ВПЕРЕДИ':'ДОГОНЯЕМ IMOEX');setText('proBattleP',`${pr>=0?'+':''}${pr.toFixed(1).replace('.',',')}%`);setText('proBattleM',`${mr>=0?'+':''}${mr.toFixed(1).replace('.',',')}%`);
  const c=d?.cbr||{};setText('proRate',Number.isFinite(Number(c.rate))?`${Number(c.rate).toFixed(2).replace('.',',')}%`:'—');setText('proRateDate',c.rateDate?`с ${shortDate(c.rateDate)}`:'Банк России');setText('proMeeting',c.nextMeeting?shortDate(c.nextMeeting):'—');
  setText('proFooterText',incomeYield>=5?'ДЕНЕЖНЫЙ ПОТОК СИЛЬНЫЙ':dd>=8?'ПЕРЕЖИЛИ ПРОСАДКУ':'ДЕНЬГИ РАБОТАЮТ');
  document.body.dataset.proRisk=risk>=70?'high':risk>=40?'mid':'low';
}
function enterPro(){
  if(pulseMode)exitPulse();
  proMode=true;document.body.classList.add('pro-active');$('proView')?.setAttribute('aria-hidden','false');$('proBtn')?.classList.add('active');
  setText('proBtn','TERMINAL');
  if(dashboardData)proRender(dashboardData);
}
function exitPro(){proMode=false;document.body.classList.remove('pro-active');$('proView')?.setAttribute('aria-hidden','true');$('proBtn')?.classList.remove('active');setText('proBtn','PRO');}
function togglePro(){proMode?exitPro():enterPro();}
$('proBtn')?.addEventListener('click',togglePro);$('proBack')?.addEventListener('click',exitPro);

let pulseMode=false;
let pulseLongTimer=null;
let pulseScanToken=0;

function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function classifyPulseAsset(a){
  const type=String(a?.instrumentType||a?.type||'').toLowerCase();
  const ticker=String(a?.ticker||'').toUpperCase();
  const name=String(a?.name||'').toLowerCase();
  if(type.includes('bond') || /^SU\d/.test(ticker) || /^RU000A/.test(ticker) || /офз|облигац/.test(name)) return 'bonds';
  if(type.includes('etf') || type.includes('fund') || /tmon|ликвидн|денежн.*рын/.test(`${ticker} ${name}`.toLowerCase())) return 'reserve';
  if(type.includes('currency') || type.includes('cash')) return 'reserve';
  if(type.includes('share') || type.includes('stock')) return 'stocks';
  return 'stocks';
}
function pulseStats(d){
  const s=window.__shieldDNA||{};
  const assets=Array.isArray(d?.assets)?d.assets:(Array.isArray(d?.portfolio?.assets)?d.portfolio.assets:[]);
  const total=Number(d?.portfolio?.value)||assets.reduce((z,a)=>z+Math.max(0,Number(a?.currentValue)||0),0)||1;
  const byValue=[...assets].filter(a=>(Number(a?.currentValue)||0)>0).sort((a,b)=>(Number(b.currentValue)||0)-(Number(a.currentValue)||0));
  const weights=byValue.map(a=>Math.max(0,Number(a.currentValue)||0)/total*100);
  const assetResult=a=>Number.isFinite(Number(a?.yieldRub))?Number(a.yieldRub):Number(a?.expectedYield)||0;
  const byResult=[...byValue].sort((a,b)=>assetResult(b)-assetResult(a));
  const strength=byResult[0]||null,painAsset=byResult[byResult.length-1]||null;
  const alloc=s.allocation||{},scores=s.scores||{},risk=s.risk||{},flow=s.flow||{};
  const stocksPct=Number(alloc.stocks)||0,bondsPct=Number(alloc.bonds)||0,reservePct=Number(alloc.reserve)||0,defensivePct=bondsPct+reservePct;
  const whale=byValue[0]||null,whaleWeight=Number(risk.largestWeight)||weights[0]||0;
  const maxDD=Number(risk.drawdown)||0,riskScore=Number(scores.risk)||0,balanceScore=Number(scores.balance)||0,flowScore=Number(scores.flow)||0;
  const node=(level,text)=>({level,text});
  return {pts:[],p1:100,m1:100,total,pReturn:0,mReturn:0,activeReturn:0,maxDD,peak:100,trough:100,recovery:100,momentum:50,flowBar:flowScore,whale,whaleWeight,strength,painAsset,strengthTicker:strength?(strength.ticker||strength.name||'—'):'—',painTicker:painAsset?(painAsset.ticker||painAsset.name||'—'):'—',strengthYield:assetResult(strength),painYield:assetResult(painAsset),riskLabel:risk.label||'—',riskScore,monthly:Number(flow.monthly)||0,incomeYield:Number(flow.yieldPct)||0,flowScore,score:Number(s.score)||0,dnaBase:Number(s.score)||0,ageDays:null,pulseBeat:s.coreStatus||'SERVER',dnaIncome:flowScore,dnaStability:Number(scores.stability)||0,dnaGrowth:Number(scores.growth)||0,dnaDivers:Number(scores.diversification)||0,dnaBalance:balanceScore,dnaConcentration:Number(scores.concentration)||0,diagnosisTitle:s.diagnosis?.title||'SERVER DNA',diagnosisText:s.diagnosis?.text||'Защищённый расчёт загружается с сервера.',vol:0,diversified:Number(s.portfolio?.assets)||byValue.length,dnaVerdict:s.verdict||'SERVER DNA',weights,byValue,stocksPct,bondsPct,reservePct,defensivePct,balanceScore,balanceGap:Math.abs(stocksPct-defensivePct),concentrationRisk:Math.max(0,100-(Number(scores.concentration)||0)),concentrationScore:Number(scores.concentration)||0,allocationState:Math.abs(stocksPct-defensivePct)<8?'ПОЧТИ 50 / 50':'БАЛАНС СМЕЩЁН',effectiveN:Number(s.portfolio?.effectivePositions)||0,concentrationNode:node(whaleWeight>=30?'HIGH':whaleWeight>=22?'WATCH':'OK',`${whaleWeight.toFixed(1).replace('.',',')}%`),balanceNode:node(Math.abs(stocksPct-defensivePct)>=30?'HIGH':Math.abs(stocksPct-defensivePct)>=16?'WATCH':'OK',`${stocksPct.toFixed(0)} / ${defensivePct.toFixed(0)}`),drawdownNode:node(maxDD>=15?'HIGH':maxDD>=8?'WATCH':'OK',`−${maxDD.toFixed(1).replace('.',',')}%`),assetResult};
}
function drawPulsePath(key,pts){
  const a=pts.map(x=>Number(x?.[key])).filter(v=>Number.isFinite(v)&&v>0);
  if(a.length<2)return '';
  const min=Math.min(...a),max=Math.max(...a),span=Math.max(0.0001,max-min);
  return a.map((v,i)=>{const x=(i/(a.length-1))*600;const y=10+(1-(v-min)/span)*80;return (i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}).join(' ');
}
function enterPulse(){
  const root=$('pulse'),shot=$('pulseShot'),d=dashboardData||{};
  root.classList.remove('is-scanning');
  ['scanRow1','scanRow2','scanRow3'].forEach(id=>$(id)?.classList.remove('done'));
  setStyle('pulseScanProgress','width','0%'); setText('scanPct','0%'); setText('scanSignal','WAIT'); setText('scanFlux','—'); setText('scanRisk','—'); setText('pulseScanSub','Считываем распределение и риски…');
  const st=pulseStats(d);
  setText('pulseScore',String(st.score));
  setText('pulseCoreStatus',st.score>=80?'STRONG':(st.score>=65?'BALANCED':(st.score>=50?'ONLINE':'WATCH')));
  setText('pulseBalanceScore',String(st.balanceScore)); setText('pulseRiskScore',String(st.riskScore)); setText('pulseFlowScore',String(st.flowScore));
  setText('riskScore',String(st.riskScore)); setText('riskLabel',st.riskLabel); setText('riskDrawdown',`−${st.maxDD.toFixed(1).replace('.',',')}%`); setText('riskConcentration',`${st.whaleWeight.toFixed(1).replace('.',',')}%`); setText('riskWhale',st.whale?(st.whale.ticker||st.whale.name||'—'):'—');
  setStyle('riskScore','color',st.riskScore>=65?'#ff7180':'');
  const dial=document.querySelector('.riskDial'); if(dial)dial.style.background=`conic-gradient(${st.riskScore>=65?'#ff7180':'var(--accent)'} ${st.riskScore*3.6}deg,rgba(255,255,255,.05) 0deg)`;
  setText('flowState',st.flowScore>=70?'ACTIVE':(st.flowScore>=45?'STABLE':'LOW')); setText('flowMonthly',Number.isFinite(st.monthly)?rub(st.monthly):'—'); setText('flowYield',`${st.incomeYield.toFixed(1).replace('.',',')}%`); setStyle('flowBar','width',`${st.flowBar}%`);
  const daily=Number.isFinite(st.monthly)?st.monthly/30.4375:NaN, annual=Number.isFinite(st.monthly)?st.monthly*12:NaN; setText('flowDaily',Number.isFinite(daily)?rub(daily):'—'); setText('flowAnnual',Number.isFinite(annual)?rub(annual):'—');

  setText('allocationState',st.allocationState); setText('allocStocks',`${st.stocksPct.toFixed(1).replace('.',',')}%`); setText('allocBonds',`${st.bondsPct.toFixed(1).replace('.',',')}%`); setText('allocReserve',`${st.reservePct.toFixed(1).replace('.',',')}%`);
  setStyle('allocStocksBar','width',`${st.stocksPct}%`); setStyle('allocBondsBar','width',`${st.bondsPct}%`); setStyle('allocReserveBar','width',`${st.reservePct}%`);
  setText('fieldCount',`${st.diversified} АКТИВОВ`); setText('fieldMessage',st.concentrationRisk>=55?'ЯДРО ПЕРЕГРУЖЕНО':(st.balanceScore>=80?'СТРУКТУРА РОВНАЯ':'СЛЕДИМ ЗА БАЛАНСОМ'));
  const field=$('assetField');
  if(field){
    field.innerHTML=''; const maxW=Math.max(...st.weights,1);
    st.byValue.slice(0,6).forEach((a,i)=>{const pctW=st.weights[i]||0,pnl=st.assetResult(a);const el=document.createElement('div');el.className='assetBar';const pnlText=Number.isFinite(pnl)?`${pnl>=0?'+':''}${new Intl.NumberFormat('ru-RU',{notation:'compact',maximumFractionDigits:1}).format(pnl)}₽`:'—';el.innerHTML=`<span>${i+1}</span><b>${escapeHtml(a.ticker||a.name||'—')}</b><i><em style="width:${clamp(pctW/maxW*100,3,100)}%"></em></i><strong>${pctW.toFixed(1).replace('.',',')}%</strong><small class="${pnl<0?'neg':pnl>0?'pos':''}">${pnlText}</small>`;field.appendChild(el);});
  }

  const nodes=[['nodeConcentration','nodeConcentrationText',st.concentrationNode],['nodeBalance','nodeBalanceText',st.balanceNode],['nodeDrawdown','nodeDrawdownText',st.drawdownNode]];
  for(const [id,textId,node] of nodes){const b=$(id),box=b?.closest('.riskNode');setText(id,node.level);setText(textId,node.text);if(box)box.dataset.level=node.level.toLowerCase();}

  setText('dnaVerdict',st.dnaVerdict);
  const dna=[['dnaBalance2','dnaBalanceVal2',st.dnaBalance],['dnaConcentration2','dnaConcentrationVal2',st.dnaConcentration],['dnaStability2','dnaStabilityVal2',st.dnaStability],['dnaIncome2','dnaIncomeVal2',st.dnaIncome],['dnaGrowth2','dnaGrowthVal2',st.dnaGrowth],['dnaDivers2','dnaDiversVal2',st.dnaDivers]];
  for(const [bar,val,n] of dna){setStyle(bar,'width',`${n}%`);setText(val,`${n}`);}
  setText('pulseDiagnosisTitle',st.diagnosisTitle); setText('pulseDiagnosisText',st.diagnosisText); root.dataset.pulseRisk=(st.riskLabel||'').toLowerCase();
  setStyle('scoreRing','background','conic-gradient(var(--accent) 0deg,rgba(255,255,255,.07) 0deg)'); requestAnimationFrame(()=>setStyle('scoreRing','background',`conic-gradient(var(--accent) ${st.score*3.6}deg,rgba(255,255,255,.07) 0deg)`));
  setText('pulseCommandText','TAP CORE ↻ RESCAN'); setText('pulseTime',new Date().toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}));
  root.classList.add('pulse-capture');shot.setAttribute('aria-hidden','false');pulseMode=true;setText('pulseBtn','✕ PULSE');document.body.classList.add('pulse-active');runPulseScan(st);
}
function runPulseScan(st){
  const token=++pulseScanToken;
  const root=$('pulse'), progress=$('pulseScanProgress'), sub=$('pulseScanSub');
  if(!root||!progress)return;
  root.classList.add('is-scanning');
  const steps=[
    [180,18,'Разделяем акции, облигации и резерв…','scanRow1'],
    [470,46,'Проверяем концентрацию, просадку и поток…','scanRow2'],
    [760,76,'Собираем шесть генов Portfolio DNA…','scanRow3'],
    [1080,100,'Формируем структурный диагноз…',null]
  ];
  steps.forEach(([delay,pct,msg,id])=>setTimeout(()=>{
    if(!pulseMode || token!==pulseScanToken)return;
    setStyle('pulseScanProgress','width',pct+'%');
    setText('scanPct',pct+'%');
    const signal = pct < 46 ? 'SCAN' : pct < 76 ? 'LOCK' : 'LIVE';
    const flux = pct < 46 ? 'SEARCH' : (Number.isFinite(st?.monthly)?rub(st.monthly)+'/M':'SYNC');
    const risk = pct < 46 ? 'CALC' : (st?.riskLabel||'—');
    setText('scanSignal',signal); setText('scanFlux',flux); setText('scanRisk',risk);
    setText('pulseScanSub',msg);
    if(id)$(id)?.classList.add('done');
  },delay));
  setTimeout(()=>{
    if(!pulseMode || token!==pulseScanToken)return;
    setStyle('pulseScanProgress','width','100%'); setText('scanPct','100%');
    setText('scanSignal','LOCKED'); setText('scanFlux',Number.isFinite(st?.monthly)?rub(st.monthly)+'/M':'LIVE'); setText('scanRisk',st?.riskLabel||'—');
    setText('pulseScanSub','СКАН ГОТОВ');
    setTimeout(()=>{ if(!pulseMode || token!==pulseScanToken)return; root.classList.remove('is-scanning'); animatePulseScore(st?.score||0); },220);
  },1320);
}
function animatePulseScore(target){
  const el=$('pulseScore');
  if(!el)return;
  const start=0, duration=650, t0=performance.now();
  const tick=(now)=>{
    const k=clamp((now-t0)/duration,0,1), e=1-Math.pow(1-k,3), n=Math.round(start+(target-start)*e);
    setText('pulseScore',String(n));
    if(k<1)requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
$('scoreRing')?.addEventListener('click',()=>{
  if(!pulseMode || !dashboardData) return;
  runPulseScan(pulseStats(dashboardData));
});
$('scoreRing')?.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('scoreRing').click();}});

function exitPulse(){
  const root=$('pulse'),shot=$('pulseShot');pulseScanToken++;root.classList.remove('pulse-capture','is-scanning');shot.setAttribute('aria-hidden','true');pulseMode=false;
  setText('pulseBtn','PULSE');document.body.classList.remove('pulse-active');
}
function togglePulse(e){if(e){e.preventDefault();e.stopPropagation();}pulseMode?exitPulse():enterPulse();}
$('pulseBtn').addEventListener('click',togglePulse);
$('pulseExitBtn')?.addEventListener('click',togglePulse);
$('pulseBack')?.addEventListener('click',togglePulse);

// Long press on PULSE opens the same Röntgen view with a subtle "deep" state for power users.
$('pulseBtn').addEventListener('pointerdown',()=>{pulseLongTimer=setTimeout(()=>{if(!pulseMode)enterPulse();$('pulseShot').classList.add('deep-pulse');},650);});
['pointerup','pointercancel','pointerleave'].forEach(ev=>$('pulseBtn').addEventListener(ev,()=>{if(pulseLongTimer){clearTimeout(pulseLongTimer);pulseLongTimer=null;}}));

load();setInterval(load,60000);

// v6.4 — FUND INTEL UI
let intelData=null;
let intelLoading=false;
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function intelAgo(iso){const ms=Date.now()-new Date(iso).getTime();if(!Number.isFinite(ms)||ms<0)return 'сейчас';const h=Math.floor(ms/3600000);if(h<1)return 'меньше часа назад';if(h<24)return `${h} ч назад`;return `${Math.floor(h/24)} дн назад`;}
function intelOpen(){const modal=$('intelModal');if(!modal)return;modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(intelData)renderIntel(intelData);else loadIntel();}
function intelClose(){const modal=$('intelModal');if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
function intelImpactLabel(item){
  const imp=Number(item?.importance)||0;
  if(imp>=70)return 'ВЫСОКОЕ';
  if(imp>=45)return 'СРЕДНЕЕ';
  return 'НИЗКОЕ';
}
function intelMemory(items){const key='kriaht_intel_memory_v1';let prev={};try{prev=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}const now={},changes={};for(const x of items){const k=String(x.ticker||x.name||'').toUpperCase();if(!k)continue;now[k]={status:x.status,sentiment:x.sentiment,at:Date.now()};const old=prev[k];if(old&&old.status&&old.status!==x.status)changes[k]=`${old.status} → ${x.status}`;}try{localStorage.setItem(key,JSON.stringify(now))}catch{}return changes;}
function renderIntel(data){
  intelData=data||{}; const list=$('intelList'),summary=$('intelSummary'),stats=$('intelStats');
  if(summary)summary.textContent=data?.summary||'Новости по портфелю пока недоступны.';
  if($('intelUpdated'))setText('intelUpdated',data?.generatedAt?`ОБНОВЛЕНО ${new Date(data.generatedAt).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}`:'LIVE');
  const items=Array.isArray(data?.items)?data.items:[],quiet=Array.isArray(data?.quiet)?data.quiet:[],d=data?.diagnosis||{},changes=intelMemory(items);
  const panel=$('intelPanel');if(panel)panel.classList.toggle('quietMode',!items.length);
  const watchCount=d.watch??quiet.filter(x=>x.status==='НАБЛЮДАЕМ').length,quietCount=d.quiet??quiet.filter(x=>x.status!=='НАБЛЮДАЕМ').length;
  if(stats)stats.innerHTML=`<span><b>${d.events??items.length}</b> СОБЫТИЙ</span><span class="${d.critical?'hot':''}"><b>${d.critical??0}</b> КРИТИЧНЫХ</span><span class="${watchCount?'good':''}"><b>${watchCount}</b> НАБЛЮДАЕМ</span><span><b>${quietCount}</b> ТИХО</span><span class="major"><b>${escapeHtml(d.largestPosition||d.mainFactor||'—')}</b> КРУПНЕЙШАЯ</span>`;
  if(!list)return;if(!items.length){const q=quiet.map(x=>{const watch=x.status==='НАБЛЮДАЕМ';return `<span class="${watch?'watch':'quiet'}"><b>${escapeHtml(x.ticker||x.name||'—')}</b><i>${watch?'НАБЛЮДАЕМ':'ТИХО'} · ${Number(x.weight||0).toFixed(1).replace('.',',')}%</i></span>`}).join('');list.innerHTML='<div class="intelEmpty"><b>НОВОСТНОЙ ФОН ЧИСТЫЙ</b><span>Подтверждённых событий за 72 часа нет. Шум в основной INTEL не попал.</span></div>'+(q?`<section class="intelAttention"><div><b>КАРТА СОСТОЯНИЙ</b><small>НАБЛЮДАЕМ = материал есть, но факта пока недостаточно</small></div><div class="intelAttentionGrid">${q}</div></section>`:'');return;}
  const cards=items.map((item,idx)=>{const cls=['pos','neg','neu'].includes(item.sentimentClass)?item.sentimentClass:'neu',confidence=Math.max(1,Math.min(100,Number(item.confidence)||50)),sc=item.scenarios||{},sources=Array.isArray(item.sources)?item.sources:[],ticker=String(item.ticker||item.name||'—').toUpperCase(),memory=changes[ticker];return `<article class="intelItem${idx===0?' featured':''}"><div class="intelItemTop"><div class="intelTickerWrap"><span class="intelTicker">${escapeHtml(ticker)}</span><span class="intelImpact ${cls}">${escapeHtml(item.status||'НАБЛЮДАТЬ')}</span></div><span class="intelTag ${cls}">${escapeHtml(item.sentiment||'БЕЗ СДВИГА')}</span></div><div class="intelEventLine"><span>${escapeHtml(item.eventType||'СОБЫТИЕ')} · ${escapeHtml(item.qualityLevel||'СИГНАЛ')} ${Number(item.qualityScore||0)}% · ФАКТ ${Number(item.understandingScore||0)}%</span><b>СИЛА ДЛЯ ПОРТФЕЛЯ ${Number(item.strength||0).toFixed(1).replace('.',',')} / 10</b></div>${memory?`<div class="intelMemory">СЛЕД СОБЫТИЯ · ${escapeHtml(memory)}</div>`:''}<div class="intelTitle">${escapeHtml(item.title||'Без заголовка')}</div><div class="intelMeta"><span>${Number(item.weight||0).toFixed(1).replace('.',',')}% портфеля · ${item.stories||1} ист.</span><span>${escapeHtml(intelAgo(item.publishedAt))}</span><span>${escapeHtml(item.horizon||'долгосрок')}</span></div><div class="intelWhyBlock"><b>ЧТО ПРОИЗОШЛО</b><span>${escapeHtml(item.whatChanged||item.title||'')}</span></div><div class="intelWhyBlock meaning"><b>ПОЧЕМУ ЭТО ВАЖНО</b><span>${escapeHtml(item.meaning||'')}</span></div><div class="intelChain"><b>ЦЕПОЧКА ВЛИЯНИЯ</b><span>${escapeHtml(item.chain||'Событие → компания → портфель')}</span></div><div class="intelScenarios"><div class="intelScenario base"><i>●</i><div><b>БАЗОВЫЙ</b><span>${escapeHtml(sc.base||'Текущий сценарий сохраняется.')}</span></div></div><div class="intelScenario bull"><i>▲</i><div><b>УСИЛЕНИЕ</b><span>${escapeHtml(sc.bull||'Фактор развивается лучше базового сценария.')}</span></div></div><div class="intelScenario bear"><i>▼</i><div><b>РИСК</b><span>${escapeHtml(sc.bear||'Фактор развивается хуже базового сценария.')}</span></div></div></div><div class="intelBreaker"><b>ЧТО ИЗМЕНИТ ОЦЕНКУ</b><span>${escapeHtml(item.thesisBreaker||'Новые подтверждённые данные компании.')}</span></div><div class="intelVerdict"><div><small>СТАТУС НАБЛЮДЕНИЯ</small><b>${escapeHtml(item.status||'НАБЛЮДАТЬ')}</b></div><div class="intelConfidence"><small>НАДЁЖНОСТЬ ДАННЫХ</small><strong>${confidence}%</strong><i><em style="width:${confidence}%"></em></i></div></div><a class="intelSource" href="${escapeHtml(item.link||'#')}" target="_blank" rel="noopener noreferrer"><span>↗ ${escapeHtml(item.source||'Источник')}${sources.length>1?` + ещё ${sources.length-1}`:''}</span><b>ОТКРЫТЬ ИСТОЧНИК</b></a></article>`}).join('');
  const map=items.map(x=>{const c=['pos','neg','neu'].includes(x.sentimentClass)?x.sentimentClass:'neu';return `<span class="${c}"><b>${escapeHtml(x.ticker||x.name||'—')}</b><i>${escapeHtml(x.status||'ФОН')}</i></span>`}).join('')+quiet.map(x=>{const watch=x.status==='НАБЛЮДАЕМ';return `<span class="${watch?'watch':'quiet'}"><b>${escapeHtml(x.ticker||x.name||'—')}</b><i>${watch?'НАБЛЮДАЕМ':'ТИХО'}</i></span>`}).join('');
  list.innerHTML=cards+`<section class="intelAttention"><div><b>КАРТА ВНИМАНИЯ</b><small>Срез факторов по портфелю сейчас</small></div><div class="intelAttentionGrid">${map}</div></section>`;
}
async function loadIntel(force=false){
  if(intelLoading)return;
  if(intelData&&!force){renderIntel(intelData);return;}
  intelLoading=true;
  const list=$('intelList');if(list)list.innerHTML='<div class="intelLoading">✦ СКАНИРУЮ НОВОСТИ ПО ТВОИМ ПОЗИЦИЯМ…</div>';
  if($('intelSummary'))setText('intelSummary','Смотрю сначала на самые крупные позиции и события за последние 72 часа.');
  try{
    const r=await fetch('/api/intel?v=7.0&t='+Date.now(),{cache:'no-store'});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error||`HTTP ${r.status}`);
    renderIntel(d);
  }catch(e){
    console.error('Intel error:',e);
    if($('intelSummary'))setText('intelSummary','Не удалось получить ленту новостей. Можно повторить обновление.');
    if(list)list.innerHTML='<div class="intelEmpty">Новости временно недоступны.<br>Нажми «ОБНОВИТЬ» и попробуем ещё раз.</div>';
  }finally{intelLoading=false;}
}
$('intelBtn')?.addEventListener('click',intelOpen);
$('intelClose')?.addEventListener('click',intelClose);
$('intelBackdrop')?.addEventListener('click',intelClose);
$('intelRefresh')?.addEventListener('click',()=>loadIntel(true));
document.addEventListener('keydown',e=>{if(e.key==='Escape')intelClose();});
