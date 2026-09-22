export const WANDERER_PRESENCE_VERSION='v1' as const

export type WandererMotion={x:number;y:number;rotation:number;lanternAlpha:number}

/** Presentation-only motion for the canonical Living World hero. No timers/runtime ownership live here. */
export function resolveWandererMotion(nowMs:number,reducedMotion:boolean):WandererMotion{
 if(reducedMotion)return{x:870,y:676,rotation:0,lanternAlpha:.88}
 return{
  x:870+Math.sin(nowMs/6200)*5,
  y:676+Math.sin(nowMs/780)*2.2,
  rotation:Math.sin(nowMs/2100)*.008,
  lanternAlpha:.78+Math.sin(nowMs/430)*.16,
 }
}

export type WandererPalette={skin:number;hat:number;cloak:number;cloakLight:number;cloakDark:number;leather:number;steel:number;lantern:number;lanternCore:number}
export const WANDERER_PALETTE:WandererPalette={skin:0xcda77d,hat:0x17231f,cloak:0x253832,cloakLight:0x3b5147,cloakDark:0x1b2a25,leather:0x9b7049,steel:0xd7ddd7,lantern:0xc88b4d,lanternCore:0xffd58b}

/** Stable authored geometry contract consumed by the Pixi stage; kept data-only for cheap regression tests. */
export const WANDERER_SILHOUETTE={
 anchor:{x:870,y:676},
 hat:[-22,-57,0,-70,24,-57,15,-53,-15,-53],
 cloak:[-14,-48,13,-48,22,-8,9,5,-10,5,-24,-8],
 leftSleeve:[-15,-46,-4,-37,-11,-5,-24,-8],
 rightSleeve:[13,-46,4,-37,9,-5,22,-8],
 sword:{from:[15,-43] as const,to:[33,2] as const,tip:[41,-12] as const},
 lantern:{x:-31,y:-2},
} as const
