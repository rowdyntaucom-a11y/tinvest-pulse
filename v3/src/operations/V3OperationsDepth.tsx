import{useCallback,useEffect,useMemo,useState}from"react";
import{loadV3OperationsLedger,type V3OperationKind,type V3OperationsLedger}from"./operationsLedger";
import"../styles/samuraiOperationsDepth.css";

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"2-digit"});

const FILTERS=[
 ["ALL","Все"],
 ["TRADE","Сделки"],
 ["INCOME","Доход"],
 ["EXTERNAL_CASH","Потоки"],
 ["FEE","Комиссии"],
 ["OTHER","Прочее"]
] as const;
type Filter=typeof FILTERS[number][0];

function kindLabel(kind:V3OperationKind){
 if(kind==="TRADE")return"СДЕЛКА";
 if(kind==="INCOME")return"ДОХОД";
 if(kind==="EXTERNAL_CASH")return"ВНЕШНИЙ ПОТОК";
 if(kind==="FEE")return"КОМИССИЯ";
 return"ДРУГОЕ";
}
function signedMoney(value:number){
 const sign=value>0?"+":value<0?"−":"";
 return sign+rub.format(Math.abs(value))+" ₽";
}
function ratio(value:number|null){
 return value==null?"—":pct.format(value*100)+"%";
}
function dateText(value:string|null){
 if(!value)return"—";
 const d=new Date(value);
 return Number.isNaN(d.getTime())?"—":dateFmt.format(d);
}

export function V3OperationsDepth(){
 const[ledger,setLedger]=useState<V3OperationsLedger|null>(null);
 const[loading,setLoading]=useState(true);
 const[filter,setFilter]=useState<Filter>("ALL");
 const[expanded,setExpanded]=useState(false);

 const refresh=useCallback(async(signal?:AbortSignal)=>{
  setLoading(true);
  try{setLedger(await loadV3OperationsLedger(signal))}
  catch(error){if(!(error instanceof DOMException&&error.name==="AbortError"))setLedger(null)}
  finally{if(!signal?.aborted)setLoading(false)}
 },[]);

 useEffect(()=>{
  const controller=new AbortController();
  void refresh(controller.signal);
  return()=>controller.abort();
 },[refresh]);

 const visible=useMemo(()=>{
  if(!ledger?.available)return[];
  const rows=filter==="ALL"?ledger.rows:ledger.rows.filter(row=>row.kind===filter);
  return rows.slice(0,expanded?60:14);
 },[ledger,filter,expanded]);

 const counts=useMemo(()=>{
  const rows=ledger?.rows??[];
  return{
   trade:rows.filter(row=>row.kind==="TRADE").length,
   income:rows.filter(row=>row.kind==="INCOME").length,
   flow:rows.filter(row=>row.kind==="EXTERNAL_CASH").length,
   fees:rows.filter(row=>row.kind==="FEE").length
  };
 },[ledger]);

 return <section className="sam-ops-depth" aria-label="Операции и целостность событий">
  <section id="sam-assets-operations" className="sam-ops-depth__block">
   <header className="sam-ops-depth__head">
    <div><span>06 · ОПЕРАЦИИ</span><h3>Журнал портфеля</h3><p>Исполненные брокерские операции. Типы не угадываются по знаку денег: используются явные типы и серверные флаги.</p></div>
    <button type="button" onClick={()=>void refresh()} disabled={loading}>{loading?"SYNC":"ОБНОВИТЬ"}</button>
   </header>

   {loading&&!ledger?<div className="sam-ops-depth__gate">Получаем подтверждённый журнал операций…</div>:
    !ledger?.available?<div className="sam-ops-depth__gate is-warning"><strong>Журнал недоступен</strong><span>{ledger?.reason??"Источник операций не подтвердил данные."}</span></div>:
    <>
     <div className="sam-ops-depth__summary">
      <article><span>Событий</span><strong>{ledger.rows.length}</strong><small>{dateText(ledger.coverageFrom)} → {dateText(ledger.coverageTo)}</small></article>
      <article><span>Сделок</span><strong>{counts.trade}</strong><small>buy / sell / delivery</small></article>
      <article><span>Доходных</span><strong>{counts.income}</strong><small>{ledger.passiveIncomeTotal==null?"агрегат —":rub.format(ledger.passiveIncomeTotal)+" ₽"}</small></article>
      <article><span>Внешних потоков</span><strong>{counts.flow}</strong><small>{ledger.externalCashTotal==null?"агрегат —":signedMoney(ledger.externalCashTotal)}</small></article>
     </div>

     <div className="sam-ops-depth__filters" role="group" aria-label="Фильтр операций">
      {FILTERS.map(([id,label])=><button key={id} type="button" className={filter===id?"is-active":""} onClick={()=>{setFilter(id);setExpanded(false)}}>{label}</button>)}
     </div>

     <div className="sam-ops-depth__rows">
      {visible.length?visible.map(row=><article key={row.key} className={"is-"+row.kind.toLowerCase().replace("_","-")}>
       <div className="sam-ops-depth__when"><strong>{dateText(row.date)}</strong><span>{kindLabel(row.kind)}</span></div>
       <div className="sam-ops-depth__what"><strong>{row.ticker??row.name??row.type.replace("OPERATION_TYPE_","")}</strong><span>{row.name??row.type.replace("OPERATION_TYPE_","").replaceAll("_"," ")}</span></div>
       <div className="sam-ops-depth__money"><strong className={row.payment>0?"is-positive":row.payment<0?"is-negative":""}>{signedMoney(row.payment)}</strong><span>{row.quantity==null?"":row.quantity.toLocaleString("ru-RU",{maximumFractionDigits:4})+" шт."}</span></div>
      </article>):<div className="sam-ops-depth__empty">В выбранной категории подтверждённых операций нет.</div>}
     </div>
     {ledger.rows.length>14&&<button type="button" className="sam-ops-depth__more" onClick={()=>setExpanded(value=>!value)}>{expanded?"Свернуть журнал":"Показать больше операций"}</button>}
     <p className="sam-ops-depth__note">Операционный журнал показывает фактические события счёта. Он не является дневником рыночной доходности и не заменяет TWR/XIRR.</p>
    </>}
  </section>

  <section id="sam-assets-integrity" className="sam-ops-depth__block sam-ops-depth__integrity">
   <div className="sam-ops-depth__title"><div><span>07 · ЦЕЛОСТНОСТЬ СОБЫТИЙ</span><h3>Контроль данных</h3></div><small>{ledger?.integrityLevel??"UNAVAILABLE"}</small></div>
   {!ledger?.available?<div className="sam-ops-depth__gate">Проверки появятся после подтверждения журнала операций.</div>:<>
    <div className="sam-ops-depth__checks">
     <article><i className={ledger.possiblyTruncated?"is-warning":"is-ok"}/><span><strong>Покрытие журнала</strong><small>{dateText(ledger.coverageFrom)} → {dateText(ledger.coverageTo)}{ledger.possiblyTruncated?" · достигнут лимит выборки":""}</small></span></article>
     <article><i className={ledger.traceableRatio===1?"is-ok":"is-warning"}/><span><strong>Трассировка операций</strong><small>{ratio(ledger.traceableRatio)} строк имеют broker operation id</small></span></article>
     <article><i className={ledger.instrumentIdentityRatio==null||ledger.instrumentIdentityRatio===1?"is-ok":"is-warning"}/><span><strong>Идентичность инструмента</strong><small>{ratio(ledger.instrumentIdentityRatio)} сделок/доходных событий связаны с FIGI / UID / ticker</small></span></article>
     <article><i className={ledger.aggregatesMatch===false?"is-warning":"is-ok"}/><span><strong>Сверка агрегатов</strong><small>{ledger.aggregatesMatch===false?"Итоги клиента и сервера расходятся":ledger.aggregatesMatch===null?"Серверные агрегаты не переданы":"Доход и внешние потоки сверены"}</small></span></article>
     <article><i className="is-unverified"/><span><strong>Корпоративные действия</strong><small>Отдельный реестр корпоративных действий пока не подключён — полнота не утверждается по одному журналу операций.</small></span></article>
    </div>
    {(ledger.rejected>0||ledger.duplicates>0)&&<p className="sam-ops-depth__warning">Отклонено строк: {ledger.rejected}; дубликатов broker id: {ledger.duplicates}. Эти строки не используются как подтверждённые события.</p>}
    <p className="sam-ops-depth__note">QVANIX не помечает портфель как «полный» только потому, что брокер вернул операции. Для проверки пропущенных корпоративных действий нужен отдельный верифицируемый источник/контракт.</p>
   </>}
  </section>
 </section>;
}
