// v11.9.2 — resilient independent history owner.
// Live portfolio data is rendered by app.js. History/IMOEX is requested only
// afterwards and retries independently, so T-Bank rate limits can never blank
// the live portfolio cards.
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
      const r=await fetch('/api/history-debug?v=11.9.2&a='+attempt+'&t='+Date.now(),{cache:'no-store',signal:controller.signal});
      const payload=await r.json();
      if(!r.ok || !payload?.ok || !payload?.history?.available) throw new Error(payload?.error||`HTTP ${r.status}`);
      return payload.history;
    }finally{
      clearTimeout(timer);
    }
  }

  async function loadHistory(){
    if(started)return;
    if(typeof dashboardData==='undefined' || !dashboardData?.portfolio?.value)return;
    started=true;
    let lastError=null;
    for(let attempt=0;attempt<MAX_ATTEMPTS;attempt++){
      try{
        const history=await requestHistory(attempt);
        dashboardData.history=history;
        if(typeof render==='function') render(dashboardData);
        else if(typeof renderChart==='function') renderChart(history);
        window.dispatchEvent(new CustomEvent('tinvest:history-ready',{detail:{points:history.points?.length||0,attempt:attempt+1}}));
        return;
      }catch(err){
        lastError=err;
        console.warn('Independent history attempt failed:',attempt+1,err?.message||err);
      }
    }
    setHistoryMessage('История временно недоступна');
    window.dispatchEvent(new CustomEvent('tinvest:history-error',{detail:{message:String(lastError?.message||lastError||'unknown')}}));
  }

  const poll=setInterval(()=>{
    if(typeof dashboardData!=='undefined' && dashboardData?.portfolio?.value){
      clearInterval(poll);
      loadHistory();
    }
  },400);
  setTimeout(()=>clearInterval(poll),20000);
})();