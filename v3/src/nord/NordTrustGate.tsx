import type{MouseEvent}from"react";
type GateKind="assets"|"analysis"|"income";

const COPY:Record<GateKind,{rune:string;code:string;title:string;lead:string;steps:[string,string,string][]}>={
 assets:{rune:"ᛟ",code:"HOLDINGS // 02",title:"Строй ждёт подтверждения",lead:"Позиции, веса и структура появятся только после валидного снимка портфеля.",steps:[["ᚠ","Источник","Получить брокерский снимок"],["ᚱ","Строй","Проверить состав и веса"],["ᛉ","Глубина","Открыть структуру и карточки активов"]]},
 analysis:{rune:"ᚱ",code:"RISK // 03",title:"Руны риска ещё закрыты",lead:"Доходность, просадка и сравнение с IMOEX не строятся без подтверждённой истории.",steps:[["ᛏ","История","Подтвердить точки TWR"],["ᛞ","Риск","Связать историю и состав"],["ᛟ","Матрица","Открыть риск, структуру и рынок"]]},
 income:{rune:"ᚠ",code:"FLOW // 04",title:"Казна ждёт фактический поток",lead:"Купоны и дивиденды не заменяются оценками: нужен подтверждённый журнал операций.",steps:[["ᚾ","Операции","Получить фактические выплаты"],["ᛃ","Связь","Сопоставить выплаты с активами"],["ᚠ","Поток","Открыть календарь и источники дохода"]]}
};

export function NordTrustGate({kind,onRefresh,refreshing=false}:{kind:GateKind;onRefresh?:()=>void|Promise<void>;refreshing?:boolean}){
 const x=COPY[kind];
 const scrollToRoute=(event:MouseEvent<HTMLButtonElement>)=>{
  const route=event.currentTarget.closest(".nord-gate")?.querySelector<HTMLElement>(".nord-gate__route");
  const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;
  route?.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
 };
 return <main className={"nord-gate nord-gate--"+kind} aria-label={x.title}>
  <section className="nord-gate__world" aria-hidden="true">
   <div className="nord-gate__atmosphere"><i/><i/><i/></div>
   <div className="nord-gate__crest"><i/><b>{x.rune}</b><span/></div>
   <div className="nord-gate__rune-rail"><i>ᚠ</i><i>ᚱ</i><i>ᛏ</i><i>ᛟ</i><i>ᛉ</i></div>
  </section>
  <section className="nord-gate__answer">
   <div className="nord-gate__chapter"><span>{x.code}</span><b>RUNE GATE</b></div>
   <header><i aria-hidden="true">{x.rune}</i><div><span>DATA GATE // FAIL-CLOSED</span><strong>{x.title}</strong><p>{x.lead}</p></div></header>
   <div className="nord-gate__source"><i aria-hidden="true">◆</i><span>Источник не подтверждён · значения не подставляются</span></div>
   <button type="button" className="nord-gate__cue" onClick={scrollToRoute} aria-label="Перейти ниже к маршруту проверки"><span>НИЖЕ · МАРШРУТ ПРОВЕРКИ</span><i aria-hidden="true">⌄</i></button>
  </section>
  <section className="nord-gate__route" aria-label="Маршрут проверки">
   {x.steps.map(([r,title,copy],index)=><article key={r+title}>
    <b aria-hidden="true">{r}</b><div><span>{title}</span><small>{copy}</small></div><i aria-hidden="true">{index<2?"›":"✓"}</i>
   </article>)}
   <div className="nord-gate__action">
    <button type="button" onClick={()=>void onRefresh?.()} disabled={refreshing||!onRefresh}>{refreshing?"Синхронизация…":"Проверить источник"}</button>
    <small>{refreshing?"Повторно запрашиваем подтверждённый снимок":"После проверки откроются реальные значения и глубокие слои"}</small>
   </div>
  </section>
 </main>;
}
