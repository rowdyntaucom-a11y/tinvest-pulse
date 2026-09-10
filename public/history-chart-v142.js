// v14.2.0 — ONE HISTORY OWNER. No dependency on legacy app events or fetch wrappers.
(function(){
  'use strict';
  if(window.__TIN_HISTORY_V142)return;
  window.__TIN_HISTORY_V142=true;
  const $=id=>document.getElementById(id);
  const state={history:null,chart:null,mode:'growth'};
  const shortDate=d=>d?new Date(d).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'}):'';
  function message(t){const e=$('chartEmpty');if(e){e.textContent=t;e.style.display='flex';}}
  function series(points,key){return (points||[]).map(p=>({date:p.date,value:Number(p&&p[key])})).filter(x=>Number.isFinite(x.value)&&x.value>0)}
  function vsMoex(h){
    const p=series(h.points,'portfolio'),m=series(h.points,'imoex'); let vs=null;
    if(p.length>1&&m.length>1)vs=((p[p.length-1].value/p[0].value-1)-(m[m.length-1].value/m[0].value-1))*100;
    const e=$('vsMoex'),c=$('vsMoexCaption');
    if(e)e.textContent=vs==null?'—':(vs>=0?'+':'')+vs.toFixed(2).replace('.',',')+' п.п.';
    if(c)c.textContent=vs==null?'ждём индекс':vs>=0?'обгоняем индекс':'отстаём от индекса';
  }
  function draw(h){
    state.history=h; vsMoex(h);
    const p=series(h.points,'portfolio'),m=series(h.points,'imoex');
    if(p.length<2){message('История временно недоступна');return;}
    const empty=$('chartEmpty');if(empty)empty.style.display='none';
    if(state.chart){state.chart.destroy();state.chart=null;}
    if(typeof Chart==='undefined'||!$('chart')){message('График временно недоступен');return;}
    const labels=p.map(x=>shortDate(x.date)); const mm=new Map(m.map(x=>[x.date,x.value]));
    let datasets=[];
    if(state.mode==='growth')datasets=[
      {label:'Портфель',data:p.map(x=>x.value),borderColor:'#54f6c5',backgroundColor:'rgba(84,246,197,.07)',borderWidth:2.7,pointRadius:0,tension:.25,fill:true},
      {label:'IMOEX',data:p.map(x=>mm.has(x.date)?mm.get(x.date):null),borderColor:'#8290a7',borderWidth:1.7,pointRadius:0,tension:.2,spanGaps:true,fill:false}
    ];
    else {
      const vals=new Map((h.valuePoints||[]).map(x=>[x.date,Number(x.value)]));
      const inv=new Map((h.investedPoints||[]).map(x=>[x.date,Number(x.value)]));
      if(state.mode==='value')datasets=[{label:'Стоимость',data:p.map(x=>vals.get(x.date)??null),borderColor:'#54f6c5',backgroundColor:'rgba(84,246,197,.08)',borderWidth:2.5,pointRadius:0,tension:.2,spanGaps:true,fill:true},{label:'Вложено',data:p.map(x=>inv.get(x.date)??null),borderColor:'#8b5cff',borderDash:[6,5],borderWidth:1.6,pointRadius:0,spanGaps:true,fill:false}];
      else datasets=[{label:'Прибыль',data:p.map(x=>vals.has(x.date)&&inv.has(x.date)?vals.get(x.date)-inv.get(x.date):null),borderColor:'#54f6c5',backgroundColor:'rgba(84,246,197,.08)',borderWidth:2.6,pointRadius:0,tension:.2,spanGaps:true,fill:true}];
    }
    state.chart=new Chart($('chart'),{type:'line',data:{labels,datasets},options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false}},scales:{x:{display:false},y:{grid:{color:'rgba(255,255,255,.07)'},ticks:{color:'#7e8b86',maxTicksLimit:4}}}}});
  }
  function load(){
    message('История загружается…');
    const x=new XMLHttpRequest();
    x.open('GET','/api/history-debug?owner=v142&t='+Date.now(),true);x.timeout=90000;
    x.onload=function(){try{const p=JSON.parse(x.responseText||'null');if(x.status>=200&&x.status<300&&p&&p.ok&&p.history&&p.history.available){draw(p.history);return}}catch(_){}message('История временно недоступна')};
    x.onerror=x.ontimeout=function(){message('История временно недоступна')};x.send(null);
  }
  document.querySelectorAll('.chartTab').forEach(b=>b.addEventListener('click',function(){state.mode=this.dataset.mode||'growth';if(state.history)draw(state.history)}));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,1800),{once:true});else setTimeout(load,1800);
})();