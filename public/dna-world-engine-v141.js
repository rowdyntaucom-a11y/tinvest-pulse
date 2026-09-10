(()=>{'use strict';
const V='14.9.0';let raf=0;
function boot(){
 const h=document.getElementById('iwScene');if(!h)return setTimeout(boot,120);
 if(getComputedStyle(h).position==='static')h.style.position='relative';
 h.querySelectorAll('canvas,svg').forEach(e=>e.style.display='none');
 ['dnaWorld148','dnaWorldArt148'].forEach(id=>{const e=document.getElementById(id);if(e)e.remove()});
 let artReady=false;
 const art=document.createElement('img');art.id='dnaWorldArt148';art.alt='';art.decoding='async';art.loading='eager';
 Object.assign(art.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'cover',zIndex:39,pointerEvents:'none',opacity:'0',transition:'opacity .25s ease'});
 art.onload=()=>{artReady=true;art.style.opacity='1';window.dispatchEvent(new CustomEvent('dna-art-ready',{detail:{version:V,width:art.naturalWidth,height:art.naturalHeight,source:'dom-image'}}));};
 art.onerror=()=>{artReady=false;art.style.opacity='0';console.warn('DNA art v'+V+' failed to load from same-origin source');};
 art.src='/dna-art-v148.webp?rev=1490';h.appendChild(art);
 const c=document.createElement('canvas');c.id='dnaWorld148';c.width=1200;c.height=680;
 Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:40,pointerEvents:'none',imageRendering:'auto'});h.appendChild(c);
 const g=c.getContext('2d');g.imageSmoothingEnabled=true;const A=()=>window.DNA_GAME_ASSETS||null;
 const R=(x,y,w,z,k,a=1)=>{g.globalAlpha=a;g.fillStyle=k;g.fillRect(x,y,w,z);g.globalAlpha=1};
 const L=(x,y,a,b,k,w=1)=>{g.strokeStyle=k;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(a,b);g.stroke()};
 function glow(x,y,r=26,a=.18,col='255,177,68'){g.save();g.globalCompositeOperation='screen';let q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,`rgba(${col},${a})`);q.addColorStop(.35,`rgba(${col},${a*.45})`);q.addColorStop(1,`rgba(${col},0)`);g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
 function worker(x,y,t,role='minerIdle',flip=false){const a=A();if(a&&a.draw(role,x-10,y-37,21,38,{flipX:flip,alpha:.98}))return;R(x-5,y-23,10,8,'#c88b63');R(x-7,y-15,14,15,'#248d88')}
 function cart(x,y,load){const a=A(),key=load?'cartLoaded':'cartEmpty';if(a&&a.draw(key,x-2,y-22,37,22,{alpha:.98}))return;R(x,y-14,32,12,'#593725');R(x+4,y-2,6,6,'#07100e');R(x+23,y-2,6,6,'#07100e')}
 function crystal(x,y,s=1){g.fillStyle='#39e5e4';g.beginPath();g.moveTo(x,y);g.lineTo(x+4*s,y-11*s);g.lineTo(x+8*s,y);g.fill();g.fillStyle='#9ffff8';g.beginPath();g.moveTo(x+5*s,y);g.lineTo(x+8*s,y-8*s);g.lineTo(x+11*s,y);g.fill()}
 function fallback(){
  let q=g.createLinearGradient(0,0,0,340);q.addColorStop(0,'#02091a');q.addColorStop(.48,'#0b2740');q.addColorStop(1,'#061516');g.fillStyle=q;g.fillRect(0,0,600,340);
  g.fillStyle='rgba(20,52,73,.9)';[[0,168,125,58],[92,156,155,70],[225,163,150,63],[365,151,160,75],[475,163,150,63]].forEach(p=>{g.beginPath();g.moveTo(p[0],p[1]+p[3]);g.lineTo(p[0]+p[2]*.48,p[1]);g.lineTo(p[0]+p[2],p[1]+p[3]);g.closePath();g.fill()});
  R(0,194,600,24,'#4b3025');R(0,218,600,122,'#03100f');
  R(18,116,110,81,'#2a1d19');R(32,131,82,64,'#161311');R(42,142,62,54,'#07100e');R(20,108,106,10,'#60402d');L(21,108,61,84,'#4a3126',8);L(61,84,124,108,'#4a3126',8);
  for(let i=0;i<3;i++)for(let j=0;j<2;j++)crystal(47+i*18,176-j*25,.85);
  R(229,123,116,75,'rgba(35,31,25,.68)');for(let x=238;x<=334;x+=24)L(x,111,x,198,'#68452d',4);for(let y=125;y<=185;y+=20)L(234,y,341,y,'#68452d',3);L(234,112,341,198,'#65432c',2);L(341,112,234,198,'#65432c',2);for(let i=0;i<5;i++)R(252+i*16,177-(i%2)*4,13,15,'#a9967c');
  R(367,133,84,64,'#17372f');R(378,151,62,46,'#24473d');g.fillStyle='#492f23';g.beginPath();g.moveTo(362,133);g.lineTo(410,103);g.lineTo(457,133);g.closePath();g.fill();
  R(466,151,63,46,'#3b2a20');R(476,162,43,35,'#59402e');
  L(472,88,472,194,'#69472f',5);L(472,90,552,90,'#69472f',5);L(552,90,552,130,'#69472f',2);R(544,128,16,11,'#86603e');
  R(20,230,560,3,'#68442d');R(20,306,560,3,'#68442d');for(let x=30;x<580;x+=34)L(x,232,x,305,'#5c3b29',3);for(let x=30;x<560;x+=68)L(x,234,x+45,304,'#4c3426',2);
  R(20,286,560,4,'#6a4730');for(let x=22;x<580;x+=18)L(x,282,x+8,294,'#765039',2);
  [26,43,60,499,516,533,550].forEach(x=>crystal(x,286,.85));
 }
 function ambient(t){
  const pulse=(Math.sin(t*2.9)+1)/2;
  [[49,190,19],[164,171,14],[347,185,16],[504,195,16],[162,270,13],[307,270,13]].forEach((p,i)=>glow(p[0],p[1],p[2],.11+.055*Math.sin(t*4+i)));
  glow(152,173,28,.08+.04*pulse,'39,226,218');glow(205,267,24,.06+.03*pulse,'39,226,218');
  g.save();g.globalAlpha=.08;g.fillStyle='#b7dbe2';for(let i=0;i<5;i++){const x=(70+i*127+(t*3*(i+1)))%670-40,y=116+(i%3)*26;g.beginPath();g.ellipse(x,y,38,8,0,0,Math.PI*2);g.fill()}g.restore();
 }
 function activity(t){
  const p=(t%22)/22;let wx=82,cx=118,loaded=false,role='minerMine',flip=false;
  if(p<.16){wx=80+Math.sin(t*3)*2;role='minerMine'}
  else if(p<.26){wx=82+(p-.16)/.10*45;role='haulerWalk'}
  else if(p<.34){wx=127;role='haulerWalk';loaded=p>.29}
  else if(p<.58){wx=127;cx=118+(p-.34)/.24*118;loaded=true}
  else if(p<.72){wx=238;cx=236;loaded=true;role='builderWork'}
  else{cx=236-(p-.72)/.28*118;role='minerIdle';flip=true}
  worker(wx,205,t,role,flip);cart(cx,207,loaded);
  worker(204,208,t+.7,'haulerWalk',true);worker(276,207,t+1.4,'builderWork',false);worker(385,208,t+2.1,'operatorIdle',true);worker(500,211,t+2.8,'operatorIdle',false);
  const undergroundX=142+Math.sin(t*.35)*32;cart(undergroundX,301,true);worker(346,302,t+1.1,'minerMine',true);
  if(p>.54&&p<.78){const a=1-Math.abs(((p-.54)/.24)-.5)*2;for(let i=0;i<7;i++){const sx=281+i*4,sy=191-(i%3)*3;R(sx,sy,1.5,1.5,'#ffd15f',Math.max(0,a))}}
  const lift=80+Math.sin(t*.62)*10;L(524,92,524,lift+58,'rgba(218,180,117,.55)',.8);R(517,lift+55,15,9,'rgba(129,92,60,.82)');
 }
 function frame(ms){if(!document.body.contains(c))return;const t=ms/1000;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,1200,680);g.setTransform(2,0,0,2,0,0);if(!artReady)fallback();ambient(t);activity(t);raf=requestAnimationFrame(frame)}
 cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
 setTimeout(()=>{h.querySelectorAll('.dnBadge').forEach(b=>b.innerHTML='<i></i> GAME ASSETS · v'+V+' · 2/11')},120)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('dna-game-remount',()=>setTimeout(boot,100));
})();