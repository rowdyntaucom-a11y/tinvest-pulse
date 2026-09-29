import{useEffect,useMemo,useState}from"react";
import"../styles/glossaryHelp.css";

export type V3GlossaryKey="twr"|"xirr"|"cagr"|"pnl"|"var"|"cvar"|"beta"|"trackingError"|"basis"|"margin"|"drift"|"coverage"|"ytm"|"duration";

type Entry={title:string;simple:string;detail:string};
export const V3_GLOSSARY:Record<V3GlossaryKey,Entry>={
 twr:{title:"TWR",simple:"Доходность портфеля без искажения от пополнений и выводов.",detail:"Time-Weighted Return нейтрализует внешние денежные потоки и удобна для сравнения результата стратегии с индексом за тот же период."},
 xirr:{title:"XIRR",simple:"Личная годовая доходность с учётом дат и размеров пополнений и выводов.",detail:"Money-weighted показатель: результат зависит от того, когда и сколько денег фактически было внесено или выведено."},
 cagr:{title:"CAGR",simple:"Среднегодовой темп изменения капитала за доступный период.",detail:"Это сглаженная годовая скорость изменения между начальным и конечным значением. Она не описывает путь и просадки внутри периода."},
 pnl:{title:"P/L",simple:"Текущая прибыль или убыток по открытым позициям.",detail:"Это не то же самое, что TWR или XIRR: P/L зависит от текущих открытых позиций и их себестоимости."},
 var:{title:"VaR",simple:"Историческая оценка неблагоприятного движения при выбранном уровне доверия.",detail:"QVANIX считает её только на доступной подтверждённой истории. Это статистика прошлого окна, а не прогноз максимального убытка."},
 cvar:{title:"CVaR",simple:"Средняя величина наиболее плохих наблюдений за пределом VaR.",detail:"Показывает глубину исторического хвоста. Не является гарантированной оценкой будущих потерь."},
 beta:{title:"Beta",simple:"Чувствительность доходности портфеля к движению выбранного индекса.",detail:"Оценивается на общей подтверждённой истории портфеля и IMOEX. Малое покрытие истории ограничивает интерпретацию."},
 trackingError:{title:"Tracking Error",simple:"Насколько доходность портфеля отклонялась от индекса по периодам.",detail:"Это разброс относительной доходности на общей истории, а не оценка качества стратегии сама по себе."},
 basis:{title:"Basis",simple:"Разница между ценой фьючерса и базового актива.",detail:"В QVANIX basis и его годовой эквивалент — арифметическая диагностика введённых данных, не прогноз и не торговый сигнал."},
 margin:{title:"ГО",simple:"Гарантийное обеспечение, указанное для фьючерсного контракта.",detail:"Расчётное плечо использует введённое ГО. Реальные требования биржи и брокера могут меняться и должны подтверждаться отдельно."},
 drift:{title:"Drift / отклонение",simple:"Разница между фактической и заданной пользователем долей класса активов.",detail:"Допуск показывает границу внимания к структуре. QVANIX не превращает отклонение в команду купить или продать конкретную бумагу."},
 coverage:{title:"Покрытие",simple:"Какая доля необходимых данных подтверждена доступными источниками.",detail:"Низкое или частичное покрытие означает, что часть расчёта или календаря может быть скрыта либо неполна."},
 ytm:{title:"YTM",simple:"Доходность облигации к погашению по текущей цене и известным денежным потокам.",detail:"Для сложных выпусков показатель зависит от полноты подтверждённых параметров. Он не гарантирует фактическую будущую доходность."},
 duration:{title:"Modified duration",simple:"Приближённая чувствительность цены облигации к изменению доходности.",detail:"QVANIX показывает её только там, где денежный поток позволяет корректный расчёт; для сложных выпусков значение остаётся пустым."},
};

export function V3GlossaryHelp({terms,label="Что означают показатели?"}:{terms:readonly V3GlossaryKey[];label?:string}){
 const[open,setOpen]=useState(false);
 const entries=useMemo(()=>terms.map(key=>({key,...V3_GLOSSARY[key]})),[terms]);
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[open]);
 return <>
  <button type="button" className="v3-glossary-help__trigger" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><i aria-hidden="true">i</i><span>{label}</span></button>
  {open&&<div className="v3-glossary-help__backdrop" role="presentation" onClick={()=>setOpen(false)}>
   <section className="v3-glossary-help" role="dialog" aria-modal="true" aria-label="Пояснения к показателям" onClick={e=>e.stopPropagation()}>
    <header><div><span>QVANIX EXPLAIN</span><strong>Показатели без жаргона</strong><small>Короткое объяснение сверху, методика — ниже.</small></div><button type="button" aria-label="Закрыть пояснения" onClick={()=>setOpen(false)}>×</button></header>
    <div className="v3-glossary-help__list">{entries.map(entry=><details key={entry.key}><summary><span><b>{entry.title}</b><small>{entry.simple}</small></span><i aria-hidden="true">⌄</i></summary><p>{entry.detail}</p></details>)}</div>
    <footer>Пояснения описывают методику и смысл метрик. Они не являются инвестиционной рекомендацией или прогнозом.</footer>
   </section>
  </div>}
 </>;
}
