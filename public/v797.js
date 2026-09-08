(()=>{
 const num=s=>Number(String(s).replace(/\s/g,'').replace(',','.'));
 const abs=(n,d=2)=>Math.abs(n).toFixed(d).replace('.',',');
 function context(el,n){
  const box=el.closest('.w77controls label,.w77grid>div,.stGrid>div,.mini,.card')||el.parentElement;
  const txt=((box?.textContent||'')+' '+(el.id||'')).toLowerCase();
  if(el.id==='vsMoex'||/imoex|индекс/.test(txt))return `${abs(n)}% ${n>=0?'лучше':'хуже'} IMOEX`;
  if(/ставк|доходност|w77rate/.test(txt))return `${n<0?'снижение':'рост'} доходности на ${abs(n,1)} п.п.`;
  if(/отклон|цели|stgap|gap/.test(txt))return `акций на ${abs(n,1)}% ${n<0?'меньше':'больше'} цели`;
  return `${abs(n,1)} процентного пункта ${n<0?'ниже':'выше'} ориентира`;
 }
 function explain(el){
  if(!el||el.classList?.contains('ppExplain'))return;
  const raw=(el.textContent||'').trim();
  const cleaned=raw.replace(/\s*\([+−-]?\d+(?:[.,]\d+)?%\)/g,'');
  if(cleaned!==raw)el.textContent=cleaned;
  const m=cleaned.match(/([+−-]?\d+(?:[.,]\d+)?)\s*п\.п\./i);if(!m)return;
  const n=num(m[1].replace('−','-'));if(!Number.isFinite(n))return;
  const hint=context(el,n);
  let h=el.nextElementSibling;
  if(!h||!h.classList.contains('ppExplain')){h=document.createElement('small');h.className='ppExplain';el.insertAdjacentElement('afterend',h)}
  if(h.textContent!==hint)h.textContent=hint;
  el.dataset.ppExplain=String(n);
 }
 function scan(){document.querySelectorAll('body *').forEach(el=>{if(!el.classList?.contains('ppExplain')&&el.children.length===0&&/п\.п\./i.test(el.textContent||''))explain(el)})}
 const css=document.createElement('style');css.textContent='.ppExplain{display:block;margin-top:3px;font-size:6px;line-height:1.2;letter-spacing:.15px;color:#81918d;font-weight:600;text-transform:none}.mini .ppExplain{font-size:6px}.w77controls .ppExplain{display:block;margin:3px 0 0;text-align:right;white-space:normal}.w77grid .ppExplain,.stGrid .ppExplain{font-size:5px}';document.head.appendChild(css);
 let queued=false;const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;scan()})};new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true,characterData:true});scan();setTimeout(scan,700);setInterval(scan,3000);
})();
