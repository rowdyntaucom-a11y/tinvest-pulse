// v14.0.1 — independent history owner.
// app.js keeps dashboardData in a top-level lexical binding, so it is not a
// window property. Start from the live-dashboard event and only then use the
// shared lexical dashboardData/render functions.
(function(){
  let started=false;
  const MAX_ATTEMPTS=3;
  const RETRY_DELAYS=[0,8000,20000];

  function setHistoryMessage(text){
    const el=document.getElementById('chartEmpty');
    if(el){el.textContent=text;el.style.display='flex';}
  }
  function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
  function liveReady(){
    try{return !!(dashboardData&&dashboardData.portfolio&&dashboardData.portfolio.value)}catch(_){return false}
  }
  async function requestHistory(attempt){
    if(RETRY_DELAYS[attempt]) await sleep(RETRY_DELAYS[attempt]);
    setHistoryMessage(attempt===0?'История загружается…':`История: повтор ${attempt}/${MAX_ATTEMPTS-1}…`);
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),45000);
    try{
      const r=await fetch('/api/history-debug?v=14.0.1&a='+attempt+'&t='+Date.now(),{cache:'no-store',signal:controller.signal});
      const payload=await r.json();
      if(!r.ok||!payload||!payload.ok||!payload.history||!payload.history.available)throw new Error((payload&&payload.error)||`HTTP ${r.status}`);
      return payload.history;
    }finally{clearTimeout(timer)}
  }
  async function loadHistory(){
    if(started||!liveReady())return;
    started=true;
    let lastError=null;
    for(let attempt=0;attempt<MAX_ATTEMPTS;attempt++){
      try{
        const history=await requestHistory(attempt);
        dashboardData.history=history;
        if(typeof render==='function')render(dashboardData);
        else if(typeof renderChart==='function')renderChart(history);
        window.dispatchEvent(new CustomEvent('tinvest:history-ready',{detail:{points:(history.points||[]).length,attempt:attempt+1}}));
        return;
      }catch(err){lastError=err;console.warn('Independent history attempt failed:',attempt+1,err&&err.message||err)}
    }
    setHistoryMessage('История временно недоступна');
    window.dispatchEvent(new CustomEvent('tinvest:history-error',{detail:{message:String(lastError&&lastError.message||lastError||'unknown')}}));
  }
  function tryStart(){if(liveReady())loadHistory()}
  window.addEventListener('tinvest:dashboard-live',tryStart);
  window.addEventListener('load',tryStart,{once:true});
  const poll=setInterval(()=>{if(liveReady()){clearInterval(poll);loadHistory()}},400);
  setTimeout(()=>clearInterval(poll),30000);
})();