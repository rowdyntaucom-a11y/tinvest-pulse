import{useEffect,useState}from"react";
import{createPortal}from"react-dom";
import{CORE_RESULT_WORKSPACE_MODES,normalizeCoreResultWorkspaceMode,type CoreResultWorkspaceMode}from"./coreResultWorkspaceV94";

const STORAGE_KEY="qvanix-core-result-workspace-v94";
function readMode():CoreResultWorkspaceMode{try{return normalizeCoreResultWorkspaceMode(sessionStorage.getItem(STORAGE_KEY))}catch{return"summary"}}
function writeMode(mode:CoreResultWorkspaceMode){try{sessionStorage.setItem(STORAGE_KEY,mode)}catch{}}
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
  attach();
  const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});
  return()=>{observer.disconnect();detach()};
 },[]);
 useEffect(()=>{if(root)root.dataset.resultWorkspaceV94=mode},[root,mode]);
 const select=(next:CoreResultWorkspaceMode)=>{setMode(next);writeMode(next);window.requestAnimationFrame(()=>host?.scrollIntoView({block:"start",behavior:"auto"}))};
 if(!host)return null;
 return createPortal(<nav className="sb-result-workspace-v94" aria-label="Режим экрана доходности">{CORE_RESULT_WORKSPACE_MODES.map(([value,label,description])=><button key={value} type="button" className={mode===value?"active":""} aria-pressed={mode===value} onClick={()=>select(value)}><b>{label}</b><small>{description}</small></button>)}</nav>,host);
}
