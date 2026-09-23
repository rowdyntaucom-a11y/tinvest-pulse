export const WORLD_VIEW_WIDTH=1600
export const WORLD_VIEW_HEIGHT=900

export type WorldFocusPoint={x:number;y:number}
export type WorldCameraFrame={
  width:number
  height:number
  scale:number
  x:number
  y:number
  immersivePortrait:boolean
}
export type WorldScreenPoint={x:number;y:number}
export type ClampedWorldScreenPoint=WorldScreenPoint&{
  edge:boolean
  edgeX:'left'|'right'|null
  edgeY:'top'|'bottom'|null
}

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value))

/** Canonical DNA camera geometry shared by Pixi and the DOM exploration layer.
 * Portrait uses a cover crop around the inhabited band; landscape/tablet keeps the whole world visible.
 * An optional focus only pans portrait framing and is always clamped so the canvas cannot expose blank space. */
export function resolveWorldCameraFrame(width:number,height:number,focus?:WorldFocusPoint|null):WorldCameraFrame{
  const w=Math.max(1,width)
  const h=Math.max(1,height)
  const immersivePortrait=h>w*1.15
  const baseScale=immersivePortrait
    ?Math.max(w/WORLD_VIEW_WIDTH,h/WORLD_VIEW_HEIGHT)
    :Math.min(w/WORLD_VIEW_WIDTH,h/WORLD_VIEW_HEIGHT)
  // Phone portrait prioritises the inhabited band rather than the geometric centre.
  // The smaller push-in keeps workshop + wanderer + mine readable together before interaction.
  const scale=immersivePortrait?baseScale*1.035:baseScale
  const focusX=immersivePortrait?(focus?.x??865):WORLD_VIEW_WIDTH/2
  const focusY=immersivePortrait?(focus?.y??565):WORLD_VIEW_HEIGHT/2
  const scaledWidth=WORLD_VIEW_WIDTH*scale
  const scaledHeight=WORLD_VIEW_HEIGHT*scale
  const desiredX=w/2-focusX*scale
  const desiredY=h/2-focusY*scale
  const x=scaledWidth>=w?clamp(desiredX,w-scaledWidth,0):(w-scaledWidth)/2
  const y=scaledHeight>=h?clamp(desiredY,h-scaledHeight,0):(h-scaledHeight)/2
  return{width:w,height:h,scale,x,y,immersivePortrait}
}

export function projectWorldPointToScreen(point:WorldFocusPoint,frame:WorldCameraFrame):WorldScreenPoint{
  return{x:frame.x+point.x*frame.scale,y:frame.y+point.y*frame.scale}
}

/** Keeps an off-camera landmark discoverable at the nearest safe edge without pretending
 * that the point itself is on-screen. data-world-landmark-edge exposes that distinction to UI/tests. */
export function clampWorldMarkerToViewport(point:WorldScreenPoint,width:number,height:number,margin=24):ClampedWorldScreenPoint{
  const w=Math.max(margin*2,width)
  const h=Math.max(margin*2,height)
  const x=clamp(point.x,margin,w-margin)
  const y=clamp(point.y,margin,h-margin)
  return{
    x,y,
    edge:x!==point.x||y!==point.y,
    edgeX:point.x<margin?'left':point.x>w-margin?'right':null,
    edgeY:point.y<margin?'top':point.y>h-margin?'bottom':null,
  }
}
