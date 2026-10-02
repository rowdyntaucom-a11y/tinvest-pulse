import{Application,Container,Graphics,Sprite}from"pixi.js";import{clampWorldResolution}from"./perfBudget";
export const DNA_PIXI_CONSTRUCTORS={Container,Graphics,Sprite}as const;
/** One canonical Pixi Application root. Constructors are exported explicitly so TypeScript keeps them constructable after the runtime split. */
export async function createDnaWorldRoot(host:HTMLElement){const app=new Application();await app.init({resizeTo:host,antialias:true,autoDensity:true,resolution:clampWorldResolution(window.devicePixelRatio||1,window.innerWidth<900),background:"#071613",preference:"webgl",powerPreference:"high-performance"});return app}
