(()=>{'use strict';
const V='14.18.0';let raf=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function readLevel(){
 const root=document.getElementById('iwScene')?.parentElement||document.body;
 const m=(root.innerText||'').match(/(\d+)\s*\/\s*11/);
 return clamp(m?Number(m[1]):1,1,11);
}
function mount(){
 const h=document.getElementById('iwScene');if(!h)return setTimeout(mount,120);
 const old=document.getElementById('dnaRuntime14180');if(old)old.remove();
 const c=document.createElement('canvas');c.id='dnaRuntime14180';c.width=820;c.height=680;
 Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:42,pointerEvents:'none'});h.appendChild(c);
 const g=c.getContext('2d');g.imageSmoothingEnabled=true;
 function glow(x,y,r,a,col){g.save();g.globalCompositeOperation='screen';const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,`rgba(${col},${a})`);q.addColorStop(.42,`rgba(${col},${a*.42})`);q.addColorStop(1,`rgba(${col},0)`);g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
 function drawCart(x,y,loaded=true,alpha=.98){
  const A=window.DNA_GAME_ASSETS;if(A&&A.draw&&A.draw(loaded?'cartLoaded':'cartEmpty',x-26,y-28,58,40,{alpha}))return;
  g.save();g.globalAlpha=alpha;g.fillStyle='#8d5d3b';g.beginPath();g.moveTo(x-25,y-20);g.lineTo(x+25,y-20);g.lineTo(x+18,y);g.lineTo(x-18,y);g.closePath();g.fill();g.fillStyle='#0b1715';g.beginPath();g.arc(x-14,y+5,6,0,Math.PI*2);g.arc(x+14,y+5,6,0,Math.PI*2);g.fill();g.restore();
 }
 function atmosphere(t,level){
  const stage=Math.ceil(level/2),dust=8+stage*2;
  g.save();g.fillStyle='#d7f4ef';for(let i=0;i<dust;i++){const x=(i*71+t*(7+i%4)*(1.4+stage*.18))%850-15;const y=120+(i*47)%430+Math.sin(t*.8+i)*7;g.globalAlpha=.03+(i%4)*.014;g.beginPath();g.arc(x,y,1+(i%3)*.45,0,Math.PI*2);g.fill()}g.restore();
  // Higher levels gradually add weather, never hiding the master art.
  if(level>=4){g.save();g.strokeStyle=`rgba(126,205,221,${.05+level*.004})`;g.lineWidth=1;const n=10+level*2;for(let i=0;i<n;i++){const x=(i*53+t*(34+level*2))%880-30,y=(i*61+t*(56+level*3))%560;g.beginPath();g.moveTo(x,y);g.lineTo(x-5,y+12);g.stroke()}g.restore()}
  if(level>=8){g.save();g.globalCompositeOperation='screen';const y=80+Math.sin(t*.18)*12;const q=g.createLinearGradient(0,y-35,820,y+35);q.addColorStop(0,'rgba(32,232,199,0)');q.addColorStop(.45,'rgba(32,232,199,.035)');q.addColorStop(.7,'rgba(91,118,255,.028)');q.addColorStop(1,'rgba(91,118,255,0)');g.fillStyle=q;g.fillRect(0,y-40,820,80);g.restore()}
 }
 function infrastructure(t,level){
  const speed=.72+level*.025;
  const lift=150+Math.sin(t*speed)*22;g.strokeStyle='rgba(214,169,103,.82)';g.lineWidth=2;g.beginPath();g.moveTo(478,92);g.lineTo(478,lift);g.stroke();g.fillStyle='#765039';g.fillRect(466,lift,24,14);glow(478,lift+7,22,.065,'255,190,92');
  [[369,203],[182,509],[338,509],[492,509]].forEach((p,i)=>glow(p[0],p[1],27,.085+.055*Math.sin(t*(2.3+level*.03)+i),'255,186,78'));
  [[125,535],[153,542],[385,535],[414,541]].forEach((p,i)=>glow(p[0],p[1],19,.055+.04*Math.sin(t*(3+level*.04)+i),'54,236,226'));
 }
 function logistics(t,level){
  // Real moving wagons: amount and speed scale with investor level.
  const count=level>=7?3:level>=3?2:1,speed=22+level*2.2;
  for(let i=0;i<count;i++){
   const x=-40+((t*speed+i*(820/count+80))%930);drawCart(x,286,i%2===0,.92);
  }
  if(level>=5){const ux=860-((t*(16+level*1.4))%930);drawCart(ux,558,true,.82)}
  // Rail energy traces keep motion readable even when carts pass behind detailed art.
  const sx=55+((t*(38+level*1.6))%700),ux=80+((t*(28+level))%650);g.save();g.globalCompositeOperation='screen';
  let q=g.createLinearGradient(sx-70,0,sx+20,0);q.addColorStop(0,'rgba(72,239,222,0)');q.addColorStop(.72,'rgba(72,239,222,.25)');q.addColorStop(1,'rgba(205,255,247,.7)');g.strokeStyle=q;g.lineWidth=2.6;g.beginPath();g.moveTo(sx-70,282);g.lineTo(sx+20,282);g.stroke();
  q=g.createLinearGradient(ux-60,0,ux+18,0);q.addColorStop(0,'rgba(255,181,84,0)');q.addColorStop(.7,'rgba(255,181,84,.22)');q.addColorStop(1,'rgba(255,229,176,.65)');g.strokeStyle=q;g.lineWidth=2.2;g.beginPath();g.moveTo(ux-60,557);g.lineTo(ux+18,557);g.stroke();g.restore();
 }
 function progression(level){
  // One source of truth for the future modular world. Other systems can subscribe to this state.
  const stage=Math.ceil(level/2);
  window.DNA_WORLD_STATE={version:V,level,stage,weather:level>=8?'storm':level>=4?'rain':'clear',workers:2+stage,carts:level>=7?3:level>=3?2:1,buildTier:stage};
 }
 let lastLevel=0;
 function frame(ms){
  if(!document.body.contains(c))return;const t=ms/1000,level=readLevel();if(level!==lastLevel){lastLevel=level;progression(level);window.dispatchEvent(new CustomEvent('dna-world-level',{detail:window.DNA_WORLD_STATE}))}
  g.clearRect(0,0,820,680);atmosphere(t,level);infrastructure(t,level);logistics(t,level);raf=requestAnimationFrame(frame);
 }
 cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
window.addEventListener('dna-game-remount',()=>setTimeout(mount,120));
})();