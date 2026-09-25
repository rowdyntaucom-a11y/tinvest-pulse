export function NordScrollCue({targetId,label="НИЖЕ",placement="scene"}:{targetId:string;label?:string;placement?:"scene"|"inline"}){
 const go=()=>{
  const target=document.getElementById(targetId);
  if(!target)return;
  const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;
  target.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
 };
 return <button type="button" className={"nord-scroll-cue nord-scroll-cue--"+placement} onClick={go} aria-label={label}>
  <span>{label}</span><i aria-hidden="true">⌄</i><i aria-hidden="true">⌄</i>
 </button>;
}
