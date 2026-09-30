import{useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import"./instrumentAvatar.css";

export function InstrumentAvatar({position,size="md"}:{position:Pick<PositionSnapshot,"ticker"|"name"|"brand"|"instrumentType">;size?:"sm"|"md"|"lg"}){
 const[failed,setFailed]=useState(false);
 const logo=position.brand?.logoUrl&&!failed?position.brand.logoUrl:null;
 const fallback=(position.ticker||position.name||"?").trim().slice(0,2).toUpperCase();
 const style={
  "--instrument-brand-bg":position.brand?.logoBaseColor||undefined,
  "--instrument-brand-text":position.brand?.textColor||undefined,
 }as React.CSSProperties;
 return <span className={"instrument-avatar is-"+size} style={style} aria-hidden="true">
  {logo?<img src={logo} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>:<b>{fallback}</b>}
 </span>;
}
