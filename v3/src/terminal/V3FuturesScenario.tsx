import{useMemo,useState}from"react";
import{calculateFuturesScenario,futuresScenarioWarnings,parseScenarioNumber,type FuturesScenarioInput}from"./futuresMath";

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

const empty:FuturesScenarioInput={futuresPrice:null,spotPrice:null,scenarioPrice:null,contracts:null,priceValuePerPoint:null,marginPerContract:null,daysToExpiry:null};

function metric(value:number|null,format:(v:number)=>string){return value==null?"—":format(value)}

export function V3FuturesScenario(){
 const[input,setInput]=useState<FuturesScenarioInput>(empty);
 const result=useMemo(()=>calculateFuturesScenario(input),[input]);
 const warnings=useMemo(()=>futuresScenarioWarnings(input,result),[input,result]);
 const update=(key:FieldKey,raw:string)=>setInput(prev=>({...prev,[key]:parseScenarioNumber(raw)}));

 return <section className="v3-pro-tool v3-futures-scenario" aria-label="Сценарий по фьючерсу">
  <header><div><span>DERIVATIVES // READ-ONLY</span><h3>Фьючерс · сценарий</h3><p>Расчёт по введённым параметрам. QVANIX ничего не отправляет брокеру и не создаёт заявку.</p></div><strong>WHAT IF</strong></header>
  <div className="v3-futures-scenario__fields">{FIELDS.map(field=><label key={field.key}><span>{field.label}</span><input inputMode="decimal" placeholder={field.placeholder} onChange={e=>update(field.key,e.target.value)}/><small>{field.hint}</small></label>)}</div>
  <div className="v3-futures-scenario__metrics">
   <article><span>Номинал сценария</span><strong>{metric(result.notional,v=>money.format(v)+" ₽")}</strong><small>цена × контракты × ₽/пункт</small></article>
   <article><span>Расчётное плечо</span><strong>{metric(result.leverage,v=>ratio.format(v)+"×")}</strong><small>номинал / введённое ГО</small></article>
   <article><span>P/L сценария</span><strong className={result.scenarioPnl==null?"":result.scenarioPnl>0?"is-positive":result.scenarioPnl<0?"is-negative":""}>{metric(result.scenarioPnl,v=>(v>0?"+":"")+money.format(v)+" ₽")}</strong><small>без комиссий и налогов</small></article>
   <article><span>К ГО</span><strong>{metric(result.scenarioMarginReturnPct,v=>(v>0?"+":"")+ratio.format(v)+"%")}</strong><small>scenario P/L / суммарное ГО</small></article>
   <article><span>Basis</span><strong>{metric(result.basisPct,v=>(v>0?"+":"")+ratio.format(v)+"%")}</strong><small>фьючерс к базовому активу</small></article>
   <article><span>Basis годовой</span><strong>{metric(result.annualizedBasisPct,v=>(v>0?"+":"")+ratio.format(v)+"%")}</strong><small>простая annualized оценка, не прогноз</small></article>
  </div>
  {warnings.length>0&&<div className="v3-futures-scenario__warnings">{warnings.map(item=><p key={item}>{item}</p>)}</div>}
  <footer>Не рассчитываются ликвидация, гарантийные требования брокера, вариационная маржа биржи, комиссии, налоги и риск принудительного закрытия без отдельного подтверждённого контракта данных.</footer>
 </section>;
}
