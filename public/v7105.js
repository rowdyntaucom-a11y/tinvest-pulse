(()=>{
 const $=id=>document.getElementById(id),rub=n=>Number.isFinite(+n)?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(+n)+' ₽':'—';
 let last=null;
 function set(id,v){const e=$(id);if(e)e.textContent=v}
 function paint(d){
  const g=+d?.forecast?.gross,t=+d?.forecast?.tax,n=+d?.forecast?.net,c=+d?.forecast?.count;
  if(!(g>0)||!(n>=0)||!(c>0))return;
  last=d;const nm=n/12,gm=g/12,day=n/365;
  // OVERVIEW — same TRUE PAYOUT source as PULSE calendar.
  set('monthly',rub(nm));set('daily',rub(day));set('annual',rub(n));
  const main=$('monthly')?.closest('.mini');if(main){const title=main.querySelector('span');if(title)title.textContent='ПАССИВНЫЙ ДОХОД · ПРОГНОЗ';const note=main.querySelector('i');if(note)note.textContent=`на руки · ${c} выплат · начислят ${rub(g)}/год`}
  // PULSE.
  set('flowMonthly',rub(nm));set('flowNetMonthly',rub(nm));set('flowDaily',rub(day));set('flowAnnual',rub(n));
  const fv=document.querySelector('.flowValue span');if(fv)fv.textContent='/ МЕС · НА РУКИ';
  const ff=document.querySelector('.flowFoot span:last-child');if(ff)ff.innerHTML=`начислят <b>${rub(gm)}</b>/мес`;
  // PRO.
  set('proMonthly',rub(nm));set('proDaily',rub(day));set('proAnnual',rub(n));
  const pro=$('proMonthly')?.parentElement?.querySelector('span');if(pro)pro.textContent='/ мес · на руки';
  const sig=$('proFlowSignal');if(sig)sig.textContent=`TRUE PAYOUT · ${c} ВЫПЛАТ · НАЧИСЛЯТ ${rub(g)}`;
 }
 async function load(){try{const r=await fetch('/api/payouts?v=7.10.5&t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const d=await r.json();if(+d?.forecast?.count>0)paint(d)}catch(_){}}
 // Repaint after legacy dashboard/PULSE renderers so there is one visible source of truth.
 setTimeout(load,900);setInterval(load,15000);
 new MutationObserver(()=>{if(last)setTimeout(()=>paint(last),80)}).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('click',e=>{if(e.target.closest('#pulseBtn,#proBtn,#pulseExitBtn,#proBack'))setTimeout(()=>last?paint(last):load(),700)});
})();
