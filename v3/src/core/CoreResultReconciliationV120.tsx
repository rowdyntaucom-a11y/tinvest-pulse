import{buildResultReconciliationV120}from"./resultReconciliationModelV120";import"./coreResultReconciliationV120.css";
const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0,signDisplay:"exceptZero"});
const money=(v:number)=>rub.format(v)+" ₽";
export function CoreResultReconciliationV120({totalResult,openPositionPl,realizedPayouts,trusted}:{totalResult:number|null;openPositionPl:number|null;realizedPayouts:number|null;trusted:boolean}){
 const m=buildResultReconciliationV120({totalResult,openPositionPl,realizedPayouts,trusted});
 if(!m)return null;
 const rows=[
  {key:"open",label:"Открытые позиции",value:m.openPositionPl,share:m.openShareOfMagnitude,note:"брокерский P/L текущих позиций"},
  {key:"payout",label:"Полученные выплаты",value:m.realizedPayouts,share:m.payoutShareOfMagnitude,note:"подтверждённые купоны и дивиденды"},
  {key:"other",label:"Прочие реализованные эффекты",value:m.otherRealizedEffects,share:m.otherShareOfMagnitude,note:"остаток сверки: закрытые сделки, комиссии, налоги и прочие операции вместе"},
 ];
 return <section className="sb-result-reconcile-v120" aria-label="Сверка общего результата">
  <header><div><span>СВЕРКА РЕЗУЛЬТАТА</span><strong>Из чего складывается наблюдаемый итог</strong></div><b className={m.totalResult>=0?"up":"down"}>{money(m.totalResult)}</b></header>
  <p>Это бухгалтерская сверка уже наблюдаемых величин, а не атрибуция доходности. QVANIX не раскладывает остаток на комиссии, налоги и закрытые сделки без подтверждённых отдельных данных.</p>
  <div className="sb-result-reconcile-v120__rail" aria-hidden="true">{rows.map(row=><i key={row.key} data-kind={row.key} style={{flexGrow:Math.max(row.share??0,.5)}}/>)}</div>
  <div className="sb-result-reconcile-v120__rows">{rows.map(row=><article key={row.key}><div><span>{row.label}</span><strong className={row.value>0?"up":row.value<0?"down":""}>{money(row.value)}</strong></div><small>{row.note}</small><footer>{row.share==null?"нулевая база":Math.round(row.share)+"% абсолютной величины компонентов"}</footer></article>)}</div>
  <footer><span>Контроль суммы</span><b>{money(m.openPositionPl)} + {money(m.realizedPayouts)} + {money(m.otherRealizedEffects)} = {money(m.componentsTotal)}</b><small>Знаки сохранены. Доли выше используют абсолютные величины только для визуального масштаба.</small></footer>
 </section>;
}
