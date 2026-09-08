(()=>{
 const $=id=>document.getElementById(id),rub=n=>Number.isFinite(+n)?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(+n)+' ₽':'—';
 let last=null,loading=false; const STORE='tinvest:lastPayoutForecast';
 function claim(){const main=$('monthly')?.closest('.income,.mini');if(main){main.dataset.truePayout='1';const title=main.querySelector('.eyebrow,span');if(title)title.textContent='ПАССИВНЫЙ ДОХОД · ПРОГНОЗ';}}
 function set(id,v){const e=$(id);if(e)e.textContent=v}
 function save(d){try{localStorage.setItem(STORE,JSON.stringify({at:Date.now(),data:d}))}catch(_){}}
 function restore(){try{const x=JSON.parse(localStorage.getItem(STORE)||'null');return x?.data||null}catch(_){return null}}
 function paint(d,stale=false){
  const g=+d?.forecast?.gross,t=+d?.forecast?.tax,n=+d?.forecast?.net,c=+d?.forecast?.count;
  if(!(g>0)||!(n>=0)||!(c>0))return false;
  last=d;const nm=n/12,gm=g/12,day=n/365;
  set('monthly',rub(nm));set('daily',rub(day));set('annual',rub(n));
  const main=$('monthly')?.closest('.income,.mini');if(main){main.dataset.truePayout='1';const title=main.querySelector('.eyebrow,span');if(title)title.textContent='ПАССИВНЫЙ ДОХОД · ПРОГНОЗ';const note=main.querySelector('small,i');if(note)note.textContent=`на руки · ${c} выплат · начислят ${rub(g)}/год${stale?' · последний расчёт':''}`}
  set('flowMonthly',rub(nm));set('flowNetMonthly',rub(nm));set('flowDaily',rub(day));set('flowAnnual',rub(n));
  set('flowGrossAnnual',rub(g));set('flowTaxAnnual','−'+rub(Math.abs(t)));set('flowNetAnnual',rub(n));set('flowGrossMonthly',rub(gm));
  const fv=document.querySelector('.flowValue span');if(fv)fv.textContent='/ МЕС · НА РУКИ';
  const ff=document.querySelector('.flowFoot span:last-child');if(ff)ff.innerHTML=`начислят <b id="flowGrossMonthly">${rub(gm)}</b>/мес`;
  set('proMonthly',rub(nm));set('proDaily',rub(day));set('proAnnual',rub(n));
  const pro=$('proMonthly')?.parentElement?.querySelector('span');if(pro)pro.textContent='/ мес · на руки';
  const sig=$('proFlowSignal');if(sig)sig.textContent=`TRUE PAYOUT · ${c} ВЫПЛАТ · НАЧИСЛЯТ ${rub(g)}`;
  return true;
 }
 async function load(){if(loading)return;loading=true;const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),4500);try{const r=await fetch('/api/payouts?v=7.11.7&t='+Date.now(),{cache:'no-store',signal:ac.signal});if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.json();if(+d?.forecast?.count>0&&paint(d)){save(d)}}catch(_){const cached=last||restore();if(cached)paint(cached,true)}finally{clearTimeout(tm);loading=false}}
 claim();const cached=restore();if(cached)paint(cached,true);else{set('monthly','—');set('daily','—');set('annual','—');}
 const repaint=()=>{if(last)paint(last);else{const c=restore();if(c)paint(c,true);else load()}};
 setTimeout(load,250);setTimeout(repaint,1100);setInterval(load,15000);setInterval(repaint,1200);
 new MutationObserver(()=>setTimeout(repaint,40)).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('click',e=>{if(e.target.closest('#pulseBtn,#proBtn,#pulseExitBtn,#proBack,#scoreRing'))setTimeout(repaint,180)});
})();
