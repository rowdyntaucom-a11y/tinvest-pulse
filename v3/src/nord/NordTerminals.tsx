import type{ReactNode}from"react";

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});

type Leader={ticker:string;weight:number;currentValue:number};

export function NordAssetsTerminal({total,count,top3,positive,leaders}:{total:number;count:number;top3:number;positive:number;leaders:Leader[]}){
 return <section className="nord-terminal nord-terminal--assets" aria-label="NORD · строй активов">
  <header className="nord-terminal__head"><div><span>FORMATION BOARD // LIVE</span><strong>Строй капитала</strong><small>Состав и концентрация без торговых сигналов</small></div><i aria-hidden="true">ᛟ</i></header>
  <div className="nord-assets-board">
   <div className="nord-assets-board__shield" aria-label={"Топ-3 занимают "+pct.format(top3)+"% портфеля"} style={{"--nord-concentration":Math.max(0,Math.min(100,top3))+"%"} as React.CSSProperties}>
    <i/><i/><b>{pct.format(top3)}%</b><span>TOP-3</span>
   </div>
   <div className="nord-assets-board__capital"><span>Капитал</span><strong>{rub.format(total)} ₽</strong><small>{count} позиций · {positive} в плюсе по broker P/L</small></div>
   <div className="nord-assets-board__roster">
    {leaders.length?leaders.map((x,index)=><div key={x.ticker}><i>{String(index+1).padStart(2,"0")}</i><span><b>{x.ticker}</b><small>{pct.format(x.weight*100)}% · {rub.format(x.currentValue)} ₽</small></span><em style={{width:Math.min(100,Math.max(5,x.weight*100))+"%"}}/></div>):<div className="is-empty"><span>Нет подтверждённых позиций</span></div>}
   </div>
  </div>
 </section>;
}

export function NordAnalysisTerminal({maxDrawdown,effective,largestTicker,largestWeight,positive,totalPositions,top3}:{maxDrawdown:number|null;effective:number|null;largestTicker:string|null;largestWeight:number|null;positive:number;totalPositions:number;top3:number}){
 const risk=maxDrawdown==null?0:Math.min(100,Math.abs(maxDrawdown));
 return <section className="nord-terminal nord-terminal--analysis" aria-label="NORD · рунная навигация">
  <header className="nord-terminal__head"><div><span>RUNE COMPASS // LIVE</span><strong>Карта риска</strong><small>Просадка, концентрация и ширина текущего P/L</small></div><i aria-hidden="true">ᚱ</i></header>
  <div className="nord-analysis-map">
   <div className="nord-analysis-map__scope" style={{"--nord-risk":risk+"%"} as React.CSSProperties} aria-label={maxDrawdown==null?"Просадка недоступна":"Максимальная просадка "+pct.format(maxDrawdown)+"%"}>
    <i/><i/><i/><span/><b>{maxDrawdown==null?"—":pct.format(maxDrawdown)+"%"}</b><small>MAX DD</small>
   </div>
   <div className="nord-analysis-map__coordinates">
    <div><span>Концентрация</span><strong>{effective==null?"—":effective.toLocaleString("ru-RU",{maximumFractionDigits:2})+" экв."}</strong><small>effective positions</small></div>
    <div><span>Крупнейшая</span><strong>{largestTicker??"—"}</strong><small>{largestWeight==null?"—":pct.format(largestWeight)+"%"}</small></div>
    <div><span>Топ-3</span><strong>{pct.format(top3)}%</strong><small>капитала</small></div>
    <div><span>Ширина</span><strong>{positive}/{totalPositions}</strong><small>в плюсе</small></div>
   </div>
   <div className="nord-analysis-map__scan" aria-hidden="true"><i/><i/></div>
  </div>
 </section>;
}

export function NordIncomeTerminal({total,monthly,annual,flowMonths,annualShare}:{total:number|null;monthly:number|null;annual:number|null;flowMonths:number|null;annualShare:number|null}){
 const money=(v:number|null)=>v==null?"—":rub.format(v)+" ₽";
 return <section className="nord-terminal nord-terminal--income" aria-label="NORD · северная казна">
  <header className="nord-terminal__head"><div><span>TREASURY CURRENT // LIVE</span><strong>Казна</strong><small>Только фактически полученные купоны и дивиденды</small></div><i aria-hidden="true">ᚠ</i></header>
  <div className="nord-income-current">
   <div className="nord-income-current__total"><span>Получено</span><strong>{money(total)}</strong><small>за доступную историю операций</small></div>
   <div className="nord-income-current__river" aria-hidden="true"><i/><i/><i/><i/><b>ᚠ</b></div>
   <div className="nord-income-current__metrics">
    <div><span>Средний месяц</span><strong>{money(monthly)}</strong></div>
    <div><span>Годовой эквивалент</span><strong>{money(annual)}</strong></div>
    <div><span>Получено / месяц</span><strong>{flowMonths==null?"—":flowMonths.toLocaleString("ru-RU",{maximumFractionDigits:1})+"×"}</strong></div>
    <div><span>Темп / капитал</span><strong>{annualShare==null?"—":pct.format(annualShare)+"%"}</strong></div>
   </div>
  </div>
 </section>;
}

export function NordGoalTerminal({target,current,progress,remaining,onEdit,editing,editor}:{target:number|null;current:number|null;progress:number|null;remaining:number|null;onEdit:()=>void;editing:boolean;editor?:ReactNode}){
 const targetText=target==null?"Не задан":rub.format(target)+" ₽",currentText=current==null?"—":rub.format(current)+" ₽";
 const marker=progress==null?0:Math.min(100,Math.max(0,progress));
 return <section className="nord-terminal nord-terminal--goal" aria-label="NORD · путь капитала">
  <header className="nord-terminal__head"><div><span>EXPEDITION PATH // USER</span><strong>Маршрут капитала</strong><small>Ориентир пользователя, не прогноз доходности</small></div><i aria-hidden="true">ᛏ</i></header>
  {editing&&editor?<div className="nord-goal-route__editor">{editor}</div>:<div className="nord-goal-route">
   <div className="nord-goal-route__target"><span>Цель</span><strong>{targetText}</strong><button type="button" onClick={onEdit}>{target?"Изменить":"Задать цель"}</button></div>
   <div className="nord-goal-route__track" style={{"--nord-progress":marker+"%"} as React.CSSProperties}>
    <i/><i/><i/><i/><b/><em/>
    <span className="nord-goal-route__start"><small>Сейчас</small><strong>{currentText}</strong></span>
    <span className="nord-goal-route__finish"><small>Ориентир</small><strong>{targetText}</strong></span>
   </div>
   <div className="nord-goal-route__facts">
    <div><span>Прогресс</span><strong>{progress==null?"—":pct.format(progress)+"%"}</strong></div>
    <div><span>Осталось</span><strong>{remaining==null?"—":rub.format(remaining)+" ₽"}</strong></div>
   </div>
  </div>}
 </section>;
}
