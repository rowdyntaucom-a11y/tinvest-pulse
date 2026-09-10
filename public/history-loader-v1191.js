// v14.1.1 — independent history owner.
// History must never depend on a dashboard event or on another script's lexical
// state to START. The request is launched on page readiness; when it completes
// we merge it into the already loaded dashboard if that binding is available.
(function(){
  let started=false;
  const MAX_ATTEMPTS=3;
  const RETRY_DELAYS=[0,8000,20000];

  function setHistoryMessage(text){
    const el=document.getElementById('chartEmpty');
    if(el){el.textContent=text;el.style.display='flex';}
  }
  function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}

  async function requestHistory(attempt){
    if(RETRY_DELAYS[attempt]) await sleep(RETRY_DELAYS[attempt]);
    setHistoryMessage(attempt===0?'История загружается…':`История: повтор ${attempt}/${MAX_ATTEMPTS-1}…`);
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),45000);
    try{
      const r=await fetch('/api/history-debug?v=14.1.1&a='+attempt+'&t='+Date.now(),{cache:'no-store',signal:controller.signal});
      const payload=await r.json();
      if(!r.ok||!payload||!payload.ok||!payload.history||!payload.history.available){
        throw new Error((payload&&payload.error)||`HTTP ${r.status}`);
      }
      return payload.history;
    }finally{clearTimeout(timer)}
  }

  function applyHistory(history){
    let applied=false;
    try{
      if(typeof dashboardData!=='undefined'&&dashboardData){
        dashboardData.history=history;
        if(typeof render==='function'){render(dashboardData);applied=true;}
      }
    }catch(err){console.warn('History merge failed:',err&&err.message||err)}
    if(!applied){
      try{if(typeof renderChart==='function'){renderChart(history);applied=true;}}catch(_){}
    }
    window.dispatchEvent(new CustomEvent('tinvest:history-ready',{detail:{points:(history.points||[]).length,applied}}));
  }

  async function loadHistory(){
    if(started)return;
    started=true;
    let lastError=null;
    for(let attempt=0;attempt<MAX_ATTEMPTS;attempt++){
      try{
        const history=await requestHistory(attempt);
        applyHistory(history);
        return;
      }catch(err){
        lastError=err;
        console.warn('Independent history attempt failed:',attempt+1,err&&err.message||err);
      }
    }
    setHistoryMessage('История временно недоступна');
    window.dispatchEvent(new CustomEvent('tinvest:history-error',{detail:{message:String(lastError&&lastError.message||lastError||'unknown')}}));
  }

  // Start unconditionally. This is deliberately independent from
  // tinvest:dashboard-live, dashboardData and legacy fetch ownership.
  function start(){setTimeout(loadHistory,1200)}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();