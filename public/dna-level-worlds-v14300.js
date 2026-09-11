(()=>{'use strict';
const V='14.30.0',N=['ФУНДАМЕНТ','ДОМ','ПОСЕЛЕНИЕ','ГОРОД','КРЕПОСТЬ','КОРОЛЕВСТВО','СТОЛИЦА','ЦИТАДЕЛЬ','ИМПЕРИЯ','ЛЕГЕНДА','БЕСКОНЕЧНОСТЬ'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function level(){const p=Number(window.DNA_PREVIEW_LEVEL||0);if(p>=1&&p<=11)return p;const s=document.getElementById('iwScene');const m=((s?.parentElement||document.body).innerText||'').match(/(\d+)\s*\/\s*11/);return clamp(m?Number(m[1]):1,1,11)}
function css(){if(document.getElementById('dnaResponsive14300'))return;const st=document.createElement('style');st.id='dnaResponsive14300';st.textContent=`
#iwScene{isolation:isolate}
@media (min-width:900px){
 html,body{min-width:100%;min-height:100%}
 body.investorWorldOpen{overflow:auto!important;background:#030807!important}
 body.investorWorldOpen .phone{width:100%!important;max-width:none!important;height:auto!important;min-height:100vh!important;overflow:visible!important;margin:0!important;padding:0!important;border:0!important;background:#030807!important}
 body.investorWorldOpen #investorWorld{position:relative!important;inset:auto!important;width:100%!important;min-height:100vh!important;height:auto!important;padding:28px 32px 48px!important;overflow:visible!important;background:radial-gradient(circle at 50% 0,rgba(33,116,104,.12),transparent 42%),#030807!important}
 body.investorWorldOpen #investorWorld>.iwTop,body.investorWorldOpen #investorWorld>.iwHero,body.investorWorldOpen #investorWorld>.iwStats,body.investorWorldOpen #investorWorld>.iwActivity,body.investorWorldOpen #investorWorld>.iwProfile,body.investorWorldOpen #investorWorld>.iwFoot{width:min(78vw,820px)!important;max-width:820px!important;margin-left:auto!important;margin-right:auto!important}
 body.investorWorldOpen .iwTop{margin-bottom:18px!important}
 body.investorWorldOpen .iwTop h2{font-size:34px!important}
 body.investorWorldOpen .iwTop p{font-size:13px!important}
 body.investorWorldOpen .iwHero{border-radius:28px!important}
 body.investorWorldOpen #iwScene{width:100%!important;height:auto!important;aspect-ratio:820/680!important;min-height:0!important;max-height:none!important}
 body.investorWorldOpen .iwLevel{padding:18px 24px 20px!important}
 body.investorWorldOpen .iwStats{gap:12px!important;margin-top:14px!important}
 body.investorWorldOpen .iwStats>div{min-height:86px!important;padding:16px 18px!important}
 body.investorWorldOpen .iwActivity,body.investorWorldOpen .iwProfile{margin-top:14px!important}
 body.investorWorldOpen #dnaPreview14290{left:18px!important;top:18px!important;transform:scale(1.08);transform-origin:top left}
}
@media (min-width:1400px){body.investorWorldOpen #investorWorld>.iwTop,body.investorWorldOpen #investorWorld>.iwHero,body.investorWorldOpen #investorWorld>.iwStats,body.investorWorldOpen #investorWorld>.iwActivity,body.investorWorldOpen #investorWorld>.iwProfile,body.investorWorldOpen #investorWorld>.iwFoot{width:820px!important}}
@media (max-width:899px){body.investorWorldOpen #iwScene{max-width:100%;overflow:hidden}}
`;document.head.appendChild(st)}
function mount(){css();const h=document.getElementById('iwScene');if(!h)return setTimeout(mount,140);document.getElementById('dnaLevelWorld14300')?.remove();const c=document.createElement('canvas');c.id='dnaLevelWorld14300';c.width=820;c.height=680;Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'42.6',pointerEvents:'none'});h.appendChild(c);const g=c.getContext('2d');g.imageSmoothingEnabled=true;let last=0;
const glow=(x,y,r,a,col='255,184,88')=>{g.save();g.globalCompositeOperation='screen';const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,`rgba(${col},${a})`);q.addColorStop(.42,`rgba(${col},${a*.38})`);q.addColorStop(1,`rgba(${col},0)`);g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()};
function house(x,y,s=1,warm=true){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle='#17302d';g.strokeStyle='rgba(196,126,70,.9)';g.lineWidth=3;g.fillRect(-22,-29,44,29);g.strokeRect(-22,-29,44,29);g.beginPath();g.moveTo(-28,-29);g.lineTo(0,-51);g.lineTo(28,-29);g.closePath();g.fillStyle='#35251f';g.fill();g.stroke();g.fillStyle=warm?'#ffd274':'#7de6db';g.fillRect(-11,-21,8,9);g.fillRect(7,-21,8,9);g.restore()}
function lamp(x,y,a=1){g.fillStyle='#a36639';g.fillRect(x-2,y-22,4,22);g.fillStyle='#ffd06e';g.fillRect(x-4,y-25,8,7);glow(x,y-21,18,.07*a)}
function wall(x,y,w,h){const q=g.createLinearGradient(x,y,x,y+h);q.addColorStop(0,'#36413a');q.addColorStop(1,'#182722');g.fillStyle=q;g.strokeStyle='#6b5a45';g.lineWidth=3;g.fillRect(x,y,w,h);g.strokeRect(x,y,w,h);for(let xx=x+14;xx<x+w;xx+=28){g.strokeStyle='rgba(160,134,93,.26)';g.beginPath();g.moveTo(xx,y);g.lineTo(xx,y+h);g.stroke()}}
function tower(x,y,s=1){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle='#232f2a';g.strokeStyle='#a06a43';g.lineWidth=3;g.fillRect(-18,-52,36,52);g.strokeRect(-18,-52,36,52);g.fillStyle='#4b3326';g.beginPath();g.moveTo(-24,-52);g.lineTo(0,-72);g.lineTo(24,-52);g.closePath();g.fill();g.stroke();g.fillStyle='#ffd16d';g.fillRect(-4,-34,8,10);g.restore()}
function keep(x,y,s=1){g.save();g.translate(x,y);g.scale(s,s);wall(-46,-45,92,45);tower(-42,-44,.75);tower(42,-44,.75);g.fillStyle='#283c34';g.fillRect(-22,-74,44,74);g.strokeStyle='#b17646';g.lineWidth=3;g.strokeRect(-22,-74,44,74);g.fillStyle='#4f3426';g.beginPath();g.moveTo(-28,-74);g.lineTo(0,-98);g.lineTo(28,-74);g.closePath();g.fill();g.stroke();g.fillStyle='#ffd276';g.fillRect(-5,-51,10,14);g.restore()}
function bridge(x,y,w){g.save();g.strokeStyle='#856040';g.lineWidth=5;g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y);g.stroke();g.lineWidth=3;for(let i=0;i<=4;i++){const xx=x+w*i/4;g.beginPath();g.moveTo(xx,y);g.quadraticCurveTo(xx+w/8,y+26,xx+w/4,y);g.stroke()}g.restore()}
function city(level){const baseY=325;
 if(level>=2){house(496,baseY,.62);lamp(458,baseY);}
 if(level>=3){house(540,baseY,.48);house(580,baseY,.43);lamp(520,baseY);lamp(610,baseY);}
 if(level>=4){for(let i=0;i<4;i++)house(445+i*46,baseY,.38+(.04*(i%2)),i%2===0);g.fillStyle='rgba(217,156,83,.4)';g.fillRect(422,baseY+4,213,5);}
 if(level>=5){wall(420,282,220,43);tower(432,282,.72);tower(628,282,.72);}
 if(level>=6){keep(535,baseY,.64);bridge(612,300,135);lamp(646,302);lamp(711,302);}
 if(level>=7){for(let i=0;i<6;i++){const x=390+i*54,h=32+(i%3)*13;g.fillStyle=i%2?'#19332f':'#1b2927';g.fillRect(x,baseY-h,36,h);g.fillStyle='#ffd06f';for(let y=baseY-h+9;y<baseY-5;y+=12)g.fillRect(x+8,y,4,4)}tower(688,baseY,.58);}
 if(level>=8){tower(535,baseY,1.18);g.strokeStyle='rgba(103,245,226,.55)';g.lineWidth=2;g.beginPath();g.moveTo(535,198);g.lineTo(535,254);g.stroke();glow(535,202,30,.08,'79,241,223');}
 if(level>=9){for(let i=0;i<3;i++){const x=655+i*28;g.fillStyle='#25332f';g.fillRect(x,251-i*9,17,74+i*9);g.fillStyle='#8e5f3d';g.fillRect(x+3,236-i*9,11,20);glow(x+8,239-i*9,24,.035,'255,162,75')}}
 if(level>=10){bridge(352,248,395);for(let i=0;i<9;i++)lamp(365+i*46,248,.75);glow(548,232,70,.045,'255,195,102');}
 if(level>=11){g.save();g.globalCompositeOperation='screen';const a=g.createLinearGradient(0,70,820,250);a.addColorStop(0,'rgba(60,238,206,0)');a.addColorStop(.25,'rgba(60,238,206,.07)');a.addColorStop(.52,'rgba(108,101,255,.08)');a.addColorStop(.75,'rgba(60,238,206,.055)');a.addColorStop(1,'rgba(60,238,206,0)');g.fillStyle=a;g.beginPath();g.moveTo(0,180);g.quadraticCurveTo(210,72,410,172);g.quadraticCurveTo(625,58,820,162);g.lineTo(820,230);g.quadraticCurveTo(610,132,410,222);g.quadraticCurveTo(215,125,0,236);g.closePath();g.fill();g.restore();glow(535,190,92,.07,'91,255,232');}
}
function underground(level){if(level<3)return;g.save();g.globalAlpha=.82;const y=566;if(level>=3){g.fillStyle='#6d4931';g.fillRect(270,y,75,7);g.fillRect(290,y-13,38,7)}if(level>=5){wall(335,536,64,30);lamp(370,559,.7)}if(level>=7){g.strokeStyle='#86603c';g.lineWidth=5;g.beginPath();g.moveTo(440,600);g.lineTo(440,520);g.lineTo(500,520);g.stroke();lamp(472,540,.8)}if(level>=9){g.fillStyle='#2b413a';g.fillRect(590,532,74,54);g.fillStyle='#ffd16d';g.fillRect(602,547,8,8);g.fillRect(622,547,8,8);g.fillRect(642,547,8,8)}if(level>=11){glow(412,566,74,.065,'66,245,228')}g.restore()}
function frame(ms){if(!document.body.contains(c))return;const lv=level(),t=ms/1000;g.clearRect(0,0,820,680);city(lv);underground(lv);if(last!==lv){last=lv;h.dataset.previewLevel=String(lv);h.dataset.previewName=N[lv-1];window.dispatchEvent(new CustomEvent('dna-level-world-render',{detail:{version:V,level:lv,name:N[lv-1]}}))}if(lv>=4){g.save();g.globalAlpha=.018+.01*Math.sin(t*.7);g.fillStyle='#c8fff8';g.fillRect(0,336,820,34);g.restore()}requestAnimationFrame(frame)}requestAnimationFrame(frame)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();window.addEventListener('dna-game-remount',()=>setTimeout(mount,120));
})();