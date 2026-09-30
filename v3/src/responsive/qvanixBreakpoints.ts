import{useEffect,useState}from"react";

export const QVANIX_BREAKPOINTS={
 tablet:700,
 desktop:900,
}as const;

export type QvanixLayoutTier="phone"|"tablet"|"desktop";

export function resolveQvanixLayout(width:number):QvanixLayoutTier{
 if(width>=QVANIX_BREAKPOINTS.desktop)return"desktop";
 if(width>=QVANIX_BREAKPOINTS.tablet)return"tablet";
 return"phone";
}

export function useQvanixLayoutTier(){
 const read=()=>resolveQvanixLayout(typeof window==="undefined"?QVANIX_BREAKPOINTS.desktop:window.innerWidth);
 const[tier,setTier]=useState<QvanixLayoutTier>(read);
 useEffect(()=>{
  let frame=0;
  const sync=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>setTier(resolveQvanixLayout(window.innerWidth)))};
  window.addEventListener("resize",sync,{passive:true});
  return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",sync)};
 },[]);
 return tier;
}
