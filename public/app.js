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
  setText('value',rub(p.value));
  setText('profit',rub(p.profit));
  setText('profitPct',p.profitPercent==null?'—':pct(p.profitPercent));
  setText('gain',p.profitPercent==null?'—':(p.profitPercent>=0?'+':'')+pct(p.profitPercent));
  const gainEl=setStyle('gain','color',p.profitPercent>=0?'var(--accent)':'#ff6575');
  if(gainEl) gainEl.setAttribute('data-ready','1');
  setText('cagr',p.cagr==null?'—':pct(p.cagr));
  setText('xirr',p.xirr==null?'—':pct(p.xirr));

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
  setText('vsMoex',vs==null?'—':`${vs>=0?'+':''}${vs.toFixed(2).replace('.',',')} п.п.`);
  setStyle('vsMoex','color',vs==null?'#fff':(vs>=0?'var(--accent)':'#ff6575'));
  setText('vsMoexCaption',vs==null?'ждём индекс':(vs>=0?'обгоняем индекс':'отстаём от индекса'));
  const badge=vs==null?'НЕ СИДИМ':(vs>=0?'ОБГОНЯЕМ':'ДОГОНЯЕМ');
  setText('chartBadge',badge);
  setText('dates',`Начало: ${shortDate(p.startDate)} • Сегодня: ${shortDate(new Date())}`);

  const monthly=Number(dashboardData.passiveIncome?.averageMonthly ?? dashboardData.income?.monthly);
  setText('monthly',rub(monthly));
  setText('daily',Number.isFinite(monthly)?rub(monthly/30.4375):'—');
  setText('annual',Number.isFinite(monthly)?rub(monthly*12):'—');

  const c=dashboardData.cbr||{};
  setText('keyRate',Number.isFinite(Number(c.rate))&&Number(c.rate)>0?`${Number(c.rate).toFixed(2).replace('.',',')}%`:'—');
  setText('keyRateDate',c.rateDate?`с ${shortDate(c.rateDate)}`:'Банк России');
  setText('nextMeeting',c.nextMeeting?shortDate(c.nextMeeting):'—');

  const g=dashboardData.leaders?.gainers?.[0], l=dashboardData.leaders?.losers?.[0];
  setText('gainer',g?`${g.ticker||g.name} ${g.yieldRub>=0?'+':''}${rub(g.yieldRub)}`:'—');
  setText('loser',l?`${l.ticker||l.name} ${l.yieldRub>=0?'+':''}${rub(l.yieldRub)}`:'—');
  setText('status',`✓ Данные загружены • ${dashboardData.assets?.length||p.assets?.length||0} активов`);
  const statusEl=$('status');if(statusEl)statusEl.className='ok';
  setText('updated',new Date(dashboardData.updatedAt||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}));
  try{renderChart(dashboardData.history||{});}catch(err){
    console.error('Chart render error:',err);
    const empty=$('chartEmpty');if(empty){empty.textContent='История временно недоступна';empty.style.display='flex';}
  }
}
document.querySelectorAll('.chartTab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.chartTab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  chartMode=btn.dataset.mode||'growth';
  if(dashboardData)renderChart(dashboardData.history);
}));
async function load(){try{const r=await fetch('/api/dashboard?v=5.0&t='+Date.now(),{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||`HTTP ${r.status}`);render(d);}catch(e){console.error(e);setText('status','Ошибка: '+e.message);const statusEl=$('status');if(statusEl)statusEl.className='err';setText('value','Нет данных');}}
let pulseMode=false;
let pulseLongTimer=null;

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
  const assets=Array.isArray(d?.assets)?d.assets:((Array.isArray(p.assets)?p.assets:[]));
  const total=Number(p.value)||0;
  const whale=[...assets].sort((a,b)=>(Number(b.currentValue)||0)-(Number(a.currentValue)||0))[0];
  const whaleWeight=whale&&total>0?((Number(whale.currentValue)||0)/total*100):null;
  const monthly=Number(d?.passiveIncome?.averageMonthly);
  const xirr=Number(p.xirr)*100;
  const incomeYield=Number.isFinite(monthly)&&total>0?(monthly*12/total*100):0;
  const score=clamp(Math.round(48 + clamp(pReturn*2.8,-15,18) + clamp(xirr*.45,-8,18) + clamp(incomeYield*.8,0,8) + clamp((assets.length-5)*.7,0,8) - clamp(maxDD*.8,0,12) + clamp((pReturn-mReturn)*1.1,-8,8)),0,100);
  const ageDays=p.startDate?Math.max(0,Math.round((Date.now()-new Date(p.startDate).getTime())/86400000)):null;
  let character='УПРЯМЫЙ', text='Просадку переживает и продолжает работать.';
  if(pReturn>=3 && pReturn-mReturn>=0){character='КРЯХТИТ, НО РАСТЁТ';text='Растёт и индекс обгоняет. Так держать.';}
  else if(incomeYield>=7){character='ДИВИДЕНДНЫЙ';text='Деньги приходят сами. Терпение окупается.';}
  else if(maxDD>=8){character='ЖЕЛЕЗНЫЙ';text='Видел просадку. Не дрогнул. Вернулся.';}
  else if(pReturn-mReturn<-2){character='УПРЯМЫЙ';text='Индекс убежал вперёд. Фонд догоняет.';}
  else if(pReturn>=0){character='КРЕПКИЙ';text='Без суеты. Деньги работают каждый день.';}
  const pulseBeat=pReturn>=0?'ЖИВОЙ':'КРЯХТИТ';
  const totalBase=p1+m1;
  const pBar=totalBase>0?clamp(p1/totalBase*100,18,82):50;
  return {pts,p1,m1,pReturn,mReturn,maxDD,whale,whaleWeight,monthly,incomeYield,score,ageDays,character,text,pulseBeat,pBar, mBar:100-pBar};
}
function drawPulsePath(key,pts){
  const a=pts.map(x=>Number(x?.[key])).filter(v=>Number.isFinite(v)&&v>0);
  if(a.length<2)return '';
  const min=Math.min(...a),max=Math.max(...a),span=Math.max(0.0001,max-min);
  return a.map((v,i)=>{const x=(i/(a.length-1))*600;const y=10+(1-(v-min)/span)*80;return (i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}).join(' ');
}
function enterPulse(){
  const root=$('pulse'),shot=$('pulseShot'),d=dashboardData||{};
  const p=d.portfolio||{}, st=pulseStats(d);
  setText('pulseValue',rub(p.value));
  setText('pulseGain',p.profitPercent==null?'—':`${p.profitPercent>=0?'+':''}${pct(p.profitPercent)}`);
  setText('pulseScore',String(st.score));
  setText('pulseHeartbeat',st.pulseBeat);
  setText('pulseVs',st.pReturn-st.mReturn>=0?`+${(st.pReturn-st.mReturn).toFixed(2).replace('.',',')} п.п.`:`${(st.pReturn-st.mReturn).toFixed(2).replace('.',',')} п.п.`);
  setText('pulseXirr',p.xirr==null?'—':pct(p.xirr));
  setText('pulseIncome',Number.isFinite(st.monthly)?rub(st.monthly):'—');
  const pl=$('pulseLine'),pa=$('pulseArea'),pm=$('pulseMoex');
  const pp=drawPulsePath('portfolio',st.pts),mm=drawPulsePath('imoex',st.pts);
  if(pl)pl.setAttribute('d',pp); if(pa)pa.setAttribute('d',pp?pp+' L600 105 L0 105 Z':''); if(pm)pm.setAttribute('d',mm);
  setText('pulseTrendEnd',`СЕЙЧАС ${st.p1.toFixed(1).replace('.',',')}`);
  const whale=st.whale;
  setText('pulseWhale',whale?(whale.ticker||whale.name||'—'):'—');
  setText('pulseWhaleWeight',st.whaleWeight==null?'—':`${st.whaleWeight.toFixed(1).replace('.',',')}% веса`);
  setText('pulsePain',st.maxDD>0?`−${st.maxDD.toFixed(1).replace('.',',')}%`:'0,0%');
  setText('pulsePainText',st.maxDD>0?'макс. просадка':'без просадки');
  setText('pulseSpeed',Number.isFinite(st.monthly)?rub(st.monthly/30.4375):'—');
  setText('pulseAge',st.ageDays==null?'—':`${st.ageDays} дн.`);
  setText('pulseCharacterName',st.character);setText('pulseCharacterText',st.text);
  setStyle('scoreRing','background',`conic-gradient(var(--accent) ${st.score*3.6}deg,rgba(255,255,255,.07) 0deg)`);
  setStyle('battlePortfolio','width',`${st.pBar}%`);setStyle('battleMoex','width',`${st.mBar}%`);
  setText('pulseBattleText',st.pReturn-st.mReturn>=0?'ОБГОНЯЕМ':'ДОГОНЯЕМ');
  setText('pulseTime',new Date().toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}));
  root.classList.add('pulse-capture');shot.setAttribute('aria-hidden','false');pulseMode=true;
  setText('pulseBtn','✕ PULSE');document.body.classList.add('pulse-active');
}
function exitPulse(){
  const root=$('pulse'),shot=$('pulseShot');root.classList.remove('pulse-capture');shot.setAttribute('aria-hidden','true');pulseMode=false;
  setText('pulseBtn','PULSE');document.body.classList.remove('pulse-active');
}
function togglePulse(){pulseMode?exitPulse():enterPulse();}
$('pulseBtn').addEventListener('click',togglePulse);
$('pulseBack')?.addEventListener('click',togglePulse);

// Long press on PULSE opens the same Röntgen view with a subtle "deep" state for power users.
$('pulseBtn').addEventListener('pointerdown',()=>{pulseLongTimer=setTimeout(()=>{if(!pulseMode)enterPulse();$('pulseShot').classList.add('deep-pulse');},650);});
['pointerup','pointercancel','pointerleave'].forEach(ev=>$('pulseBtn').addEventListener(ev,()=>{if(pulseLongTimer){clearTimeout(pulseLongTimer);pulseLongTimer=null;}}));

load();setInterval(load,60000);
