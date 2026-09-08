(()=>{
  const $=id=>document.getElementById(id);
  const rub=n=>Number.isFinite(Number(n))?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Number(n))+' ₽':'—';
  const dateShort=v=>v?new Date(v).toLocaleDateString('ru-RU',{day:'2-digit',month:'short'}).replace('.',''):'—';
  const monthName=(y,m)=>new Date(y,m-1,1).toLocaleString('ru-RU',{month:'short'}).replace('.','').toUpperCase();

  let loading=false;
  let selectedMonth=null;

  function install(){
    const host=$('cashCalendarMonths');
    const panel=host?.closest('.cashCalendar');
    if(!host||!panel)return false;
    host.dataset.truePayout='1';
    if($('payoutTrueMeta'))return true;

    const head=panel.querySelector('.panelHead');
    if(head){
      const title=head.querySelector('span'); if(title)title.textContent='▦ КАЛЕНДАРЬ ВЫПЛАТ';
      const badge=head.querySelector('b'); if(badge){badge.id='payoutCalendarBadge';badge.textContent='TRUE 12M';}
    }

    const foot=panel.querySelector('.cashCalendarFoot');
    if(foot)foot.innerHTML='<span>ФАКТ <b id="payoutActual">—</b></span><span>ПРОГНОЗ NET <b id="payoutForecast">—</b></span>';

    panel.insertAdjacentHTML('beforeend','<div class="payoutTrueMeta" id="payoutTrueMeta"><div><small>БЛИЖАЙШАЯ ВЫПЛАТА</small><b id="payoutNext">Загрузка…</b></div><p id="payoutDetail">Получаем реальные купоны и объявленные дивиденды из T‑Invest API…</p></div>');

    const css=document.createElement('style');
    css.id='v72Style';
    css.textContent=`
      .cashMonth.trueMonth{cursor:pointer;min-height:38px;transition:.18s ease}
      .cashMonth.trueMonth:active{transform:scale(.96)}
      .cashMonth.trueMonth.hasPay{border-color:color-mix(in srgb,var(--accent) 36%,transparent);background:color-mix(in srgb,var(--accent) 5%,transparent)}
      .cashMonth.trueMonth.nextPay{box-shadow:0 0 12px color-mix(in srgb,var(--accent) 17%,transparent);border-color:var(--accent)}
      .cashMonth.trueMonth.quiet b{color:#52635f;font-size:6px;letter-spacing:.6px}
      .cashMonth.trueMonth small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .cashCalendarFoot span{display:flex;gap:3px;align-items:center}.cashCalendarFoot span b{color:var(--accent)}
      .payoutTrueMeta{margin-top:5px;padding-top:5px;border-top:1px solid rgba(255,255,255,.065)}
      .payoutTrueMeta>div{display:flex;justify-content:space-between;gap:8px;align-items:baseline}.payoutTrueMeta small{font-size:5px;letter-spacing:.8px;color:var(--muted)}.payoutTrueMeta b{font-size:6px;color:var(--accent);text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70%}
      .payoutTrueMeta p{font-size:5.5px;line-height:1.25;color:#7f918c;margin:3px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    `;
    document.head.appendChild(css);
    return true;
  }

  function renderDetail(month){
    const p=$('payoutDetail');if(!p)return;
    if(!month||!month.items?.length){p.textContent='В этом месяце подтверждённых выплат по текущим позициям нет — ТИХО.';return;}
    p.textContent=month.items.slice(0,3).map(x=>`${dateShort(x.date)} · ${x.ticker} · ${x.kind==='COUPON'?'КУПОН':'ДИВИДЕНД'} · ${rub(x.net)} NET`).join('  •  ')+(month.items.length>3?`  •  +${month.items.length-3}`:'');
  }

  function render(d){
    if(!install())return;
    const host=$('cashCalendarMonths');
    const months=Array.isArray(d?.months)?d.months:[];
    host.innerHTML='';
    const nextKey=d?.next?.date?`${new Date(d.next.date).getFullYear()}-${String(new Date(d.next.date).getMonth()+1).padStart(2,'0')}`:null;

    months.forEach(m=>{
      const el=document.createElement('div');
      const has=Number(m.count)>0;
      el.className='cashMonth trueMonth '+(has?'hasPay':'quiet')+(m.key===nextKey?' nextPay':'');
      el.dataset.month=m.key;
      el.innerHTML=`<span>${monthName(m.year,m.month)}</span><b>${has?rub(m.net):'ТИХО'}</b><small>${has?`${m.count} ВЫПЛ.`:'0 ВЫПЛ.'}</small>`;
      el.onclick=()=>{selectedMonth=m.key;host.querySelectorAll('.trueMonth').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderDetail(m)};
      host.appendChild(el);
    });

    if($('payoutActual'))$('payoutActual').textContent=`${d?.actual?.year||new Date().getFullYear()} · ${rub(d?.actual?.totalNet)}`;
    if($('payoutForecast'))$('payoutForecast').textContent=rub(d?.forecast?.net);
    if($('payoutCalendarBadge'))$('payoutCalendarBadge').textContent=d?.forecast?.count?`${d.forecast.count} ВЫПЛ.`:'TRUE 12M';

    if(d?.next){
      const kind=d.next.kind==='COUPON'?'КУПОН':'ДИВИДЕНД';
      if($('payoutNext'))$('payoutNext').textContent=`${d.next.ticker} · ${dateShort(d.next.date)} · ${rub(d.next.net)} · ${d.next.days} дн.`;
      if(!selectedMonth&&$('payoutDetail'))$('payoutDetail').textContent=`${kind}: ${rub(d.next.gross)} начислено → −${rub(d.next.tax)} НДФЛ → ${rub(d.next.net)} на руки.`;
    }else{
      if($('payoutNext'))$('payoutNext').textContent='В ближайшие 12 месяцев подтверждений нет';
      if($('payoutDetail'))$('payoutDetail').textContent='Показываем только выплаты, подтверждённые расписанием T‑Invest API.';
    }

    const sub=document.querySelector('.pulseKicker')?.parentElement?.querySelector('small');
    if(sub)sub.textContent='PORTFOLIO GENOME · v7.2';
  }

  async function load(force=false){
    if(loading)return;
    if(!document.body.classList.contains('pulse-active')&&!force)return;
    loading=true;
    try{
      const r=await fetch('/api/payouts?v=7.2&t='+Date.now(),{cache:'no-store'});
      const d=await r.json();
      if(!r.ok)throw new Error(d?.error||`HTTP ${r.status}`);
      render(d);
    }catch(err){
      install();
      if($('payoutCalendarBadge'))$('payoutCalendarBadge').textContent='RETRY';
      if($('payoutNext'))$('payoutNext').textContent='Календарь временно недоступен';
      if($('payoutDetail'))$('payoutDetail').textContent=err?.message||'Ошибка получения расписания выплат';
      console.warn('v7.2 payout calendar:',err);
    }finally{loading=false;}
  }

  const observer=new MutationObserver(()=>{
    if(document.body.classList.contains('pulse-active'))setTimeout(()=>load(true),250);
  });
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('click',e=>{if(e.target.closest('#pulseBtn,#scoreRing'))setTimeout(()=>load(true),1300)});
  setTimeout(()=>{if(document.body.classList.contains('pulse-active'))load(true)},900);
})();