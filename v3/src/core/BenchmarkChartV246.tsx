import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import type{BenchmarkPeriodComparison}from"../analysis/benchmarkPeriodsV244";
import{buildBenchmarkChart}from"../analysis/benchmarkChartV246";
export function BenchmarkChartV246({history,comparison}:{history:HistoryPoint[];comparison:BenchmarkPeriodComparison}){
 const model=buildBenchmarkChart(history,comparison);
 if(!model)return null;
 const fmt=(n:number)=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1}).format(n);
 return <figure className="qc-verified-chart" aria-label="График динамики портфеля и IMOEX на одинаковых датах">
 <figcaption><strong>Динамика относительно 100</strong><span className="qc-chart-legend"><span className="qc-legend-portfolio">Портфель</span><span className="qc-legend-imoex">IMOEX</span></span></figcaption>
 <svg viewBox="0 0 620 210" role="img" aria-label={"Динамика: портфель "+fmt(model.points.at(-1)!.portfolio)+", индекс IMOEX "+fmt(model.points.at(-1)!.imoex)+". Период "+model.startDate+" — "+model.endDate}>
 <title>Сравнение портфеля и IMOEX с начальным уровнем 100</title>
 <line x1="48" x2="604" y1={model.referenceY} y2={model.referenceY} className="qc-chart-base"/>
 <text x="2" y={model.referenceY-5} className="qc-chart-axis">100</text>
 <text x="2" y="19" className="qc-chart-axis">{fmt(model.max)}</text>
 <text x="2" y="178" className="qc-chart-axis">{fmt(model.min)}</text>
 {model.portfolioSegments.map((d,i)=><path key={"p"+i} d={d} className="qc-chart-portfolio"/>)}
 {model.imoexSegments.map((d,i)=><path key={"i"+i} d={d} className="qc-chart-imoex"/>)}
 {model.points.map((p,i)=><g key={p.date}><circle cx={p.x} cy={p.yPortfolio} r={i===0||i===model.points.length-1?3.4:2} className="qc-chart-dot-p"/><circle cx={p.x} cy={p.yImoex} r={i===0||i===model.points.length-1?3.4:2} className="qc-chart-dot-i"/></g>)}
 <text x="48" y="205" className="qc-chart-axis">{model.startDate}</text>
 <text x="604" y="205" textAnchor="end" className="qc-chart-axis">{model.endDate}</text>
 </svg>
 <small>Одинаковые даты и стартовый уровень 100. {model.gapCount?"Разрывы линии: "+model.gapCount+" (нет наблюдений более 45 дней).":"Пропущенные даты не дорисовываются."}</small>
 </figure>;
}
