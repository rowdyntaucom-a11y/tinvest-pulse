// v11.9.1 — independent history owner.
// Live portfolio data is already rendered by app.js. Historical reconstruction
// is deliberately requested afterwards, so a slow/failed history request can
// never block capital, profit, DNA or other live cards.
(function(){
  let started=false;

  function setHistoryMessage(text){
    const el=document.getElementById('chartEmpty');
    if(el){el.textContent=text;el.style.display='flex';}
  }

  async function loadHistory(){
    if(started)return;
    if(typeof dashboardData==='undefined' || !dashboardData?.portfolio?.value)return;
    started=true;
    setHistoryMessage('История загружается…');
    try{
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),45000);
      const r=await fetch('/api/history-debug?v=11.9.1&t='+Date.now(),{cache:'no-store',signal:controller.signal});
      clearTimeout(timer);
      const payload=await r.json();
      if(!r.ok || !payload?.ok || !payload?.history?.available) throw new Error(payload?.error||`HTTP ${r.status}`);
      dashboardData.history=payload.history;
      if(typeof render==='function') render(dashboardData);
      else if(typeof renderChart==='function') renderChart(payload.history);
      window.dispatchEvent(new CustomEvent('tinvest:history-ready',{detail:{points:payload.history.points?.length||0}}));
    }catch(err){
      console.warn('Independent history unavailable:',err?.message||err);
      setHistoryMessage('История временно недоступна');
      window.dispatchEvent(new CustomEvent('tinvest:history-error',{detail:{message:String(err?.message||err)}}));
    }
  }

  // app.js owns the live request. Wait until that data exists, then start the
  // expensive historical request exactly once.
  const poll=setInterval(()=>{
    if(typeof dashboardData!=='undefined' && dashboardData?.portfolio?.value){
      clearInterval(poll);
      loadHistory();
    }
  },400);
  setTimeout(()=>clearInterval(poll),20000);
})();