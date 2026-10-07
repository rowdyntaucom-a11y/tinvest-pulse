import{useEffect,useMemo,useState}from"react";
import{createPortal}from"react-dom";
import{CORE_PORTFOLIO_MODE_STORAGE_KEY,CORE_PORTFOLIO_WORKSPACE_MODES,corePortfolioModeFromLabel,corePortfolioScrollStorageKey,normalizeCorePortfolioScroll,normalizeCorePortfolioWorkspaceMode,type CorePortfolioWorkspaceMode}from"./corePortfolioWorkspaceV102";

function readMode(){try{return normalizeCorePortfolioWorkspaceMode(sessionStorage.getItem(CORE_PORTFOLIO_MODE_STORAGE_KEY))}catch{return"assets" as CorePortfolioWorkspaceMode}}
function writeMode(mode:CorePortfolioWorkspaceMode){try{sessionStorage.setItem(CORE_PORTFOLIO_MODE_STORAGE_KEY,mode)}catch{}}
function readScroll(mode:CorePortfolioWorkspaceMode){try{return normalizeCorePortfolioScroll(sessionStorage.getItem(corePortfolioScrollStorageKey(mode)))}catch{return 0}}
function writeScroll(mode:CorePortfolioWorkspaceMode,value:number){try{sessionStorage.setItem(corePortfolioScrollStorageKey(mode),String(normalizeCorePortfolioScroll(value)))}catch{}}
function portfolioSwitch(){
 const title=[...document.querySelectorAll<HTMLElement>(".sb-title")].find(node=>node.querySelector("h1")?.textContent?.trim()==="Портфель");
 const main=title?.closest("main");
 if(!main)return null;
 return [...main.querySelectorAll<HTMLElement>(".sb-switch")].find(node=>[...node.querySelectorAll("button")].some(button=>corePortfolioModeFromLabel(button.textContent)))??null;
}
function modeButtons(source:HTMLElement){return [...source.querySelectorAll<HTMLButtonElement>("button")].map(button=>({button,mode:corePortfolioModeFromLabel(button.textContent)})).filter((row):row is{button:HTMLButtonElement;mode:CorePortfolioWorkspaceMode}=>row.mode!=null)}
function activeSourceMode(source:HTMLElement){return modeButtons(source).find(row=>row.button.classList.contains("active"))?.mode??null}

export function CorePortfolioWorkspaceRouterV102(){
 const[mode,setMode]=useState<CorePortfolioWorkspaceMode>(readMode),[source,setSource]=useState<HTMLElement|null>(null),[host,setHost]=useState<HTMLElement|null>(null),[available,setAvailable]=useState<CorePortfolioWorkspaceMode[]>(["assets","structure"]);
 useEffect(()=>{
  let currentSource:HTMLElement|null=null,currentHost:HTMLElement|null=null;const restored=new WeakSet<HTMLElement>();
  const detach=()=>{if(currentSource)delete currentSource.dataset.portfolioWorkspaceV102Source;if(currentHost?.isConnected)currentHost.remove();currentSource=null;currentHost=null};
  const attach=()=>{
   const next=portfolioSwitch();
   if(!next){detach();setSource(null);setHost(null);return}
   const rows=modeButtons(next),modes=rows.map(row=>row.mode);setAvailable(current=>current.join("|")===modes.join("|")?current:modes);
   if(next!==currentSource){detach();const nextHost=document.createElement("div");nextHost.className="sb-portfolio-workspace-host-v102";next.insertAdjacentElement("beforebegin",nextHost);next.dataset.portfolioWorkspaceV102Source="true";currentSource=next;currentHost=nextHost;setSource(next);setHost(nextHost)}
   const active=activeSourceMode(next);
   if(active&&active!==mode)setMode(active);
   if(!restored.has(next)){
    restored.add(next);const stored=readMode(),target=rows.find(row=>row.mode===stored);
    if(target&&!target.button.classList.contains("active")){target.button.click();setMode(stored)}else if(active)setMode(active);
   }
  };
  let frame=0;const queueAttach=()=>{if(frame)return;frame=window.requestAnimationFrame(()=>{frame=0;attach()})};
  attach();const observer=new MutationObserver(queueAttach);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
  return()=>{if(frame)window.cancelAnimationFrame(frame);observer.disconnect();detach()};
 },[]);
 useEffect(()=>{if(source){const active=activeSourceMode(source);if(active&&active!==mode)setMode(active)}},[source,mode]);
 const visibleModes=useMemo(()=>CORE_PORTFOLIO_WORKSPACE_MODES.filter(([value])=>available.includes(value)),[available]);
 const select=(next:CorePortfolioWorkspaceMode)=>{
  if(!source||next===mode)return;writeScroll(mode,window.scrollY);const target=modeButtons(source).find(row=>row.mode===next);if(!target)return;
  target.button.click();setMode(next);writeMode(next);window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>{const saved=readScroll(next);if(saved>0)window.scrollTo({top:saved,behavior:"auto"});else host?.scrollIntoView({block:"start",behavior:"auto"})}));
 };
 const onKeyDown=(event:React.KeyboardEvent<HTMLButtonElement>,index:number)=>{let next=index;if(event.key==="ArrowRight")next=Math.min(visibleModes.length-1,index+1);else if(event.key==="ArrowLeft")next=Math.max(0,index-1);else if(event.key==="Home")next=0;else if(event.key==="End")next=visibleModes.length-1;else return;event.preventDefault();select(visibleModes[next][0]);window.requestAnimationFrame(()=>document.querySelectorAll<HTMLButtonElement>(".sb-portfolio-workspace-v102 button")[next]?.focus())};
 if(!host)return null;
 return createPortal(<nav className="sb-portfolio-workspace-v102" aria-label="Раздел портфеля">{visibleModes.map(([value,label,description],index)=><button type="button" key={value} className={mode===value?"active":""} aria-pressed={mode===value} onClick={()=>select(value)} onKeyDown={event=>onKeyDown(event,index)}><b>{label}</b><small>{description}</small></button>)}</nav>,host);
}
