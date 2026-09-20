import{useEffect,useMemo,useState}from"react";
import{loadPayoutCalendar,type PayoutCalendar,type PayoutEvent}from"../../../v2/src/lib/payoutsApi";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{buildV3IncomeDepth}from"./incomeDepth";
import"../styles/incomePreview.css";

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const rub2=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short"});
function amount(event:PayoutEvent|null){return event&&typeof event.gross==="number"&&Number.isFinite(event.gross)&&event.gross>0?event.gross:null}
function kind(event:PayoutEvent|null){const value=String(event?.kind||"").toUpperCase();return value==="COUPON"?"Купон":value==="DIVIDEND"?"Дивиденд":"Выплата"}

export function V3IncomePreview({positions}:{positions:PositionSnapshot[]}){
  const[calendar,setCalendar]=useState<PayoutCalendar|null>(null),[loading,setLoading]=useState(true),[loadedAt,setLoadedAt]=useState(()=>Date.now());
  useEffect(()=>{let active=true;setLoading(true);void loadPayoutCalendar().then(value=>{if(active){setCalendar(value);setLoadedAt(Date.now());setLoading(false)}}).catch(()=>{if(active){setCalendar(null);setLoadedAt(Date.now());setLoading(false)}});return()=>{active=false}},[]);
  const depth=useMemo(()=>calendar?buildV3IncomeDepth(calendar,positions,loadedAt):null,[calendar,positions,loadedAt]);
  if(loading)return <section className="v3-income-preview is-loading" aria-label="Ближайшие выплаты"><span>КАЛЕНДАРЬ ВЫПЛАТ</span><strong>Синхронизация…</strong><small>Проверяем официальное расписание текущих позиций</small></section>;
  if(!calendar||!depth)return <section className="v3-income-preview is-gated" aria-label="Ближайшие выплаты"><span>КАЛЕНДАРЬ ВЫПЛАТ</span><strong>Сейчас недоступен</strong><small>Фактический доход выше остаётся отдельным подтверждённым показателем.</small></section>;
  if(!depth.payoutTrust.safeToCalculate)return <section className="v3-income-preview is-gated" aria-label="Ближайшие выплаты"><span>КАЛЕНДАРЬ ВЫПЛАТ</span><strong>Расписание не подтверждено</strong><small>{depth.payoutTrust.shortReason}. Будущие суммы скрыты fail-closed.</small></section>;
  const next=depth.trustedIncome.taxCalendar.next??null,nextAmount=amount(next),forecast=calendar.forecast.gross;
  return <section className="v3-income-preview" aria-label="Ближайшие выплаты"><div className="v3-income-preview-head"><span>КАЛЕНДАРЬ ВЫПЛАТ</span><small>официальное расписание · 12М</small></div><div className="v3-income-preview-grid"><article><span>Следующая</span><strong>{next?(next.ticker||next.name):"Нет события"}</strong><small>{next?dateFmt.format(new Date(next.date))+" · "+kind(next):"В проверенном окне событий нет"}</small></article><article><span>Сумма события</span><strong>{nextAmount==null?"—":rub2.format(nextAmount)+" ₽"}</strong><small>{nextAmount==null?"источник не дал пригодную сумму":"до налога"}</small></article><article><span>12М расписание</span><strong>{Number.isFinite(forecast)?rub.format(forecast)+" ₽":"—"}</strong><small>{calendar.forecast.count} подтверждённых событий</small></article></div><small className="v3-income-preview-note">Будущее расписание не складывается с уже полученным фактом и не является прогнозом доходности. Полный помесячный календарь доступен в подробном режиме.</small></section>;
}
