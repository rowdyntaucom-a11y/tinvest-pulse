import{lazy,Suspense,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{V3DetailMode,V3Shell}from"../app/model";
import{V3MetricHelp}from"../help/V3MetricHelp";
import{V3SectionSelector}from"../navigation/V3SectionSelector";

const V3IncomeDepth=lazy(()=>import("./V3IncomeDepth").then(m=>({default:m.V3IncomeDepth})));
const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const INCOME_VIEWS=[
  {value:"overview",label:"Обзор",description:"Полученный пассивный доход, среднемесячный поток и понятный контекст без прогноза."},
  {value:"depth",label:"Календарь и факт",description:"Подтверждённые будущие выплаты, помесячный факт и источники дохода."},
] as const;
type IncomeView=typeof INCOME_VIEWS[number]["value"];

export type V3IncomeModel={total:number|null;monthly:number|null;annual:number|null;portfolioValue:number|null;trusted:boolean};

export function V3Income({model,shell,mode,positions,onOpenAsset}:{model:V3IncomeModel;shell:V3Shell;mode:V3DetailMode;positions:PositionSnapshot[];onOpenAsset?:(position:PositionSnapshot)=>void}){
  const[view,setView]=useState<IncomeView>("overview");
  const m=(v:number|null)=>v==null?"—":rub.format(v)+" ₽",flowMonths=model.trusted&&model.total!=null&&model.monthly!=null&&model.monthly>0?model.total/model.monthly:null,annualShare=model.trusted&&model.annual!=null&&model.portfolioValue!=null&&model.portfolioValue>0?model.annual/model.portfolioValue*100:null,scale=flowMonths==null?0:Math.min(100,flowMonths/12*100);
  const overview=mode==="simple"||view==="overview";
  return <main className="v3-income" data-shell={shell}>
    <header className="v3-page-head"><span>ДЕНЕЖНЫЙ ПОТОК</span><h1>Доход</h1><p>{model.trusted?"Купоны и дивиденды · без пополнений":"Доход скрыт до подтверждения данных"}</p></header>
    <section className="v3-income-hero"><div><span>Получено пассивно <V3MetricHelp topic="passiveIncome"/></span><strong>{m(model.total)}</strong><small>За доступную историю операций</small></div><i aria-hidden="true">↗</i></section>
    <section className="v3-income-grid"><article><span>Среднее в месяц</span><strong>{m(model.monthly)}</strong><small>Фактический средний поток</small></article><article><span>Темп в год <V3MetricHelp topic="annualizedIncome"/></span><strong>{m(model.annual)}</strong><small>Годовой эквивалент среднего</small></article></section>
    {model.trusted&&<section className="v3-income-context"><div><span>Получено / средний месяц</span><strong>{flowMonths==null?"—":flowMonths.toLocaleString("ru-RU",{maximumFractionDigits:1})+"×"}</strong></div><i aria-label={flowMonths==null?"Соотношение недоступно":`Полученная сумма равна примерно ${flowMonths.toLocaleString("ru-RU",{maximumFractionDigits:1})} среднемесячного потока`}><b style={{width:scale+"%"}}/></i><small>Отношение полученной суммы к текущему среднемесячному показателю; шкала ограничена 12×. Это не длительность истории и не прогноз будущего дохода.</small></section>}
    {mode==="detailed"&&model.trusted&&<V3SectionSelector label="Раздел дохода" value={view} onChange={setView} options={INCOME_VIEWS}/>} 
    {mode==="detailed"&&overview&&model.trusted&&<section className="v3-income-ratios"><article><span>Средний поток / капитал</span><strong>{annualShare==null?"—":annualShare.toLocaleString("ru-RU",{maximumFractionDigits:1})+"%"}</strong><small>Годовой эквивалент среднего ÷ текущая стоимость портфеля</small></article><article><span>Получено / средний месяц</span><strong>{flowMonths==null?"—":flowMonths.toLocaleString("ru-RU",{maximumFractionDigits:1})+"×"}</strong><small>Сравнение накопленного пассивного дохода со среднемесячным показателем, не число месяцев истории</small></article></section>}
    {mode==="detailed"&&overview&&<section className="v3-income-detail"><h2>Как читать</h2><p>Главное число — уже полученные купоны и дивиденды. Среднее в месяц описывает наблюдавшийся поток, а годовой темп лишь масштабирует это среднее: это не обещание будущих выплат. Пополнения счёта не считаются доходом.</p></section>}
    {mode==="detailed"&&model.trusted&&view==="depth"&&<Suspense fallback={<section className="v3-income-detail"><p>Открываем подробный календарь выплат…</p></section>}><V3IncomeDepth positions={positions} onOpenAsset={onOpenAsset}/></Suspense>}
  </main>;
}
