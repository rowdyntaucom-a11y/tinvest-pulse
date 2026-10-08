import{useEffect,useState}from"react";import{shouldShowCoreScrollTop}from"./coreNavigationMemoryModel";

function reduceMotion(){return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false}

/**
 * V221: SnowballCore is the single owner of active-workspace + scroll restoration.
 * This component deliberately owns only the floating "back to top" affordance.
 * Keeping a second click/sessionStorage restoration loop here caused competing
 * requestAnimationFrame scrollTo calls when market/screener DOM changed.
 */
export function CoreNavigationMemory(){
 const[showTop,setShowTop]=useState(false);
 useEffect(()=>{
  let frame=0;
  const coarse=window.matchMedia?.("(pointer: coarse)")?.matches??false;
  const syncNow=()=>setShowTop(shouldShowCoreScrollTop(window.scrollY,document.documentElement.classList.contains("qv-input-active"),coarse));
  const sync=()=>{if(frame)return;frame=window.requestAnimationFrame(()=>{frame=0;syncNow()})};
  window.addEventListener("scroll",sync,{passive:true});
  document.addEventListener("focusin",sync,true);
  document.addEventListener("focusout",sync,true);
  syncNow();
  return()=>{if(frame)window.cancelAnimationFrame(frame);window.removeEventListener("scroll",sync);document.removeEventListener("focusin",sync,true);document.removeEventListener("focusout",sync,true)};
 },[]);
 const toTop=()=>window.scrollTo({top:0,behavior:reduceMotion()?"auto":"smooth"});
 return showTop?<button type="button" className="sb-scroll-top-v91" aria-label="К началу раздела" title="К началу раздела" onClick={toTop}><span aria-hidden="true">↑</span><small>НАВЕРХ</small></button>:null;
}
