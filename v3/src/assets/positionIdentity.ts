import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

export type PositionIdentityRef={
  instrumentUid?:string|null;
  figi?:string|null;
};

const clean=(value:string|null|undefined)=>String(value??"").trim();

export function exactPositionIdentity(ref:PositionIdentityRef){
  const uid=clean(ref.instrumentUid),figi=clean(ref.figi);
  return uid?{kind:"instrumentUid" as const,value:uid}:figi?{kind:"figi" as const,value:figi}:null;
}

export function positionIdentityKey(position:PositionSnapshot){
  return clean(position.instrumentUid)||clean(position.figi)||null;
}

export function resolveExactPosition(positions:PositionSnapshot[],ref:PositionIdentityRef){
  const identity=exactPositionIdentity(ref);
  if(!identity)return null;
  const matches=positions.filter(position=>clean(position[identity.kind])===identity.value);
  return matches.length===1?matches[0]:null;
}

export function resolvePositionByKey(positions:PositionSnapshot[],key:string|null|undefined){
  const target=clean(key);
  if(!target)return null;
  const matches=positions.filter(position=>clean(position.instrumentUid)===target||clean(position.figi)===target);
  return matches.length===1?matches[0]:null;
}
