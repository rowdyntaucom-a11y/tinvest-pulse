export const DNA_WORLD_PERF_BUDGET={version:"0.1",mobile:{maxDevicePixelRatio:1.35,targetFps:30,maxAmbientActors:14,maxParticles:60,maxEventCaravans:3},desktop:{maxDevicePixelRatio:1.75,targetFps:60}} as const;
export type DnaWorldPerfBudget=typeof DNA_WORLD_PERF_BUDGET;
/** Renderer limits are product contracts, not measured performance claims. Real-device validation remains required before raising them. */
export function clampWorldResolution(devicePixelRatio:number,mobile:boolean){const cap=mobile?DNA_WORLD_PERF_BUDGET.mobile.maxDevicePixelRatio:DNA_WORLD_PERF_BUDGET.desktop.maxDevicePixelRatio;return Math.max(1,Math.min(Number.isFinite(devicePixelRatio)?devicePixelRatio:1,cap))}
