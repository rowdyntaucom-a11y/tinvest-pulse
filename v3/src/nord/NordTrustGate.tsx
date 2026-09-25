import{NordScrollCue}from"./NordScrollCue";
type GateKind="assets"|"analysis"|"income";

const COPY:Record<GateKind,{rune:string;code:string;title:string;lead:string;steps:[string,string,string][]}>={
 assets:{rune:"ᛟ",code:"HOLDINGS // 02",title:"Строй ждёт подтверждения",lead:"Позиции, веса и структура появятся только после валидного снимка портфеля.",steps:[["ᚠ","Источник","Получить брокерский снимок"],["ᚱ","Строй","Проверить состав и веса"],["ᛉ","Глубина","Открыть структуру и карточки активов"]]},
 analysis:{rune:"ᚱ",code:"RISK // 03",title:"Руны риска ещё закрыты",lead:"Доходность, просадка и сравнение с IMOEX не строятся без подтверждённой истории.",steps:[["ᛏ","История","Подтвердить точки TWR"],["ᛞ","Риск","Связать историю и состав"],["ᛟ","Матрица","Открыть риск, структуру и рынок"]]},
 income:{rune:"ᚠ",code:"FLOW // 04",title:"Казна ждёт фактический поток",lead:"Купоны и дивиденды не заменяются оценками: нужен подтверждённый журнал операций.",steps:[["ᚾ","Операции","Получить фактические выплаты"],["ᛃ","Связь","Сопоставить выплаты с активами"],["ᚠ","Поток","Открыть календарь и источники дохода"]]}
};

function Preview({kind}:{kind:GateKind}){
 if(kind==="assets")return <section className="nord-gate__preview nord-gate__preview--assets" aria-label="Структура после подтверждения данных">
  <div className="nord-gate__preview-head"><span>FORMATION BOARD</span><b>АРСЕНАЛ КАПИТАЛА</b></div>
  <div className="nord-gate__preview-shield" aria-hidden="true"><i/><i/><b>—</b><span>TOP-3</span></div>
  <div className="nord-gate__preview-list"><div><i>01</i><span><b>Состав</b><small>позиции и веса</small></span><em/></div><div><i>02</i><span><b>Классы</b><small>акции · облигации · фонды</small></span><em/></div><div><i>03</i><span><b>Концентрация</b><small>топ-позиции и эмитенты</small></span><em/></div></div>
 </section>;
 if(kind==="analysis")return <section className="nord-gate__preview nord-gate__preview--analysis" aria-label="Аналитика после подтверждения данных">
  <div className="nord-gate__preview-head"><span>RUNE COMPASS</span><b>КАРТА РИСКА</b></div>
  <div className="nord-gate__preview-scope" aria-hidden="true"><i/><i/><i/><span/><b>—</b><small>MAX DD</small></div>
  <div className="nord-gate__preview-grid"><div><span>TWR</span><b>—</b></div><div><span>IMOEX</span><b>—</b></div><div><span>РИСК</span><b>—</b></div><div><span>КОНЦ.</span><b>—</b></div></div>
 </section>;
 return <section className="nord-gate__preview nord-gate__preview--income" aria-label="Доход после подтверждения данных">
  <div className="nord-gate__preview-head"><span>TREASURY CURRENT</span><b>СЕВЕРНАЯ КАЗНА</b></div>
  <div className="nord-gate__preview-flow" aria-hidden="true"><i/><i/><i/><i/><b>ᚠ</b></div>
  <div className="nord-gate__preview-income"><div><span>Купоны</span><b>—</b></div><div><span>Дивиденды</span><b>—</b></div><div><span>Средний месяц</span><b>—</b></div><div><span>Календарь</span><b>—</b></div></div>
 </section>;
}

export function NordTrustGate({kind,onRefresh,refreshing=false}:{kind:GateKind;onRefresh?:()=>void|Promise<void>;refreshing?:boolean}){
 const x=COPY[kind];
 return <main className={"nord-gate nord-gate--"+kind} aria-label={x.title}>
  <section className="nord-gate__world" aria-hidden="true">
   <div className="nord-gate__atmosphere"><i/><i/><i/></div>
   <div className="nord-gate__crest"><i/><b>{x.rune}</b><span/></div>
   <div className="nord-gate__rune-rail"><i>ᚠ</i><i>ᚱ</i><i>ᛏ</i><i>ᛟ</i><i>ᛉ</i></div>
  </section>
  <Preview kind={kind}/>
  <section className="nord-gate__answer">
   <div className="nord-gate__chapter"><span>{x.code}</span><b>RUNE GATE</b></div>
   <header><i aria-hidden="true">{x.rune}</i><div><span>DATA GATE // FAIL-CLOSED</span><strong>{x.title}</strong><p>{x.lead}</p></div></header>
   <div className="nord-gate__source"><i aria-hidden="true">◆</i><span>Источник не подтверждён · значения не подставляются</span></div>
   <NordScrollCue targetId="nord-gate-route" label="НИЖЕ · МАРШРУТ"/>
  </section>
  <section id="nord-gate-route" className="nord-gate__route" aria-label="Маршрут проверки">
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
