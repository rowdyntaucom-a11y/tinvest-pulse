let chart;
let chartMode='growth';
let dashboardData=null;
const $=id=>document.getElementById(id);
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
function applyTheme(){const t=themes[themeIndex];document.body.dataset.theme=t[0];$('styleBtn').textContent=t[1];$('slogan').textContent=t[2];localStorage.setItem('pulseTheme',t[0]);}
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
  dashboardData=d;
  const p=d.portfolio||{};
  $('value').textContent=rub(p.value);
  $('profit').textContent=rub(p.profit);
  $('profitPct').textContent=p.profitPercent==null?'—':pct(p.profitPercent);
  $('gain').textContent=p.profitPercent==null?'—':(p.profitPercent>=0?'+':'')+pct(p.profitPercent);
  $('gain').style.color=p.profitPercent>=0?'var(--accent)':'#ff6575';
  if ($('cagr')) $('cagr').textContent=p.cagr==null?'—':pct(p.cagr);
  $('xirr').textContent=p.xirr==null?'—':pct(p.xirr);
  const hp=Array.isArray(d.history?.points)?d.history.points:[];
  const common=hp.filter(x=>Number.isFinite(Number(x.portfolio))&&Number.isFinite(Number(x.imoex))).slice(-1)[0];
  const vs=common?Number(common.portfolio)-Number(common.imoex):null;
  $('vsMoex').textContent=vs==null?'—':`${vs>=0?'+':''}${vs.toFixed(2).replace('.',',')} п.п.`;
  $('vsMoex').style.color=vs==null?'#fff':(vs>=0?'var(--accent)':'#ff6575');
  $('vsMoexCaption').textContent=vs==null?'ждём индекс':(vs>=0?'обгоняем индекс':'отстаём от индекса');
  $('dates').textContent=`Начало: ${shortDate(p.startDate)} • Сегодня: ${shortDate(new Date())}`;
  const monthly=Number(d.passiveIncome?.averageMonthly ?? d.income?.monthly);
  $('monthly').textContent=rub(monthly);
  $('daily').textContent=Number.isFinite(monthly)?rub(monthly/30.4375):'—';
  $('annual').textContent=Number.isFinite(monthly)?rub(monthly*12):'—';
  const c=d.cbr||{};
  $('keyRate').textContent=Number.isFinite(Number(c.rate))?`${Number(c.rate).toFixed(2).replace('.',',')}%`:'—';
  $('keyRateDate').textContent=c.rateDate?`с ${shortDate(c.rateDate)}`:'Банк России';
  $('nextMeeting').textContent=c.nextMeeting?shortDate(c.nextMeeting):'—';
  const g=d.leaders?.gainers?.[0], l=d.leaders?.losers?.[0];
  $('gainer').textContent=g?`${g.ticker||g.name} ${g.yieldRub>=0?'+':''}${rub(g.yieldRub)}`:'—';
  $('loser').textContent=l?`${l.ticker||l.name} ${l.yieldRub>=0?'+':''}${rub(l.yieldRub)}`:'—';
  $('status').textContent=`✓ Данные загружены • ${d.assets?.length||p.assets?.length||0} активов`;$('status').className='ok';
  $('updated').textContent=new Date(d.updatedAt||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
  renderChart(d.history);
}
document.querySelectorAll('.chartTab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.chartTab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  chartMode=btn.dataset.mode||'growth';
  if(dashboardData)renderChart(dashboardData.history);
}));
async function load(){try{const r=await fetch('/api/dashboard',{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||`HTTP ${r.status}`);render(d);}catch(e){$('status').textContent='Ошибка: '+e.message;$('status').className='err';$('value').textContent='Нет данных';}}
$('pulseBtn').addEventListener('click',async()=>{try{if(!window.html2canvas){const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';document.head.appendChild(s);await new Promise(r=>s.onload=r)}const canvas=await html2canvas($('pulse'),{backgroundColor:'#05070b',scale:2});const a=document.createElement('a');a.download='kryahtyashiy-fond-pulse.png';a.href=canvas.toDataURL('image/png');a.click();}catch(e){alert('Не удалось сделать Pulse: '+e.message)}});
load();setInterval(load,60000);
