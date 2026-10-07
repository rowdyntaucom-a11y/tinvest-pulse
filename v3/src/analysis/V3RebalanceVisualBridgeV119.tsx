import{useMemo}from"react";
import type{DriftResult}from"../../../v2/src/features/analytics/drift";
import type{RebalanceScenarioResult}from"../../../v2/src/features/analytics/rebalanceScenarios";
import{buildRebalanceVisualBridgeModelV119}from"./rebalanceVisualBridgeModelV119";
import"../styles/rebalanceVisualBridgeV119.css";

type Props={drift:DriftResult;scenario:RebalanceScenarioResult};
const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
function money(value:number|null|undefined){return typeof value==="number"&&Number.isFinite(value)?rub.format(value)+" ₽":"—"}
function signed(value:number){if(!Number.isFinite(value))return"—";return`${value>0?"+":value<0?"−":""}${rub.format(Math.abs(value))} ₽`}
function percent(value:number|null|undefined){return typeof value==="number"&&Number.isFinite(value)?pct.format(value*100)+"%":"—"}
function modeName(mode:RebalanceScenarioResult["mode"]){return mode==="ADD_CAPITAL"?"Довнесение":mode==="WITHDRAW_CAPITAL"?"Вывод":"Перераспределение"}

export function V3RebalanceVisualBridgeV119({drift,scenario}:Props){
 const model=useMemo(()=>buildRebalanceVisualBridgeModelV119(drift,scenario),[drift,scenario]);
 if(!model)return null;
 return <section className="v3-rebalance-bridge-v119" aria-label="Визуальная проверка сценария ребалансировки">
  <header><div><span>04 · ВИЗУАЛЬНАЯ СВЕРКА</span><strong>До → целевая структура</strong><p>Одна шкала для текущей и целевой доли внутри двухклассовой части портфеля. Денежная дельта берётся из уже рассчитанного сценария.</p></div><small>{modeName(scenario.mode)}</small></header>
  <div className="v3-rebalance-bridge-v119__capital">
   <article><span>Капитал классов до</span><strong>{money(scenario.assignedValueBefore)}</strong></article>
   <i aria-hidden="true">→</i>
   <article><span>После заданного потока</span><strong>{money(scenario.assignedValueAfter)}</strong></article>
   <article><span>Охват модели сейчас</span><strong>{percent(model.coverage)}</strong><small>вне модели {percent(scenario.unassignedWeight)}</small></article>
  </div>
  <section className="v3-rebalance-bridge-v119__classes"><header><div><span>КЛАССЫ</span><strong>Текущая доля и цель</strong></div><small>доля внутри двухклассовой части · 0–100%</small></header>{model.rows.map(row=><article key={row.key}>
   <div className="v3-rebalance-bridge-v119__row-head"><strong>{row.label}</strong><span>сейчас {percent(row.currentShare)} · цель {percent(row.targetShare)}</span></div>
   <div className="v3-rebalance-bridge-v119__rail" aria-label={`${row.label}: сейчас ${percent(row.currentShare)}, цель ${percent(row.targetShare)}`}><i style={{width:`${Math.min(100,Math.max(0,row.currentShare*100))}%`}}/><b style={{left:`${Math.min(100,Math.max(0,row.targetShare*100))}%`}}/></div>
   <div className="v3-rebalance-bridge-v119__row-values"><span>{money(row.currentValue)} → {money(row.targetValue)}</span><strong className={row.deltaValue>0?"is-positive":row.deltaValue<0?"is-negative":""}>{signed(row.deltaValue)}</strong></div>
  </article>)}</section>
  <section className="v3-rebalance-bridge-v119__delta"><header><div><span>ТРЕБУЕМАЯ ДЕЛЬТА</span><strong>Масштаб изменений по классам</strong></div><small>{model.displayedMovementLabel} {money(model.displayedMovement)}</small></header>{model.rows.map(row=><article key={row.key}><div><strong>{row.label}</strong><span>{row.direction==="INCREASE"?"увеличить":row.direction==="DECREASE"?"уменьшить":"без изменения"}</span></div><i><b style={{width:`${row.deltaMagnitude/model.maxDelta*100}%`}}/></i><small>{signed(row.deltaValue)}</small></article>)}</section>
  {scenario.mode!=="REBALANCE_EXISTING"&&<section className="v3-rebalance-bridge-v119__threshold"><header><div><span>ПОТОК</span><strong>Задано и минимум для точной цели</strong></div><small>{scenario.exactTargetPossible?"цель достижима":"есть конфликт направления"}</small></header><div><article><span>Заданный поток</span><i><b style={{width:`${Math.min(100,scenario.requestedFlow/model.thresholdMax*100)}%`}}/></i><strong>{money(scenario.requestedFlow)}</strong></article><article><span>Минимум</span><i><b style={{width:`${Math.min(100,(model.minimum??0)/model.thresholdMax*100)}%`}}/></i><strong>{money(model.minimum)}</strong></article>{model.thresholdGap!=null&&<article className="v3-rebalance-bridge-v119__gap"><span>Разница к минимуму</span><strong className={model.thresholdGap>=0?"is-positive":"is-negative"}>{signed(model.thresholdGap)}</strong><small>{model.thresholdGap>=0?"поток не ниже рассчитанного минимума":"поток ниже рассчитанного минимума"}</small></article>}</div>{model.directionConflict.length>0&&<p>При выбранном направлении потока точная цель требует противоположного изменения класса: {model.directionConflict.map(row=>row.label).join(", ")}. QVANIX показывает конфликт и не превращает его в инструкцию по сделкам.</p>}</section>}
  <footer>Сверка описывает только пользовательский сценарий на уровне классов. Это не предложение изменить портфель и не список операций с конкретными бумагами.</footer>
 </section>;
}
