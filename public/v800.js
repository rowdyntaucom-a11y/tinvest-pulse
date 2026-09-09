(()=>{
'use strict';
const VERSION='8.0.0';
const KEY='tinvest_investor_dna_v8';
const PROFILES={
 mixed:{name:'СМЕШАННАЯ',icon:'◈',desc:'Рост капитала + денежный поток',focus:['Баланс','Риск','Поток']},
 dividend:{name:'ДИВИДЕНДНАЯ',icon:'₽',desc:'Дивиденды, стабильность выплат и рост потока',focus:['Дивиденды','Yield','Покрытие']},
 coupon:{name:'КУПОННАЯ',icon:'▥',desc:'Купоны, YTM, дюрация и лестница погашений',focus:['Купоны','YTM','Duration']},
 growth:{name:'РОСТ',icon:'↗',desc:'Рост капитала и качество риска',focus:['CAGR','Drawdown','Alpha']},
 active:{name:'АКТИВНАЯ',icon:'⌁',desc:'Результат сделок и контроль риска',focus:['P/L','Hit rate','Risk']}
};
function rub(n){return Math.round(Number(n)||0).toLocaleString('ru-RU')+' ₽'}
function numText(el){return Number(String(el?.textContent||'').replace(/[^0-9,.-]/g,'').replace(',','.'))||0}
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x))}
function capital(){return Math.max(0,numText(document.getElementById('value')))}
function profit(){return numText(document.getElementById('profit'))}
function levelData(cap){
 const thresholds=[0,100000,250000,500000,1000000,2500000,5000000,10000000,25000000,50000000,100000000];
 let level=1; for(let i=1;i<thresholds.length;i++) if(cap>=thresholds[i]) level=i+1;
 const idx=Math.min(level-1,thresholds.length-1), from=thresholds[idx], next=thresholds[Math.min(idx+1,thresholds.length-1)];
 const pct=level>=thresholds.length?100:Math.max(0,Math.min(100,(cap-from)/(next-from)*100));
 return {level,pct,next,max:thresholds.length};
}
function stage(l){return l<=2?'ФУНДАМЕНТ':l<=4?'МАСТЕРСКАЯ':l<=6?'КАПИТАЛЬНЫЙ ДОМ':l<=8?'БАШНЯ КАПИТАЛА':l<=10?'ФИНАНСОВАЯ КРЕПОСТЬ':'ЛЕГЕНДА'}
function ensure(){
 if(document.getElementById('dnaWorldBtn'))return;
 const b=document.createElement('button'); b.id='dnaWorldBtn'; b.className='dnaWorldBtn'; b.type='button'; b.textContent='DNA';
 const actions=document.querySelector('.topActions'); if(actions) actions.insertBefore(b,actions.firstChild);
 const wrap=document.createElement('section'); wrap.id='investorWorld'; wrap.className='investorWorld'; wrap.setAttribute('aria-hidden','true');
 wrap.innerHTML=`<div class="iwTop"><div><small>INVESTOR DNA · v${VERSION}</small><h2>ЖИВОЙ ПОРТФЕЛЬ</h2></div><button id="iwClose">×</button></div>
 <div class="iwHero"><div class="iwScene"><div class="iwSky">✦　·　✧</div><div class="iwBuild" id="iwBuild"><i></i><b>⌂</b><span id="iwStage">ФУНДАМЕНТ</span></div><div class="iwMiner">♟<i>◆</i></div><div class="iwVault"><span>◆</span><b id="iwWealth">—</b></div></div>
 <div class="iwLevel"><small>УРОВЕНЬ ИНВЕСТОРА</small><strong id="iwLevel">1</strong><span id="iwLevelMax">/ 11</span><div><i id="iwProgress"></i></div><p id="iwNext">—</p></div></div>
 <div class="iwStats"><div><small>КАПИТАЛ</small><b id="iwCapital">—</b></div><div><small>ПРИБЫЛЬ</small><b id="iwProfit">—</b></div><div><small>МИР</small><b id="iwWorldName">—</b></div></div>
 <div class="iwProfile"><div class="iwHead"><span>ТВОЯ СТРАТЕГИЯ</span><small>инструменты адаптируются под профиль</small></div><div class="iwProfiles" id="iwProfiles"></div><div class="iwFocus" id="iwFocus"></div></div>
 <div class="iwFoot">Рост мира привязан к реальному капиталу. Уровень нельзя купить игровыми очками.</div>`;
 document.querySelector('main.phone')?.appendChild(wrap);
 b.onclick=()=>open(); document.getElementById('iwClose').onclick=()=>close();
}
function renderProfiles(){
 const s=state(), active=s.profile||'mixed', box=document.getElementById('iwProfiles'); if(!box)return;
 box.innerHTML=Object.entries(PROFILES).map(([k,p])=>`<button class="iwProfileBtn ${k===active?'active':''}" data-p="${k}"><b>${p.icon} ${p.name}</b><small>${p.desc}</small></button>`).join('');
 box.querySelectorAll('button').forEach(x=>x.onclick=()=>{const n=state();n.profile=x.dataset.p;save(n);render();});
 const p=PROFILES[active]; document.getElementById('iwFocus').innerHTML='<span>ФОКУС DNA</span>'+p.focus.map(x=>`<b>${x}</b>`).join('');
}
function render(){
 ensure(); const cap=capital(), pr=profit(), ld=levelData(cap), s=state();
 document.getElementById('iwCapital').textContent=rub(cap); document.getElementById('iwProfit').textContent=(pr>=0?'+':'')+rub(pr);
 document.getElementById('iwLevel').textContent=ld.level; document.getElementById('iwLevelMax').textContent='/ '+ld.max;
 document.getElementById('iwProgress').style.width=ld.pct+'%'; document.getElementById('iwStage').textContent=stage(ld.level); document.getElementById('iwWorldName').textContent=stage(ld.level);
 document.getElementById('iwWealth').textContent=rub(cap); document.getElementById('iwBuild').dataset.level=ld.level;
 document.getElementById('iwNext').textContent=ld.pct>=100?'МАКСИМАЛЬНЫЙ УРОВЕНЬ':`до следующего уровня ${rub(Math.max(0,ld.next-cap))}`;
 renderProfiles();
 if(!s.firstSeen){s.firstSeen=Date.now();s.profile=s.profile||'mixed';save(s)}
}
function open(){render(); document.body.classList.add('investorWorldOpen'); document.getElementById('investorWorld').setAttribute('aria-hidden','false')}
function close(){document.body.classList.remove('investorWorldOpen'); document.getElementById('investorWorld').setAttribute('aria-hidden','true')}
const css=`.dnaWorldBtn{border:1px solid #36e6bd55;background:#07130f;color:#55f0c7;border-radius:14px;padding:10px 12px;font-weight:900;letter-spacing:1px}.investorWorld{display:none;position:absolute;z-index:120;inset:0;background:#050b09;color:#edfdf8;padding:24px 18px 70px;min-height:100vh}.investorWorldOpen .investorWorld{display:block}.investorWorldOpen main.phone>section:not(.investorWorld),.investorWorldOpen main.phone>header{display:none!important}.iwTop{display:flex;justify-content:space-between;align-items:center}.iwTop small,.iwHead small{color:#6f9188;letter-spacing:2px}.iwTop h2{margin:4px 0 16px;font-size:27px;letter-spacing:2px}.iwTop h2::first-letter{color:#55f0c7}.iwTop button{font-size:28px;background:none;border:0;color:#55f0c7}.iwHero{border:1px solid #39d9b344;border-radius:26px;overflow:hidden;background:radial-gradient(circle at 50% 20%,#15362d,#07100d 64%);box-shadow:0 0 40px #1bd8a414 inset}.iwScene{height:265px;position:relative;border-bottom:1px solid #39d9b333;background:linear-gradient(#06100e 55%,#0c1b15 56%)}.iwSky{position:absolute;inset:18px;color:#55f0c777;letter-spacing:28px;animation:iwTwinkle 3s infinite alternate}.iwBuild{position:absolute;left:50%;bottom:35px;transform:translateX(-50%);text-align:center}.iwBuild b{display:block;font-size:82px;color:#55f0c7;text-shadow:0 0 24px #2fe0b4}.iwBuild span{font-size:10px;letter-spacing:2px}.iwBuild i{position:absolute;width:90px;height:7px;bottom:18px;left:50%;transform:translateX(-50%);background:#1c5544;box-shadow:0 0 18px #55f0c7}.iwMiner{position:absolute;left:14%;bottom:25px;font-size:36px;animation:iwMine 1.5s infinite alternate}.iwMiner i{font-size:18px;color:#55f0c7}.iwVault{position:absolute;right:8%;bottom:25px;text-align:center}.iwVault span{font-size:38px;color:#55f0c7}.iwVault b{display:block;font-size:11px}.iwLevel{padding:18px}.iwLevel strong{font-size:42px;color:#55f0c7}.iwLevel>div{height:9px;background:#10211c;border-radius:9px;overflow:hidden}.iwLevel>div i{display:block;height:100%;background:#55f0c7;box-shadow:0 0 15px #55f0c7;transition:width .8s}.iwLevel p{font-size:11px;color:#8fa9a2}.iwStats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.iwStats div{border:1px solid #24453c;border-radius:18px;padding:14px 10px}.iwStats small{display:block;color:#6f9188;font-size:9px}.iwStats b{font-size:14px}.iwProfile{margin-top:18px}.iwHead{display:flex;justify-content:space-between;align-items:end;margin-bottom:10px}.iwHead span{font-weight:900;letter-spacing:2px;color:#55f0c7}.iwProfiles{display:grid;gap:8px}.iwProfileBtn{text-align:left;border:1px solid #1c3932;background:#08110e;color:#eafbf6;padding:13px;border-radius:16px}.iwProfileBtn b,.iwProfileBtn small{display:block}.iwProfileBtn small{color:#718f87;margin-top:4px}.iwProfileBtn.active{border-color:#55f0c7;box-shadow:0 0 18px #20d5a522 inset}.iwFocus{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:12px}.iwFocus span{font-size:10px;color:#6f9188}.iwFocus b{font-size:10px;border:1px solid #2b594d;padding:6px 8px;border-radius:20px}.iwFoot{margin-top:18px;border-left:3px solid #55f0c7;padding:12px;color:#78968e;font-size:11px}@keyframes iwMine{to{transform:rotate(-8deg) translateY(-3px)}}@keyframes iwTwinkle{to{opacity:.35}}@media(max-width:420px){.dnaWorldBtn{padding:9px 8px;font-size:10px}.iwScene{height:230px}.iwStats b{font-size:12px}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
function boot(){ensure();setTimeout(render,1800);setInterval(()=>{if(document.body.classList.contains('investorWorldOpen'))render()},15000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();