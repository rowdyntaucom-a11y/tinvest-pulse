import{useMemo,useState}from"react";
import{V3GlossaryHelp}from"../help/V3GlossaryHelp";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{calculateFuturesRiskProfile,calculateFuturesScenario,futuresScenarioWarnings,parseScenarioNumber,type FuturesScenarioInput}from"./futuresMath";

const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const ratio=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});

type FieldKey=keyof FuturesScenarioInput;
const FIELDS:Array<{key:FieldKey;label:string;hint:string;placeholder:string}>=[
 {key:"futuresPrice",label:"Цена фьючерса",hint:"Текущая цена контракта",placeholder:"например 100000"},
 {key:"spotPrice",label:"Цена базового актива",hint:"Для расчёта basis",placeholder:"необязательно"},
 {key:"scenarioPrice",label:"Цена в сценарии",hint:"Пользовательский WHAT IF",placeholder:"например 102000"},
 {key:"contracts",label:"Контрактов",hint:"Количество в сценарии",placeholder:"1"},
 {key:"priceValuePerPoint",label:"₽ за 1 пункт",hint:"По спецификации контракта",placeholder:"1"},
 {key:"marginPerContract",label:"ГО на контракт",hint:"Только подтверждённое/введённое значение",placeholder:"необязательно"},
 {key:"daysToExpiry",label:"Дней до экспирации",hint:"Для annualized basis",placeholder:"необязательно"},
];

const empty:FuturesScenarioInput={futuresPrice:null,spotPrice:null,scenarioPrice:null,contracts:null,priceValuePerPoint:null,marginPerContract:null,daysToExpiry:null,direction:"LONG"};

function metric(value:number|null,format:(v:number)=>string){return value==null?"—":format(value)}

export function V3FuturesScenario({positions=[]}:{positions?:PositionSnapshot[]}){
 const[input,setInput]=useState<FuturesScenarioInput>(empty);
 const result=useMemo(()=>calculateFuturesScenario(input),[input]);
 const warnings=useMemo(()=>futuresScenarioWarnings(input,result),[input,result]);
 const risk=useMemo(()=>calculateFuturesRiskProfile(input),[input]);
 const update=(key:FieldKey,raw:string)=>setInput(prev=>({...prev,[key]:parseScenarioNumber(raw)}));
 const currentFutures=useMemo(()=>positions.filter(position=>String(position.instrumentType||"").toLowerCase().includes("future")),[positions]);
 const currentContracts=currentFutures.reduce((sum,position)=>sum+Math.abs(position.quantity||0),0);
 const currentPnl=currentFutures.reduce((sum,position)=>sum+(position.expectedYield||0),0);

 return <section className="v3-pro-tool v3-futures-scenario" aria-label="Сценарий по фьючерсу">
  <header><div><span>DERIVATIVES // READ-ONLY</span><h3>Фьючерс · сценарий</h3><p>Расчёт по введённым параметрам. QVANIX ничего не отправляет брокеру и не создаёт заявку.</p></div><strong>WHAT IF</strong></header>
  <div className="v3-futures-help"><V3GlossaryHelp terms={["basis","margin","pnl"]} label="Что такое Basis и ГО"/></div>
  <section className="v3-futures-current" aria-label="Текущие фьючерсные позиции" aria-live="polite">
   <span>ТЕКУЩИЙ ПОРТФЕЛЬ</span>
   <div><article><b>{currentFutures.length}</b><small>фьючерсных позиций</small></article><article><b>{ratio.format(currentContracts)}</b><small>контрактов по модулю количества</small></article><article><b className={currentPnl>0?"is-positive":currentPnl<0?"is-negative":""}>{(currentPnl>0?"+":"")+money.format(currentPnl)} ₽</b><small>P/L открытых фьючерсных позиций</small></article></div>
   {currentFutures.length?<p>{currentFutures.slice(0,6).map(position=>position.ticker).join(" · ")}{currentFutures.length>6?" · …":""}</p>:<p>В подтверждённом составе сейчас нет фьючерсных позиций. Сценарий ниже остаётся ручным WHAT IF.</p>}
  </section>
  <div className="v3-futures-direction" role="group" aria-label="Направление сценария"><button type="button" className={risk.direction==="LONG"?"is-active":""} aria-pressed={risk.direction==="LONG"} onClick={()=>setInput(prev=>({...prev,direction:"LONG"}))}>LONG <small>рост цены = +P/L</small></button><button type="button" className={risk.direction==="SHORT"?"is-active":""} aria-pressed={risk.direction==="SHORT"} onClick={()=>setInput(prev=>({...prev,direction:"SHORT"}))}>SHORT <small>падение цены = +P/L</small></button></div>
  <div className="v3-futures-scenario__fields" aria-label="Параметры ручного фьючерсного сценария">{FIELDS.map(field=><label key={field.key}><span>{field.label}</span><input inputMode="decimal" aria-label={field.label} placeholder={field.placeholder} onChange={e=>update(field.key,e.target.value)}/><small>{field.hint}</small></label>)}</div>
  <div className="v3-futures-scenario__metrics" aria-label="Результаты ручного фьючерсного сценария" aria-live="polite">
   <article><span>Номинал сценария</span><strong>{metric(result.notional,v=>money.format(v)+" ₽")}</strong><small>цена × контракты × ₽/пункт</small></article>
   <article><span>Расчётное плечо</span><strong>{metric(result.leverage,v=>ratio.format(v)+"×")}</strong><small>номинал / введённое ГО</small></article>
   <article><span>P/L сценария</span><strong className={result.scenarioPnl==null?"":result.scenarioPnl>0?"is-positive":result.scenarioPnl<0?"is-negative":""}>{metric(result.scenarioPnl,v=>(v>0?"+":"")+money.format(v)+" ₽")}</strong><small>без комиссий и налогов</small></article>
   <article><span>К ГО</span><strong>{metric(result.scenarioMarginReturnPct,v=>(v>0?"+":"")+ratio.format(v)+"%")}</strong><small>scenario P/L / суммарное ГО</small></article>
   <article><span>Basis</span><strong>{metric(result.basisPct,v=>(v>0?"+":"")+ratio.format(v)+"%")}</strong><small>фьючерс к базовому активу</small></article>
   <article><span>Basis годовой</span><strong>{metric(result.annualizedBasisPct,v=>(v>0?"+":"")+ratio.format(v)+"%")}</strong><small>простая annualized оценка, не прогноз</small></article>
  </div>
  <section className="v3-futures-risk" aria-label="Стресс-профиль фьючерса" aria-describedby="futures-stress-disclaimer">
   <div className="v3-futures-risk__head" aria-label="Состояние спецификации стресс-расчёта"><div><span>DERIVATIVES INTELLIGENCE V2</span><strong>Stress matrix</strong></div><small role="status">{risk.complete?"SPEC COMPLETE":"SPEC INCOMPLETE"}</small></div>
   <div className="v3-futures-risk__summary" aria-label="Ключевые показатели стресс-профиля">
    <article><span>P/L на 1% цены</span><strong>{metric(risk.onePercentPnl,v=>money.format(v)+" ₽")}</strong><small>абсолютная чувствительность позиции</small></article>
    <article><span>Ход цены ≈ размер ГО</span><strong>{metric(risk.priceMoveToMarginLossPct,v=>ratio.format(v)+"%")}</strong><small>арифметический ориентир, не liquidation price</small></article>
    <article><span>Basis regime</span><strong>{risk.basisState}</strong><small>{risk.expiryBasisDecayPerDayPct==null?"нужны spot + expiry":ratio.format(risk.expiryBasisDecayPerDayPct)+" п.п./день до expiry"}</small></article>
   </div>
   {risk.stress.length>0&&<div className="v3-futures-stress" aria-label="Стресс-сценарии изменения цены">{risk.stress.map(row=><article key={row.movePct}><span>{row.movePct>0?"+":""}{row.movePct}%</span><small>{ratio.format(row.scenarioPrice)}</small><strong className={row.pnl==null?"":row.pnl>0?"is-positive":"is-negative"}>{row.pnl==null?"—":(row.pnl>0?"+":"")+money.format(row.pnl)+" ₽"}</strong><b>{row.marginReturnPct==null?"—":(row.marginReturnPct>0?"+":"")+ratio.format(row.marginReturnPct)+"% ГО"}</b></article>)}</div>}
   <p className="v3-futures-risk__note" id="futures-stress-disclaimer">Матрица механически двигает цену текущего фьючерса на ±2/5/10%. Это стресс-сценарии, не прогноз вероятности. «Ход цены ≈ ГО» не является ценой ликвидации: реальные требования брокера и биржи могут изменяться.</p>
  </section>
  {warnings.length>0&&<div className="v3-futures-scenario__warnings" role="status" aria-label="Предупреждения сценария">{warnings.map(item=><p key={item}>{item}</p>)}</div>}
  <footer>Не рассчитываются ликвидация, гарантийные требования брокера, вариационная маржа биржи, комиссии, налоги и риск принудительного закрытия без отдельного подтверждённого контракта данных.</footer>
 </section>;
}
