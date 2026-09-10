(()=>{'use strict';
const VERSION='14.8.2';
const slots={background:['sceneBase','sky','mountainsFar','mountainsNear','forest','settlement'],mine:['mineExterior','mineInterior','supports','railSurface','railUnderground'],buildings:['foundation','workshop','warehouse','crane','scaffold'],workers:['minerIdle','minerMine','haulerWalk','builderWork','operatorIdle'],logistics:['cartEmpty','cartLoaded','crate','timberStack','stoneStack'],resources:['crystalSmall','crystalLarge','orePile'],fx:['lampGlow','dust','spark','smoke','mist']};
const art=window.DNA_ART_PACK||{};
const manifest={version:VERSION,level:1,name:'FOUNDATION',base:'/assets/dna-world/l1/',assets:{sceneBase:art.sceneBase||'',minerIdle:'miner.svg',minerMine:'miner.svg',haulerWalk:'miner.svg',builderWork:'miner.svg',operatorIdle:'miner.svg',cartEmpty:'cart-loaded.svg',cartLoaded:'cart-loaded.svg',mineExterior:'mine-exterior.svg',mineInterior:'mine-exterior.svg',foundation:'construction.svg',scaffold:'construction.svg',workshop:'workshop.svg',warehouse:'warehouse.svg'}};
const cache=new Map(),errors=new Map(),objectUrls=new Map();
function urlFor(key){const rel=manifest.assets[key];if(!rel)return null;if(/^data:|^blob:|^https?:/i.test(rel))return rel;return manifest.base+rel}
function toSafeUrl(key,src){
 if(!/^data:image\//i.test(src)||!src.includes(';base64,'))return src;
 try{
  const comma=src.indexOf(','),head=src.slice(5,comma),mime=head.split(';')[0]||'image/webp',raw=atob(src.slice(comma+1)),bytes=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([bytes],{type:mime}));objectUrls.set(key,url);return url;
 }catch(e){errors.set(key,'blob:'+String(e&&e.message||e));return src}
}
function register(next){if(!next||typeof next!=='object')return manifest;Object.assign(manifest.assets,next);return manifest}
async function preload(keys){
 const list=(keys&&keys.length?keys:Object.values(slots).flat()).filter(Boolean);
 return Promise.all(list.map(key=>new Promise(resolve=>{
  const raw=urlFor(key);if(!raw)return resolve({key,status:'missing'});if(cache.has(key))return resolve({key,status:'ready'});
  const img=new Image();img.decoding='async';
  img.onload=()=>{cache.set(key,img);errors.delete(key);resolve({key,status:'ready',width:img.naturalWidth,height:img.naturalHeight})};
  img.onerror=()=>{errors.set(key,'decode');resolve({key,status:'error'})};
  img.src=toSafeUrl(key,raw);
 })));
}
function get(key){return cache.get(key)||null}
function draw(ctx,key,x,y,w,h,opts={}){const img=get(key);if(!img)return false;ctx.save();ctx.globalAlpha=opts.alpha==null?1:opts.alpha;if(opts.flipX){ctx.translate(x+w,y);ctx.scale(-1,1);ctx.drawImage(img,0,0,w,h)}else ctx.drawImage(img,x,y,w,h);ctx.restore();return true}
function status(){const keys=Object.values(slots).flat();return{version:VERSION,registered:Object.keys(manifest.assets).filter(k=>manifest.assets[k]).length,loaded:cache.size,totalSlots:keys.length,sceneReady:cache.has('sceneBase'),sceneSize:cache.has('sceneBase')?[cache.get('sceneBase').naturalWidth,cache.get('sceneBase').naturalHeight]:null,errors:Object.fromEntries(errors),missing:keys.filter(k=>!manifest.assets[k])}}
const ready=preload(Object.keys(manifest.assets)).then(result=>{window.dispatchEvent(new CustomEvent('dna-assets-ready',{detail:status()}));return result});
window.DNA_GAME_ASSETS={VERSION,slots,manifest,register,preload,get,draw,status,ready};
})();