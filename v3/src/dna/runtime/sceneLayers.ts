import type{Container}from"pixi.js";
export const DNA_WORLD_LAYER_ORDER=["background","atmosphere","terrain","structures","actors","logistics","effects"]as const;
export type DnaWorldLayer=(typeof DNA_WORLD_LAYER_ORDER)[number];
export type DnaWorldLayerMap=Map<DnaWorldLayer,Container>;
/** Creates the one canonical z-ordered scene graph below WorldRoot. Layers own visuals only; financial UI is forbidden here. */
export function createDnaWorldLayers(ContainerCtor:typeof Container,root:Container):DnaWorldLayerMap{const layers=new Map<DnaWorldLayer,Container>();for(const name of DNA_WORLD_LAYER_ORDER){const layer=new ContainerCtor();layer.label=`world:${name}`;layers.set(name,layer);root.addChild(layer)}return layers}
export function requireDnaWorldLayer(layers:DnaWorldLayerMap,name:DnaWorldLayer){const layer=layers.get(name);if(!layer)throw new Error(`Missing Living World scene layer: ${name}`);return layer}
