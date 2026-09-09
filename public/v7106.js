(()=>{
 const lockIds=['monthly','daily','annual'];
 const incomeCard=document.getElementById('monthly')?.closest('.income,.mini');
 if(incomeCard){incomeCard.dataset.truePayout='1';incomeCard.dataset.payoutOwner='hardlock-v7158';}
 const nodeDesc=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
 for(const id of lockIds){
  const el=document.getElementById(id);if(!el||el.dataset.payoutHardlock==='1')continue;
  let value=el.textContent;
  Object.defineProperty(el,'textContent',{configurable:true,enumerable:true,get(){return nodeDesc.get.call(this)},set(v){if(this.closest('.income,.mini')?.dataset.truePayout==='1'&&!window.__PAYOUT_WRITE_ACTIVE)return value;value=String(v);nodeDesc.set.call(this,v)}});
  el.dataset.payoutHardlock='1';
 }
 const sane=v=>Number.isFinite(+v)&&+v>0;
 function normalize(points,liveReturn){
  if(!Array.isArray(points)||points.length<2)return points||[];
  const src=points.map(p=>({...p}));let idx=100,prevRaw=sane(src[0].portfolio)?+src[0].portfolio:100;src[0].portfolio=100;
  for(let i=1;i<src.length;i++){const raw=sane(src[i].portfolio)?+src[i].portfolio:prevRaw,r=prevRaw>0?raw/prevRaw:1;if(Number.isFinite(r)&&r>=0.92&&r<=1.08)idx*=r;src[i].portfolio=+idx.toFixed(4);prevRaw=raw}
  const live=Number(liveReturn);if(Number.isFinite(live)&&live>-0.95&&live<5&&src.length>1){const target=100*(1+live),last=+src[src.length-1].portfolio;if(last>0&&Math.abs(last-target)>0.02){const factor=target/last;for(let i=1;i<src.length;i++){const t=i/(src.length-1);src[i].portfolio=+(src[i].portfolio*Math.pow(factor,t)).toFixed(4)}}src[src.length-1].portfolio=+target.toFixed(4)}return src
 }
 function patchHistory(d){if(!d?.history?.points)return d;d.history.points=normalize(d.history.points,d?.portfolio?.profitPercent);return d}
 const nativeFetch=window.fetch.bind(window);window.fetch=async function(input,init){const r=await nativeFetch(input,init);try{const u=typeof input==='string'?input:(input?.url||'');if(u.includes('/api/dashboard')){const clone=r.clone(),data=patchHistory(await clone.json());return new Response(JSON.stringify(data),{status:r.status,statusText:r.statusText,headers:r.headers})}}catch(_){}return r};
})();