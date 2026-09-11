(()=>{'use strict';
const V='15.5.0';
const MOBILE=matchMedia('(max-width:999px)').matches;
let open=false,lastPreview=-1,previewTimer=0,remountTimer=0;
function css(){if(document.getElementById('globalPerf155Css'))return;const s=document.createElement('style');s.id='globalPerf155Css';s.textContent=`
@media(max-width:999px){
 body:not(.investorWorldOpen) .phone *,body:not(.investorWorldOpen) .phone *::before,body:not(.investorWorldOpen) .phone *::after{animation-play-state:paused!important}
 body:not(.investorWorldOpen) #hudParticles,body:not(.investorWorldOpen) .hudParticle{display:none!important}
 body:not(.investorWorldOpen) .pulseBtn::before,body:not(.investorWorldOpen) .liveDot::before{animation:none!important}
 body:not(.investorWorldOpen) .phone [style*="will-change"]{will-change:auto!important}
 body:not(.investorWorldOpen) #perf154,body:not(.investorWorldOpen) #life153{display:none!important}
 body:not(.investorWorldOpen) #perf154 *,body:not(.investorWorldOpen) #life153 *{animation:none!important;will-change:auto!important}
}
`;document.head.appendChild(s)}
function stopCanvasLoop(){const m=document.getElementById('dna153motion');if(m)m.remove()}
function stopPreviewTimer(){if(previewTimer){clearInterval(previewTimer);previewTimer=0}}
function hardSleep(){stopPreviewTimer();clearTimeout(remountTimer);stopCanvasLoop();document.documentElement.dataset.dnaSleeping='1';window.DNA_PERF_GATE={version:V,state:'sleep',mobile:MOBILE}}
function finishStaticMount(){stopCanvasLoop();const p=document.getElementById('perf154');const l=document.getElementById('life153');if(p)p.style.display='';if(l)l.style.display='';window.DNA_PERF_GATE={version:V,state:'awake-static-canvas-css-motion',mobile:MOBILE}}
function remountStatic(){if(!document.body.classList.contains('investorWorldOpen'))return;clearTimeout(remountTimer);window.dispatchEvent(new CustomEvent('dna-game-remount'));remountTimer=setTimeout(finishStaticMount,180)}
function readPreview(){const n=Number(window.DNA_PREVIEW_LEVEL||0);return n>=1&&n<=11?n:Number(window.DNA_WORLD_STATE?.level)||1}
function startPreviewTimer(){stopPreviewTimer();lastPreview=readPreview();previewTimer=setInterval(()=>{if(!document.body.classList.contains('investorWorldOpen'))return hardSleep();const n=readPreview();if(n!==lastPreview){lastPreview=n;remountStatic()}},300)}
function wake(){document.documentElement.dataset.dnaSleeping='0';remountStatic();startPreviewTimer()}
function sync(){const now=document.body.classList.contains('investorWorldOpen');if(now===open)return;open=now;if(open)wake();else hardSleep()}
function boot(){css();open=document.body.classList.contains('investorWorldOpen');if(open)wake();else setTimeout(hardSleep,80);new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',()=>{if(document.hidden)hardSleep();else sync()});window.addEventListener('pagehide',hardSleep);window.DNA_GLOBAL_PERF_VERSION=V}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();