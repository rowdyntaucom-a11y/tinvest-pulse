(()=>{'use strict';
let raf=0;
function mount(){
 const h=document.getElementById('iwScene');
 if(!h)return setTimeout(mount,120);
 const old=document.getElementById('dnaMotion14170');if(old)old.remove();
 const c=document.createElement('canvas');c.id='dnaMotion14170';c.width=820;c.height=680;
 Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:41,pointerEvents:'none'});h.appendChild(c);
 const g=c.getContext('2d');
 function glow(x,y,r,a,col){g.save();g.globalCompositeOperation='screen';const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,`rgba(${col},${a})`);q.addColorStop(.4,`rgba(${col},${a*.42})`);q.addColorStop(1,`rgba(${col},0)`);g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
 function frame(ms){
  if(!document.body.contains(c))return;
  const t=ms/1000;g.clearRect(0,0,820,680);
  // Crane cable/load motion.
  const lift=150+Math.sin(t*.72)*22;g.strokeStyle='rgba(214,169,103,.8)';g.lineWidth=2;g.beginPath();g.moveTo(478,92);g.lineTo(478,lift);g.stroke();g.fillStyle='#765039';g.fillRect(466,lift,24,14);glow(478,lift+7,22,.06,'255,190,92');
  // Breathing lamps and mineral shimmer.
  [[369,203],[182,509],[338,509],[492,509]].forEach((p,i)=>glow(p[0],p[1],27,.09+.05*Math.sin(t*2.5+i),'255,186,78'));
  [[125,535],[153,542],[385,535],[414,541]].forEach((p,i)=>glow(p[0],p[1],19,.06+.035*Math.sin(t*3.2+i),'54,236,226'));
  // Surface and underground logistics light pulses.
  const sx=55+((t*46)%700),ux=80+((t*33)%650);g.save();g.globalCompositeOperation='screen';
  let q=g.createLinearGradient(sx-70,0,sx+20,0);q.addColorStop(0,'rgba(72,239,222,0)');q.addColorStop(.72,'rgba(72,239,222,.28)');q.addColorStop(1,'rgba(205,255,247,.78)');g.strokeStyle=q;g.lineWidth=3;g.beginPath();g.moveTo(sx-70,282);g.lineTo(sx+20,282);g.stroke();
  q=g.createLinearGradient(ux-60,0,ux+18,0);q.addColorStop(0,'rgba(255,181,84,0)');q.addColorStop(.7,'rgba(255,181,84,.24)');q.addColorStop(1,'rgba(255,229,176,.7)');g.strokeStyle=q;g.lineWidth=2.5;g.beginPath();g.moveTo(ux-60,557);g.lineTo(ux+18,557);g.stroke();g.restore();
  // Fine dust and fog drift.
  g.save();g.fillStyle='#d7f4ef';for(let i=0;i<15;i++){const x=(i*71+t*(7+i%4)*2.5)%850-15;const y=125+(i*39)%430+Math.sin(t*.8+i)*6;g.globalAlpha=.045+(i%4)*.018;g.beginPath();g.arc(x,y,1+(i%3)*.45,0,Math.PI*2);g.fill()}g.restore();
  // Tiny signal pulse makes movement obvious even on a phone screenshot-scale scene.
  const p=(Math.sin(t*2)+1)/2;g.fillStyle=`rgba(84,246,197,${.025+.02*p})`;g.fillRect(0,274,820,3);
  raf=requestAnimationFrame(frame);
 }
 cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
window.addEventListener('dna-game-remount',()=>setTimeout(mount,120));
})();