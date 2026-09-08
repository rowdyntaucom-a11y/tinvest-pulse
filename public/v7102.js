(()=>{
 const $=id=>document.getElementById(id);
 function pct2(v){return Math.abs(Number(v)).toFixed(2).replace('.',',')}
 function patch(d){
  const hp=Array.isArray(d?.history?.points)?d.history.points:[];
  const p=Number(d?.portfolio?.profitPercent);
  const ms=hp.map(x=>Number(x?.imoex)).filter(v=>Number.isFinite(v)&&v>0);
  if(!Number.isFinite(p)||ms.length<2)return;
  const m=ms[ms.length-1]/ms[0]-1;
  if(!Number.isFinite(m)||Math.abs(m)>.5)return;
  const vs=p*100-m*100;
  const el=$('vsMoex');if(el){el.textContent=`${vs>=0?'+':'−'}${pct2(vs)} п.п.`;el.style.color=vs>=0?'var(--accent)':'#ff6575'}
  const cap=$('vsMoexCaption');if(cap)cap.textContent=vs>=0?'обгоняем индекс':'отстаём от индекса';
 }
 async function sync(){try{const r=await fetch('/api/dashboard?v=7.10.2&t='+Date.now(),{cache:'no-store'});if(!r.ok)return;patch(await r.json())}catch(_){}}
 setTimeout(sync,900);setInterval(sync,15000);
})();
