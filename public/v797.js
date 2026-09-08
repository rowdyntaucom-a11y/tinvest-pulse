(()=>{
 const num=s=>Number(String(s).replace(/\s/g,'').replace(',','.'));
 const sign=n=>n>0?'+':n<0?'−':'';
 const abs=n=>Math.abs(n).toFixed(2).replace('.',',');
 function explain(el){
  if(!el||el.dataset.ppExplain==='1')return;
  const raw=(el.textContent||'').trim();
  const m=raw.match(/([+−-]?\d+(?:[.,]\d+)?)\s*п\.п\./i);if(!m)return;
  const n=num(m[1].replace('−','-'));if(!Number.isFinite(n))return;
  const isVs=el.id==='vsMoex'||/IMOEX|индекс/i.test((el.parentElement?.textContent||''));
  const phrase=isVs?(n>=0?'лучше IMOEX':'хуже IMOEX'):'от цели';
  const hint=`${abs(n)}% ${phrase}`;
  let h=el.nextElementSibling;
  if(!h||!h.classList.contains('ppExplain')){h=document.createElement('small');h.className='ppExplain';el.insertAdjacentElement('afterend',h)}
  h.textContent=hint;el.dataset.ppExplain='1';
 }
 function scan(){document.querySelectorAll('body *').forEach(el=>{if(el.children.length===0&&/п\.п\./i.test(el.textContent||''))explain(el)})}
 const css=document.createElement('style');css.textContent='.ppExplain{display:block;margin-top:2px;font-size:6px;line-height:1.15;letter-spacing:.15px;color:#81918d;font-weight:600;text-transform:none}.mini .ppExplain{font-size:6px}.w77controls .ppExplain{display:inline;margin-left:5px}.w77grid .ppExplain,.stGrid .ppExplain{font-size:5px}';document.head.appendChild(css);
 const obs=new MutationObserver(()=>requestAnimationFrame(scan));obs.observe(document.documentElement,{subtree:true,childList:true,characterData:true});scan();setTimeout(scan,700);setInterval(scan,3000);
})();
