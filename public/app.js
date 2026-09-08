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

function triggerLiveFX(){
  const hero=$('value')?.closest('.hero');
  const value=$('value'), gain=$('gain'), chartCard=document.querySelector('.chartCard');
  hero?.classList.remove('live-flash'); value?.classList.remove('live-pulse'); gain?.classList.remove('live-pulse'); chartCard?.classList.remove('chart-live');
  void hero?.offsetWidth; void value?.offsetWidth;
  hero?.classList.add('live-flash'); value?.classList.add('live-pulse'); gain?.classList.add('live-pulse'); chartCard?.classList.add('chart-live');
  setTimeout(()=>{hero?.classList.remove('live-flash');value?.classList.remove('live-pulse');gain?.classList.remove('live-pulse');chartCard?.classList.remove('chart-live');},2400);
}
function setSync(mode){
  const el=$('syncFlow'); if(!el)return;
  if(mode==='sync'){
    el.textContent='SYNC → PORTFOLIO → MOEX → DIVIDENDS → READY'; el.classList.add('syncing');
  }else{
    el.textContent='PORTFOLIO • MOEX • DIVIDENDS • READY'; el.classList.remove('syncing');
  }
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
  triggerLiveFX();
  const statusEl2=$('status'); statusEl2?.classList.remove('status-flash'); void statusEl2?.offsetWidth; statusEl2?.classList.add('status-flash'); setTimeout(()=>statusEl2?.classList.remove('status-flash'),900);
  setSync('ready');
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
async function load(){try{setSync('sync');const r=await fetch('/api/dashboard?v=5.6&t='+Date.now(),{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||`HTTP ${r.status}`);render(d);}catch(e){console.error(e);setText('status','Ошибка: '+e.message);setSync('ready');const statusEl=$('status');if(statusEl)statusEl.className='err';setText('value','Нет данных');}}
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
  const byValue=[...assets].sort((a,b)=>(Number(b.currentValue)||0)-(Number(a.currentValue)||0));
  const whale=byValue[0];
  const whaleWeight=whale&&total>0?((Number(whale.currentValue)||0)/total*100):null;
  const assetResult=a=>Number.isFinite(Number(a?.yieldRub))?Number(a.yieldRub):Number(a?.expectedYield)||0;
  const byResult=[...assets].sort((a,b)=>assetResult(b)-assetResult(a));
  const strength=byResult[0];
  const painAsset=byResult[byResult.length-1];
  const monthly=Number(d?.passiveIncome?.averageMonthly);
  const xirr=Number(p.xirr)*100;
  const incomeYield=Number.isFinite(monthly)&&total>0?(monthly*12/total*100):0;
  const ageDays=p.startDate?Math.max(0,Math.round((Date.now()-new Date(p.startDate).getTime())/86400000)):null;
  const pulseBeat=pReturn>=0?'ЖИВОЙ':'КРЯХТИТ';
  const totalBase=p1+m1;
  const pBar=totalBase>0?clamp(p1/totalBase*100,18,82):50;
  // Score is intentionally explainable: the four DNA components form the base,
  // then the relative result vs IMOEX nudges it up/down. This makes the 0–100
  // score visibly traceable to the same values shown below.
  const dnaIncome=clamp(Math.round(35 + incomeYield*7.5),0,100);
  const dnaStability=clamp(Math.round(88 - maxDD*5.2),18,100);
  const dnaGrowth=clamp(Math.round(48 + pReturn*4 + (pReturn-mReturn)*2),0,100);
  const dnaDivers=clamp(Math.round(38 + Math.min(15,Math.max(0,assets.length-1))*3.2),0,100);
  const dnaBase=(dnaIncome*.30)+(dnaStability*.25)+(dnaGrowth*.30)+(dnaDivers*.15);
  const marketAdj=clamp((pReturn-mReturn)*1.2,-8,8);
  const score=clamp(Math.round(dnaBase+marketAdj),0,100);
  const strengthTicker=strength?(strength.ticker||strength.name||'—'):'—';
  const painTicker=painAsset?(painAsset.ticker||painAsset.name||'—'):'—';
  const strengthYield=Number(strength?.expectedYield)||0;
  const painYield=Number(painAsset?.expectedYield)||0;
  const riskLabel=maxDD>=10?'ВЫСОКИЙ':(maxDD>=6||((whaleWeight||0)>=30)?'УМЕРЕННЫЙ':'НИЗКИЙ');

  // The Pulse diagnosis is derived from the live portfolio state rather than fixed copy.
  let diagnosisTitle='ПУЛЬС СТАБИЛЬНЫЙ';
  let diagnosisText=`Сила: ${strengthTicker}. Боль: ${painTicker}. Риск: ${riskLabel.toLowerCase()}.`;
  let character='УПРЯМЫЙ';
  let text='Портфель держит удар и продолжает работать.';
  if(pReturn-mReturn>=2){
    character='ОХОТНИК ЗА РОСТОМ';
    text=`${strengthTicker} ведёт атаку. Фонд обгоняет индекс.`;
    diagnosisTitle='ПОШЁЛ В РАЗНОС';
    diagnosisText=`Сила: ${strengthTicker} +${strengthYield>=0?'+':''}${rub(strengthYield)}. IMOEX позади. Не мешать.`;
  } else if(incomeYield>=5){
    character='ДИВИДЕНДНЫЙ ОХОТНИК';
    text=`${rub(monthly)} в месяц — поток уже работает сам.`;
    diagnosisTitle='ДЕНЬГИ РАБОТАЮТ';
    diagnosisText=`Сила: денежный поток. ${rub(monthly)}/мес. Боль: ${painTicker}.`;
  } else if(pReturn-mReturn<=-4){
    character='УПРЯМЫЙ ДОГОНЯЛА';
    text=`${painTicker} тянет вниз. Фонд держит курс и догоняет индекс.`;
    diagnosisTitle='НУЖНО ДОГОНЯТЬ';
    diagnosisText=`Боль: ${painTicker} ${painYield>=0?'+':''}${rub(painYield)}. IMOEX впереди на ${Math.abs(pReturn-mReturn).toFixed(1).replace('.',',')} п.п.`;
  } else if(maxDD>=10 || riskLabel==='ВЫСОКИЙ'){
    character='ЖЕЛЕЗНЫЙ';
    text=`Пережил ${maxDD.toFixed(1).replace('.',',')}% просадки. Не дрогнул.`;
    diagnosisTitle='РЕЖИМ ОБОРОНЫ';
    diagnosisText=`Риск: высокий. Кит ${strengthTicker==='—'?'портфеля':(whale?.ticker||whale?.name||'—')} — ${whaleWeight?.toFixed(1).replace('.',',')||'—'}% веса.`;
  } else if(pReturn>=0){
    character='КРЕПКИЙ';
    text=`${strengthTicker} даёт импульс. Деньги работают без суеты.`;
    diagnosisTitle='ДЕНЬГИ РАБОТАЮТ';
    diagnosisText=`Сила: ${strengthTicker}. Боль: ${painTicker}. Риск: ${riskLabel.toLowerCase()}.`;
  }
  return {pts,p1,m1,pReturn,mReturn,maxDD,whale,whaleWeight,strength,painAsset,strengthTicker,painTicker,strengthYield,painYield,riskLabel,monthly,incomeYield,score,dnaBase,marketAdj,ageDays,character,text,pulseBeat,pBar, mBar:100-pBar,dnaIncome,dnaStability,dnaGrowth,dnaDivers,diagnosisTitle,diagnosisText};
}
function drawPulsePath(key,pts){
  const a=pts.map(x=>Number(x?.[key])).filter(v=>Number.isFinite(v)&&v>0);
  if(a.length<2)return '';
  const min=Math.min(...a),max=Math.max(...a),span=Math.max(0.0001,max-min);
  return a.map((v,i)=>{const x=(i/(a.length-1))*600;const y=10+(1-(v-min)/span)*80;return (i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}).join(' ');
}
function enterPulse(){
  const root=$('pulse'),shot=$('pulseShot'),d=dashboardData||{};
  // Reset the scanner every time PULSE is opened so each capture feels fresh.
  root.classList.remove('is-scanning');
  ['scanRow1','scanRow2','scanRow3'].forEach(id=>$(id)?.classList.remove('done'));
  setStyle('pulseScanProgress','width','0%');
  setText('scanPct','0%'); setText('scanSignal','WAIT'); setText('scanFlux','—'); setText('scanRisk','—');
  setText('pulseScanSub','Считываем состояние активов…');
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
  setText('pulsePain',st.painTicker||'—');
  setText('pulsePainText',st.maxDD>0?`просадка −${st.maxDD.toFixed(1).replace('.',',')}%`:'без просадки');
  setText('pulseSpeed',Number.isFinite(st.monthly)?rub(st.monthly/30.4375):'—');
  setText('pulseAge',st.ageDays==null?'—':`${st.ageDays} дн.`);const assetCount=Array.isArray(d?.assets)?d.assets.length:(Array.isArray(p.assets)?p.assets.length:0);setText('pulseAssets',`${assetCount} АКТИВОВ`);setText('pulseAgeTop',st.ageDays==null?'—':`${st.ageDays} ДН.`);setText('pulseUpdated',`ОБНОВЛЕНО ${new Date(d.updatedAt||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}`);
  setText('pulseCharacterName',st.character);setText('pulseCharacterText',st.text);
  const dna=[['dnaIncome','dnaIncomeVal',st.dnaIncome],['dnaStability','dnaStabilityVal',st.dnaStability],['dnaGrowth','dnaGrowthVal',st.dnaGrowth],['dnaDivers','dnaDiversVal',st.dnaDivers]];
  for(const [bar,val,n] of dna){setStyle(bar,'width',`${n}%`);setText(val,`${n}`);}
  const scoreWhy = `ДНК ${Math.round(st.dnaBase)} • рынок ${st.marketAdj>=0?'+':''}${st.marketAdj.toFixed(1).replace('.',',')}`;
  setText('pulseScoreWhy',scoreWhy);
  setText('pulseDiagnosisTitle',st.diagnosisTitle);setText('pulseDiagnosisText',st.diagnosisText);root.dataset.pulseRisk=(st.riskLabel||'').toLowerCase();root.dataset.pulseDiagnosis=st.diagnosisTitle;
  setStyle('scoreRing','background',`conic-gradient(var(--accent) 0deg,rgba(255,255,255,.07) 0deg)`); requestAnimationFrame(()=>setStyle('scoreRing','background',`conic-gradient(var(--accent) ${st.score*3.6}deg,rgba(255,255,255,.07) 0deg)`));
  setStyle('battlePortfolio','width',`${st.pBar}%`);setStyle('battleMoex','width',`${st.mBar}%`);
  setText('pulseBattleText',st.pReturn-st.mReturn>=0?'ОБГОНЯЕМ':'ДОГОНЯЕМ');setText('pulsePortfolioReturn',`${st.pReturn>=0?'+':''}${st.pReturn.toFixed(1).replace('.',',')}%`);setText('pulseMoexReturn',`${st.mReturn>=0?'+':''}${st.mReturn.toFixed(1).replace('.',',')}%`);
  const tempo=Number.isFinite(st.pReturn)?Math.abs(st.pReturn):0;setText('pulseTempo',`${tempo.toFixed(1).replace('.',',')}%`);setText('pulseTempoText',st.pReturn>=0?'темп роста':'темп просадки');
  const ticker=st.pReturn-st.mReturn>=2?'ФОНД НАБИРАЕТ ХОД':st.pReturn-st.mReturn<=-2?'Индекс ВПЕРЕДИ — ДОГОНЯЕМ':st.incomeYield>=5?'ДИВИДЕНДЫ ДЕРЖАТ ПУЛЬС':'ПУЛЬС СТАБИЛЬНЫЙ';setText('pulseTicker',ticker);
  setText('pulseTime',new Date().toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}));
  root.classList.add('pulse-capture');shot.setAttribute('aria-hidden','false');pulseMode=true;
  setText('pulseBtn','✕ PULSE');document.body.classList.add('pulse-active');
  runPulseScan(st);
}
function runPulseScan(st){
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
    if(!pulseMode)return;
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
    if(!pulseMode)return;
    setStyle('pulseScanProgress','width','100%'); setText('scanPct','100%');
    setText('scanSignal','LOCKED'); setText('scanFlux',Number.isFinite(st?.monthly)?rub(st.monthly)+'/M':'LIVE'); setText('scanRisk',st?.riskLabel||'—');
    setText('pulseScanSub','СКАН ГОТОВ');
    setTimeout(()=>{ if(!pulseMode)return; root.classList.remove('is-scanning'); animatePulseScore(st?.score||0); },220);
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
function exitPulse(){
  const root=$('pulse'),shot=$('pulseShot');root.classList.remove('pulse-capture','is-scanning');shot.setAttribute('aria-hidden','true');pulseMode=false;
  setText('pulseBtn','PULSE');document.body.classList.remove('pulse-active');
}
function togglePulse(){pulseMode?exitPulse():enterPulse();}
$('pulseBtn').addEventListener('click',togglePulse);
$('pulseBack')?.addEventListener('click',togglePulse);

// Long press on PULSE opens the same Röntgen view with a subtle "deep" state for power users.
$('pulseBtn').addEventListener('pointerdown',()=>{pulseLongTimer=setTimeout(()=>{if(!pulseMode)enterPulse();$('pulseShot').classList.add('deep-pulse');},650);});
['pointerup','pointercancel','pointerleave'].forEach(ev=>$('pulseBtn').addEventListener(ev,()=>{if(pulseLongTimer){clearTimeout(pulseLongTimer);pulseLongTimer=null;}}));

load();setInterval(load,60000);
