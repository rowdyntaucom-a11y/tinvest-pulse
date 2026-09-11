(()=>{'use strict';
const V='14.31.0';
const N=['ФУНДАМЕНТ','ДОМ','ПОСЕЛЕНИЕ','ГОРОД','КРЕПОСТЬ','КОРОЛЕВСТВО','СТОЛИЦА','ЦИТАДЕЛЬ','ИМПЕРИЯ','ЛЕГЕНДА','БЕСКОНЕЧНОСТЬ'];
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let lastLevel=0, realSnapshot=null, flash=0;

function currentLevel(){
  const p=Number(window.DNA_PREVIEW_LEVEL||0);
  if(p>=1&&p<=11)return p;
  const scene=$('iwScene');
  const real=Number(scene?.dataset?.level||$('iwLevel')?.textContent||1);
  return clamp(real||1,1,11);
}

function snapshotReal(){
  if(realSnapshot)return;
  const text=id=>$(id)?.textContent||'';
  realSnapshot={
    level:text('iwLevel'), max:text('iwLevelMax'), stage:text('iwStage'),
    world:text('iwWorldName'), next:text('iwNext'),
    progress:$('iwProgress')?.style.width||''
  };
}

function syncUi(level){
  const preview=Number(window.DNA_PREVIEW_LEVEL||0)>=1;
  if(preview){
    snapshotReal();
    if($('iwLevel'))$('iwLevel').textContent=String(level);
    if($('iwLevelMax'))$('iwLevelMax').textContent='/ 11';
    if($('iwStage'))$('iwStage').textContent=N[level-1];
    if($('iwWorldName'))$('iwWorldName').textContent=N[level-1];
    if($('iwNext'))$('iwNext').textContent='ПРЕДПРОСМОТР · УРОВЕНЬ '+level;
    if($('iwProgress'))$('iwProgress').style.width=((level/11)*100).toFixed(1)+'%';
  }else if(realSnapshot){
    if($('iwLevel'))$('iwLevel').textContent=realSnapshot.level;
    if($('iwLevelMax'))$('iwLevelMax').textContent=realSnapshot.max;
    if($('iwStage'))$('iwStage').textContent=realSnapshot.stage;
    if($('iwWorldName'))$('iwWorldName').textContent=realSnapshot.world;
    if($('iwNext'))$('iwNext').textContent=realSnapshot.next;
    if($('iwProgress'))$('iwProgress').style.width=realSnapshot.progress;
    realSnapshot=null;
  }
}

function injectCss(){
  if($('dnaTrueEvolution14310Style'))return;
  const s=document.createElement('style');
  s.id='dnaTrueEvolution14310Style';
  s.textContent=`
  #iwScene{isolation:isolate}
  @media(min-width:900px){
    body:not(.investorWorldOpen) .phone{
      width:min(680px,calc(100vw - 72px))!important;
      max-width:680px!important;
    }
    body.investorWorldOpen{overflow:auto!important;background:#020706!important}
    body.investorWorldOpen .phone{width:100%!important;max-width:none!important;height:auto!important;min-height:100vh!important;overflow:visible!important;margin:0!important;padding:0!important;border:0!important}
    body.investorWorldOpen #investorWorld{position:relative!important;inset:auto!important;width:100%!important;min-height:100vh!important;height:auto!important;padding:28px 32px 56px!important;overflow:visible!important}
    body.investorWorldOpen #investorWorld>.iwTop,
    body.investorWorldOpen #investorWorld>.iwHero,
    body.investorWorldOpen #investorWorld>.iwStats,
    body.investorWorldOpen #investorWorld>.iwActivity,
    body.investorWorldOpen #investorWorld>.iwProfile,
    body.investorWorldOpen #investorWorld>.iwFoot{
      width:min(82vw,900px)!important;max-width:900px!important;margin-left:auto!important;margin-right:auto!important
    }
    body.investorWorldOpen #iwScene{width:100%!important;height:auto!important;aspect-ratio:820/680!important;min-height:0!important}
    body.investorWorldOpen .iwTop h2{font-size:36px!important}
    body.investorWorldOpen .iwTop p{font-size:13px!important}
    body.investorWorldOpen .iwStats{gap:12px!important;margin-top:14px!important}
    body.investorWorldOpen .iwStats>div{min-height:82px!important;padding:15px 18px!important}
    body.investorWorldOpen #dnaPreview14290{left:18px!important;top:18px!important;transform:scale(1.08);transform-origin:top left}
  }
  @media(min-width:1400px){
    body:not(.investorWorldOpen) .phone{width:740px!important;max-width:740px!important}
    body.investorWorldOpen #investorWorld>.iwTop,
    body.investorWorldOpen #investorWorld>.iwHero,
    body.investorWorldOpen #investorWorld>.iwStats,
    body.investorWorldOpen #investorWorld>.iwActivity,
    body.investorWorldOpen #investorWorld>.iwProfile,
    body.investorWorldOpen #investorWorld>.iwFoot{width:900px!important}
  }`;
  document.head.appendChild(s);
}

function mount(){
  injectCss();
  const h=$('iwScene');
  if(!h)return setTimeout(mount,120);
  $('dnaTrueEvolution14310')?.remove();

  const c=document.createElement('canvas');
  c.id='dnaTrueEvolution14310';
  c.width=820;c.height=680;
  Object.assign(c.style,{
    position:'absolute',inset:'0',width:'100%',height:'100%',
    zIndex:'44.6',pointerEvents:'none',imageRendering:'auto'
  });
  h.appendChild(c);
  const g=c.getContext('2d');
  g.imageSmoothingEnabled=true;

  const glow=(x,y,r,a,col='87,242,218')=>{
    g.save();g.globalCompositeOperation='screen';
    const q=g.createRadialGradient(x,y,1,x,y,r);
    q.addColorStop(0,`rgba(${col},${a})`);
    q.addColorStop(.45,`rgba(${col},${a*.35})`);
    q.addColorStop(1,`rgba(${col},0)`);
    g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore();
  };
  const line=(x1,y1,x2,y2,col,w=2)=>{
    g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
  };
  function maskRect(x,y,w,h,colA='#071512',colB='#071018'){
    const q=g.createLinearGradient(x,y,x+w,y+h);
    q.addColorStop(0,colA);q.addColorStop(1,colB);
    g.fillStyle=q;g.fillRect(x,y,w,h);
    g.save();g.globalAlpha=.08;g.strokeStyle='#72a59a';g.lineWidth=1;
    for(let yy=y+12;yy<y+h;yy+=18)line(x,yy,x+w,yy,'rgba(114,165,154,.14)',1);
    g.restore();
  }
  function earthMask(x,y,w,h){
    const q=g.createLinearGradient(x,y,x,y+h);
    q.addColorStop(0,'#0a1714');q.addColorStop(1,'#030b0a');
    g.fillStyle=q;g.fillRect(x,y,w,h);
    g.save();g.globalAlpha=.13;g.strokeStyle='#5a4736';
    for(let yy=y+14;yy<y+h;yy+=22)line(x,yy,x+w,yy,'rgba(126,92,61,.18)',1);
    g.restore();
  }
  function foundation(x,y,w=110){
    g.fillStyle='#6f4c34';g.fillRect(x,y,w,10);
    g.fillStyle='#2d3d37';for(let i=0;i<4;i++)g.fillRect(x+10+i*(w-20)/3,y-18-(i%2)*5,8,18+(i%2)*5);
    g.strokeStyle='#b77646';g.lineWidth=3;g.strokeRect(x,y-8,w,18);
  }
  function house(x,y,s=1,lit=true){
    g.save();g.translate(x,y);g.scale(s,s);
    g.fillStyle='#18342f';g.strokeStyle='#b8794c';g.lineWidth=3;
    g.fillRect(-26,-38,52,38);g.strokeRect(-26,-38,52,38);
    g.fillStyle='#4a3025';g.beginPath();g.moveTo(-33,-38);g.lineTo(0,-66);g.lineTo(33,-38);g.closePath();g.fill();g.stroke();
    g.fillStyle=lit?'#ffd274':'#3a6e67';
    g.fillRect(-16,-27,10,11);g.fillRect(8,-27,10,11);
    g.fillStyle='#0b1714';g.fillRect(-5,-22,12,22);
    g.restore();
  }
  function market(x,y,s=1){
    g.save();g.translate(x,y);g.scale(s,s);
    g.fillStyle='#7c4b31';g.fillRect(-28,-18,56,18);
    g.fillStyle='#d4904f';for(let i=0;i<4;i++)g.fillRect(-31+i*16,-27,12,9);
    line(-34,-28,34,-28,'#c47b46',2);
    g.restore();
  }
  function lamp(x,y,a=1){
    g.fillStyle='#8f613d';g.fillRect(x-2,y-25,4,25);
    g.fillStyle='#ffd16c';g.fillRect(x-5,y-30,10,8);
    glow(x,y-25,22,.09*a,'255,192,92');
  }
  function wall(x,y,w,h=42){
    const q=g.createLinearGradient(x,y,x,y+h);q.addColorStop(0,'#43524a');q.addColorStop(1,'#192821');
    g.fillStyle=q;g.strokeStyle='#9b7652';g.lineWidth=3;g.fillRect(x,y,w,h);g.strokeRect(x,y,w,h);
    for(let xx=x+18;xx<x+w;xx+=35)line(xx,y,xx,y+h,'rgba(165,131,89,.28)',1);
  }
  function tower(x,y,s=1,lit=true){
    g.save();g.translate(x,y);g.scale(s,s);
    g.fillStyle='#283832';g.strokeStyle='#b97849';g.lineWidth=3;
    g.fillRect(-20,-64,40,64);g.strokeRect(-20,-64,40,64);
    g.fillStyle='#553528';g.beginPath();g.moveTo(-27,-64);g.lineTo(0,-91);g.lineTo(27,-64);g.closePath();g.fill();g.stroke();
    g.fillStyle=lit?'#ffd06b':'#527b73';g.fillRect(-5,-44,10,13);
    g.restore();
  }
  function keep(x,y,s=1){
    g.save();g.translate(x,y);g.scale(s,s);
    wall(-64,-54,128,54);
    tower(-54,-52,.82);tower(54,-52,.82);
    g.fillStyle='#2b453b';g.strokeStyle='#c1814d';g.lineWidth=4;
    g.fillRect(-28,-94,56,94);g.strokeRect(-28,-94,56,94);
    g.fillStyle='#5a3929';g.beginPath();g.moveTo(-36,-94);g.lineTo(0,-126);g.lineTo(36,-94);g.closePath();g.fill();g.stroke();
    g.fillStyle='#ffd476';g.fillRect(-6,-66,12,18);
    g.restore();
  }
  function road(y,x1=340,x2=800){
    g.fillStyle='rgba(92,79,62,.72)';g.fillRect(x1,y,x2-x1,8);
    g.fillStyle='rgba(197,163,104,.24)';for(let x=x1+12;x<x2;x+=30)g.fillRect(x,y+2,13,2);
  }
  function bridge(x,y,w){
    g.strokeStyle='#a06d46';g.lineWidth=6;line(x,y,x+w,y,'#a06d46',6);
    for(let i=0;i<5;i++){
      const xx=x+(w/4)*i;g.beginPath();g.moveTo(xx,y);g.quadraticCurveTo(xx+w/8,y+28,xx+w/4,y);g.stroke();
    }
  }
  function factory(x,y,s=1){
    g.save();g.translate(x,y);g.scale(s,s);
    g.fillStyle='#23332f';g.strokeStyle='#8e6749';g.lineWidth=2;
    g.fillRect(-28,-42,56,42);g.strokeRect(-28,-42,56,42);
    for(let i=0;i<3;i++){g.fillStyle='#5f4332';g.fillRect(-22+i*21,-78-i*5,10,36+i*5);g.fillStyle='#d88d51';g.fillRect(-20+i*21,-82-i*5,6,6)}
    g.fillStyle='#ffd172';for(let i=0;i<3;i++)g.fillRect(-18+i*18,-28,7,7);
    g.restore();
  }
  function spire(x,y,s=1){
    g.save();g.translate(x,y);g.scale(s,s);
    g.fillStyle='rgba(39,91,82,.94)';g.strokeStyle='rgba(111,255,235,.88)';g.lineWidth=3;
    g.beginPath();g.moveTo(-24,0);g.lineTo(-13,-95);g.lineTo(0,-142);g.lineTo(14,-95);g.lineTo(25,0);g.closePath();g.fill();g.stroke();
    for(let yy=-88;yy<-18;yy+=19)line(-10,yy,11,yy,'rgba(255,212,116,.72)',3);
    glow(0,-125,58,.12,'91,255,232');g.restore();
  }
  function underground(level){
    if(level<=1){
      earthMask(245,420,575,260);
      g.fillStyle='#03100e';g.beginPath();g.ellipse(155,565,112,105,0,Math.PI,Math.PI*2);g.fill();
      return;
    }
    if(level===2){
      earthMask(470,420,350,260);
      return;
    }
    if(level===3)earthMask(670,420,150,260);

    if(level>=3){road(624,250,610);foundation(270,604,95)}
    if(level>=4){lamp(365,617,.8);g.fillStyle='#6e4b35';g.fillRect(332,584,72,34)}
    if(level>=5){wall(432,564,96,50);tower(480,565,.58)}
    if(level>=6){bridge(520,590,175);lamp(565,590,.8);lamp(650,590,.8)}
    if(level>=7){g.fillStyle='#1d3530';g.fillRect(600,548,78,60);g.fillStyle='#ffd06f';for(let i=0;i<3;i++)g.fillRect(612+i*19,565,8,9)}
    if(level>=8){tower(690,610,.78);line(690,520,690,455,'rgba(94,244,225,.45)',2);glow(690,468,34,.08)}
    if(level>=9){factory(560,608,.72)}
    if(level>=10){road(536,230,780);for(let x=270;x<760;x+=72)lamp(x,536,.7)}
    if(level>=11){glow(525,565,100,.07,'74,246,228');glow(705,560,86,.065,'111,102,255')}
  }
  function surface(level,t){
    // Hide the advanced baked-in right side at early tiers, then replace it with stage-specific construction.
    if(level===1){
      maskRect(310,86,510,290,'#08161a','#07120f');
      foundation(392,351,125);
      g.fillStyle='#765039';g.fillRect(555,333,52,12);
      for(let i=0;i<5;i++)g.fillRect(565+i*9,316-i%2*5,6,17+i%2*5);
      lamp(330,355,.55);
    }else if(level===2){
      maskRect(455,92,365,280,'#08161a','#07120f');
      house(515,355,.92,true);foundation(610,351,110);lamp(450,355,.7);
    }else if(level===3){
      maskRect(650,96,170,276,'#08161a','#07120f');
      house(500,355,.72,true);house(575,355,.66,true);house(642,355,.58,true);market(552,355,.72);
      lamp(462,355);lamp(615,355);
    }else if(level===4){
      house(442,355,.58,true);house(502,355,.55,true);house(562,355,.52,true);house(620,355,.5,true);house(676,355,.48,true);
      market(535,355,.82);road(365,365,790);for(let x=400;x<760;x+=76)lamp(x,363,.9);
    }else if(level===5){
      wall(382,315,390,48);tower(400,316,.78);tower(755,316,.78);road(368,365,790);house(485,360,.48);house(555,360,.5);house(625,360,.48);
    }else if(level===6){
      wall(360,315,420,48);tower(382,316,.82);tower(758,316,.82);keep(570,362,.72);road(368,366,795);for(let x=430;x<750;x+=85)lamp(x,365,1);
    }else if(level===7){
      for(let i=0;i<7;i++){
        const x=360+i*60,h=38+(i%3)*18;
        g.fillStyle=i%2?'#17322e':'#1d2928';g.strokeStyle='#76533d';g.lineWidth=2;
        g.fillRect(x,362-h,44,h);g.strokeRect(x,362-h,44,h);
        g.fillStyle='#ffd16e';for(let yy=362-h+10;yy<350;yy+=14){g.fillRect(x+9,yy,5,5);g.fillRect(x+26,yy,5,5)}
      }
      keep(595,362,.82);road(366,365,800);for(let x=380;x<790;x+=55)lamp(x,365,1);
    }else if(level===8){
      wall(335,316,460,50);tower(360,318,.9);tower(770,318,.9);keep(525,362,.78);tower(650,362,1.35);
      line(650,232,650,166,'rgba(80,245,223,.65)',3);glow(650,170,50,.11);road(367,365,800);
    }else if(level===9){
      keep(500,362,.78);factory(645,360,.9);factory(735,360,.72);tower(370,360,.86);road(366,365,805);
      g.strokeStyle='#a96d42';g.lineWidth=5;line(320,278,805,278,'#a96d42',5);for(let x=350;x<800;x+=90)line(x,278,x,365,'rgba(151,102,65,.72)',3);
    }else if(level===10){
      keep(470,362,.82);tower(625,362,1.18);tower(730,362,1.0);bridge(330,258,465);road(365,365,805);
      for(let x=350;x<800;x+=48)lamp(x,258,.8);
      g.save();g.globalAlpha=.35;g.fillStyle='#1b3530';for(let i=0;i<8;i++){const x=350+i*58,h=35+(i%4)*16;g.fillRect(x,362-h,38,h)}g.restore();
    }else{
      // Level 11 deliberately looks like a different world, not the same mine with more props.
      g.save();g.globalAlpha=.72;
      const sky=g.createLinearGradient(0,70,0,360);sky.addColorStop(0,'rgba(11,30,42,.2)');sky.addColorStop(1,'rgba(4,17,17,.78)');
      g.fillStyle=sky;g.fillRect(292,70,528,300);g.restore();
      for(let i=0;i<9;i++){
        const x=310+i*58,h=64+(i%4)*30;
        g.fillStyle=i%2?'#183730':'#1d2b2d';g.strokeStyle='rgba(105,236,216,.28)';g.lineWidth=2;
        g.fillRect(x,363-h,44,h);g.strokeRect(x,363-h,44,h);
        g.fillStyle='#ffd373';for(let yy=363-h+12;yy<350;yy+=14){g.fillRect(x+8,yy,5,5);g.fillRect(x+26,yy,5,5)}
      }
      spire(615,362,1.08);bridge(300,245,500);road(365,365,810);for(let x=320;x<805;x+=42)lamp(x,245,.75);
      g.save();g.globalCompositeOperation='screen';g.globalAlpha=.7;
      const a=g.createLinearGradient(250,90,820,240);a.addColorStop(0,'rgba(54,239,207,0)');a.addColorStop(.38,'rgba(54,239,207,.12)');a.addColorStop(.68,'rgba(107,99,255,.13)');a.addColorStop(1,'rgba(54,239,207,0)');
      g.fillStyle=a;g.beginPath();g.moveTo(250,160);g.quadraticCurveTo(440,78,570,166);g.quadraticCurveTo(690,84,820,145);g.lineTo(820,220);g.quadraticCurveTo(690,170,560,225);g.quadraticCurveTo(420,142,250,230);g.closePath();g.fill();g.restore();
    }

    if(level>=4){
      g.save();g.globalAlpha=.035+.012*Math.sin(t*.75);g.fillStyle='#c8fff8';g.fillRect(300,367,520,28);g.restore();
    }
  }

  function badge(level){
    g.save();
    g.fillStyle='rgba(1,10,10,.72)';g.strokeStyle='rgba(90,244,220,.32)';g.lineWidth=1.5;
    g.beginPath();g.roundRect(650,24,145,34,10);g.fill();g.stroke();
    g.fillStyle='#8cf8e7';g.font='700 11px system-ui';g.textAlign='center';
    g.fillText('WORLD '+String(level).padStart(2,'0')+' · '+N[level-1],722,45);
    g.restore();
  }

  function frame(ms){
    if(!document.body.contains(c))return;
    const level=currentLevel(), t=ms/1000;
    g.clearRect(0,0,820,680);
    surface(level,t);underground(level);badge(level);

    if(level!==lastLevel){
      lastLevel=level;flash=1;syncUi(level);
      h.dataset.previewLevel=String(level);h.dataset.previewName=N[level-1];
      window.dispatchEvent(new CustomEvent('dna-level-world-render',{detail:{version:V,level,name:N[level-1]}}));
    }else if(window.DNA_PREVIEW_LEVEL) syncUi(level);

    if(flash>0.01){
      g.save();g.globalCompositeOperation='screen';g.globalAlpha=flash*.13;g.fillStyle='#86ffe9';g.fillRect(0,0,820,680);g.restore();flash*=.90;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
window.addEventListener('dna-preview-level',e=>{
  if(!e.detail?.level){syncUi(currentLevel())}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
window.addEventListener('dna-game-remount',()=>setTimeout(mount,100));
})();