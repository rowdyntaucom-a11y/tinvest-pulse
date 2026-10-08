import{useEffect,useState}from"react";import{coreScrollStorageKey,shouldShowCoreScrollTop}from"./coreNavigationMemoryModel";

const ACTIVE_KEY="qvanix-core-active-section-v212";
const VALID_SECTIONS=new Set(["Обзор","Портфель","Доходность","Выплаты","Аналитика"]);

export function readCoreScrollPosition(label:string){
 try{const raw=sessionStorage.getItem(coreScrollStorageKey(label)),value=raw==null?null:Number(raw);return value!=null&&Number.isFinite(value)&&value>=0?value:null}catch{return null}
}
export function writeCoreScrollPosition(label:string,value:number){
 if(!label||!Number.isFinite(value)||value<0)return;
 try{sessionStorage.setItem(coreScrollStorageKey(label),String(Math.round(value)))}catch{}
}
export function readCoreActiveSection(){
 try{const value=sessionStorage.getItem(ACTIVE_KEY);return value&&VALID_SECTIONS.has(value)?value:"Обзор"}catch{return"Обзор"}
}
export function writeCoreActiveSection(label:string){
 if(!VALID_SECTIONS.has(label))return;
 try{sessionStorage.setItem(ACTIVE_KEY,label)}catch{}
}
function navLabel(button:Element|null){return button?.querySelector("span")?.textContent?.trim()??""}
function activeNavLabel(){return navLabel(document.querySelector(".sb-nav button.active"))||"Обзор"}
function navButtonFor(label:string){return Array.from(document.querySelectorAll<HTMLButtonElement>(".sb-nav button")).find(button=>navLabel(button)===label)??null}
function reduceMotion(){return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false}
function restore(label:string){const y=readCoreScrollPosition(label)??0;window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>window.scrollTo({top:y,behavior:"auto"})))}

export function CoreNavigationMemory(){
 const[showTop,setShowTop]=useState(false);
 useEffect(()=>{
  let frame=0,restoring=false;
  const coarse=window.matchMedia?.("(pointer: coarse)")?.matches??false;
  const syncNow=()=>setShowTop(shouldShowCoreScrollTop(window.scrollY,document.documentElement.classList.contains("qv-input-active"),coarse));
  const sync=()=>{if(frame)return;frame=window.requestAnimationFrame(()=>{frame=0;syncNow()})};
  const rememberCurrent=()=>{const current=activeNavLabel();writeCoreActiveSection(current);writeCoreScrollPosition(current,window.scrollY)};
  const onClick=(event:MouseEvent)=>{
   const target=event.target instanceof Element?event.target:null;
   const navButton=target?.closest(".sb-nav button")??null;
   const brandButton=target?.closest(".sb-top>button:first-child")??null;
   if(!navButton&&!brandButton)return;
   const current=activeNavLabel(),next=brandButton?"Обзор":navLabel(navButton);
   if(!next||next===current)return;
   writeCoreScrollPosition(current,window.scrollY);
   writeCoreActiveSection(next);
   restore(next);
  };
  const onPageHide=()=>rememberCurrent();
  const onVisibility=()=>{if(document.visibilityState==="hidden")rememberCurrent()};
  window.addEventListener("scroll",sync,{passive:true});
  window.addEventListener("pagehide",onPageHide);
  document.addEventListener("visibilitychange",onVisibility);
  document.addEventListener("click",onClick,true);
  document.addEventListener("focusin",sync,true);
  document.addEventListener("focusout",sync,true);
  syncNow();
  const wanted=readCoreActiveSection();
  if(wanted!=="Обзор"){
   window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>{
    if(restoring)return;const button=navButtonFor(wanted);if(!button)return;
    restoring=true;button.click();restore(wanted);restoring=false;
   }));
  }
  return()=>{rememberCurrent();if(frame)window.cancelAnimationFrame(frame);window.removeEventListener("scroll",sync);window.removeEventListener("pagehide",onPageHide);document.removeEventListener("visibilitychange",onVisibility);document.removeEventListener("click",onClick,true);document.removeEventListener("focusin",sync,true);document.removeEventListener("focusout",sync,true)};
 },[]);
 const toTop=()=>window.scrollTo({top:0,behavior:reduceMotion()?"auto":"smooth"});
 return showTop?<button type="button" className="sb-scroll-top-v91" aria-label="К началу раздела" title="К началу раздела" onClick={toTop}><span aria-hidden="true">↑</span><small>НАВЕРХ</small></button>:null;
}
