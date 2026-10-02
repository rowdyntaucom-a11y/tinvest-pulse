const STORAGE_PREFIX="qvanix-core-scroll-v91:";
export const CORE_SCROLL_TOP_THRESHOLD=720;
export function coreScrollStorageKey(label:string){return STORAGE_PREFIX+label.trim().toLowerCase()}
export function shouldShowCoreScrollTop(scrollY:number,inputActive:boolean){return scrollY>=CORE_SCROLL_TOP_THRESHOLD&&!inputActive}
