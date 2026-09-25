import{useMemo}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{clampPercent}from"../data/units";
import{buildPortfolioReport,type PortfolioReportRow,type PortfolioReportSlice}from"./portfolioReport";
import"../styles/samuraiReportDepth.css";

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});

function signedMoney(value:number){
 const sign=value>0?"+":value<0?"−":"";
 return sign+rub.format(Math.abs(value))+" ₽";
}

function Row({row}:{row:PortfolioReportRow}){
 return <article className="sam-report-depth__row">
  <div><strong>{row.label}</strong><small>{row.positionCount} поз.</small></div>
  <div><span>Текущая</span><b>{rub.format(row.currentValue)} ₽</b></div>
  <div><span>Вложено</span><b>{rub.format(row.costBasis)} ₽</b></div>
  <div><span>Broker P/L</span><b className={row.pnl>0?"is-positive":row.pnl<0?"is-negative":""}>{signedMoney(row.pnl)}</b></div>
  <i aria-hidden="true"><b style={{width:clampPercent(row.share*100)+"%"}}/></i>
  <em>{pct.format(row.share*100)}%</em>
 </article>;
}

function Slice({slice,kind}:{slice:PortfolioReportSlice;kind:"category"|"currency"}){
 const unknownShare=slice.coverageRatio==null?null:Math.max(0,1-slice.coverageRatio);
 return <div className="sam-report-depth__slice">
  <div className="sam-report-depth__coverage">
   <span>{kind==="category"?"Покрытие категорий":"Покрытие валют"}</span>
   <strong>{slice.coverageRatio==null?"—":pct.format(slice.coverageRatio*100)+"%"}</strong>
   <small>{kind==="category"?"Класс выводится только из нормализованного типа инструмента.":"Валюта учитывается только когда она подтверждена метаданными инструмента."}</small>
  </div>
  <div className="sam-report-depth__rows">
   {slice.rows.length?slice.rows.map(row=><Row key={row.key} row={row}/>):<div className="sam-report-depth__empty">Подтверждённых строк для этого среза пока нет.</div>}
   {slice.unclassifiedValue>0&&<article className="sam-report-depth__unknown">
    <div><strong>Без подтверждённой классификации</strong><small>{kind==="currency"?"QVANIX не предполагает валюту по бирже или названию бумаги.":"Неизвестное остаётся неизвестным."}</small></div>
    <b>{rub.format(slice.unclassifiedValue)} ₽{unknownShare==null?"":" · "+pct.format(unknownShare*100)+"%"}</b>
   </article>}
  </div>
 </div>;
}

export function V3PortfolioReportDepth({positions}:{positions:PositionSnapshot[]}){
 const model=useMemo(()=>buildPortfolioReport(positions),[positions]);
 const investedDelta=model.totalValue-model.totalCostBasis;
 const reconciliationDelta=model.totalPnl-investedDelta;
 const reconciled=Math.abs(reconciliationDelta)<=Math.max(.01,Math.max(Math.abs(model.totalPnl),Math.abs(investedDelta))*.000001);

 return <section className="sam-report-depth" aria-label="Отчёт, категории и валюты">
  <section id="sam-assets-report" className="sam-report-depth__block">
   <header className="sam-report-depth__head">
    <div><span>08 · REPORT</span><h3>Отчёт портфеля</h3><p>Текущая стоимость, вложенная база и накопленный broker P/L. Это отчёт по текущему составу, а не TWR и не дневная доходность.</p></div>
    <i aria-hidden="true">帳</i>
   </header>
   <div className="sam-report-depth__summary">
    <article><span>Текущая стоимость</span><strong>{rub.format(model.totalValue)} ₽</strong><small>{model.totalPositions} позиций</small></article>
    <article><span>Cost basis</span><strong>{rub.format(model.totalCostBasis)} ₽</strong><small>по доступной средней цене</small></article>
    <article><span>Broker P/L</span><strong className={model.totalPnl>0?"is-positive":model.totalPnl<0?"is-negative":""}>{signedMoney(model.totalPnl)}</strong><small>накопленный контекст позиций</small></article>
    <article><span>Сверка базы</span><strong>{reconciled?"OK":"РАСХОЖДЕНИЕ"}</strong><small>{reconciled?"P/L согласуется с value − basis":"Δ "+signedMoney(reconciliationDelta)}</small></article>
   </div>
   {!reconciled&&<p className="sam-report-depth__warning">Broker P/L и разница «текущая стоимость − cost basis» расходятся. QVANIX показывает оба факта и не подменяет один другим.</p>}
   <p className="sam-report-depth__method">Отчёт не использует предположения о пропущенных операциях, налогах или корпоративных действиях. Историческая доходность остаётся в TWR/XIRR, а здесь — текущий срез состава.</p>
  </section>

  <section id="sam-assets-categories" className="sam-report-depth__block">
   <header className="sam-report-depth__title"><div><span>09 · КАТЕГОРИИ</span><h3>Разрез по классам</h3></div><small>стоимость · база · P/L</small></header>
   <Slice slice={model.category} kind="category"/>
   <p className="sam-report-depth__method">Категории здесь означают нормализованные классы активов: акции, облигации, фонды, валюта, фьючерсы и «другое». Отраслевой срез остаётся отдельной главой выше.</p>
  </section>

  <section id="sam-assets-currencies" className="sam-report-depth__block">
   <header className="sam-report-depth__title"><div><span>10 · ВАЛЮТЫ</span><h3>Валютная структура</h3></div><small>только подтверждённые метаданные</small></header>
   <Slice slice={model.currency} kind="currency"/>
   <p className="sam-report-depth__method">Если валюта инструмента отсутствует в текущем нормализованном контракте, позиция остаётся в «без подтверждённой классификации». RUB не подставляется автоматически.</p>
  </section>
 </section>;
}
