(()=>{'use strict';
const V='14.21.0';let raf=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function readLevel(){const root=document.getElementById('iwScene')?.parentElement||document.body;const m=(root.innerText||'').match(/(\d+)\s*\/\s*11/);return clamp(m?Number(m[1]):1,1,11)}
function mount(){
 const h=document.getElementById('iwScene');if(!h)return setTimeout(mount,120);document.getElementById('dnaMotion14170')?.remove();document.getElementById('dnaRuntime14180')?.remove();
 const c=document.createElement('canvas');c.id='dnaRuntime14180';c.width=820;c.height=680;Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:42,pointerEvents:'none'});h.appendChild(c);
 const g=c.getContext('2d');g.imageSmoothingEnabled=true;
 const A=()=>window.DNA_GAME_ASSETS;
 function glow(x,y,r,a,col){g.save();g.globalCompositeOperation='screen';const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,`rgba(${col},${a})`);q.addColorStop(.42,`rgba(${col},${a*.42})`);q.addColorStop(1,`rgba(${col},0)`);g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
 function asset(key,x,y,w,h,opts={}){const a=A();return !!(a&&a.draw&&a.draw(g,key,x,y,w,h,opts))}
 function drawCart(x,baseY,loaded=true,alpha=.98,scale=1){const w=76*scale,h=52*scale;if(asset(loaded?'cartLoaded':'cartEmpty',x-w/2,baseY-h*.78,w,h,{alpha}))return;g.save();g.globalAlpha=alpha;g.fillStyle='#965a36';g.fillRect(x-w*.38,baseY-h*.55,w*.76,h*.42);g.fillStyle='#11191a';for(const dx of[-w*.22,w*.22]){g.beginPath();g.arc(x+dx,baseY,7*scale,0,Math.PI*2);g.fill()}g.restore()}
 function worker(key,x,feetY,w=66,h=96,flip=false,alpha=1,bob=0){g.save();g.globalAlpha=.36;g.fillStyle='#000';g.beginPath();g.ellipse(x,feetY+2,w*.27,5,0,0,Math.PI*2);g.fill();g.restore();asset(key,x-w/2,feetY-h+bob,w,h,{flipX:flip,alpha})}
 function atmosphere(t,level){const stage=Math.ceil(level/2),dust=8+stage*2;g.save();g.fillStyle='#d7f4ef';for(let i=0;i<dust;i++){const x=(i*71+t*(7+i%4)*(1.4+stage*.18))%850-15,y=105+(i*47)%500+Math.sin(t*.8+i)*7;g.globalAlpha=.025+(i%4)*.012;g.beginPath();g.arc(x,y,1+(i%3)*.45,0,Math.PI*2);g.fill()}g.restore();if(level>=4){g.save();g.strokeStyle=`rgba(126,205,221,${.05+level*.004})`;g.lineWidth=1;const n=10+level*2;for(let i=0;i<n;i++){const x=(i*53+t*(34+level*2))%880-30,y=(i*61+t*(56+level*3))%610;g.beginPath();g.moveTo(x,y);g.lineTo(x-5,y+12);g.stroke()}g.restore()}if(level>=8){g.save();g.globalCompositeOperation='screen';const y=80+Math.sin(t*.18)*12,q=g.createLinearGradient(0,y-35,820,y+35);q.addColorStop(0,'rgba(32,232,199,0)');q.addColorStop(.45,'rgba(32,232,199,.04)');q.addColorStop(.7,'rgba(91,118,255,.03)');q.addColorStop(1,'rgba(91,118,255,0)');g.fillStyle=q;g.fillRect(0,y-40,820,80);g.restore()}}
 function infrastructure(t,level){const lift=225+Math.sin(t*(.7+level*.02))*31;g.strokeStyle='rgba(214,169,103,.92)';g.lineWidth=2;g.beginPath();g.moveTo(548,145);g.lineTo(548,lift);g.stroke();g.fillStyle='#83502e';g.strokeStyle='#d39a5b';g.lineWidth=2;g.fillRect(536,lift,24,16);g.strokeRect(536,lift,24,16);glow(548,lift+8,25,.09,'255,190,92');[[221,479],[514,479],[764,479]].forEach((p,i)=>glow(p[0],p[1],32,.09+.06*Math.sin(t*(2.2+level*.03)+i),'255,186,78'));[[96,572],[118,582],[493,570],[515,581],[688,575]].forEach((p,i)=>glow(p[0],p[1],19,.05+.035*Math.sin(t*3+i),'54,236,226'))}
 function people(t,level){
   // Every character is a separate Figma-derived sprite. No workers are baked into the world art.
   const mineBob=Math.sin(t*5.2)*2.2;worker('minerMine',326,365,72,104,false,1,mineBob);
   worker('builderWork',602,365,71,103,false,1,Math.sin(t*4.4+1)*1.8);
   const hx=205+((t*(12+level*.8))%300);worker('haulerWalk',hx,365,68,99,false,.98,Math.sin(t*7)*2);
   if(level>=3)worker('operatorIdle',476,365,68,99,false,.98,Math.sin(t*2.5)*1.2);
   if(level>=5)worker('minerMine',158,636,67,99,true,.95,Math.sin(t*5+2)*2);
   if(level>=7)worker('builderWork',676,636,67,99,true,.95,Math.sin(t*4+3)*1.7);
 }
 function logistics(t,level){const count=level>=7?3:level>=3?2:1,speed=34+level*2.8;for(let i=0;i<count;i++){const x=-55+((t*speed+i*(820/count+120))%960);drawCart(x,388,i%2===0,.98,1.05)}const undergroundCount=level>=6?2:1;for(let i=0;i<undergroundCount;i++){const ux=875-((t*(22+level*1.8)+i*470)%970);drawCart(ux,640,true,.91,.94)}const sx=55+((t*(42+level*1.6))%700),ux=80+((t*(31+level))%650);g.save();g.globalCompositeOperation='screen';let q=g.createLinearGradient(sx-80,0,sx+25,0);q.addColorStop(0,'rgba(72,239,222,0)');q.addColorStop(.72,'rgba(72,239,222,.30)');q.addColorStop(1,'rgba(205,255,247,.82)');g.strokeStyle=q;g.lineWidth=3;g.beginPath();g.moveTo(sx-80,379);g.lineTo(sx+25,379);g.stroke();q=g.createLinearGradient(ux-70,0,ux+22,0);q.addColorStop(0,'rgba(255,181,84,0)');q.addColorStop(.7,'rgba(255,181,84,.25)');q.addColorStop(1,'rgba(255,229,176,.72)');g.strokeStyle=q;g.lineWidth=2.6;g.beginPath();g.moveTo(ux-70,628);g.lineTo(ux+22,628);g.stroke();g.restore()}
 function growth(level){
  // Visible build stages make the same preset evolve with investor level.
  if(level>=2){g.fillStyle='#6f452d';for(let i=0;i<4;i++)g.fillRect(335+i*12,331-i*3,34,6)}
  if(level>=3){g.fillStyle='#ffd06e';g.fillRect(381,313,7,15);glow(384,320,22,.08,'255,190,92')}
  if(level>=4){g.fillStyle='#76503a';g.fillRect(575,314,28,25);g.strokeStyle='#bd7a4b';g.strokeRect(575,314,28,25)}
  if(level>=5){g.strokeStyle='#c07843';g.lineWidth=5;g.beginPath();g.moveTo(304,343);g.lineTo(304,246);g.lineTo(349,246);g.stroke()}
  if(level>=6){g.fillStyle='#71432c';g.fillRect(731,441,8,172);g.fillRect(710,465,49,7)}
  if(level>=7){g.fillStyle='#ffd47a';g.fillRect(618,256,11,18);g.fillRect(781,260,10,17)}
  if(level>=9){g.strokeStyle='#8b5939';g.lineWidth=6;g.beginPath();g.moveTo(574,342);g.lineTo(574,209);g.lineTo(610,209);g.stroke()}
  if(level>=11){glow(706,174,65,.11,'80,245,222');glow(92,202,55,.10,'80,245,222')}
 }
 function progression(level){const stage=Math.ceil(level/2);window.DNA_WORLD_STATE={version:V,level,stage,weather:level>=8?'storm':level>=4?'rain':'clear',workers:3+(level>=3)+(level>=5)+(level>=7),carts:1+(level>=3)+(level>=7),buildTier:stage};}
 let lastLevel=0;function frame(ms){if(!document.body.contains(c))return;const t=ms/1000,level=readLevel();if(level!==lastLevel){lastLevel=level;progression(level);window.dispatchEvent(new CustomEvent('dna-world-level',{detail:window.DNA_WORLD_STATE}))}g.clearRect(0,0,820,680);growth(level);atmosphere(t,level);infrastructure(t,level);people(t,level);logistics(t,level);raf=requestAnimationFrame(frame)}
 cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();window.addEventListener('dna-game-remount',()=>setTimeout(mount,120));
})();