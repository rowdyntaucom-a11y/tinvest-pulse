(()=>{
 const sane=v=>Number.isFinite(+v)&&+v>0;
 function normalize(points,liveReturn){
  if(!Array.isArray(points)||points.length<2)return points||[];
  const src=points.map(p=>({...p}));
  let idx=100,prevRaw=sane(src[0].portfolio)?+src[0].portfolio:100;
  src[0].portfolio=100;
  for(let i=1;i<src.length;i++){
   const raw=sane(src[i].portfolio)?+src[i].portfolio:prevRaw;
   const r=prevRaw>0?raw/prevRaw:1;
   // A diversified 50/50 portfolio cannot realistically move 8% in one day here.
   // Larger jumps are reconstruction/cash-flow artifacts and must not enter P&L.
   if(Number.isFinite(r)&&r>=0.92&&r<=1.08)idx*=r;
   src[i].portfolio=+idx.toFixed(4);prevRaw=raw;
  }
  // profitPercent in /api/dashboard is decimal (e.g. 0.025 = +2.5%).
  // Read it from the SAME response being rendered; app.js keeps dashboardData lexical,
  // so window.dashboardData was never a valid source and caused the previous bad anchor.
  const live=Number(liveReturn);
  if(Number.isFinite(live)&&live>-0.95&&live<5&&src.length>1){
   const target=100*(1+live),last=+src[src.length-1].portfolio;
   if(last>0&&Math.abs(last-target)>0.02){
    const factor=target/last;
    for(let i=1;i<src.length;i++){
     const t=i/(src.length-1);
     src[i].portfolio=+(src[i].portfolio*Math.pow(factor,t)).toFixed(4);
    }
   }
   src[src.length-1].portfolio=+target.toFixed(4);
  }
  return src;
 }
 function patchHistory(d){
  if(!d?.history?.points)return d;
  d.history.points=normalize(d.history.points,d?.portfolio?.profitPercent);
  return d;
 }
 const nativeFetch=window.fetch.bind(window);
 window.fetch=async function(input,init){
  const r=await nativeFetch(input,init);
  try{
   const u=typeof input==='string'?input:(input?.url||'');
   if(u.includes('/api/dashboard')){
    const clone=r.clone(),data=patchHistory(await clone.json());
    return new Response(JSON.stringify(data),{status:r.status,statusText:r.statusText,headers:r.headers});
   }
  }catch(_){}
  return r;
 };
})();
