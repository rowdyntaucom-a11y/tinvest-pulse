export type DnaWorldCameraMode='phone-portrait'|'phone-landscape'|'tablet-portrait'|'wide'
export type DnaWorldCameraFrame={mode:DnaWorldCameraMode;scale:number;focusX:number;focusY:number;offsetX:number;offsetY:number}

const finite=(value:number,fallback:number)=>Number.isFinite(value)&&value>0?value:fallback

/**
 * Deterministic camera framing for the canonical 1600x900 Living World.
 * This is presentation-only: it never changes world state, progression or renderer ownership.
 * Portrait phones intentionally crop peripheral sky/terrain so the authored settlement + wanderer
 * remain readable; landscape/wide layouts preserve more of the full world.
 */
export function resolveDnaWorldCamera(widthInput:number,heightInput:number,worldWidth=1600,worldHeight=900):DnaWorldCameraFrame{
  const width=finite(widthInput,1),height=finite(heightInput,1)
  const ww=finite(worldWidth,1600),wh=finite(worldHeight,900)
  const aspect=width/height
  const phone=Math.min(width,height)<600
  const portrait=height>width
  const mode:DnaWorldCameraMode=phone&&portrait?'phone-portrait':phone&&!portrait?'phone-landscape':portrait?'tablet-portrait':'wide'

  const contain=Math.min(width/ww,height/wh)
  const cover=Math.max(width/ww,height/wh)
  let scale=contain,focusX=ww/2,focusY=wh/2

  if(mode==='phone-portrait'){
    // Keep workshop, mine and wanderer as the first-screen visual answer.
    scale=cover*1.04
    focusX=842
    focusY=594
  }else if(mode==='tablet-portrait'){
    scale=Math.max(contain,cover*.78)
    focusX=830
    focusY=555
  }else if(mode==='phone-landscape'){
    scale=contain*1.03
    focusX=820
    focusY=510
  }

  return{mode,scale,focusX,focusY,offsetX:width/2-focusX*scale,offsetY:height/2-focusY*scale}
}
