(()=>{'use strict';
const V='15.4.0';let scene=null,root=null,last=0;
function css(){if(document.getElementById('perf154css'))return;const s=document.createElement('style');s.id='perf154css';s.textContent=`
#perf154{position:absolute;inset:0;z-index:75;pointer-events:none;overflow:hidden;contain:layout paint style}
.p154{position:absolute;will-change:transform;filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}
.p154.cart{width:34px;height:17px;border:2px solid #b77a4a;border-top:4px solid #e1a063;background:#75452e;border-radius:2px 2px 6px 6px;animation:cart154 12s linear infinite}
.p154.cart:before,.p154.cart:after{content:'';position:absolute;width:7px;height:7px;border-radius:50%;background:#182023;border:2px solid #8c9697;bottom:-7px}.p154.cart:before{left:4px}.p154.cart:after{right:4px}
.p154.cart.loaded{box-shadow:0 -7px 0 -2px #45ded2,7px -10px 0 -4px #76fff3,-7px -9px 0 -4px #29bbb8}
.p154.cart.underground{top:91%;animation-duration:15s;animation-direction:reverse;opacity:.88}.p154.cart.surface{top:66%}
.p154.worker{width:16px;height:34px;animation:bob154 1.15s ease-in-out infinite alternate}.p154.worker:before{content:'';position:absolute;left:4px;top:0;width:9px;height:9px;border-radius:50%;background:#d89c68;box-shadow:0 -3px 0 #e6ae44}.p154.worker:after{content:'';position:absolute;left:3px;top:9px;width:11px;height:18px;border-radius:3px;background:#22a79e;box-shadow:-1px 18px 0 -1px #29383c,6px 18px 0 -1px #29383c}
.p154.worker.mine{left:13%;top:66%;transform-origin:50% 100%}.p154.worker.build{right:9%;top:66%;animation-duration:1.35s}.p154.worker.under{left:17%;top:92%;opacity:.9;animation-duration:1.45s}
.p154.bird{top:22%;width:22px;height:8px;animation:bird154 18s linear infinite}.p154.bird:before,.p154.bird:after{content:'';position:absolute;top:4px;width:12px;height:2px;background:rgba(214,235,230,.72)}.p154.bird:before{left:0;transform:rotate(-18deg)}.p154.bird:after{right:0;transform:rotate(18deg)}
@keyframes cart154{from{transform:translate3d(-70px,0,0)}to{transform:translate3d(calc(100vw + 70px),0,0)}}@keyframes bob154{to{transform:translate3d(0,-2px,0) rotate(1.5deg)}}@keyframes bird154{from{transform:translate3d(-40px,0,0)}to{transform:translate3d(calc(100vw + 50px),8px,0)}}
@media(max-width:999px){.p154.bird{display:none}.p154.cart{animation-duration:14s}.p154.worker{animation-duration:1.35s}}
`;document.head.appendChild(s)}
function level(){const p=Number(window.DNA_PREVIEW_LEVEL||0);return p>=1&&p<=11?p:Number(window.DNA_WORLD_STATE?.level)||1}
function badge(l){document.querySelectorAll('.dnBadge').forEach(x=>x.innerHTML='<i></i> PERF CEILING · v'+V+' · '+l+'/11');window.DNA_PERF_STATE={version:V,level:l,mode:'constant-cost-css-motion',canvasMotionDisabled:true,animatedObjects:matchMedia('(max-width:999px)').matches?5:6,levelScaledMotion:false}}
function tuneCanvas(){const m=document.getElementById('dna153motion');if(!m)return false;m.width=2;m.height=2;m.style.cssText+=';display:none!important;width:2px!important;height:2px!important;';const A=window.DNA_GAME_ASSETS;if(A&&!A.__perf154){const old=A.draw.bind(A);A.draw=function(ctx,...args){if(ctx?.canvas?.id==='dna153motion')return false;return old(ctx,...args)};A.__perf154=true}return true}
function build(){if(!scene)return;document.getElementById('perf154')?.remove();root=document.createElement('div');root.id='perf154';root.innerHTML='<i class="p154 worker mine"></i><i class="p154 worker build"></i><i class="p154 worker under"></i><i class="p154 cart loaded surface"></i><i class="p154 cart loaded underground"></i><i class="p154 bird"></i>';scene.appendChild(root);apply(level())}
function apply(l){if(!root||l===last)return;last=l;const under=root.querySelector('.worker.under'),bird=root.querySelector('.bird');if(under)under.style.opacity=l>=2?'.9':'0';if(bird)bird.style.opacity=l>=3?'1':'0';badge(l)}
function mount(){css();scene=document.getElementById('iwScene');if(!scene)return setTimeout(mount,80);let tries=0;const wait=()=>{if(tuneCanvas()||tries++>30){build();window.addEventListener('dna-v153-level',e=>apply(Number(e.detail?.level)||level()));window.dispatchEvent(new CustomEvent('dna-perf154-ready',{detail:{version:V}}));return}setTimeout(wait,60)};wait()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();