import type{ReactNode}from"react";

export type NordWorkspaceKind="assets"|"analysis"|"income"|"goal";
const COPY:Record<NordWorkspaceKind,{code:string;title:string;subtitle:string;rune:string;cue:string}>={
 assets:{code:"FORMATION // 02",title:"Арсенал капитала",subtitle:"Строй, веса и структура портфеля",rune:"ᛟ",cue:"ОТКРЫТЬ СТРОЙ"},
 analysis:{code:"RISK // 03",title:"Рунная навигация",subtitle:"Доходность, риск и связь с рынком",rune:"ᚱ",cue:"ОТКРЫТЬ КАРТУ"},
 income:{code:"TREASURY // 04",title:"Северная казна",subtitle:"Купоны, дивиденды и фактический поток",rune:"ᚠ",cue:"ОТКРЫТЬ КАЗНУ"},
 goal:{code:"PATH // 05",title:"Путь капитала",subtitle:"Личный ориентир и пользовательские сценарии",rune:"ᛏ",cue:"ОТКРЫТЬ МАРШРУТ"},
};
function scrollTo(id:string){const el=document.getElementById(id);if(!el)return;const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;el.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})}

export function NordWorkspaceStage({kind,targetId,value,meta,children}:{kind:NordWorkspaceKind;targetId:string;value:ReactNode;meta:ReactNode;children?:ReactNode}){
 const x=COPY[kind];
 return <section className={"nord-stage-v3 nord-stage-v3--"+kind} aria-label={x.title}>
  <div className="nord-stage-v3__art" aria-hidden="true">
   <div className="nord-stage-v3__aurora"><i/><i/><i/></div>
   <div className="nord-stage-v3__mist"><i/><i/></div>
   <div className="nord-stage-v3__snow"><i/><i/><i/><i/><i/><i/></div>
   <div className="nord-stage-v3__mark"><span>QVANIX</span><b>{x.code}</b></div>
  </div>
  <section className="nord-stage-v3__answer">
   <div className="nord-stage-v3__answer-copy"><span>{x.subtitle}</span><strong>{value}</strong><small>{meta}</small></div>
   <div className="nord-stage-v3__rune" aria-hidden="true"><i/><b>{x.rune}</b><i/></div>
   {children}
  </section>
  <button type="button" className="nord-stage-v3__cue" onClick={()=>scrollTo(targetId)} aria-label={"Плавно перейти ниже: "+x.cue}><span>{x.cue}</span><i aria-hidden="true">⌄</i></button>
 </section>;
}
