import{useEffect,useState}from"react";

const STORAGE_PREFIX="qvanix-core-scroll-v91:";
export const CORE_SCROLL_TOP_THRESHOLD=720;

export function coreScrollStorageKey(label:string){return STORAGE_PREFIX+label.trim().toLowerCase()}
export function shouldShowCoreScrollTop(scrollY:number,inputActive:boolean){return scrollY>=CORE_SCROLL_TOP_THRESHOLD&&!inputActive}
export function readCoreScrollPosition(label:string){
 try{const raw=sessionStorage.getItem(coreScrollStorageKey(label)),value=raw==null?null:Number(raw);return value!=null&&Number.isFinite(value)&&value>=0?value:null}catch{return null}
}
export function writeCoreScrollPosition(label:string,value:number){
 if(!label||!Number.isFinite(value)||value<0)return;
 try{sessionStorage.setItem(coreScrollStorageKey(label),String(Math.round(value)))}catch{}
}
function navLabel(button:Element|null){return button?.querySelector("span")?.textContent?.trim()??""}
function activeNavLabel(){return navLabel(document.querySelector(".sb-nav button.active"))||"Обзор"}
function reduceMotion(){return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false}
function restore(label:string){const y=readCoreScrollPosition(label)??0;window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>window.scrollTo({top:y,behavior:"auto"})))}

export function CoreNavigationMemory(){
 const[showTop,setShowTop]=useState(false);
 useEffect(()=>{
  const sync=()=>setShowTop(shouldShowCoreScrollTop(window.scrollY,document.documentElement.classList.contains("qv-input-active")));
  const onClick=(event:MouseEvent)=>{
   const target=event.target instanceof Element?event.target:null;
   const navButton=target?.closest(".sb-nav button");
   const brandButton=target?.closest(".sb-top>button:first-child");
   if(!navButton&&!brandButton)return;
   const current=activeNavLabel(),next=brandButton?"Обзор":navLabel(navButton);
   if(!next||next===current)return;
   writeCoreScrollPosition(current,window.scrollY);
   restore(next);
  };
  window.addEventListener("scroll",sync,{passive:true});
  document.addEventListener("click",onClick,true);
  document.addEventListener("focusin",sync,true);
  document.addEventListener("focusout",sync,true);
  sync();
  return()=>{window.removeEventListener("scroll",sync);document.removeEventListener("click",onClick,true);document.removeEventListener("focusin",sync,true);document.removeEventListener("focusout",sync,true)};
 },[]);
 const toTop=()=>window.scrollTo({top:0,behavior:reduceMotion()?"auto":"smooth"});
 return showTop?<button type="button" className="sb-scroll-top-v91" aria-label="К началу раздела" title="К началу раздела" onClick={toTop}><span aria-hidden="true">↑</span><small>НАВЕРХ</small></button>:null;
}
