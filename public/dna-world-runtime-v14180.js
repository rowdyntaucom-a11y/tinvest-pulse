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
 document.getElementById('dnaMotion14170')?.remove();
 const old=document.getElementById('dnaRuntime14180');if(old)old.remove();
 const c=document.createElement('canvas');c.id='dnaRuntime14180';c.width=820;c.height=680;
 Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:42,pointerEvents:'none'});h.appendChild(c);
 const g=c.getContext('2d');g.imageSmoothingEnabled=true;
 function glow(x,y,r,a,col){g.save();g.globalCompositeOperation='screen';const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,`rgba(${col},${a})`);q.addColorStop(.42,`rgba(${col},${a*.42})`);q.addColorStop(1,`rgba(${col},0)`);g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
 function drawCart(x,y,loaded=true,alpha=.98,scale=1){
  const w=68*scale,h=48*scale,A=window.DNA_GAME_ASSETS;
  if(A&&A.draw&&A.draw(loaded?'cartLoaded':'cartEmpty',x-w/2,y-h*.72,w,h,{alpha}))return;
  g.save();g.globalAlpha=alpha;g.fillStyle='#9b643e';g.beginPath();g.moveTo(x-w*.42,y-h*.48);g.lineTo(x+w*.42,y-h*.48);g.lineTo(x+w*.30,y-h*.04);g.lineTo(x-w*.30,y-h*.04);g.closePath();g.fill();g.strokeStyle='#d49a61';g.lineWidth=2;g.stroke();g.fillStyle='#091311';for(const dx of[-w*.23,w*.23]){g.beginPath();g.arc(x+dx,y+4*scale,7*scale,0,Math.PI*2);g.fill()}g.restore();
 }
 function atmosphere(t,level){
  const stage=Math.ceil(level/2),dust=8+stage*2;
  g.save();g.fillStyle='#d7f4ef';for(let i=0;i<dust;i++){const x=(i*71+t*(7+i%4)*(1.4+stage*.18))%850-15;const y=105+(i*47)%500+Math.sin(t*.8+i)*7;g.globalAlpha=.025+(i%4)*.012;g.beginPath();g.arc(x,y,1+(i%3)*.45,0,Math.PI*2);g.fill()}g.restore();
  if(level>=4){g.save();g.strokeStyle=`rgba(126,205,221,${.05+level*.004})`;g.lineWidth=1;const n=10+level*2;for(let i=0;i<n;i++){const x=(i*53+t*(34+level*2))%880-30,y=(i*61+t*(56+level*3))%610;g.beginPath();g.moveTo(x,y);g.lineTo(x-5,y+12);g.stroke()}g.restore()}
  if(level>=8){g.save();g.globalCompositeOperation='screen';const y=80+Math.sin(t*.18)*12;const q=g.createLinearGradient(0,y-35,820,y+35);q.addColorStop(0,'rgba(32,232,199,0)');q.addColorStop(.45,'rgba(32,232,199,.035)');q.addColorStop(.7,'rgba(91,118,255,.028)');q.addColorStop(1,'rgba(91,118,255,0)');g.fillStyle=q;g.fillRect(0,y-40,820,80);g.restore()}
 }
 function infrastructure(t,level){
  // Match the Figma crane: cable is at x=566 and the beam starts near y=148.
  const speed=.72+level*.025,lift=226+Math.sin(t*speed)*30;
  g.strokeStyle='rgba(214,169,103,.9)';g.lineWidth=2;g.beginPath();g.moveTo(566,148);g.lineTo(566,lift);g.stroke();
  g.fillStyle='#83502e';g.strokeStyle='#d39a5b';g.lineWidth=2;g.fillRect(554,lift,24,16);g.strokeRect(554,lift,24,16);glow(566,lift+8,25,.085,'255,190,92');
  // Existing lamps in the master art.
  [[429,207],[182,507],[338,507],[492,507]].forEach((p,i)=>glow(p[0],p[1],29,.09+.06*Math.sin(t*(2.2+level*.03)+i),'255,186,78'));
  [[125,535],[153,542],[385,535],[414,541]].forEach((p,i)=>glow(p[0],p[1],20,.055+.04*Math.sin(t*(3+level*.04)+i),'54,236,226'));
 }
 function logistics(t,level){
  // Surface rail in the Figma master sits around y=379. Make level-1 motion unmistakable.
  const count=level>=7?3:level>=3?2:1,speed=34+level*2.8;
  for(let i=0;i<count;i++){
   const x=-55+((t*speed+i*(820/count+120))%960);drawCart(x,382,i%2===0,.98,1.08);
  }
  // Underground rail sits around y=608. It unlocks early so the mine feels alive from the start.
  const undergroundCount=level>=6?2:1;
  for(let i=0;i<undergroundCount;i++){
   const ux=875-((t*(22+level*1.8)+i*470)%970);drawCart(ux,609,true,.9,.94);
  }
  // Rail light traces aligned to the real rails.
  const sx=55+((t*(42+level*1.6))%700),ux=80+((t*(31+level))%650);g.save();g.globalCompositeOperation='screen';
  let q=g.createLinearGradient(sx-80,0,sx+25,0);q.addColorStop(0,'rgba(72,239,222,0)');q.addColorStop(.72,'rgba(72,239,222,.30)');q.addColorStop(1,'rgba(205,255,247,.82)');g.strokeStyle=q;g.lineWidth=3;g.beginPath();g.moveTo(sx-80,379);g.lineTo(sx+25,379);g.stroke();
  q=g.createLinearGradient(ux-70,0,ux+22,0);q.addColorStop(0,'rgba(255,181,84,0)');q.addColorStop(.7,'rgba(255,181,84,.25)');q.addColorStop(1,'rgba(255,229,176,.72)');g.strokeStyle=q;g.lineWidth=2.6;g.beginPath();g.moveTo(ux-70,608);g.lineTo(ux+22,608);g.stroke();g.restore();
 }
 function progression(level){
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
