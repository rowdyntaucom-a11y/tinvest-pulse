(()=>{'use strict';
const V='15.6.0',MOBILE=matchMedia('(max-width:999px)').matches;
let scene=null,last=0,fxTimer=0,settleTimer=0;
const NAMES=['ФУНДАМЕНТ','ДОМ','ПОСЕЛЕНИЕ','ГОРОД','КРЕПОСТЬ','КОРОЛЕВСТВО','СТОЛИЦА','ЦИТАДЕЛЬ','ИМПЕРИЯ','ЛЕГЕНДА','БЕСКОНЕЧНОСТЬ'];
function css(){if(document.getElementById('evo156css'))return;const s=document.createElement('style');s.id='evo156css';s.textContent=`
#evo156{position:absolute;inset:0;z-index:88;pointer-events:none;overflow:hidden;contain:layout paint style}
#evo156 .evoFlash{position:absolute;inset:0;opacity:0;background:linear-gradient(110deg,transparent 18%,rgba(84,246,197,.12) 48%,rgba(255,205,112,.15) 54%,transparent 82%);transform:translateX(-55%)}
#evo156.go .evoFlash{animation:evoFlash156 .52s ease-out 1}
#evo156 .evoDust{position:absolute;left:22%;right:12%;top:48%;height:24%;opacity:0;background:radial-gradient(ellipse at 22% 70%,rgba(185,132,76,.20),transparent 26%),radial-gradient(ellipse at 48% 62%,rgba(185,132,76,.14),transparent 28%),radial-gradient(ellipse at 78% 72%,rgba(185,132,76,.12),transparent 25%)}
#evo156.go .evoDust{animation:evoDust156 .62s ease-out 1}
#evo156 .evoLabel{position:absolute;left:50%;top:8%;transform:translate(-50%,-8px);padding:6px 11px;border:1px solid rgba(84,246,197,.32);border-radius:999px;background:rgba(2,10,10,.72);color:#bfffee;font:800 10px/1 system-ui,sans-serif;letter-spacing:.9px;opacity:0;white-space:nowrap}
#evo156.go .evoLabel{animation:evoLabel156 .9s ease-out 1}
#evo156 .finished{position:absolute;left:25%;top:42.5%;width:16.5%;height:24%;opacity:0;transition:opacity .35s ease;filter:none}
#evo156 .finished::before{content:'';position:absolute;left:8%;right:8%;bottom:0;height:68%;background:linear-gradient(#583b2c,#2c211d);border:2px solid #9f6b43;box-shadow:inset 0 0 0 3px rgba(255,205,120,.04)}
#evo156 .finished::after{content:'';position:absolute;left:0;right:0;top:13%;height:29%;clip-path:polygon(0 100%,50% 0,100% 100%);background:#6f472f;border-bottom:3px solid #ba7746}
#evo156 .finished .windows{position:absolute;z-index:2;left:20%;right:20%;bottom:17%;height:24%;background:repeating-linear-gradient(90deg,#ffd77d 0 9%,transparent 9% 27%);opacity:.9}
#evo156.final .finished{opacity:1}
#evo156.final10 .finished{opacity:.72}
@keyframes evoFlash156{0%{opacity:0;transform:translateX(-55%)}35%{opacity:1}100%{opacity:0;transform:translateX(55%)}}
@keyframes evoDust156{0%{opacity:0;transform:translateY(8px) scale(.94)}35%{opacity:1}100%{opacity:0;transform:translateY(-12px) scale(1.04)}}
@keyframes evoLabel156{0%{opacity:0;transform:translate(-50%,-8px)}18%,70%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,4px)}}
@media(max-width:999px){
 #life153 .l153{filter:none!important;will-change:auto!important;animation:none!important}
 #life153 .l153.bird{display:none!important}
 #perf154 .p154{filter:none!important;will-change:auto!important}
 #perf154 .worker.under,#perf154 .cart.underground,#perf154 .bird{display:none!important}
 #perf154 .worker.mine,#perf154 .worker.build{animation-duration:1.8s!important}
 #perf154 .cart.surface{animation-duration:18s!important}
 #evo156 .evoDust{display:none}
 #evo156 .evoLabel{font-size:9px}
}
@media(prefers-reduced-motion:reduce){#evo156 .evoFlash,#evo156 .evoDust,#evo156 .evoLabel{animation:none!important}.p154,.l153{animation:none!important}}
`;document.head.appendChild(s)}
function level(){const p=Number(window.DNA_PREVIEW_LEVEL||0);return p>=1&&p<=11?p:(Number(window.DNA_WORLD_STATE?.level)||1)}
function mount(){css();scene=document.getElementById('iwScene');if(!scene)return setTimeout(mount,100);document.getElementById('evo156')?.remove();const r=document.createElement('div');r.id='evo156';r.innerHTML='<i class="evoFlash"></i><i class="evoDust"></i><b class="evoLabel"></b><div class="finished"><i class="windows"></i></div>';scene.appendChild(r);last=level();applyFinal(last);window.addEventListener('dna-v153-level',e=>change(Number(e.detail?.level)||level()));window.addEventListener('dna-perf154-ready',trim);trim();window.DNA_EVOLUTION_STATE={version:V,level:last,transition:'build-flash',finalConstruction:last>=10,perfMode:MOBILE?'mobile-lite':'desktop-full'}}
function trim(){if(!MOBILE)return;document.querySelectorAll('#life153 .bird,#perf154 .bird,#perf154 .worker.under,#perf154 .cart.underground').forEach(n=>n.style.display='none')}
function applyFinal(l){const r=document.getElementById('evo156');if(!r)return;r.classList.toggle('final10',l===10);r.classList.toggle('final',l>=11);window.DNA_EVOLUTION_STATE={version:V,level:l,transition:'build-flash',finalConstruction:l>=10,completed:l>=11,perfMode:MOBILE?'mobile-lite':'desktop-full'}}
function change(l){if(!scene||!l||l===last)return;const from=last;last=l;const r=document.getElementById('evo156');if(!r)return;clearTimeout(fxTimer);clearTimeout(settleTimer);const label=r.querySelector('.evoLabel');if(label)label.textContent=(l>from?'СТРОИМ → ':'ВОЗВРАТ → ')+(NAMES[l-1]||('УРОВЕНЬ '+l));r.classList.remove('go');void r.offsetWidth;r.classList.add('go');applyFinal(l);fxTimer=setTimeout(()=>r.classList.remove('go'),920);settleTimer=setTimeout(trim,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();