(()=>{'use strict';
const V='15.7.0',M=matchMedia('(max-width:999px)').matches;
let scene=null,last=-1,killTimer=0;
function css(){if(document.getElementById('dna157safeCss'))return;const s=document.createElement('style');s.id='dna157safeCss';s.textContent=`
@media(max-width:999px){
 body.investorWorldOpen #iwScene{contain:layout paint style!important;transform:translateZ(0)}
 body.investorWorldOpen #iwScene *,body.investorWorldOpen #iwScene *::before,body.investorWorldOpen #iwScene *::after{filter:none!important;will-change:auto!important}
 body.investorWorldOpen #perf154 .p154,body.investorWorldOpen #life153 .l153{animation:none!important;transition:none!important}
 body.investorWorldOpen #perf154 .bird,body.investorWorldOpen #perf154 .cart.underground,body.investorWorldOpen #perf154 .worker.under,body.investorWorldOpen #life153 .bird{display:none!important}
 body.investorWorldOpen #perf154 .cart.surface{left:58%!important;right:auto!important;top:66%!important;transform:none!important}
 body.investorWorldOpen #dna153motion{display:none!important}
}
#dna157transition{position:absolute;inset:0;z-index:110;pointer-events:none;opacity:0;background:radial-gradient(circle at 55% 58%,rgba(80,241,218,.14),rgba(80,241,218,0) 48%),linear-gradient(90deg,rgba(255,179,75,0),rgba(255,179,75,.08),rgba(255,179,75,0));transition:opacity .22s ease-out}
#dna157transition.on{opacity:1;transition:none}
`;document.head.appendChild(s)}
function killMotion(){clearTimeout(killTimer);killTimer=setTimeout(()=>{const m=document.getElementById('dna153motion');if(m)m.remove();},50)}
function ensureOverlay(){if(!scene)return null;let o=document.getElementById('dna157transition');if(!o){o=document.createElement('div');o.id='dna157transition';scene.appendChild(o)}return o}
function level(){const p=Number(window.DNA_PREVIEW_LEVEL||0);return p>=1&&p<=11?p:Number(window.DNA_WORLD_STATE?.level)||1}
function flash(n){if(!document.body.classList.contains('investorWorldOpen'))return;const o=ensureOverlay();if(!o)return;o.classList.add('on');requestAnimationFrame(()=>requestAnimationFrame(()=>o.classList.remove('on')));last=n;killMotion()}
function lock(){document.querySelectorAll('*').forEach(el=>{if(el.children.length)return;const t=el.textContent||'';if(/INVESTOR DNA\s*·\s*v\d+\.\d+\.\d+/i.test(t))el.textContent=t.replace(/v\d+\.\d+\.\d+/i,'v'+V)});document.querySelectorAll('.dnBadge').forEach(b=>b.innerHTML='<i></i> PERF SAFE · v'+V+' · '+level()+'/11')}
function mount(){css();scene=document.getElementById('iwScene');if(!scene)return setTimeout(mount,100);if(M)killMotion();lock();last=level();window.DNA_SAFE_STATE={version:V,mobile:M,continuousCanvasMotion:!M,continuousCssMotion:!M,mode:M?'static-mobile-safe':'desktop-motion'};window.addEventListener('dna-game-remount',()=>{if(M)killMotion()});window.addEventListener('dna-v153-level',e=>{const n=Number(e.detail?.level)||level();if(n!==last)flash(n);lock()});setTimeout(lock,400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
