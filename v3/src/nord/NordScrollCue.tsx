import{useEffect,useState}from"react";

export function NordScrollCue({targetId,label="НИЖЕ"}:{targetId:string;label?:string}){
 const[visible,setVisible]=useState(true);
 useEffect(()=>{
  const update=()=>{
   const target=document.getElementById(targetId);
   if(!target){setVisible(true);return}
   const top=target.getBoundingClientRect().top+window.scrollY;
   setVisible(window.scrollY+window.innerHeight*.72<top);
  };
  update();
  window.addEventListener("scroll",update,{passive:true});
  window.addEventListener("resize",update);
  return()=>{window.removeEventListener("scroll",update);window.removeEventListener("resize",update)}
 },[targetId]);
 const go=()=>{
  const target=document.getElementById(targetId);
  if(!target)return;
  const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;
  target.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
 };
 return <button type="button" className={"nord-scroll-cue"+(visible?"":" is-hidden")} onClick={go} aria-label={label}>
  <span>{label}</span><i aria-hidden="true">⌄</i><i aria-hidden="true">⌄</i>
 </button>;
}
