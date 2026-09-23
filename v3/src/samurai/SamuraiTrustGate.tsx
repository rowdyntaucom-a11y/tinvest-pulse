type GateKind="assets"|"analysis"|"income";
const COPY:Record<GateKind,{glyph:string,chapter:string,code:string,eyebrow:string,title:string,lead:string,steps:[string,string,string][]}>={
 assets:{glyph:"陣",chapter:"Активы",code:"FORMATION // 02",eyebrow:"FORMATION LOCKED",title:"Строй ждёт подтверждения",lead:"Состав не подменяется нулями: позиции появятся только после валидного снимка портфеля.",steps:[["壱","Источник","Получить брокерский снимок"],["弐","Покрытие","Проверить полноту состава"],["参","Строй","Показать веса и позиции"]]},
 analysis:{glyph:"眼",chapter:"Анализ",code:"TACTICAL // 03",eyebrow:"TACTICAL LOCKED",title:"Диагностика ждёт историю",lead:"Риск и доходность остаются скрыты, пока источник или покрытие не прошли проверку.",steps:[["壱","История","Подтвердить точки TWR"],["弐","Состав","Связать текущие позиции"],["参","Матрица","Открыть риск и структуру"]]},
 income:{glyph:"禄",chapter:"Доход",code:"TREASURY // 04",eyebrow:"TREASURY LOCKED",title:"Казначейство ждёт факт",lead:"Купоны и дивиденды не заменяются оценками: нужен подтверждённый поток операций.",steps:[["壱","Операции","Получить выплаты"],["弐","Связь","Сопоставить источники"],["参","Поток","Показать факт и темп"]]}
};

function GateInstrument({kind}:{kind:GateKind}){
 if(kind==="assets")return <div className="sam-trust-instrument sam-trust-instrument--formation" aria-hidden="true">
  <div className="sam-trust-instrument__label"><span>FORMATION MAP</span><b>ROSTER / SOURCE</b></div>
  <div className="sam-formation-map">
   <i className="slot slot-a"/><i className="slot slot-b"/><i className="slot slot-c"/><i className="slot slot-d"/><i className="slot slot-e"/>
   <span className="lane lane-a"/><span className="lane lane-b"/><span className="lane lane-c"/>
   <b>陣</b>
  </div>
  <small>Позиции появятся только после подтверждённого состава</small>
 </div>;
 if(kind==="analysis")return <div className="sam-trust-instrument sam-trust-instrument--radar" aria-hidden="true">
  <div className="sam-trust-instrument__label"><span>TACTICAL SCOPE</span><b>HISTORY / TWR / RISK</b></div>
  <div className="sam-radar">
   <i className="ring ring-a"/><i className="ring ring-b"/><i className="ring ring-c"/>
   <span className="axis axis-x"/><span className="axis axis-y"/><span className="sweep"/>
   <b className="blip blip-a"/><b className="blip blip-b"/><b className="blip blip-c"/>
   <em>眼</em>
  </div>
  <small>Матрица не строится без проверенной истории и связанного состава</small>
 </div>;
 return <div className="sam-trust-instrument sam-trust-instrument--ledger" aria-hidden="true">
  <div className="sam-trust-instrument__label"><span>TREASURY LEDGER</span><b>OPS / MATCH / FLOW</b></div>
  <div className="sam-ledger">
   <span className="row row-a"><i/><i/><b/></span>
   <span className="row row-b"><i/><i/><b/></span>
   <span className="row row-c"><i/><i/><b/></span>
   <span className="row row-d"><i/><i/><b/></span>
   <em>禄</em>
  </div>
  <small>Факт выплат откроется только после подтверждения операций</small>
 </div>;
}

export function SamuraiTrustGate({kind,onRefresh,refreshing=false}:{kind:GateKind;onRefresh?:()=>void|Promise<void>;refreshing?:boolean}){
 const x=COPY[kind];
 return <section className={"sam-trust-gate sam-trust-gate--"+kind} data-kind={kind} aria-label={x.title}>
  <div className="sam-trust-gate__chapter"><span>{x.code}</span><strong>{x.chapter}</strong></div>
  <div className="sam-trust-gate__watermark" aria-hidden="true">{x.glyph}</div>
  <header><i aria-hidden="true">{x.glyph}</i><div><span>{x.eyebrow}</span><strong>{x.title}</strong><small>{x.lead}</small></div></header>
  <GateInstrument kind={kind}/>
  <div className="sam-trust-gate__route">{x.steps.map(([n,title,copy],index)=><article key={n}><b>{n}</b><span>{title}</span><small>{copy}</small><i aria-hidden="true">{index<2?"→":"✓"}</i></article>)}</div>
  <div className="sam-trust-gate__action"><button type="button" onClick={()=>void onRefresh?.()} disabled={refreshing||!onRefresh}>{refreshing?"Синхронизация…":"Проверить источник"}</button><span>{refreshing?"Повторно запрашиваем подтверждённый снимок":"Запустить повторную проверку данных"}</span></div>
  <footer><span>FAIL-CLOSED</span><i aria-hidden="true"/><small>QVANIX показывает только подтверждённые финансовые значения</small></footer>
 </section>;
}
