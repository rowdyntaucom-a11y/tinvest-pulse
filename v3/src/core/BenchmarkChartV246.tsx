import{useMemo,useState}from"react";
import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import type{BenchmarkPeriodComparison}from"../analysis/benchmarkPeriodsV244";
import{buildBenchmarkChart}from"../analysis/benchmarkChartV246";
import{benchmarkChartToCsv,inspectBenchmarkDate,nearestBenchmarkPointIndex,sampleBenchmarkMarkers}from"../analysis/benchmarkExplorerV247";

const localeNumber=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
const signed=(n:number,unit:string)=>((n>0?"+":"")+localeNumber.format(n)+unit);
export function BenchmarkChartV246({history,comparison}:{history:HistoryPoint[];comparison:BenchmarkPeriodComparison}){
 const model=useMemo(()=>buildBenchmarkChart(history,comparison),[history,comparison]);
 const[selectedDate,setSelectedDate]=useState<string|null>(null);
 const inspection=useMemo(()=>inspectBenchmarkDate(model,selectedDate),[model,selectedDate]);
 const markers=useMemo(()=>sampleBenchmarkMarkers(model?.points??[],72),[model]);
 if(!model||!inspection)return null;
 const fmt=(n:number)=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1}).format(n);
 const highlighted=model.points[inspection.index];
 const inspectByOffset=(step:number)=>setSelectedDate(model.points[Math.min(model.points.length-1,Math.max(0,inspection.index+step))].date);
 const saveCsv=()=>{
  const csv=benchmarkChartToCsv(model);if(!csv)return;
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob),link=document.createElement("a");
  try{link.href=url;link.download="qvanix-imoex-"+model.startDate+"-"+model.endDate+".csv";document.body.appendChild(link);link.click()}finally{link.remove();URL.revokeObjectURL(url)}
 };
 return <figure className="qc-verified-chart" aria-label="График динамики портфеля и IMOEX на одинаковых датах">
 <figcaption><strong>Динамика относительно 100</strong><span className="qc-chart-legend"><span className="qc-legend-portfolio">Портфель</span><span className="qc-legend-imoex">IMOEX</span></span></figcaption>
 <svg viewBox="0 0 620 210" role="img" aria-label={"Интерактивный график: портфель "+fmt(model.points.at(-1)!.portfolio)+", индекс IMOEX "+fmt(model.points.at(-1)!.imoex)+". Период "+model.startDate+" — "+model.endDate}
 onPointerUp={event=>{const bounds=event.currentTarget.getBoundingClientRect();if(bounds.width<=0)return;const point=nearestBenchmarkPointIndex(model.points,(event.clientX-bounds.left)*620/bounds.width);if(point>=0)setSelectedDate(model.points[point].date)}}>
 <title>Сравнение портфеля и IMOEX с начальным уровнем 100. Выберите дату касанием или ползунком ниже.</title>
 <line x1="48" x2="604" y1={model.referenceY} y2={model.referenceY} className="qc-chart-base"/>
 <text x="2" y={model.referenceY-5} className="qc-chart-axis">100</text>
 <text x="2" y="19" className="qc-chart-axis">{fmt(model.max)}</text>
 <text x="2" y="178" className="qc-chart-axis">{fmt(model.min)}</text>
 {model.portfolioSegments.map((d,i)=><path key={"p"+i} d={d} className="qc-chart-portfolio"/>)}
 {model.imoexSegments.map((d,i)=><path key={"i"+i} d={d} className="qc-chart-imoex"/>)}
 {markers.map(point=><g key={point.date}><circle cx={point.x} cy={point.yPortfolio} r="2" className="qc-chart-dot-p"/><circle cx={point.x} cy={point.yImoex} r="2" className="qc-chart-dot-i"/></g>)}
 <line x1={highlighted.x} y1="15" x2={highlighted.x} y2="179" className="qc-chart-cursor"/>
 <circle cx={highlighted.x} cy={highlighted.yPortfolio} r="5" className="qc-chart-selected-p"/>
 <circle cx={highlighted.x} cy={highlighted.yImoex} r="5" className="qc-chart-selected-i"/>
 <text x="48" y="205" className="qc-chart-axis">{model.startDate}</text>
 <text x="604" y="205" textAnchor="end" className="qc-chart-axis">{model.endDate}</text>
 </svg>
 <div className="qc-chart-navigation">
 <button type="button" aria-label="Предыдущая подтверждённая дата" disabled={inspection.index===0} onClick={()=>inspectByOffset(-1)}>←</button>
 <label><span>Дата наблюдения · {inspection.index+1} / {model.points.length}</span><input type="range" min={0} max={model.points.length-1} step={1} value={inspection.index} aria-label="Выбрать подтверждённую дату на графике" onChange={event=>setSelectedDate(model.points[Number(event.currentTarget.value)].date)}/></label>
 <button type="button" aria-label="Следующая подтверждённая дата" disabled={inspection.index===model.points.length-1} onClick={()=>inspectByOffset(1)}>→</button>
 <button type="button" className="qc-chart-export" aria-label="Скачать проверенную историю портфеля и IMOEX в CSV" onClick={saveCsv}>CSV ↓</button>
 </div>
 <div className="qc-chart-observation" role="status" aria-live="polite" aria-atomic="true">
 <strong>{inspection.date}</strong>
 <div><span>Портфель <b>{signed(inspection.portfolioReturnPct,"%")}</b></span><span>IMOEX <b>{signed(inspection.imoexReturnPct,"%")}</b></span><span>Опережение <b>{signed(inspection.alphaPp," п.п.")}</b></span></div>
 {inspection.previousDate&&<small>С {inspection.previousDate}: портфель {signed(inspection.intervalPortfolioPct!,"%")}, IMOEX {signed(inspection.intervalImoexPct!,"%")}. {inspection.gapWarning?"Между наблюдениями больше 45 дней.":"Изменение между подтверждёнными датами."}</small>}
 </div>
 <small>Одинаковые даты и стартовый уровень 100. {model.gapCount?"Разрывы линии: "+model.gapCount+" (нет наблюдений более 45 дней).":"Пропущенные даты не дорисовываются."} Касание линии показывает ближайшее реальное наблюдение.</small>
 </figure>;
}
