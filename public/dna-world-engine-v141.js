(()=>{'use strict';
const V='14.20.0';let raf=0;
function boot(){
 const h=document.getElementById('iwScene');if(!h)return setTimeout(boot,120);
 if(getComputedStyle(h).position==='static')h.style.position='relative';
 h.querySelectorAll('canvas,svg').forEach(e=>e.style.display='none');
 ['dnaWorld148','dnaWorldArt148','dnaQuality14200'].forEach(id=>{const e=document.getElementById(id);if(e)e.remove()});
 let artReady=false;
 const art=document.createElement('img');art.id='dnaWorldArt148';art.alt='';art.decoding='async';art.loading='eager';
 Object.assign(art.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'cover',zIndex:39,pointerEvents:'none',opacity:'0',transition:'opacity .25s ease'});
 art.onload=()=>{artReady=true;art.style.opacity='1';window.dispatchEvent(new CustomEvent('dna-art-ready',{detail:{version:V,width:art.naturalWidth,height:art.naturalHeight,source:'figma-mobile-master'}}));};
 art.onerror=()=>{artReady=false;art.style.opacity='0';console.warn('DNA local art v'+V+' failed to load');};
 art.src=(window.DNA_ART_PACK&&window.DNA_ART_PACK.sceneBase)||'/assets/dna-world/l1/figma-mobile-v14170.svg?rev=14170';h.appendChild(art);
 const quality=document.createElement('img');quality.id='dnaQuality14200';quality.alt='';quality.decoding='async';quality.src=(window.DNA_ART_PACK&&window.DNA_ART_PACK.qualityOverlay)||'/assets/dna-world/l1/quality-overlay-v14200.svg?rev=14200';Object.assign(quality.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'cover',zIndex:41,pointerEvents:'none',opacity:'.92'});h.appendChild(quality);
 const c=document.createElement('canvas');c.id='dnaWorld148';c.width=1200;c.height=680;
 Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:40,pointerEvents:'none',imageRendering:'auto'});h.appendChild(c);
 const g=c.getContext('2d');g.imageSmoothingEnabled=true;const A=()=>window.DNA_GAME_ASSETS||null;
 const R=(x,y,w,z,k,a=1)=>{g.globalAlpha=a;g.fillStyle=k;g.fillRect(x,y,w,z);g.globalAlpha=1};
 const L=(x,y,a,b,k,w=1)=>{g.strokeStyle=k;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(a,b);g.stroke()};
 function glow(x,y,r=26,a=.18,col='255,177,68'){g.save();g.globalCompositeOperation='screen';let q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,`rgba(${col},${a})`);q.addColorStop(.35,`rgba(${col},${a*.45})`);q.addColorStop(1,`rgba(${col},0)`);g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
 function worker(x,y,t,role='minerIdle',flip=false){const a=A();if(a&&a.draw(role,x-17,y-56,34,56,{flipX:flip,alpha:.99}))return;R(x-7,y-31,14,10,'#d79c70');R(x-10,y-21,20,21,'#248d88')}
 function cart(x,y,load){const a=A(),key=load?'cartLoaded':'cartEmpty';if(a&&a.draw(key,x-5,y-38,55,38,{alpha:.99}))return;R(x,y-18,39,15,'#68422d');R(x+5,y-3,7,7,'#07100e');R(x+28,y-3,7,7,'#07100e')}
 function crystal(x,y,s=1,large=false){const a=A(),key=large?'crystalLarge':'crystalSmall',w=(large?24:16)*s,h=(large?30:20)*s;if(a&&a.draw(key,x-w/2,y-h,w,h,{alpha:.98}))return;g.fillStyle='#39e5e4';g.beginPath();g.moveTo(x,y);g.lineTo(x+4*s,y-11*s);g.lineTo(x+8*s,y);g.fill();g.fillStyle='#9ffff8';g.beginPath();g.moveTo(x+5*s,y);g.lineTo(x+8*s,y-8*s);g.lineTo(x+11*s,y);g.fill()}
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
 function infrastructure(){const a=A();if(!a)return;a.draw('mineExterior',9,92,138,112,{alpha:.58});a.draw('mineInterior',14,219,572,96,{alpha:.4});a.draw('supports',14,220,572,91,{alpha:.62});a.draw('railSurface',16,193,568,23,{alpha:.99});a.draw('railUnderground',16,283,568,23,{alpha:.98})}
 function resources(t){const a=A();if(a&&a.draw('orePile',72,170,46,25,{alpha:.96}))glow(95,184,25,.08,'39,226,218');crystal(48,192,.96,false);crystal(145,190,.92,true);crystal(205,289,.88,false);crystal(309,289,.98,true);crystal(511,289,.9,false)}
 function ambient(t){
  const pulse=(Math.sin(t*2.9)+1)/2;
  [[50,184,28],[145,180,20],[342,184,20],[509,180,22],[205,279,18],[309,279,18]].forEach((p,i)=>glow(p[0],p[1],p[2],.13+.06*Math.sin(t*4+i)));
  glow(61,170,46,.12+.05*pulse,'39,226,218');glow(516,162,48,.08+.035*pulse,'255,188,92');glow(286,166,35,.05+.025*pulse,'255,178,80');
  g.save();g.globalAlpha=.075;g.fillStyle='#b7dbe2';for(let i=0;i<6;i++){const x=(60+i*111+(t*2.6*(i+1)))%680-45,y=108+(i%3)*25;g.beginPath();g.ellipse(x,y,43,8,0,0,Math.PI*2);g.fill()}g.restore();
 }
 function activity(t){
  const p=(t%22)/22;let wx=82,cx=118,loaded=false,role='minerMine',flip=false;
  if(p<.16){wx=80+Math.sin(t*3)*2;role='minerMine'}
  else if(p<.26){wx=82+(p-.16)/.10*45;role='haulerWalk'}
  else if(p<.34){wx=127;role='haulerWalk';loaded=p>.29}
  else if(p<.58){wx=127;cx=118+(p-.34)/.24*118;loaded=true}
  else if(p<.72){wx=238;cx=236;loaded=true;role='builderWork'}
  else{cx=236-(p-.72)/.28*118;role='minerIdle';flip=true}
  worker(wx,207,t,role,flip);cart(cx,209,loaded);
  worker(201,208,t+.7,'haulerWalk',true);worker(276,208,t+1.4,'builderWork',false);worker(390,208,t+2.1,'operatorIdle',true);worker(500,211,t+2.8,'operatorIdle',false);
  const undergroundX=142+Math.sin(t*.35)*32;cart(undergroundX,303,true);worker(347,305,t+1.1,'minerMine',true);
  if(p>.54&&p<.78){const a=1-Math.abs(((p-.54)/.24)-.5)*2;for(let i=0;i<8;i++){const sx=278+i*4,sy=188-(i%3)*4;R(sx,sy,2,2,'#ffd15f',Math.max(0,a))}}
  const lift=76+Math.sin(t*.62)*12;L(590,86,590,lift+58,'rgba(218,180,117,.68)',1);R(581,lift+55,18,11,'rgba(145,99,60,.9)');
 }
 function frame(ms){if(!document.body.contains(c))return;const t=ms/1000;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,1200,680);g.setTransform(2,0,0,2,0,0);if(!artReady)fallback();else{}ambient(t);raf=requestAnimationFrame(frame)}
 cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
 setTimeout(()=>{h.querySelectorAll('.dnBadge').forEach(b=>b.innerHTML='<i></i> QUALITY PASS · v'+V+' · 11/11')},120)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('dna-game-remount',()=>setTimeout(boot,100));
})();