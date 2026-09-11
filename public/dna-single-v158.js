(()=>{'use strict';
const V='15.8.0';
const LEVELS=['ФУНДАМЕНТ','ДОМ','ПОСЕЛЕНИЕ','ГОРОД','КРЕПОСТЬ','КОРОЛЕВСТВО','СТОЛИЦА','ЦИТАДЕЛЬ','ИМПЕРИЯ','ЛЕГЕНДА','БЕСКОНЕЧНОСТЬ'];
let scene=null,root=null,last=0,open=false,bodyObserver=null,remountTimer=0;
function css(){if(document.getElementById('dna158css'))return;const s=document.createElement('style');s.id='dna158css';s.textContent=`
#life158{position:absolute;inset:0;z-index:76;pointer-events:none;overflow:hidden;contain:layout paint style}
#life158 .e{position:absolute;transform:translate(-50%,-100%)}
#life158 .person{width:14px;height:34px}
#life158 .person:before{content:'';position:absolute;left:3px;top:0;width:9px;height:9px;border-radius:50%;background:#dca16b}
#life158 .person:after{content:'';position:absolute;left:2px;top:9px;width:10px;height:17px;border-radius:3px;background:#25a99f;box-shadow:-1px 17px 0 -1px #26363a,6px 17px 0 -1px #26363a}
#life158 .woman:after{background:linear-gradient(#33c8bd 0 58%,#d97845 59%)}
#life158 .engineer:after{background:#e89043}
#life158 .child{width:10px;height:23px}
#life158 .child:before{content:'';position:absolute;left:2px;top:0;width:7px;height:7px;border-radius:50%;background:#d69b69}
#life158 .child:after{content:'';position:absolute;left:1px;top:7px;width:8px;height:11px;border-radius:2px;background:#4bc8bd;box-shadow:-1px 11px 0 -1px #29393c,5px 11px 0 -1px #29393c}
#life158 .child.c2:after{background:#e48350}
#life158 .dog{width:20px;height:10px;border-radius:5px;background:#996640}
#life158 .dog:before{content:'';position:absolute;right:-5px;top:-3px;width:9px;height:9px;border-radius:50%;background:#aa7650}
#life158 .cat{width:14px;height:7px;border-radius:50%;background:#777e7c}
#life158 .cat:before{content:'';position:absolute;right:-4px;top:-3px;width:7px;height:7px;border-radius:50%;background:#858c89}
#life158 .plant{width:11px;height:7px;border-radius:50%;background:#245a42;box-shadow:6px -2px 0 #1c4937,-6px -1px 0 #1e503c}
#life158 .flower{width:3px;height:3px;border-radius:50%;background:#e4bd5b;box-shadow:0 5px 0 -1px #2d704f,4px 1px 0 #d98270,-4px 1px 0 #c99bc4}
#life158 .cart{left:-55px;top:66%;width:30px;height:14px;border:2px solid #b97b49;border-top:4px solid #e0a063;background:#75452d;border-radius:2px 2px 6px 6px;transform:none;animation:cart158 16s linear infinite;will-change:transform}
#life158 .cart:before,#life158 .cart:after{content:'';position:absolute;bottom:-7px;width:6px;height:6px;border-radius:50%;background:#182023;border:2px solid #8d9697}
#life158 .cart:before{left:3px}#life158 .cart:after{right:3px}
#life158 .cart.loaded{box-shadow:0 -6px 0 -2px #43dcd1,6px -8px 0 -4px #74fff3,-6px -8px 0 -4px #2ab9b6}
#life158 .bird{left:-25px;top:22%;width:20px;height:7px;transform:none;animation:bird158 22s linear infinite;will-change:transform}
#life158 .bird:before,#life158 .bird:after{content:'';position:absolute;top:3px;width:10px;height:2px;background:rgba(214,235,230,.75)}
#life158 .bird:before{left:0;transform:rotate(-18deg)}#life158 .bird:after{right:0;transform:rotate(18deg)}
#dna158flash{position:absolute;inset:0;z-index:108;pointer-events:none;opacity:0;background:radial-gradient(circle at 58% 58%,rgba(73,238,214,.12),rgba(73,238,214,0) 44%);transition:opacity .18s ease-out}
#dna158flash.on{opacity:1;transition:none}
@keyframes cart158{from{transform:translate3d(0,0,0)}to{transform:translate3d(calc(100vw + 120px),0,0)}}
@keyframes bird158{from{transform:translate3d(0,0,0)}to{transform:translate3d(calc(100vw + 90px),7px,0)}}
body:not(.investorWorldOpen) #life158{display:none!important}
body:not(.investorWorldOpen) #life158 *{animation-play-state:paused!important}
@media(max-width:999px){#life158 .bird{animation-duration:28s}#life158 .cart{animation-duration:18s}}
`;document.head.appendChild(s)}
function currentLevel(){const p=Number(window.DNA_PREVIEW_LEVEL||0);if(p>=1&&p<=11)return p;return Math.max(1,Math.min(11,Number(window.DNA_WORLD_STATE?.level)||1))}
function node(cls,x,y,extra=''){const n=document.createElement('i');n.className='e '+cls+(extra?' '+extra:'');if(x!=null)n.style.left=x+'%';if(y!=null)n.style.top=y+'%';return n}
function removeLegacy(){['life153','perf154','dna157transition','dna153motion'].forEach(id=>document.getElementById(id)?.remove())}
function lock(l){document.querySelectorAll('.dnBadge').forEach(b=>b.innerHTML='<i></i> SINGLE RUNTIME · v'+V+' · '+l+'/11');const top=document.querySelector('.iwTop');if(top){[...top.querySelectorAll('*')].filter(e=>!e.children.length).forEach(e=>{const t=e.textContent||'';if(/INVESTOR DNA\s*·\s*v\d+\.\d+\.\d+/i.test(t))e.textContent=t.replace(/v\d+\.\d+\.\d+/i,'v'+V)})}}
function populate(l){if(!root)return;root.replaceChildren();
 if(l>=2){root.append(node('woman person',47,65),node('plant',43,65),node('plant',51,65),node('flower',54,65));}
 if(l>=3){root.append(node('person',57,65),node('child',51.5,65),node('child',54,65,'c2'),node('dog',60,65),node('plant',63,65));}
 if(l>=4){root.append(node('engineer woman person',69,65),node('cat',73,65),node('flower',76,65));}
 if(l>=6)root.append(node('person',80,65));
 root.append(node('cart loaded'));
 if(l>=3)root.append(node('bird'));
 window.DNA_SINGLE_STATE={version:V,level:l,world:LEVELS[l-1],mode:'single-static-canvas-plus-compositor',animatedObjects:l>=3?2:1,residents:{adults:l<2?0:l<3?1:l<4?2:l<6?3:4,children:l>=3?2:0,animals:l>=4?2:l>=3?1:0}};
 lock(l)}
function flash(){if(!scene)return;let f=document.getElementById('dna158flash');if(!f){f=document.createElement('div');f.id='dna158flash';scene.appendChild(f)}f.classList.add('on');requestAnimationFrame(()=>requestAnimationFrame(()=>f.classList.remove('on')))}
function stopMotion(){clearTimeout(remountTimer);removeLegacy()}
function refreshStatic(l){if(!scene)return;flash();window.dispatchEvent(new CustomEvent('dna-game-remount'));remountTimer=setTimeout(()=>{removeLegacy();populate(l)},140)}
function syncOpen(){const n=document.body.classList.contains('investorWorldOpen');if(n===open)return;open=n;if(!open)removeLegacy();else setTimeout(()=>{removeLegacy();populate(currentLevel())},80)}
function mount(){css();scene=document.getElementById('iwScene');if(!scene)return setTimeout(mount,80);removeLegacy();document.getElementById('life158')?.remove();root=document.createElement('div');root.id='life158';scene.appendChild(root);last=currentLevel();populate(last);open=document.body.classList.contains('investorWorldOpen');
 window.addEventListener('dna-preview-level',e=>{const l=Math.max(1,Math.min(11,Number(e.detail?.level)||1));if(l===last)return;last=l;refreshStatic(l)});
 window.addEventListener('dna-v153-level',e=>{const l=Math.max(1,Math.min(11,Number(e.detail?.level)||currentLevel()));last=l;setTimeout(()=>{removeLegacy();populate(l)},0)});
 bodyObserver?.disconnect();bodyObserver=new MutationObserver(syncOpen);bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)removeLegacy()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();