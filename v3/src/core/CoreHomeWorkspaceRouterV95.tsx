import{useEffect,useState}from"react";
import{createPortal}from"react-dom";
import{CORE_HOME_WORKSPACE_MODES,normalizeCoreHomeWorkspaceMode,type CoreHomeWorkspaceMode}from"./coreHomeWorkspaceV95";

const STORAGE_KEY="qvanix-core-home-workspace-v95";
function readMode():CoreHomeWorkspaceMode{try{return normalizeCoreHomeWorkspaceMode(sessionStorage.getItem(STORAGE_KEY))}catch{return"summary"}}
function writeMode(mode:CoreHomeWorkspaceMode){try{sessionStorage.setItem(STORAGE_KEY,mode)}catch{}}
function findHomeRoot(){const balance=document.querySelector<HTMLElement>(".sb main>.sb-balance");return balance?.parentElement instanceof HTMLElement?balance.parentElement:null}

export function CoreHomeWorkspaceRouterV95(){
 const[mode,setMode]=useState<CoreHomeWorkspaceMode>(readMode),[root,setRoot]=useState<HTMLElement|null>(null),[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  let currentRoot:HTMLElement|null=null,currentHost:HTMLElement|null=null;
  const detach=()=>{if(currentRoot)delete currentRoot.dataset.homeWorkspaceV95;if(currentHost?.isConnected)currentHost.remove();currentRoot=null;currentHost=null};
  const attach=()=>{
   const next=findHomeRoot();if(next===currentRoot)return;detach();
   if(!next){setRoot(null);setHost(null);return}
   const balance=next.querySelector<HTMLElement>(":scope>.sb-balance");if(!balance)return;
   const nextHost=document.createElement("div");nextHost.className="sb-home-workspace-host-v95";balance.insertAdjacentElement("afterend",nextHost);
   currentRoot=next;currentHost=nextHost;setRoot(next);setHost(nextHost);
  };
  attach();const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});
  return()=>{observer.disconnect();detach()};
 },[]);
 useEffect(()=>{if(root)root.dataset.homeWorkspaceV95=mode},[root,mode]);
 const select=(next:CoreHomeWorkspaceMode)=>{setMode(next);writeMode(next);window.requestAnimationFrame(()=>host?.scrollIntoView({block:"start",behavior:"auto"}))};
 if(!host)return null;
 return createPortal(<nav className="sb-home-workspace-v95" aria-label="Режим главного экрана">{CORE_HOME_WORKSPACE_MODES.map(([value,label,description])=><button type="button" key={value} className={mode===value?"active":""} aria-pressed={mode===value} onClick={()=>select(value)}><b>{label}</b><small>{description}</small></button>)}</nav>,host);
}
