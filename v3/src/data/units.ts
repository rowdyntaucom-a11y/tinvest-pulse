export function ratioToPercent(value:number|null|undefined){
  return typeof value==="number"&&Number.isFinite(value)?value*100:null;
}

export function clampPercent(value:number|null|undefined){
  return value==null?0:Math.max(0,Math.min(100,value));
}
