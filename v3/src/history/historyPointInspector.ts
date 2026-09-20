import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";

export type V3HistoryInspection={index:number;point:HistoryPoint};
export function clampHistoryIndex(index:number,length:number){if(length<=0)return 0;return Math.max(0,Math.min(length-1,Math.round(index)))}
export function historyIndexFromRatio(ratio:number,length:number){if(length<=1)return 0;const safe=Math.max(0,Math.min(1,Number.isFinite(ratio)?ratio:0));return clampHistoryIndex(safe*(length-1),length)}
export function inspectHistoryPoint(points:HistoryPoint[],index:number):V3HistoryInspection|null{if(!points.length)return null;const safe=clampHistoryIndex(index,points.length);return{index:safe,point:points[safe]}}
