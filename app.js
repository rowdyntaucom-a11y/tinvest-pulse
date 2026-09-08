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
async function load(){try{const r=await fetch('/api/dashboard?v=6.2&t='+Date.now(),{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||`HTTP ${r.status}`);render(d);}catch(e){console.error(e);setText('status','Ошибка: '+e.message);setText('hudPulseState','ERR');const statusEl=$('status');if(statusEl)statusEl.className='err';setText('value','Нет данных');}}


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
function pulseStats(d){
  const p=d?.portfolio||{};
  const pts=Array.isArray(d?.history?.points)?d.history.points:[];
  const ps=pts.map(x=>Number(x?.portfolio)).filter(v=>Number.isFinite(v)&&v>0);
  const ms=pts.map(x=>Number(x?.imoex)).filter(v=>Number.isFinite(v)&&v>0);
  const p0=ps[0]||100, p1=ps[ps.length-1]||p0, m0=ms[0]||100, m1=ms[ms.length-1]||m0;
  const pReturn=(p1/p0-1)*100, mReturn=(m1/m0-1)*100;
  let peak=p0,maxDD=0;
  for(const v of ps){peak=Math.max(peak,v);if(peak>0)maxDD=Math.max(maxDD,(peak-v)/peak*100);}
  const daily=[];
  for(let i=1;i<ps.length;i++){if(ps[i-1]>0)daily.push((ps[i]/ps[i-1]-1)*100);}
  const avg=daily.length?daily.reduce((a,b)=>a+b,0)/daily.length:0;
  const vol=daily.length>1?Math.sqrt(daily.reduce((a,b)=>a+(b-avg)**2,0)/(daily.length-1)):0;
  const assets=Array.isArray(d?.assets)?d.assets:((Array.isArray(p.assets)?p.assets:[]));
  const total=Number(p.value)||0;
  const byValue=[...assets].sort((a,b)=>(Number(b.currentValue)||0)-(Number(a.currentValue)||0));
  const whale=byValue[0];
  const weights=byValue.map(a=>total>0?Math.max(0,Number(a.currentValue)||0)/total*100:0);
  const whaleWeight=weights[0]||0;
  const hhi=weights.reduce((sum,w)=>sum+w*w,0);
  const concentration=clamp(Math.round(hhi),0,100);
  const breadth=assets.length?clamp(Math.round(100-(Math.max(0,whaleWeight-10)*1.7)),18,100):0;
  const assetResult=a=>Number.isFinite(Number(a?.yieldRub))?Number(a.yieldRub):Number(a?.expectedYield)||0;
  const byResult=[...assets].sort((a,b)=>assetResult(b)-assetResult(a));
  const strength=byResult[0];
  const painAsset=byResult[byResult.length-1];
  const monthly=Number(d?.passiveIncome?.averageMonthly);
  const incomeYield=Number.isFinite(monthly)&&total>0?(monthly*12/total*100):0;
  const ageDays=p.startDate?Math.max(0,Math.round((Date.now()-new Date(p.startDate).getTime())/86400000)):null;
  const pulseBeat=pReturn>=0?'ЖИВОЙ':'КРЯХТИТ';
  const totalBase=p1+m1;
  const pBar=totalBase>0?clamp(p1/totalBase*100,18,82):50;
  const dnaIncome=clamp(Math.round(35 + incomeYield*7.5),0,100);
  const dnaStability=clamp(Math.round(88 - maxDD*5.2 - vol*4),18,100);
  const dnaGrowth=clamp(Math.round(48 + pReturn*4 + (pReturn-mReturn)*2),0,100);
  const dnaDivers=clamp(Math.round(38 + Math.min(15,Math.max(0,assets.length-1))*3.2),0,100);
  const dnaBase=(dnaIncome*.30)+(dnaStability*.25)+(dnaGrowth*.30)+(dnaDivers*.15);
  const marketAdj=clamp((pReturn-mReturn)*1.2,-8,8);
  const score=clamp(Math.round(dnaBase+marketAdj),0,100);
  const riskScore=clamp(Math.round(maxDD*4.8 + Math.max(0,whaleWeight-12)*1.6 + vol*6),0,100);
  const riskLabel=riskScore>=65?'ВЫСОКИЙ':(riskScore>=35?'УМЕРЕННЫЙ':'НИЗКИЙ');
  const flowScore=clamp(Math.round(35+incomeYield*11+(monthly>0?15:0)),0,100);
  const strengthTicker=strength?(strength.ticker||strength.name||'—'):'—';
  const painTicker=painAsset?(painAsset.ticker||painAsset.name||'—'):'—';
  const strengthYield=Number(strength?.expectedYield)||0;
  const painYield=Number(painAsset?.expectedYield)||0;
  let diagnosisTitle='ПУЛЬС СТАБИЛЬНЫЙ';
  let diagnosisText=`Структура собрана. Поток ${rub(monthly)}/мес. Риск: ${riskLabel.toLowerCase()}.`;
  if(riskScore>=65){diagnosisTitle='КОНТУР НАПРЯЖЁН';diagnosisText=`Главная уязвимость — концентрация ${whaleWeight.toFixed(1).replace('.',',')}% в ${whale?.ticker||whale?.name||'крупнейшей позиции'}.`}
  else if(incomeYield>=5){diagnosisTitle='ДЕНЕЖНЫЙ ДВИГАТЕЛЬ';diagnosisText=`Пассивный поток ${rub(monthly)}/мес. уже заметен в структуре портфеля.`}
  else if(pReturn-mReturn>=2){diagnosisTitle='ИМПУЛЬС ПОЙМАН';diagnosisText=`Портфель набирает ход относительно рынка. Сигнал роста активен.`}
  else if(pReturn-mReturn<=-4){diagnosisTitle='РЕЖИМ ДОГОНА';diagnosisText=`Индекс впереди. Внутри портфеля есть зона давления — ${painTicker}.`}
  else if(recovery>75){diagnosisTitle='ВОССТАНОВЛЕНИЕ';diagnosisText=`Портфель возвращается от локального дна. Система держит нагрузку.`}
  const trough=ps.length?Math.min(...ps):p1;
  const recovery=(p1>trough && peak>trough)?clamp((p1-trough)/(peak-trough)*100,0,100):100;
  const momentum=clamp(50+(pReturn-mReturn)*8,0,100);
  const flowBar=clamp(flowScore,8,100);
  const diversified=assets.filter(a=>(Number(a.currentValue)||0)>0).length;
  const dnaVerdict=dnaBase>=75?'СИЛЬНЫЙ ПРОФИЛЬ':(dnaBase>=55?'СБАЛАНСИРОВАН':'ТОЧКА РОСТА');
  return {pts,p1,m1,total,pReturn,mReturn,maxDD,peak,trough,recovery,momentum,flowBar,whale,whaleWeight,strength,painAsset,strengthTicker,painTicker,strengthYield,painYield,riskLabel,riskScore,monthly,incomeYield,flowScore,score,dnaBase,marketAdj,ageDays,pulseBeat,pBar,mBar:100-pBar,dnaIncome,dnaStability,dnaGrowth,dnaDivers,diagnosisTitle,diagnosisText,vol,concentration,breadth,diversified,dnaVerdict,weights,byValue};
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
  setStyle('pulseScanProgress','width','0%'); setText('scanPct','0%'); setText('scanSignal','WAIT'); setText('scanFlux','—'); setText('scanRisk','—'); setText('pulseScanSub','Считываем внутреннюю структуру…');
  const st=pulseStats(d);
  setText('pulseScore',String(st.score));
  setText('pulseCoreStatus',st.score>=70?'OPTIMAL':(st.score>=50?'ONLINE':'WATCH'));
  setText('pulseRiskScore',String(st.riskScore)); setText('pulseFlowScore',String(st.flowScore));
  setText('riskScore',String(st.riskScore)); setText('riskLabel',st.riskLabel); setText('riskDrawdown',`−${st.maxDD.toFixed(1).replace('.',',')}%`); setText('riskConcentration',`${st.whaleWeight.toFixed(1).replace('.',',')}%`); setText('riskWhale',st.whale?(st.whale.ticker||st.whale.name||'—'):'—');
  setText('flowState',st.flowScore>=70?'ACTIVE':(st.flowScore>=45?'STABLE':'LOW')); setText('flowMonthly',Number.isFinite(st.monthly)?rub(st.monthly):'—'); setText('flowYield',`${st.incomeYield.toFixed(1).replace('.',',')}%`); setStyle('flowBar','width',`${st.flowBar}%`);
  const daily=Number.isFinite(st.monthly)?st.monthly/30.4375:NaN; const annual=Number.isFinite(st.monthly)?st.monthly*12:NaN; setText('flowDaily',Number.isFinite(daily)?rub(daily):'—'); setText('flowAnnual',Number.isFinite(annual)?rub(annual):'—');
  setText('fieldCount',`${st.diversified} АКТИВОВ`); setText('fieldMessage',st.whaleWeight>=30?'КОНЦЕНТРАЦИЯ ВЫСОКАЯ':(st.diversified>=10?'СИГНАЛЫ СТАБИЛЬНЫ':'КОРЗИНА УЗКАЯ'));
  const field=$('assetField'); if(field){field.innerHTML=''; const maxW=Math.max(...st.weights,1); st.byValue.slice(0,6).forEach((a,i)=>{const w=Number(a.currentValue)||0;const weight=st.total?0:0; const pctW=st.weights[i]||0; const el=document.createElement('div');el.className='assetBar';el.innerHTML=`<span>${i+1}</span><b>${a.ticker||a.name||'—'}</b><i><em style="width:${clamp(pctW/maxW*100,3,100)}%"></em></i><strong>${pctW.toFixed(1).replace('.',',')}%</strong>`;field.appendChild(el);}); }
  setText('signalMomentum2',`${Math.round(st.momentum)}`); setStyle('signalMomentumBar2','width',`${st.momentum}%`); setText('signalMomentumText2',st.momentum>=65?'импульс вверх':(st.momentum>=45?'нейтрально':'давление'));
  setText('signalRecovery2',`${Math.round(st.recovery)}`); setStyle('signalRecoveryBar2','width',`${st.recovery}%`);
  setText('signalDivers2',`${Math.round(st.breadth)}`); setStyle('signalDiversBar2','width',`${st.breadth}%`); setText('signalDiversText2',`${st.diversified} позиций в корзине`);
  setText('signalFlow2',`${Math.round(st.flowScore)}`); setStyle('signalFlowBar2','width',`${st.flowScore}%`);
  setText('dnaVerdict',st.dnaVerdict);
  const dna=[['dnaIncome2','dnaIncomeVal2',st.dnaIncome],['dnaStability2','dnaStabilityVal2',st.dnaStability],['dnaGrowth2','dnaGrowthVal2',st.dnaGrowth],['dnaDivers2','dnaDiversVal2',st.dnaDivers]];
  for(const [bar,val,n] of dna){setStyle(bar,'width',`${n}%`);setText(val,`${n}`);}
  setText('pulseDiagnosisTitle',st.diagnosisTitle); setText('pulseDiagnosisText',st.diagnosisText); root.dataset.pulseRisk=(st.riskLabel||'').toLowerCase();
  setStyle('scoreRing','background',`conic-gradient(var(--accent) 0deg,rgba(255,255,255,.07) 0deg)`); requestAnimationFrame(()=>setStyle('scoreRing','background',`conic-gradient(var(--accent) ${st.score*3.6}deg,rgba(255,255,255,.07) 0deg)`));
  setText('pulseCommandText','TAP CORE ↻ RESCAN'); setText('pulseTime',new Date().toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}));
  root.classList.add('pulse-capture');shot.setAttribute('aria-hidden','false');pulseMode=true;setText('pulseBtn','✕ PULSE');document.body.classList.add('pulse-active');runPulseScan(st);
}
function runPulseScan(st){
  const token=++pulseScanToken;
  const root=$('pulse'), progress=$('pulseScanProgress'), sub=$('pulseScanSub');
  if(!root||!progress)return;
  root.classList.add('is-scanning');
  const steps=[
    [180,18,'Проверяем состав и вес активов…','scanRow1'],
    [470,46,'Сверяем динамику портфеля с IMOEX…','scanRow2'],
    [760,76,'Оцениваем денежный поток и просадку…','scanRow3'],
    [1080,100,'Формируем персональный диагноз…',null]
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
  if(stats)stats.innerHTML=`<span><b>${d.events??items.length}</b> СОБЫТИЙ</span><span class="${d.critical?'hot':''}"><b>${d.critical??0}</b> КРИТИЧНЫХ</span><span class="${d.attention?'hot':''}"><b>${d.attention??0}</b> ВНИМАНИЕ</span><span><b>${d.quiet??quiet.length}</b> ТИХО</span><span><b>${escapeHtml(d.mainFactor||'—')}</b> ФАКТОР</span>`;
  if(!list)return;if(!items.length){const q=quiet.map(x=>`<span class="quiet"><b>${escapeHtml(x.ticker||x.name||'—')}</b><i>ТИХО · ${Number(x.weight||0).toFixed(1).replace('.',',')}%</i></span>`).join('');list.innerHTML='<div class="intelEmpty">Значимых подтверждённых событий за последние 72 часа не найдено.<br>Это нормальный результат: система не заполняет экран шумом.</div>'+(q?`<section class="intelAttention"><div><b>ТИХИЕ ПОЗИЦИИ</b><small>Нет достаточно качественного события</small></div><div class="intelAttentionGrid">${q}</div></section>`:'');return;}
  const cards=items.map((item,idx)=>{const cls=['pos','neg','neu'].includes(item.sentimentClass)?item.sentimentClass:'neu',confidence=Math.max(1,Math.min(100,Number(item.confidence)||50)),sc=item.scenarios||{},sources=Array.isArray(item.sources)?item.sources:[],ticker=String(item.ticker||item.name||'—').toUpperCase(),memory=changes[ticker];return `<article class="intelItem${idx===0?' featured':''}"><div class="intelItemTop"><div class="intelTickerWrap"><span class="intelTicker">${escapeHtml(ticker)}</span><span class="intelImpact ${cls}">${escapeHtml(item.status||'НАБЛЮДАТЬ')}</span></div><span class="intelTag ${cls}">${escapeHtml(item.sentiment||'БЕЗ СДВИГА')}</span></div><div class="intelEventLine"><span>${escapeHtml(item.eventType||'СОБЫТИЕ')} · ${escapeHtml(item.qualityLevel||'СИГНАЛ')} ${Number(item.qualityScore||0)}%</span><b>СИЛА ДЛЯ ПОРТФЕЛЯ ${Number(item.strength||0).toFixed(1).replace('.',',')} / 10</b></div>${memory?`<div class="intelMemory">СЛЕД СОБЫТИЯ · ${escapeHtml(memory)}</div>`:''}<div class="intelTitle">${escapeHtml(item.title||'Без заголовка')}</div><div class="intelMeta"><span>${Number(item.weight||0).toFixed(1).replace('.',',')}% портфеля · ${item.stories||1} ист.</span><span>${escapeHtml(intelAgo(item.publishedAt))}</span><span>${escapeHtml(item.horizon||'долгосрок')}</span></div><div class="intelWhyBlock"><b>ЧТО ПРОИЗОШЛО</b><span>${escapeHtml(item.whatChanged||item.title||'')}</span></div><div class="intelWhyBlock meaning"><b>ПОЧЕМУ ЭТО ВАЖНО</b><span>${escapeHtml(item.meaning||'')}</span></div><div class="intelChain"><b>ЦЕПОЧКА ВЛИЯНИЯ</b><span>${escapeHtml(item.chain||'Событие → компания → портфель')}</span></div><div class="intelScenarios"><div class="intelScenario base"><i>●</i><div><b>БАЗОВЫЙ</b><span>${escapeHtml(sc.base||'Текущий сценарий сохраняется.')}</span></div></div><div class="intelScenario bull"><i>▲</i><div><b>УСИЛЕНИЕ</b><span>${escapeHtml(sc.bull||'Фактор развивается лучше базового сценария.')}</span></div></div><div class="intelScenario bear"><i>▼</i><div><b>РИСК</b><span>${escapeHtml(sc.bear||'Фактор развивается хуже базового сценария.')}</span></div></div></div><div class="intelBreaker"><b>ЧТО ИЗМЕНИТ ОЦЕНКУ</b><span>${escapeHtml(item.thesisBreaker||'Новые подтверждённые данные компании.')}</span></div><div class="intelVerdict"><div><small>СТАТУС НАБЛЮДЕНИЯ</small><b>${escapeHtml(item.status||'НАБЛЮДАТЬ')}</b></div><div class="intelConfidence"><small>НАДЁЖНОСТЬ ДАННЫХ</small><strong>${confidence}%</strong><i><em style="width:${confidence}%"></em></i></div></div><a class="intelSource" href="${escapeHtml(item.link||'#')}" target="_blank" rel="noopener noreferrer"><span>↗ ${escapeHtml(item.source||'Источник')}${sources.length>1?` + ещё ${sources.length-1}`:''}</span><b>ОТКРЫТЬ ИСТОЧНИК</b></a></article>`}).join('');
  const map=items.map(x=>{const c=['pos','neg','neu'].includes(x.sentimentClass)?x.sentimentClass:'neu';return `<span class="${c}"><b>${escapeHtml(x.ticker||x.name||'—')}</b><i>${escapeHtml(x.status||'ФОН')}</i></span>`}).join('')+quiet.map(x=>`<span class="quiet"><b>${escapeHtml(x.ticker||x.name||'—')}</b><i>ТИХО</i></span>`).join('');
  list.innerHTML=cards+`<section class="intelAttention"><div><b>КАРТА ВНИМАНИЯ</b><small>Срез факторов по портфелю сейчас</small></div><div class="intelAttentionGrid">${map}</div></section>`;
}
async function loadIntel(force=false){
  if(intelLoading)return;
  if(intelData&&!force){renderIntel(intelData);return;}
  intelLoading=true;
  const list=$('intelList');if(list)list.innerHTML='<div class="intelLoading">✦ СКАНИРУЮ НОВОСТИ ПО ТВОИМ ПОЗИЦИЯМ…</div>';
  if($('intelSummary'))setText('intelSummary','Смотрю сначала на самые крупные позиции и события за последние 72 часа.');
  try{
    const r=await fetch('/api/intel?v=6.8&t='+Date.now(),{cache:'no-store'});
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
