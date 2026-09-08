(()=>{
  const $=id=>document.getElementById(id);
  const rub=n=>Number.isFinite(Number(n))?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Number(n))+' ₽':'—';
  const tax=g=>{
    g=Math.max(0,Number(g)||0);
    const t=Math.min(g,2400000)*.13+Math.max(0,g-2400000)*.15;
    return {gross:g,tax:t,net:g-t,effective:g?t/g*100:13};
  };
  const parseRub=text=>{
    if(text==null)return NaN;
    const cleaned=String(text).replace(/\u00a0/g,' ').replace(/[^0-9,.-]/g,'').replace(',','.');
    const n=Number(cleaned);
    return Number.isFinite(n)?n:NaN;
  };

  // v7.1.1: PRO lives inside .phone. Give it its own full remaining grid row
  // and hide every normal-dashboard row while PRO is active.
  const style=document.createElement('style');
  style.id='v711HotfixStyle';
  style.textContent=`
    body.pro-active .phone{grid-template-rows:auto minmax(0,1fr)!important;gap:0!important}
    body.pro-active .phone>.hero,
    body.pro-active .phone>.grid2,
    body.pro-active .phone>.chartCard,
    body.pro-active .phone>.bottomGrid,
    body.pro-active .phone>footer{display:none!important}
    body.pro-active .phone>.proView{display:block!important;min-height:0!important;height:100%!important;overflow:hidden!important}
  `;
  if(!document.getElementById(style.id))document.head.appendChild(style);

  let lastData=null;
  let loading=false;
  let lastFetchAt=0;

  function renderNet(monthly,total){
    monthly=Number(monthly);total=Number(total)||0;
    if(!Number.isFinite(monthly)||monthly<0||!$('flowNetMonthly'))return false;

    const annual=tax(monthly*12);
    $('flowNetMonthly').textContent=rub(annual.net/12);
    if($('flowGrossAnnual'))$('flowGrossAnnual').textContent=rub(annual.gross);
    if($('flowTaxAnnual'))$('flowTaxAnnual').textContent='−'+rub(annual.tax);
    if($('flowNetAnnual'))$('flowNetAnnual').textContent=rub(annual.net);
    if($('flowTaxRate'))$('flowTaxRate').textContent=annual.effective.toFixed(1).replace('.',',')+'%';
    if($('flowGrossMonthly'))$('flowGrossMonthly').textContent=rub(monthly);
    if($('flowNetYield'))$('flowNetYield').textContent=total?(annual.net/total*100).toFixed(1).replace('.',',')+'%':'—';

    const host=$('cashCalendarMonths');
    if(host && host.dataset.truePayout!=='1'){
      const now=new Date();
      const key=`${monthly.toFixed(4)}|${now.getFullYear()}-${now.getMonth()}`;
      if(host.dataset.key!==key){
        host.innerHTML='';
        let sum=0;
        for(let i=0;i<12;i++){
          const dt=new Date(now.getFullYear(),now.getMonth()+i,1);
          const net=tax(monthly).net;
          sum+=net;
          const el=document.createElement('div');
          el.className='cashMonth';
          el.innerHTML='<span>'+dt.toLocaleString('ru-RU',{month:'short'}).replace('.','').toUpperCase()+'</span><b>'+rub(net)+'</b><small>NET</small>';
          host.appendChild(el);
        }
        host.dataset.key=key;
        if($('cashCalendarTotal'))$('cashCalendarTotal').textContent=rub(sum);
      }
    }
    return true;
  }

  function syncFromData(d){
    const monthly=Number(d?.passiveIncome?.averageMonthly??d?.income?.monthly);
    const total=Number(d?.portfolio?.value);
    return renderNet(monthly,total);
  }

  function syncFromVisibleDashboard(){
    // The main dashboard already contains the live values, so this works even
    // before the dedicated v7.1.1 API refresh completes.
    const monthly=parseRub($('monthly')?.textContent);
    const total=parseRub($('value')?.textContent);
    return renderNet(monthly,total);
  }

  async function fetchDashboard(force=false){
    if(loading)return;
    if(!force&&Date.now()-lastFetchAt<15000)return;
    loading=true;
    lastFetchAt=Date.now();
    try{
      const r=await fetch('/api/dashboard?v=7.1.1&t='+Date.now(),{cache:'no-store'});
      const d=await r.json();
      if(!r.ok)throw new Error(d?.error||`HTTP ${r.status}`);
      lastData=d;
      window.__v711Dashboard=d;
      syncFromData(d);
    }catch(err){
      console.warn('v7.1.1 dashboard sync fallback:',err);
      syncFromVisibleDashboard();
    }finally{loading=false;}
  }

  function sync(){
    if(!document.body.classList.contains('pulse-active'))return;
    if(lastData&&syncFromData(lastData))return;
    if(syncFromVisibleDashboard()){
      fetchDashboard(false);
      return;
    }
    fetchDashboard(false);
  }

  const observer=new MutationObserver(()=>{
    if(document.body.classList.contains('pulse-active'))setTimeout(()=>{sync();fetchDashboard(true)},80);
  });
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});

  document.addEventListener('click',e=>{
    if(e.target.closest('#pulseBtn,#scoreRing'))setTimeout(()=>{sync();fetchDashboard(true)},180);
  });

  setTimeout(sync,350);
  setInterval(sync,2500);
})();