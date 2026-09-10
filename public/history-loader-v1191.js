// v14.1.3 — single independent history owner.
// Fetch history once, then apply it only after the live dashboard model exists.
(function(){
  let started=false;
  let pendingHistory=null;
  let applyTimer=null;
  const MAX_ATTEMPTS=3;
  const RETRY_DELAYS=[0,8000,20000];

  function setHistoryMessage(text){
    const el=document.getElementById('chartEmpty');
    if(el){el.textContent=text;el.style.display='flex';}
  }
  function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}

  function xhrJSON(url){
    return new Promise((resolve,reject)=>{
      const x=new XMLHttpRequest();
      x.open('GET',url,true);
      x.timeout=45000;
      x.setRequestHeader('Cache-Control','no-cache');
      x.onreadystatechange=function(){
        if(x.readyState!==4)return;
        let payload=null;
        try{payload=JSON.parse(x.responseText||'null')}catch(_){}
        if(x.status>=200&&x.status<300) resolve({status:x.status,payload});
        else reject(new Error((payload&&payload.error)||`HTTP ${x.status||0}`));
      };
      x.onerror=()=>reject(new Error('history network error'));
      x.ontimeout=()=>reject(new Error('history timeout'));
      x.send(null);
    });
  }

  async function requestHistory(attempt){
    if(RETRY_DELAYS[attempt]) await sleep(RETRY_DELAYS[attempt]);
    setHistoryMessage(attempt===0?'История загружается…':`История: повтор ${attempt}/${MAX_ATTEMPTS-1}…`);
    const result=await xhrJSON('/api/history-debug?v=14.1.3&a='+attempt+'&t='+Date.now());
    const payload=result.payload;
    if(!payload||!payload.ok||!payload.history||!payload.history.available){
      throw new Error((payload&&payload.error)||'history unavailable');
    }
    return payload.history;
  }

  function tryApplyHistory(){
    if(!pendingHistory)return false;
    let applied=false;
    try{
      if(typeof dashboardData!=='undefined'&&dashboardData&&typeof render==='function'){
        dashboardData.history=pendingHistory;
        render(dashboardData);
        applied=true;
      }
    }catch(err){console.warn('History merge failed:',err&&err.message||err)}
    if(!applied){
      try{
        if(typeof renderChart==='function'){
          renderChart(pendingHistory);
          applied=true;
        }
      }catch(_){}
    }
    if(applied){
      const history=pendingHistory;
      pendingHistory=null;
      if(applyTimer){clearInterval(applyTimer);applyTimer=null;}
      window.__TIN_HISTORY=history;
      window.dispatchEvent(new CustomEvent('tinvest:history-ready',{detail:{points:(history.points||[]).length,applied:true}}));
      return true;
    }
    return false;
  }

  function queueApply(history){
    pendingHistory=history;
    if(tryApplyHistory())return;
    setHistoryMessage('История готова, подключаем график…');
    if(!applyTimer) applyTimer=setInterval(tryApplyHistory,500);
  }

  async function loadHistory(){
    if(started)return;
    started=true;
    let lastError=null;
    for(let attempt=0;attempt<MAX_ATTEMPTS;attempt++){
      try{
        const history=await requestHistory(attempt);
        queueApply(history);
        return;
      }catch(err){
        lastError=err;
        console.warn('Independent history attempt failed:',attempt+1,err&&err.message||err);
      }
    }
    setHistoryMessage('История временно недоступна');
    window.dispatchEvent(new CustomEvent('tinvest:history-error',{detail:{message:String(lastError&&lastError.message||lastError||'unknown')}}));
  }

  window.addEventListener('tinvest:dashboard-live',tryApplyHistory);
  function start(){setTimeout(loadHistory,1200)}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();