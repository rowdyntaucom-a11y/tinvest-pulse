(()=>{'use strict';
const VERSION='14.8.0';
const slots={background:['sceneBase','sky','mountainsFar','mountainsNear','forest','settlement'],mine:['mineExterior','mineInterior','supports','railSurface','railUnderground'],buildings:['foundation','workshop','warehouse','crane','scaffold'],workers:['minerIdle','minerMine','haulerWalk','builderWork','operatorIdle'],logistics:['cartEmpty','cartLoaded','crate','timberStack','stoneStack'],resources:['crystalSmall','crystalLarge','orePile'],fx:['lampGlow','dust','spark','smoke','mist']};
const art=window.DNA_ART_PACK||{};
const manifest={version:VERSION,level:1,name:'FOUNDATION',base:'/assets/dna-world/l1/',assets:{sceneBase:art.sceneBase||'',minerIdle:'miner.svg',minerMine:'miner.svg',haulerWalk:'miner.svg',builderWork:'miner.svg',operatorIdle:'miner.svg',cartEmpty:'cart-loaded.svg',cartLoaded:'cart-loaded.svg'}};
const cache=new Map();
function urlFor(key){const rel=manifest.assets[key];if(!rel)return null;if(/^data:|^https?:/i.test(rel))return rel;return manifest.base+rel}
function register(next){if(!next||typeof next!=='object')return manifest;Object.assign(manifest.assets,next);return manifest}
async function preload(keys){const list=(keys&&keys.length?keys:Object.values(slots).flat()).filter(Boolean);return Promise.all(list.map(key=>new Promise(resolve=>{const src=urlFor(key);if(!src)return resolve({key,status:'missing'});if(cache.has(key))return resolve({key,status:'ready'});const img=new Image();img.decoding='async';img.onload=()=>{cache.set(key,img);resolve({key,status:'ready'})};img.onerror=()=>resolve({key,status:'error'});img.src=src;})))}
function get(key){return cache.get(key)||null}
function draw(ctx,key,x,y,w,h,opts={}){const img=get(key);if(!img)return false;ctx.save();ctx.globalAlpha=opts.alpha==null?1:opts.alpha;if(opts.flipX){ctx.translate(x+w,y);ctx.scale(-1,1);ctx.drawImage(img,0,0,w,h)}else ctx.drawImage(img,x,y,w,h);ctx.restore();return true}
function status(){const keys=Object.values(slots).flat();return{version:VERSION,registered:Object.keys(manifest.assets).filter(k=>manifest.assets[k]).length,loaded:cache.size,totalSlots:keys.length,sceneReady:cache.has('sceneBase'),missing:keys.filter(k=>!manifest.assets[k])}}
window.DNA_GAME_ASSETS={VERSION,slots,manifest,register,preload,get,draw,status};
preload(Object.keys(manifest.assets));
window.dispatchEvent(new CustomEvent('dna-assets-ready',{detail:status()}));
})();