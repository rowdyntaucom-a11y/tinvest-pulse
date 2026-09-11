(()=>{'use strict';
const V='15.0.0';
const LEVELS=['ФУНДАМЕНТ','ДОМ','ПОСЕЛЕНИЕ','ГОРОД','КРЕПОСТЬ','КОРОЛЕВСТВО','СТОЛИЦА','ЦИТАДЕЛЬ','ИМПЕРИЯ','ЛЕГЕНДА','БЕСКОНЕЧНОСТЬ'];
const W=1200,H=750;
let raf=0,lastLevel=0,lastFrame=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function readLevel(){const p=Number(window.DNA_PREVIEW_LEVEL||0);if(p>=1&&p<=11)return p;const root=document.getElementById('iwScene')?.parentElement||document.body;const m=(root.innerText||'').match(/(\d+)\s*\/\s*11/);return clamp(m?Number(m[1]):1,1,11)}
function css(){if(document.getElementById('dnaWorldMaster150Css'))return;const s=document.createElement('style');s.id='dnaWorldMaster150Css';s.textContent=`
body.investorWorldOpen #iwScene{aspect-ratio:8/5!important;height:auto!important;min-height:0!important;overflow:hidden!important;background:#020807!important}
#dnaWorldMaster1500,#dnaWorldLife1500{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
#dnaWorldMaster1500{z-index:60}#dnaWorldLife1500{z-index:61}
#dnaPreview14290{z-index:90!important}
@media (min-width:1000px){
 body.investorWorldOpen #investorWorld{padding:26px 30px 52px!important;overflow:visible!important}
 body.investorWorldOpen #investorWorld>.iwTop,
 body.investorWorldOpen #investorWorld>.iwHero,
 body.investorWorldOpen #investorWorld>.iwStats,
 body.investorWorldOpen #investorWorld>.iwActivity,
 body.investorWorldOpen #investorWorld>.iwProfile,
 body.investorWorldOpen #investorWorld>.iwFoot{width:min(94vw,1440px)!important;max-width:1440px!important;margin-left:auto!important;margin-right:auto!important}
 body.investorWorldOpen .iwTop h2{font-size:clamp(34px,3vw,56px)!important}
 body.investorWorldOpen .iwTop p{font-size:15px!important}
 body.investorWorldOpen .iwHero{border-radius:30px!important}
 body.investorWorldOpen .iwStats{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important}
 body.investorWorldOpen .iwStats>div{min-height:92px!important;padding:18px 20px!important}
 body.investorWorldOpen #dnaPreview14290{transform:scale(1.12);transform-origin:top left}
}
@media (max-width:999px){body.investorWorldOpen #iwScene{aspect-ratio:8/5!important}}
`;document.head.appendChild(s)}
function hideLegacy(h){['dnaWorldArt148','dnaWorldScale14290','dnaQuality14200','dnaEnv14230','dnaDetail14240','dnaWorld148','dnaRuntime14180','dnaLevelWorld14300','dnaLevelWorld14310'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});h.querySelectorAll('canvas').forEach(e=>{if(e.id!=='dnaWorldMaster1500'&&e.id!=='dnaWorldLife1500')e.style.display='none'})}
function mount(){css();const h=document.getElementById('iwScene');if(!h)return setTimeout(mount,120);if(getComputedStyle(h).position==='static')h.style.position='relative';hideLegacy(h);document.getElementById('dnaWorldMaster1500')?.remove();document.getElementById('dnaWorldLife1500')?.remove();
 const base=document.createElement('canvas');base.id='dnaWorldMaster1500';base.width=W;base.height=H;h.appendChild(base);
 const life=document.createElement('canvas');life.id='dnaWorldLife1500';life.width=W;life.height=H;h.appendChild(life);
 const b=base.getContext('2d'),g=life.getContext('2d');b.imageSmoothingEnabled=true;g.imageSmoothingEnabled=true;
 const A=()=>window.DNA_GAME_ASSETS||null;
 function poly(c,pts,fill,stroke=null,lw=1){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
 function glow(c,x,y,r,a,col='255,180,76'){c.save();c.globalCompositeOperation='screen';const q=c.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,`rgba(${col},${a})`);q.addColorStop(.38,`rgba(${col},${a*.42})`);q.addColorStop(1,`rgba(${col},0)`);c.fillStyle=q;c.fillRect(x-r,y-r,r*2,r*2);c.restore()}
 function lamp(c,x,y,s=1,a=1){c.save();c.fillStyle='#4b3026';c.fillRect(x-2*s,y-28*s,4*s,28*s);c.fillStyle='#e9a64f';c.fillRect(x-6*s,y-33*s,12*s,8*s);c.fillStyle='#ffe18b';c.fillRect(x-3*s,y-31*s,6*s,5*s);glow(c,x,y-28*s,30*s,.16*a);c.restore()}
 function pine(c,x,y,s=1,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle='#061b20';c.fillRect(x-2*s,y-28*s,4*s,28*s);for(let i=0;i<3;i++)poly(c,[[x,y-62*s+i*16*s],[x-22*s+i*2*s,y-20*s+i*12*s],[x+22*s-i*2*s,y-20*s+i*12*s]],i===0?'#0b2d34':'#09242b');c.restore()}
 function mountain(c,x,baseY,w,h,col){poly(c,[[x,baseY],[x+w*.45,baseY-h],[x+w,baseY]],col)}
 function worker(c,key,x,feetY,w=58,h=86,flip=false,alpha=1,bob=0,ang=0){const a=A();c.save();c.globalAlpha=.28;c.fillStyle='#000';c.beginPath();c.ellipse(x,feetY+3,w*.28,5,0,0,Math.PI*2);c.fill();c.restore();c.save();c.translate(x,feetY);c.rotate(ang);if(a?.draw)a.draw(c,key,-w/2,-h+bob,w,h,{flipX:flip,alpha});else{c.globalAlpha=alpha;c.fillStyle='#e0a16c';c.beginPath();c.arc(0,-h*.72,7,0,Math.PI*2);c.fill();c.fillStyle='#1aa09a';c.fillRect(-8,-h*.58,16,h*.38)}c.restore()}
 function cart(c,x,y,loaded=true,scale=1,phase=0){const a=A(),w=72*scale,h=49*scale,bounce=Math.sin(phase)*1.1;c.save();c.globalAlpha=.28;c.fillStyle='#000';c.beginPath();c.ellipse(x,y+4,w*.38,4.5,0,0,Math.PI*2);c.fill();c.restore();if(a?.draw)a.draw(c,loaded?'cartLoaded':'cartEmpty',x-w/2,y-h*.8+bounce,w,h,{alpha:.98});}
 function house(c,x,y,s=1,lit=true){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#251b18';c.strokeStyle='#8f5a39';c.lineWidth=3;c.fillRect(-35,-48,70,48);c.strokeRect(-35,-48,70,48);poly(c,[[-43,-48],[0,-82],[43,-48]],'#4a2f25','#b36d42',3);c.fillStyle='#15100f';c.fillRect(-9,-29,18,29);c.fillStyle=lit?'#ffd176':'#263633';c.fillRect(-28,-36,11,12);c.fillRect(18,-36,11,12);if(lit){glow(c,-22,-30,24,.09);glow(c,23,-30,24,.09)}c.restore()}
 function mineEntrance(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#050a0c';c.beginPath();c.moveTo(-55,0);c.lineTo(-55,-55);c.quadraticCurveTo(-48,-112,0,-118);c.quadraticCurveTo(48,-112,55,-55);c.lineTo(55,0);c.closePath();c.fill();c.strokeStyle='#7b5134';c.lineWidth=10;c.stroke();c.strokeStyle='#c48148';c.lineWidth=3;c.stroke();for(let i=-38;i<=38;i+=19){c.strokeStyle='#513626';c.lineWidth=3;c.beginPath();c.moveTo(i,-4);c.lineTo(i,-88+Math.abs(i)*.4);c.stroke()}lamp(c,-42,-15,.8,1);lamp(c,42,-15,.8,1);c.restore()}
 function scaffold(c,x,y,w,h){c.save();c.strokeStyle='#8d572f';c.lineWidth=5;for(let xx=x;xx<=x+w;xx+=w/4){c.beginPath();c.moveTo(xx,y);c.lineTo(xx,y-h);c.stroke()}for(let yy=y;yy>=y-h;yy-=h/3){c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke()}c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y-h);c.moveTo(x+w,y);c.lineTo(x,y-h);c.stroke();c.restore()}
 function factory(c,x,y,s=1,tier=1){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#151b1c';c.strokeStyle='#704733';c.lineWidth=3;c.fillRect(-80,-68,160,68);c.strokeRect(-80,-68,160,68);poly(c,[[-90,-68],[-34,-92],[88,-68]],'#28211d','#8d5a37',3);for(let i=0;i<Math.min(3,tier);i++){const xx=25+i*26;c.fillStyle='#31383a';c.fillRect(xx,-128,16,60);c.strokeStyle='#8a5a3a';c.strokeRect(xx,-128,16,60)}for(let i=0;i<5;i++){c.fillStyle=i%2?'#ffd177':'#293c3a';c.fillRect(-66+i*29,-51,12,14)}c.fillStyle='#563727';c.fillRect(-20,-40,40,40);c.restore()}
 function wall(c,x,y,w,h){c.save();const q=c.createLinearGradient(x,y,x,y+h);q.addColorStop(0,'#35403b');q.addColorStop(1,'#15231f');c.fillStyle=q;c.fillRect(x,y,w,h);c.strokeStyle='#8e704d';c.lineWidth=3;c.strokeRect(x,y,w,h);for(let yy=y+10;yy<y+h;yy+=14){c.strokeStyle='rgba(184,149,94,.18)';c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke()}c.restore()}
 function tower(c,x,y,s=1,lit=true){c.save();c.translate(x,y);c.scale(s,s);wall(c,-25,-72,50,72);poly(c,[[-32,-72],[0,-101],[32,-72]],'#422c22','#a1683f',3);c.fillStyle=lit?'#ffd06d':'#263633';c.fillRect(-6,-50,12,16);if(lit)glow(c,0,-43,28,.09);c.restore()}
 function castle(c,x,y,s=1,grand=0){c.save();c.translate(x,y);c.scale(s,s);wall(c,-92,-62,184,62);tower(c,-78,-60,.88,true);tower(c,78,-60,.88,true);c.fillStyle='#26372f';c.strokeStyle='#9b6542';c.lineWidth=4;c.fillRect(-42,-118,84,118);c.strokeRect(-42,-118,84,118);poly(c,[[-50,-118],[0,-154],[50,-118]],'#493024','#b97747',3);for(let i=-1;i<=1;i++){c.fillStyle='#ffd273';c.fillRect(i*21-5,-86,10,17);glow(c,i*21,-78,25,.07)}if(grand){tower(c,-120,-20,.66,true);tower(c,120,-20,.66,true)}c.restore()}
 function bridge(c,x,y,w){c.save();c.strokeStyle='#7c5a3c';c.lineWidth=8;c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.stroke();c.lineWidth=3;for(let i=0;i<5;i++){const x0=x+i*w/5,x1=x+(i+1)*w/5;c.beginPath();c.moveTo(x0,y);c.quadraticCurveTo((x0+x1)/2,y+52,x1,y);c.stroke()}c.restore()}
 function construction(c,x,y,s=1,tier=1){c.save();c.translate(x,y);c.scale(s,s);const ww=150,hh=95;c.fillStyle='rgba(41,31,24,.8)';c.fillRect(-ww/2,-hh,ww,hh);scaffold(c,-ww/2-12,0,ww+24,hh+24);if(tier>=2){c.fillStyle='#82705f';for(let i=0;i<4;i++)c.fillRect(-58+i*31,-22-(i%2)*14,27,18)}if(tier>=3){c.strokeStyle='#bd7a45';c.lineWidth=5;c.beginPath();c.moveTo(74,-112);c.lineTo(74,-200);c.lineTo(185,-200);c.stroke();c.lineWidth=2;c.beginPath();c.moveTo(177,-200);c.lineTo(177,-142);c.stroke();c.fillStyle='#875333';c.fillRect(164,-142,26,20)}c.restore()}
 function crystal(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.globalCompositeOperation='screen';poly(c,[[0,0],[8,-28],[16,0]],'#39efe3','#bafff8',2);poly(c,[[-11,0],[-6,-20],[1,0]],'#20aeb3','#78fff5',1);poly(c,[[12,0],[20,-18],[27,0]],'#1e9fa8','#68efe6',1);glow(c,6,-10,30,.11,'52,239,226');c.restore()}
 function label(c,text,x,y){c.save();c.font='700 18px system-ui, sans-serif';c.textAlign='center';c.fillStyle='rgba(255,232,188,.92)';c.shadowColor='rgba(255,166,74,.35)';c.shadowBlur=8;c.fillText(text,x,y);c.restore()}
 function background(c,level){let q=c.createLinearGradient(0,0,0,H);q.addColorStop(0,'#020917');q.addColorStop(.44,'#0a2740');q.addColorStop(.7,'#071817');q.addColorStop(1,'#03100e');c.fillStyle=q;c.fillRect(0,0,W,H);
  for(let i=0;i<75;i++){const x=(i*173)%W,y=18+(i*83)%230,r=(i%4===0?1.6:.8);c.fillStyle=`rgba(210,244,255,${.18+(i%5)*.06})`;c.fillRect(x,y,r,r)}
  glow(c,780,105,92,.17,'214,238,220');c.fillStyle='#e7efca';c.beginPath();c.arc(780,105,30,0,Math.PI*2);c.fill();
  mountain(c,-60,330,360,235,'#0a2235');mountain(c,180,335,410,270,'#0b2a3c');mountain(c,470,332,470,250,'#0b2637');mountain(c,780,338,480,285,'#0b2233');
  mountain(c,0,365,360,160,'#0a2930');mountain(c,310,362,360,155,'#0a2830');mountain(c,620,362,380,160,'#092830');mountain(c,930,362,340,150,'#09262e');
  for(let i=0;i<34;i++)pine(c,18+i*37,367,(.55+(i%4)*.08),.72);
  q=c.createLinearGradient(0,340,0,455);q.addColorStop(0,'#0a3135');q.addColorStop(1,'#06191d');c.fillStyle=q;c.fillRect(0,350,W,105);
  c.fillStyle='rgba(33,100,107,.19)';c.fillRect(700,350,500,105);for(let i=0;i<8;i++){c.strokeStyle=`rgba(130,240,229,${.025+i*.004})`;c.beginPath();c.moveTo(700,365+i*10);c.lineTo(1200,365+i*10);c.stroke()}
  if(level>=6){const cx=965,cy=305;castle(c,cx,cy,.32,level>=9?1:0);bridge(c,815,345,300)}
 }
 function terrain(c){c.fillStyle='#0a1514';c.fillRect(0,455,W,295);c.fillStyle='#11201c';c.fillRect(0,455,W,18);c.strokeStyle='#5e4834';c.lineWidth=5;c.beginPath();c.moveTo(0,472);c.lineTo(W,472);c.stroke();
  c.fillStyle='#0b1211';c.fillRect(0,540,W,210);for(let x=0;x<W;x+=48){c.strokeStyle='rgba(125,95,62,.20)';c.lineWidth=2;c.beginPath();c.moveTo(x,540);c.lineTo(x,750);c.stroke()}
 }
 function rail(c,y,x1=20,x2=1180){c.strokeStyle='#8b6749';c.lineWidth=5;c.beginPath();c.moveTo(x1,y);c.lineTo(x2,y);c.moveTo(x1,y+14);c.lineTo(x2,y+14);c.stroke();c.strokeStyle='#4d3327';c.lineWidth=3;for(let x=x1;x<x2;x+=28){c.beginPath();c.moveTo(x,y-4);c.lineTo(x+12,y+19);c.stroke()}}
 function world(c,level){background(c,level);terrain(c);rail(c,470,20,1180);rail(c,650,35,1165);
  mineEntrance(c,120,455,1.03);label(c,'ШАХТА',120,372);crystal(c,38,465,.9);crystal(c,64,468,.72);crystal(c,190,466,.8);
  scaffold(c,250,454,170,125);lamp(c,225,453,1,1);lamp(c,445,453,1,1);
  construction(c,1010,455,.86,1);label(c,'ФУНДАМЕНТ',1010,385);
  if(level<2){c.fillStyle='rgba(0,7,8,.62)';c.fillRect(470,330,730,125)}
  if(level>=2){house(c,545,454,.8,true);lamp(c,490,454,.9,1);label(c,'ДОМ',545,374)}
  if(level>=3){house(c,645,454,.62,true);house(c,715,454,.56,true);house(c,785,454,.52,true);lamp(c,625,454,.8,1);lamp(c,745,454,.8,1);label(c,'ПОСЕЛЕНИЕ',705,365)}
  if(level>=4){factory(c,630,455,.78,1);lamp(c,560,454,.9,1);lamp(c,700,454,.9,1);label(c,'ЦЕХ',630,352);c.fillStyle='#4e4033';c.fillRect(500,445,330,9)}
  if(level>=5){wall(c,835,398,250,57);tower(c,852,398,.72,true);tower(c,1067,398,.72,true);label(c,'КРЕПОСТЬ',960,370)}
  if(level>=6){castle(c,932,455,.62,0);bridge(c,815,455,340);label(c,'КОРОЛЕВСТВО',930,322)}
  if(level>=7){for(let i=0;i<6;i++)house(c,480+i*68,455,.42+(i%2)*.05,true);factory(c,720,455,.62,2);tower(c,1120,455,.6,true);label(c,'СТОЛИЦА',760,330)}
  if(level>=8){castle(c,925,455,.82,1);tower(c,760,455,.85,true);label(c,'ЦИТАДЕЛЬ',925,286)}
  if(level>=9){factory(c,640,455,.82,3);for(let i=0;i<3;i++){const x=760+i*60;c.fillStyle='#222c2c';c.fillRect(x,300-i*12,28,155+i*12);c.fillStyle='#8d5939';c.fillRect(x+5,282-i*12,18,25);glow(c,x+14,290-i*12,34,.05,'255,164,76')}construction(c,1040,455,.9,3);label(c,'ИМПЕРИЯ',850,265)}
  if(level>=10){bridge(c,430,330,650);for(let i=0;i<10;i++)lamp(c,455+i*65,330,.7,.85);castle(c,940,455,.94,1);label(c,'ЛЕГЕНДА',940,246);}
  if(level>=11){c.save();c.globalCompositeOperation='screen';const au=c.createLinearGradient(0,80,W,300);au.addColorStop(0,'rgba(49,231,207,0)');au.addColorStop(.28,'rgba(49,231,207,.07)');au.addColorStop(.55,'rgba(106,93,255,.09)');au.addColorStop(.8,'rgba(49,231,207,.06)');au.addColorStop(1,'rgba(49,231,207,0)');c.fillStyle=au;poly(c,[[0,110],[250,58],[510,124],[760,54],[1010,130],[1200,76],[1200,210],[950,166],[690,226],[420,158],[180,222],[0,180]],au);c.restore();for(let i=0;i<8;i++)crystal(c,760+i*34,444,.48+(i%3)*.1);label(c,'БЕСКОНЕЧНОСТЬ',940,214)}
  mineEntrance(c,170,680,.82);crystal(c,78,652,.8);crystal(c,112,658,.58);lamp(c,260,648,.8,1);
  if(level>=3){scaffold(c,300,650,150,90);crystal(c,465,650,.7)}
  if(level>=4){factory(c,590,650,.5,1);lamp(c,520,648,.7,1)}
  if(level>=5){wall(c,680,590,150,60);tower(c,700,650,.5,true);tower(c,810,650,.5,true)}
  if(level>=6){bridge(c,790,640,300);crystal(c,930,650,.9)}
  if(level>=7){factory(c,730,650,.55,2);lamp(c,850,648,.7,1)}
  if(level>=8){tower(c,960,650,.72,true);crystal(c,1010,650,1.05)}
  if(level>=9){factory(c,1040,650,.5,3)}
  if(level>=10){for(let i=0;i<6;i++)crystal(c,540+i*70,650,.5+(i%2)*.22)}
  if(level>=11){glow(c,700,620,180,.075,'55,242,227')}
 }
 function lifeFrame(c,t,level){c.clearRect(0,0,W,H);
  c.save();c.fillStyle='#b5d8d5';for(let i=0;i<7;i++){const x=((i*190+t*(6+i))%1450)-140,y=320+(i%3)*26;c.globalAlpha=.025+(i%3)*.012;c.beginPath();c.ellipse(x,y,90,12,0,0,Math.PI*2);c.fill()}c.restore();
  const swing=Math.sin(t*4.8);worker(c,'minerMine',142,472,61,91,false,.99,Math.abs(swing)*2,-.05+swing*.08);
  if(level>=2)worker(c,'builderWork',1008,472,59,89,false,.98,Math.abs(Math.sin(t*4.1))*1.5,Math.sin(t*4.1)*.04);
  if(level>=3)worker(c,'haulerWalk',420+((t*(20+level))%420),472,56,85,false,.98,Math.abs(Math.sin(t*7))*2,Math.sin(t*7)*.02);
  if(level>=4)worker(c,'operatorIdle',632,472,58,87,true,.98,Math.sin(t*2.2)*.6,0);
  if(level>=6)worker(c,'builderWork',930,472,58,88,true,.98,Math.abs(Math.sin(t*4.2))*1.5,Math.sin(t*4.2)*.035);
  if(level>=7)worker(c,'operatorIdle',780,472,57,86,false,.98,Math.sin(t*2.4)*.6,0);
  if(level>=9)worker(c,'haulerWalk',760+Math.sin(t*.35)*150,472,55,84,true,.96,Math.abs(Math.sin(t*6.3))*1.8,Math.sin(t*6.3)*.018);
  const cartCount=level>=9?3:level>=5?2:1;for(let i=0;i<cartCount;i++){const x=-70+((t*(36+level*2)+i*(W/cartCount+150))%(W+180));cart(c,x,486,i%2===0,1.05,t*6+i)}
  worker(c,'minerMine',185,652,56,84,true,.96,Math.abs(Math.sin(t*4.6+1))*1.8,.05-Math.sin(t*4.6+1)*.07);
  if(level>=4)worker(c,'operatorIdle',590,652,53,80,false,.93,Math.sin(t*2)*.5,0);
  if(level>=7)worker(c,'haulerWalk',520+Math.sin(t*.42)*150,652,52,79,true,.93,Math.abs(Math.sin(t*6))*1.5,0);
  const ux=W+80-((t*(23+level)+80)%(W+180));cart(c,ux,664,true,.92,t*5.5);
  if(level>=3){const x=1040,top=265,lift=312+(Math.sin(t*.7)+1)*48;c.strokeStyle='rgba(220,169,99,.9)';c.lineWidth=3;c.beginPath();c.moveTo(x,top);c.lineTo(x,lift);c.stroke();c.fillStyle='#805035';c.fillRect(x-16,lift,32,20);glow(c,x,lift+10,36,.08)}
  if(level>=4){for(let i=0;i<6;i++){const age=(t*.13+i*.17)%1,x=670+Math.sin(t*.7+i)*10,y=337-age*120;c.globalAlpha=(1-age)*.16;c.fillStyle='#b7c9c5';c.beginPath();c.ellipse(x,y,16+age*26,8+age*15,0,0,Math.PI*2);c.fill()}c.globalAlpha=1}
  if(level>=8){c.save();c.strokeStyle='rgba(151,210,226,.12)';c.lineWidth=1.3;for(let i=0;i<26;i++){const x=(i*57+t*88)%1300-40,y=(i*83+t*120)%520;c.beginPath();c.moveTo(x,y);c.lineTo(x-7,y+18);c.stroke()}c.restore()}
 }
 function syncBadge(level){document.querySelectorAll('.dnBadge').forEach(b=>b.innerHTML='<i></i> WORLD MASTER · v'+V+' · '+level+'/11');const world=LEVELS[level-1];const cards=[...document.querySelectorAll('.iwStats>div')];if(cards[2]){const txt=[...cards[2].querySelectorAll('*')].find(e=>e.children.length===0&&/ФУНДАМЕНТ|ДОМ|ПОСЕЛЕНИЕ|ГОРОД|КРЕПОСТЬ|КОРОЛЕВСТВО|СТОЛИЦА|ЦИТАДЕЛЬ|ИМПЕРИЯ|ЛЕГЕНДА|БЕСКОНЕЧНОСТЬ/.test(e.textContent||''));if(txt)txt.textContent=world}}
 function render(level){b.clearRect(0,0,W,H);world(b,level);syncBadge(level);h.dataset.worldMasterLevel=String(level);h.dataset.worldMasterName=LEVELS[level-1];window.DNA_WORLD_STATE={...(window.DNA_WORLD_STATE||{}),version:V,level,world:LEVELS[level-1],worldScale:'panorama',master:true};window.dispatchEvent(new CustomEvent('dna-world-master-level',{detail:window.DNA_WORLD_STATE}))}
 function frame(ms){if(!document.body.contains(life))return;if(ms-lastFrame<33)return raf=requestAnimationFrame(frame);lastFrame=ms;const level=readLevel();if(level!==lastLevel){lastLevel=level;render(level)}lifeFrame(g,ms/1000,level);raf=requestAnimationFrame(frame)}
 render(readLevel());cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();window.addEventListener('dna-game-remount',()=>setTimeout(mount,120));
})();