let chart;
const $=id=>document.getElementById(id);
const rub=n=>Number.isFinite(Number(n))?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Number(n))+' ₽':'—';
const pct=n=>Number.isFinite(Number(n))?((Number(n)*100).toFixed(1).replace('.',',')+'%'):'—';
const shortDate=d=>d?new Date(d).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'}):'—';

function render(d){
  const p=d.portfolio||{};
  $('value').textContent=rub(p.value);
  $('profit').textContent=rub(p.profit);
  $('profitPct').textContent=p.profitPercent==null?'—':pct(p.profitPercent);
  $('gain').textContent=p.profitPercent==null?'—':(p.profitPercent>=0?'+':'')+pct(p.profitPercent);
  $('gain').style.color=p.profitPercent>=0?'#43f19a':'#ff6575';
  $('cagr').textContent=p.cagr==null?'—':pct(p.cagr);
  $('xirr').textContent=p.xirr==null?'—':pct(p.xirr);
  $('dates').textContent=`Начало: ${shortDate(p.startDate)} • Сегодня: ${shortDate(new Date())}`;
  $('monthly').textContent=rub(d.income?.monthly);
  $('annual').textContent=rub(d.income?.annual);
  const g=d.leaders?.gainers?.[0], l=d.leaders?.losers?.[0];
  $('gainer').textContent=g?`${g.ticker||g.name} ${g.yieldRub>=0?'+':''}${rub(g.yieldRub)}`:'—';
  $('loser').textContent=l?`${l.ticker||l.name} ${l.yieldRub>=0?'+':''}${rub(l.yieldRub)}`:'—';
  $('status').textContent=`✓ Данные загружены • ${d.assets?.length||0} активов`;$('status').className='ok';
  $('updated').textContent=new Date(d.updatedAt||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
  $('chartEmpty').textContent='Исторический ряд подключим следующим шагом';
}

async function load(){
  try{
    const r=await fetch('/api/dashboard',{cache:'no-store'});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error||`HTTP ${r.status}`);
    render(d);
  }catch(e){
    $('status').textContent='Ошибка: '+e.message;$('status').className='err';
    $('value').textContent='Нет данных';
  }
}

$('pulseBtn').addEventListener('click',async()=>{
  try{
    if(!window.html2canvas){const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';document.head.appendChild(s);await new Promise(r=>s.onload=r)}
    const canvas=await html2canvas($('pulse'),{backgroundColor:'#050810',scale:2});
    const a=document.createElement('a');a.download='tinvest-pulse.png';a.href=canvas.toDataURL('image/png');a.click();
  }catch(e){alert('Не удалось сделать Pulse: '+e.message)}
});
load();setInterval(load,60000);
