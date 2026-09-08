(()=>{
 const DAY=86400000;
 function paint(d){
  const p=d?.portfolio||{};
  const x=document.getElementById('xirr');
  if(!x)return;
  const start=p.startDate?new Date(p.startDate):null;
  const days=start&&Number.isFinite(start.getTime())?Math.max(0,(Date.now()-start.getTime())/DAY):null;
  let note=document.getElementById('xirrExplain');
  if(!note){
   note=document.createElement('i');note.id='xirrExplain';
   const old=x.parentElement?.querySelector('i');if(old)old.replaceWith(note);else x.parentElement?.appendChild(note);
  }
  if(p.xirr==null){note.textContent='годовых · XIRR';return;}
  if(days!=null&&days<365){note.textContent=`годовых · XIRR · короткая история ${Math.max(1,Math.round(days))} дн.`;}
  else note.textContent='годовых · XIRR · с учётом пополнений';
  x.title='XIRR — годовая money-weighted доходность с учётом дат и размеров пополнений/выводов.';
 }
 async function sync(){try{const r=await fetch('/api/dashboard?v=7.10.4&t='+Date.now(),{cache:'no-store'});if(!r.ok)return;paint(await r.json())}catch(_){}}
 setTimeout(sync,700);setInterval(sync,15000);
})();
