let chart;
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
  if(arr.length<2)return [];
  const base=arr[0].value;
  return arr.map(x=>({date:x.date,value:(x.value/base)*100}));
}
function renderChart(history){
  const points=Array.isArray(history?.points)?history.points:[];
  const portfolio=cleanSeries(points,'portfolio');
  const imoex=cleanSeries(points,'imoex');
  const has=portfolio.length>=2;
  $('chartEmpty').style.display=has?'none':'flex';
  if(chart){chart.destroy();chart=null;}
  if(!has)return;
  const byDate=new Map(imoex.map(x=>[x.date,x.value]));
  const labels=portfolio.map(x=>shortDate(x.date));
  chart=new Chart($('chart'),{type:'line',data:{labels,datasets:[
    {label:'Портфель',data:portfolio.map(x=>Number(x.value.toFixed(2))),borderColor:getComputedStyle(document.body).getPropertyValue('--accent').trim(),backgroundColor:'rgba(84,246,197,.07)',borderWidth:2.5,pointRadius:0,tension:.25,fill:true},
    {label:'IMOEX',data:portfolio.map(x=>byDate.has(x.date)?Number(byDate.get(x.date).toFixed(2)):null),borderColor:'#8290a7',borderWidth:1.5,pointRadius:0,tension:.2,spanGaps:true,fill:false}
  ]},options:{responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${Number(c.parsed.y).toFixed(1).replace('.',',')}`}}},scales:{x:{display:false},y:{grid:{color:'rgba(255,255,255,.07)'},ticks:{color:'#7e8b86',maxTicksLimit:4,callback:v=>Number(v).toFixed(0)}}}}});
}
function render(d){
  const p=d.portfolio||{};
  $('value').textContent=rub(p.value);
  $('profit').textContent=rub(p.profit);
  $('profitPct').textContent=p.profitPercent==null?'—':pct(p.profitPercent);
  $('gain').textContent=p.profitPercent==null?'—':(p.profitPercent>=0?'+':'')+pct(p.profitPercent);
  $('gain').style.color=p.profitPercent>=0?'var(--accent)':'#ff6575';
  $('cagr').textContent=p.cagr==null?'—':pct(p.cagr);
  $('xirr').textContent=p.xirr==null?'—':pct(p.xirr);
  $('dates').textContent=`Начало: ${shortDate(p.startDate)} • Сегодня: ${shortDate(new Date())}`;
  const monthly=Number(d.passiveIncome?.averageMonthly ?? d.income?.monthly);
  $('monthly').textContent=rub(monthly);
  $('annual').textContent=Number.isFinite(monthly)?rub(monthly*12):'—';
  const g=d.leaders?.gainers?.[0], l=d.leaders?.losers?.[0];
  $('gainer').textContent=g?`${g.ticker||g.name} ${g.yieldRub>=0?'+':''}${rub(g.yieldRub)}`:'—';
  $('loser').textContent=l?`${l.ticker||l.name} ${l.yieldRub>=0?'+':''}${rub(l.yieldRub)}`:'—';
  $('status').textContent=`✓ Данные загружены • ${d.assets?.length||p.assets?.length||0} активов`;$('status').className='ok';
  $('updated').textContent=new Date(d.updatedAt||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
  renderChart(d.history);
}
async function load(){try{const r=await fetch('/api/dashboard',{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||`HTTP ${r.status}`);render(d);}catch(e){$('status').textContent='Ошибка: '+e.message;$('status').className='err';$('value').textContent='Нет данных';}}
$('pulseBtn').addEventListener('click',async()=>{try{if(!window.html2canvas){const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';document.head.appendChild(s);await new Promise(r=>s.onload=r)}const canvas=await html2canvas($('pulse'),{backgroundColor:'#05070b',scale:2});const a=document.createElement('a');a.download='kryahtyashiy-fond-pulse.png';a.href=canvas.toDataURL('image/png');a.click();}catch(e){alert('Не удалось сделать Pulse: '+e.message)}});
load();setInterval(load,60000);
