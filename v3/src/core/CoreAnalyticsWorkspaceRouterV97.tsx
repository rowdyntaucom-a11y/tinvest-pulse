import{useEffect,useState}from"react";
import{createPortal}from"react-dom";
import{CORE_ANALYTICS_WORKSPACE_MODES,normalizeCoreAnalyticsWorkspaceMode,type CoreAnalyticsWorkspaceMode}from"./coreAnalyticsWorkspaceV97";

const STORAGE_KEY="qvanix-core-analytics-workspace-v97";
function readMode():CoreAnalyticsWorkspaceMode{try{return normalizeCoreAnalyticsWorkspaceMode(sessionStorage.getItem(STORAGE_KEY))}catch{return"summary"}}
function writeMode(mode:CoreAnalyticsWorkspaceMode){try{sessionStorage.setItem(STORAGE_KEY,mode)}catch{}}
function findAnalyticsRoot(){return document.querySelector<HTMLElement>(".core-analytics-depth")}

export function CoreAnalyticsWorkspaceRouterV97(){
 const[mode,setMode]=useState<CoreAnalyticsWorkspaceMode>(readMode),[root,setRoot]=useState<HTMLElement|null>(null),[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  let currentRoot:HTMLElement|null=null,currentHost:HTMLElement|null=null;
  const detach=()=>{if(currentRoot)delete currentRoot.dataset.analyticsWorkspaceV97;if(currentHost?.isConnected)currentHost.remove();currentRoot=null;currentHost=null};
  const attach=()=>{
   const next=findAnalyticsRoot();
   if(next===currentRoot)return;
   detach();
   if(!next){setRoot(null);setHost(null);return}
   const nextHost=document.createElement("div");nextHost.className="core-analytics-workspace-host-v97";
   const head=next.querySelector(".core-analytics-depth__head");
   if(head)head.insertAdjacentElement("afterend",nextHost);else next.prepend(nextHost);
   currentRoot=next;currentHost=nextHost;setRoot(next);setHost(nextHost);
  };
  attach();
  const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});
  return()=>{observer.disconnect();detach()};
 },[]);
 useEffect(()=>{if(root)root.dataset.analyticsWorkspaceV97=mode},[root,mode]);
 const select=(next:CoreAnalyticsWorkspaceMode)=>{setMode(next);writeMode(next);window.requestAnimationFrame(()=>host?.scrollIntoView({block:"start",behavior:"auto"}))};
 if(!host)return null;
 return createPortal(<nav className="core-analytics-workspace-v97" aria-label="Режим профессиональной аналитики">{CORE_ANALYTICS_WORKSPACE_MODES.map(([value,label,description])=><button type="button" key={value} className={mode===value?"active":""} aria-pressed={mode===value} onClick={()=>select(value)}><b>{label}</b><small>{description}</small></button>)}</nav>,host);
}
