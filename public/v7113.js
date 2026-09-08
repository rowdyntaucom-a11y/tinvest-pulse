(()=>{
 const fix=()=>{
  const l=document.getElementById('chartLegend');
  if(!l)return;
  l.innerHTML='<span class="legendItem"><b class="legendLine portfolioLine"></b>Портфель</span><span class="legendItem"><b class="legendLine imoexLine"></b>IMOEX</span><span class="legendBase">100 = старт</span>';
  l.style.cssText='display:flex!important;align-items:center!important;width:100%!important;gap:12px!important;font-size:11px!important;line-height:18px!important;color:#87948f!important;white-space:nowrap!important;min-height:18px!important;margin-top:3px!important;overflow:hidden!important';
  l.querySelectorAll('.legendItem').forEach(x=>x.style.cssText='display:inline-flex!important;align-items:center!important;gap:5px!important;flex:0 0 auto!important');
  const p=l.querySelector('.portfolioLine'),m=l.querySelector('.imoexLine'),s=l.querySelector('.legendBase');
  if(p)p.style.cssText='display:block!important;width:24px!important;height:3px!important;flex:0 0 24px!important;background:#55f2c4!important;box-shadow:0 0 7px rgba(85,242,196,.35)!important';
  if(m)m.style.cssText='display:block!important;width:24px!important;height:3px!important;flex:0 0 24px!important;background:#8290a7!important';
  if(s)s.style.cssText='margin-left:auto!important;flex:0 0 auto!important;font-size:10px!important;color:#5d6b67!important';
 };
 const run=()=>{fix();setTimeout(fix,250);setTimeout(fix,900);setTimeout(fix,1800);setInterval(fix,1500)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
