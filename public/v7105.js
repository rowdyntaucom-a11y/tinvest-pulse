(()=>{
 const $=id=>document.getElementById(id),rub=n=>Number.isFinite(+n)?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(+n)+' ₽':'—';
 let last=null,loading=false;
 function set(id,v){const e=$(id);if(e)e.textContent=v}
 function paint(d){
  const g=+d?.forecast?.gross,t=+d?.forecast?.tax,n=+d?.forecast?.net,c=+d?.forecast?.count;
  if(!(g>0)||!(n>=0)||!(c>0))return;
  last=d;const nm=n/12,gm=g/12,day=n/365;
  // OVERVIEW — TRUE PAYOUT is the only visible passive-income source.
  set('monthly',rub(nm));set('daily',rub(day));set('annual',rub(n));
  const main=$('monthly')?.closest('.income,.mini');if(main){const title=main.querySelector('.eyebrow,span');if(title)title.textContent='ПАССИВНЫЙ ДОХОД · ПРОГНОЗ';const note=main.querySelector('small,i');if(note)note.textContent=`на руки · ${c} выплат · начислят ${rub(g)}/год`}
  // PULSE — v71 replaces flowMonthly with flowNetMonthly. Write both for safe migration.
  set('flowMonthly',rub(nm));set('flowNetMonthly',rub(nm));set('flowDaily',rub(day));set('flowAnnual',rub(n));
  set('flowGrossAnnual',rub(g));set('flowTaxAnnual','−'+rub(Math.abs(t)));set('flowNetAnnual',rub(n));set('flowGrossMonthly',rub(gm));
  const fv=document.querySelector('.flowValue span');if(fv)fv.textContent='/ МЕС · НА РУКИ';
  const ff=document.querySelector('.flowFoot span:last-child');if(ff)ff.innerHTML=`начислят <b id="flowGrossMonthly">${rub(gm)}</b>/мес`;
  // PRO — same source.
  set('proMonthly',rub(nm));set('proDaily',rub(day));set('proAnnual',rub(n));
  const pro=$('proMonthly')?.parentElement?.querySelector('span');if(pro)pro.textContent='/ мес · на руки';
  const sig=$('proFlowSignal');if(sig)sig.textContent=`TRUE PAYOUT · ${c} ВЫПЛАТ · НАЧИСЛЯТ ${rub(g)}`;
 }
 async function load(){if(loading)return;loading=true;try{const r=await fetch('/api/payouts?v=7.11.2&t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const d=await r.json();if(+d?.forecast?.count>0)paint(d)}catch(_){}finally{loading=false}}
 // Payout data is authoritative. Repaint after any legacy dashboard render without polling the API every time.
 const repaint=()=>{if(last)paint(last);else load()};
 setTimeout(load,250);setTimeout(repaint,1100);setInterval(load,15000);setInterval(()=>{if(last)paint(last)},1200);
 new MutationObserver(()=>setTimeout(repaint,40)).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('click',e=>{if(e.target.closest('#pulseBtn,#proBtn,#pulseExitBtn,#proBack,#scoreRing'))setTimeout(repaint,180)});
})();
