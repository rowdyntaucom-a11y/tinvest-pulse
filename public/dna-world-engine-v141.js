(()=>{'use strict';
const V='14.8.1';let raf=0;
function boot(){
 const h=document.getElementById('iwScene');if(!h)return setTimeout(boot,120);
 h.querySelectorAll('canvas,svg').forEach(e=>e.style.display='none');
 const old=document.getElementById('dnaWorld148');if(old)old.remove();
 const c=document.createElement('canvas');c.id='dnaWorld148';c.width=1200;c.height=680;
 Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:40,pointerEvents:'none',imageRendering:'auto'});h.appendChild(c);
 const g=c.getContext('2d');g.imageSmoothingEnabled=true;const A=()=>window.DNA_GAME_ASSETS||null;
 const R=(x,y,w,z,k,a=1)=>{g.globalAlpha=a;g.fillStyle=k;g.fillRect(x,y,w,z);g.globalAlpha=1};
 const L=(x,y,a,b,k,w=1)=>{g.strokeStyle=k;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(a,b);g.stroke()};
 function glow(x,y,r=26,a=.18,col='255,177,68'){g.save();g.globalCompositeOperation='screen';let q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,`rgba(${col},${a})`);q.addColorStop(.35,`rgba(${col},${a*.45})`);q.addColorStop(1,`rgba(${col},0)`);g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
 function worker(x,y,t,role='minerIdle',flip=false){const a=A();if(a&&a.draw(role,x-10,y-37,21,38,{flipX:flip,alpha:.98}))return;R(x-5,y-23,10,8,'#c88b63');R(x-7,y-15,14,15,'#248d88')}
 function cart(x,y,load){const a=A(),key=load?'cartLoaded':'cartEmpty';if(a&&a.draw(key,x-2,y-22,37,22,{alpha:.98}))return;R(x,y-14,32,12,'#593725')}
 function fallback(){let q=g.createLinearGradient(0,0,0,340);q.addColorStop(0,'#02091a');q.addColorStop(.55,'#103044');q.addColorStop(1,'#061516');g.fillStyle=q;g.fillRect(0,0,600,340);R(0,198,600,142,'#04100f')}
 function base(){const a=A();return !!(a&&a.draw('sceneBase',0,0,600,340,{alpha:1}))}
 function ambient(t){
  const pulse=(Math.sin(t*2.9)+1)/2;
  [[49,190,19],[164,171,14],[347,185,16],[504,195,16],[162,270,13],[307,270,13]].forEach((p,i)=>glow(p[0],p[1],p[2],.11+.055*Math.sin(t*4+i)));
  glow(152,173,28,.08+.04*pulse,'39,226,218');glow(205,267,24,.06+.03*pulse,'39,226,218');
  g.save();g.globalAlpha=.16;g.fillStyle='#b7dbe2';for(let i=0;i<5;i++){const x=(70+i*127+(t*3*(i+1)))%670-40,y=116+(i%3)*26;g.beginPath();g.ellipse(x,y,38,8,0,0,Math.PI*2);g.fill()}g.restore();
 }
 function activity(t){
  const p=(t%22)/22;let wx=82,cx=118,loaded=false,role='minerMine',flip=false;
  if(p<.16){wx=80+Math.sin(t*3)*2;role='minerMine'}
  else if(p<.26){wx=82+(p-.16)/.10*45;role='haulerWalk';flip=false}
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
 function frame(ms){if(!document.body.contains(c))return;const t=ms/1000;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,1200,680);g.setTransform(2,0,0,2,0,0);if(!base())fallback();ambient(t);activity(t);raf=requestAnimationFrame(frame)}
 cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
 setTimeout(()=>{h.querySelectorAll('.dnBadge').forEach(b=>b.innerHTML='<i></i> DNA ART · v'+V+' · 1/11')},120)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('dna-game-remount',()=>setTimeout(boot,100));
})();