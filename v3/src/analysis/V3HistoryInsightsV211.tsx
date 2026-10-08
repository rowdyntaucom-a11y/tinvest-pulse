import {useMemo,useState} from "react";
import type {HistoryPoint} from "../../../v2/src/lib/portfolioApi";
import {buildHistoryTrustV210} from "./historyTrustV210";
import {V3HistoryCoverageV203} from "./V3HistoryCoverageV203";
import {V3CapitalBridgeV204} from "./V3CapitalBridgeV204";
import {V3BenchmarkHitRateV205} from "./V3BenchmarkHitRateV205";
import {V3BenchmarkCaptureV206} from "./V3BenchmarkCaptureV206";
import {V3ReturnQuartilesV207} from "./V3ReturnQuartilesV207";
import {V3RollingRangeV208} from "./V3RollingRangeV208";
import {V3ValueHighWaterV209} from "./V3ValueHighWaterV209";
import {V3HistoryTrustV210} from "./V3HistoryTrustV210";
import "../styles/historyInsightsV211.css";

export type V3HistoryInsightsChapter="overview"|"return"|"market";

const chapters:Record<V3HistoryInsightsChapter,{eyebrow:string;title:string;detail:string}>={
  overview:{eyebrow:"ИСТОРИЯ · КАЧЕСТВО",title:"Покрытие и движение капитала",detail:"Источники, полнота, вложения и максимумы стоимости"},
  return:{eyebrow:"TWR · РАСПРЕДЕЛЕНИЕ",title:"Как менялась доходность",detail:"Квартили интервалов и диапазоны rolling-окон"},
  market:{eyebrow:"IMOEX · СОПОСТАВЛЕНИЕ",title:"Когда портфель опережал индекс",detail:"Частота опережения и поведение на росте/падении"}
};

export function V3HistoryInsights({history,chapter,integrity}:{history:HistoryPoint[];chapter:V3HistoryInsightsChapter;integrity:string}){
  const [expanded,setExpanded]=useState(false);
  const quality=useMemo(()=>buildHistoryTrustV210(history),[history]);
  if(!quality.available)return null;
  const metadata=chapters[chapter],panelId="v3-history-insights-"+chapter;
  const canCompute=integrity==="OK"&&quality.invalidDateRows===0&&quality.conflictingDateRows===0;
  return <section className="v3-history-insights" data-chapter={chapter} aria-label={metadata.title}>
    <button className="v3-history-insights-trigger" type="button" aria-expanded={expanded} aria-controls={panelId} onClick={()=>setExpanded(value=>!value)}>
      <span><small>{metadata.eyebrow}</small><strong>{metadata.title}</strong><em>{metadata.detail}</em></span>
      <b aria-hidden="true">{expanded?"Свернуть":"Раскрыть"} <i>⌄</i></b>
    </button>
    {expanded&&<div className="v3-history-insights-content" id={panelId}>
      {chapter==="overview"&&<><V3HistoryTrustV210 history={history}/><V3HistoryCoverageV203 history={history}/></>}
      {!canCompute&&<p className="v3-history-insights-gate" role="status">Расчётные блоки скрыты: {quality.reason??"история содержит конфликтные даты TWR"}. Проверьте источник и целостность ряда. Полнота полей сама по себе не подтверждает корректность доходности.</p>}
      {canCompute&&chapter==="overview"&&<><V3CapitalBridgeV204 history={history}/><V3ValueHighWaterV209 history={history}/></>}
      {canCompute&&chapter==="return"&&<><V3ReturnQuartilesV207 history={history}/><V3RollingRangeV208 history={history}/></>}
      {canCompute&&chapter==="market"&&<><V3BenchmarkHitRateV205 history={history}/><V3BenchmarkCaptureV206 history={history}/></>}
      <p className="v3-history-insights-method">Только подтверждённые наблюдения. Пропущенные значения не заменяются нулями; статистика не является прогнозом или торговой рекомендацией.</p>
    </div>}
  </section>;
}
