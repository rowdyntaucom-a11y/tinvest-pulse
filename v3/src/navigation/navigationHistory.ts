import{V3_NAV,type V3Workspace}from"../app/model";

export type V3NavigationLayer="workspace"|"asset"|"pulse";
export type V3NavigationState={workspace:V3Workspace;layer:V3NavigationLayer;assetTicker?:string};
const KEY="qvanixV3Navigation";
const isWorkspace=(value:unknown):value is V3Workspace=>typeof value==="string"&&V3_NAV.some(item=>item.id===value);
export function readNavigationState(value:unknown,fallback:V3Workspace):V3NavigationState{if(!value||typeof value!=="object")return{workspace:fallback,layer:"workspace"};const raw=(value as Record<string,unknown>)[KEY];if(!raw||typeof raw!=="object")return{workspace:fallback,layer:"workspace"};const state=raw as Record<string,unknown>,workspace=isWorkspace(state.workspace)?state.workspace:fallback,layer=state.layer==="asset"||state.layer==="pulse"?state.layer:"workspace",assetTicker=typeof state.assetTicker==="string"&&state.assetTicker.trim()?state.assetTicker.trim():undefined;if(layer==="asset"&&!assetTicker)return{workspace,layer:"workspace"};return assetTicker?{workspace,layer,assetTicker}:{workspace,layer};}
export function navigationEntry(state:V3NavigationState){return{[KEY]:state};}
export function navigationUrl(state:V3NavigationState,location:Pick<Location,"pathname"|"search"|"hash">=window.location){const url=new URL(location.pathname+location.search,window.location.origin);url.searchParams.set("view",state.workspace);if(state.layer==="asset"&&state.assetTicker)url.searchParams.set("asset",state.assetTicker);else url.searchParams.delete("asset");if(state.layer==="pulse")url.searchParams.set("overlay","pulse");else url.searchParams.delete("overlay");url.hash=location.hash;return `${url.pathname}${url.search}${url.hash}`;}
export function workspaceFromLocation(search:string,fallback:V3Workspace){const params=new URLSearchParams(search),candidate=params.get("view");return isWorkspace(candidate)?candidate:fallback;}
