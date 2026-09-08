(()=>{
 const fix=()=>{
  const l=document.getElementById('chartLegend');
  if(!l)return;
  l.style.cssText='display:flex!important;align-items:center!important;gap:5px!important;font-size:11px!important;line-height:1!important;color:#87948f!important;white-space:nowrap!important;min-height:18px!important;margin-top:3px!important;overflow:hidden!important';
  const i=l.querySelector('i'),e=l.querySelector('em'),s=l.querySelector('span');
  if(i)i.style.cssText='display:inline-block!important;flex:0 0 24px!important;width:24px!important;height:3px!important;margin:0 1px 0 0!important;vertical-align:middle!important;background:var(--accent)!important';
  if(e)e.style.cssText='display:inline-block!important;flex:0 0 24px!important;width:24px!important;height:3px!important;margin:0 1px 0 7px!important;vertical-align:middle!important;background:#8290a7!important';
  if(s)s.style.cssText='float:none!important;margin-left:auto!important;font-size:10px!important;color:#5d6b67!important';
 };
 fix();document.addEventListener('DOMContentLoaded',fix);setTimeout(fix,300);setTimeout(fix,1200);
})();
