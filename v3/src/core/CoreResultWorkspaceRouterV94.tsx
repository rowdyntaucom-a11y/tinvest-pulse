import{useEffect,useState}from"react";
import{createPortal}from"react-dom";
import{CORE_RESULT_WORKSPACE_MODES,coreResultScrollStorageKey,normalizeCoreResultScroll,normalizeCoreResultWorkspaceMode,type CoreResultWorkspaceMode}from"./coreResultWorkspaceV94";

const STORAGE_KEY="qvanix-core-result-workspace-v94";
function readMode():CoreResultWorkspaceMode{try{return normalizeCoreResultWorkspaceMode(sessionStorage.getItem(STORAGE_KEY))}catch{return"summary"}}
function writeMode(mode:CoreResultWorkspaceMode){try{sessionStorage.setItem(STORAGE_KEY,mode)}catch{}}
function readScroll(mode:CoreResultWorkspaceMode){try{return normalizeCoreResultScroll(sessionStorage.getItem(coreResultScrollStorageKey(mode)))}catch{return 0}}
function writeScroll(mode:CoreResultWorkspaceMode,value:number){try{sessionStorage.setItem(coreResultScrollStorageKey(mode),String(normalizeCoreResultScroll(value)))}catch{}}
function findResultRoot(){
 const lead=document.querySelector<HTMLElement>(".sb-result-lead");
 return lead?.closest<HTMLElement>("main")??null;
}

export function CoreResultWorkspaceRouterV94(){
 const[mode,setMode]=useState<CoreResultWorkspaceMode>(readMode),[root,setRoot]=useState<HTMLElement|null>(null),[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  let currentRoot:HTMLElement|null=null,currentHost:HTMLElement|null=null;
  const detach=()=>{if(currentRoot)delete currentRoot.dataset.resultWorkspaceV94;if(currentHost?.isConnected)currentHost.remove();currentRoot=null;currentHost=null};
  const attach=()=>{
   const next=findResultRoot();
   if(next===currentRoot)return;
   detach();
   if(!next){setRoot(null);setHost(null);return}
   const lead=next.querySelector<HTMLElement>(".sb-result-lead");
   const nextHost=document.createElement("div");nextHost.className="sb-result-workspace-host-v94";
   lead?.insertAdjacentElement("beforebegin",nextHost);
   currentRoot=next;currentHost=nextHost;setRoot(next);setHost(nextHost);
  };
  let frame=0;const queueAttach=()=>{if(frame)return;frame=window.requestAnimationFrame(()=>{frame=0;attach()})};
  attach();
  const observer=new MutationObserver(queueAttach);observer.observe(document.body,{childList:true,subtree:true});
  return()=>{if(frame)window.cancelAnimationFrame(frame);observer.disconnect();detach()};
 },[]);
 useEffect(()=>{if(root)root.dataset.resultWorkspaceV94=mode},[root,mode]);
 const select=(next:CoreResultWorkspaceMode)=>{if(next===mode)return;writeScroll(mode,window.scrollY);setMode(next);writeMode(next);window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>{const saved=readScroll(next);if(saved>0)window.scrollTo({top:saved,behavior:"auto"});else host?.scrollIntoView({block:"start",behavior:"auto"})}))};
 const onKeyDown=(event:React.KeyboardEvent<HTMLButtonElement>,index:number)=>{let next=index;if(event.key==="ArrowRight")next=Math.min(CORE_RESULT_WORKSPACE_MODES.length-1,index+1);else if(event.key==="ArrowLeft")next=Math.max(0,index-1);else if(event.key==="Home")next=0;else if(event.key==="End")next=CORE_RESULT_WORKSPACE_MODES.length-1;else return;event.preventDefault();select(CORE_RESULT_WORKSPACE_MODES[next][0]);window.requestAnimationFrame(()=>document.querySelectorAll<HTMLButtonElement>(".sb-result-workspace-v94 button")[next]?.focus())};
 if(!host)return null;
 return createPortal(<nav className="sb-result-workspace-v94" role="tablist" aria-label="Режим экрана доходности">{CORE_RESULT_WORKSPACE_MODES.map(([value,label,description],index)=><button key={value} type="button" role="tab" className={mode===value?"active":""} aria-selected={mode===value} aria-pressed={mode===value} onClick={()=>select(value)} onKeyDown={event=>onKeyDown(event,index)}><b>{label}</b><small>{description}</small></button>)}</nav>,host);
}
