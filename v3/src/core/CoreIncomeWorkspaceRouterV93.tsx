import{useEffect,useState}from"react";
import{createPortal}from"react-dom";
import{CORE_INCOME_WORKSPACE_MODES,coreIncomeScrollStorageKey,normalizeCoreIncomeScroll,normalizeCoreIncomeWorkspaceMode,type CoreIncomeWorkspaceMode}from"./coreIncomeWorkspaceV93";

const STORAGE_KEY="qvanix-core-income-workspace-v93";

function readMode():CoreIncomeWorkspaceMode{
 try{return normalizeCoreIncomeWorkspaceMode(sessionStorage.getItem(STORAGE_KEY))}catch{return"summary"}
}
function writeMode(mode:CoreIncomeWorkspaceMode){try{sessionStorage.setItem(STORAGE_KEY,mode)}catch{}}
function readScroll(mode:CoreIncomeWorkspaceMode){try{return normalizeCoreIncomeScroll(sessionStorage.getItem(coreIncomeScrollStorageKey(mode)))}catch{return 0}}
function writeScroll(mode:CoreIncomeWorkspaceMode,value:number){try{sessionStorage.setItem(coreIncomeScrollStorageKey(mode),String(normalizeCoreIncomeScroll(value)))}catch{}}
function findFullCalendar(){
 return Array.from(document.querySelectorAll<HTMLElement>(".qpay")).find(node=>!node.classList.contains("qpay-compact")&&Boolean(node.querySelector(".qpay-ledger")))??null;
}

export function CoreIncomeWorkspaceRouterV93(){
 const[mode,setMode]=useState<CoreIncomeWorkspaceMode>(readMode),[root,setRoot]=useState<HTMLElement|null>(null),[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  let currentRoot:HTMLElement|null=null,currentHost:HTMLElement|null=null;
  const detach=()=>{if(currentRoot)delete currentRoot.dataset.incomeWorkspaceV93;if(currentHost?.isConnected)currentHost.remove();currentRoot=null;currentHost=null};
  const attach=()=>{
   const next=findFullCalendar();
   if(next===currentRoot)return;
   detach();
   if(!next){setRoot(null);setHost(null);return}
   const nextHost=document.createElement("div");
   nextHost.className="qpay-workspace-host-v93";
   const ledger=next.querySelector(".qpay-ledger");
   if(ledger)ledger.insertAdjacentElement("afterend",nextHost);else next.prepend(nextHost);
   currentRoot=next;currentHost=nextHost;setRoot(next);setHost(nextHost);
  };
  attach();
  const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});
  return()=>{observer.disconnect();detach()};
 },[]);
 useEffect(()=>{if(root)root.dataset.incomeWorkspaceV93=mode},[root,mode]);
 const select=(next:CoreIncomeWorkspaceMode)=>{if(next===mode)return;writeScroll(mode,window.scrollY);setMode(next);writeMode(next);window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>{const saved=readScroll(next);if(saved>0)window.scrollTo({top:saved,behavior:"auto"});else root?.scrollIntoView({block:"start",behavior:"auto"})}))};
 const onKeyDown=(event:React.KeyboardEvent<HTMLButtonElement>,index:number)=>{let next=index;if(event.key==="ArrowRight")next=Math.min(CORE_INCOME_WORKSPACE_MODES.length-1,index+1);else if(event.key==="ArrowLeft")next=Math.max(0,index-1);else if(event.key==="Home")next=0;else if(event.key==="End")next=CORE_INCOME_WORKSPACE_MODES.length-1;else return;event.preventDefault();select(CORE_INCOME_WORKSPACE_MODES[next][0]);window.requestAnimationFrame(()=>document.querySelectorAll<HTMLButtonElement>(".qpay-workspace-v93 button")[next]?.focus())};
 if(!host)return null;
 return createPortal(<nav className="qpay-workspace-v93" role="tablist" aria-label="Режим календаря выплат">{CORE_INCOME_WORKSPACE_MODES.map(([value,label,description],index)=><button type="button" role="tab" key={value} className={mode===value?"active":""} aria-selected={mode===value} aria-pressed={mode===value} onClick={()=>select(value)} onKeyDown={event=>onKeyDown(event,index)}><b>{label}</b><small>{description}</small></button>)}</nav>,host);
}
