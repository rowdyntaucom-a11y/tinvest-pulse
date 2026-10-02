import{useEffect,useState}from"react";
import{createPortal}from"react-dom";
import{CORE_ASSET_WORKSPACE_MODES,normalizeCoreAssetWorkspaceMode,type CoreAssetWorkspaceMode}from"./coreAssetWorkspaceV96";

const STORAGE_KEY="qvanix-core-asset-workspace-v96";

function readMode():CoreAssetWorkspaceMode{
 try{return normalizeCoreAssetWorkspaceMode(sessionStorage.getItem(STORAGE_KEY))}catch{return"summary"}
}
function writeMode(mode:CoreAssetWorkspaceMode){try{sessionStorage.setItem(STORAGE_KEY,mode)}catch{}}
function findAssetRoot(){return document.querySelector<HTMLElement>(".sb-asset-detail")}
function markDetailSections(root:HTMLElement){
 for(const node of root.querySelectorAll<HTMLElement>(":scope > .sb-detail-section")){
  if(node.classList.contains("sb-asset-math")){node.dataset.assetDetailV96="math";continue}
  if(node.classList.contains("sb-asset-context")){node.dataset.assetDetailV96="context";continue}
  if(node.classList.contains("sb-asset-history")){node.dataset.assetDetailV96="history";continue}
  const title=node.querySelector("h2")?.textContent?.trim().toLowerCase()??"";
  if(title.includes("параметры облигации"))node.dataset.assetDetailV96="instrument";
 }
}

export function CoreAssetWorkspaceRouterV96(){
 const[mode,setMode]=useState<CoreAssetWorkspaceMode>(readMode),[root,setRoot]=useState<HTMLElement|null>(null),[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  let currentRoot:HTMLElement|null=null,currentHost:HTMLElement|null=null;
  const detach=()=>{if(currentRoot)delete currentRoot.dataset.assetWorkspaceV96;if(currentHost?.isConnected)currentHost.remove();currentRoot=null;currentHost=null};
  const attach=()=>{
   const next=findAssetRoot();
   if(next===currentRoot){if(next)markDetailSections(next);return}
   detach();
   if(!next){setRoot(null);setHost(null);return}
   markDetailSections(next);
   const nextHost=document.createElement("div");nextHost.className="sb-asset-workspace-host-v96";
   const hero=next.querySelector(".sb-asset-hero");
   if(hero)hero.insertAdjacentElement("afterend",nextHost);else next.prepend(nextHost);
   currentRoot=next;currentHost=nextHost;setRoot(next);setHost(nextHost);
  };
  attach();
  const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  return()=>{observer.disconnect();detach()};
 },[]);
 useEffect(()=>{if(root)root.dataset.assetWorkspaceV96=mode},[root,mode]);
 const select=(next:CoreAssetWorkspaceMode)=>{setMode(next);writeMode(next);window.requestAnimationFrame(()=>root?.scrollIntoView({block:"start",behavior:"auto"}))};
 if(!host)return null;
 return createPortal(<nav className="sb-asset-workspace-v96" aria-label="Раздел карточки актива">{CORE_ASSET_WORKSPACE_MODES.map(([value,label,description])=><button type="button" key={value} className={mode===value?"active":""} aria-pressed={mode===value} onClick={()=>select(value)}><b>{label}</b><small>{description}</small></button>)}</nav>,host);
}
