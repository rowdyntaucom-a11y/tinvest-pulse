import{useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{V3HomeViewModel}from"../home/homeViewModel";
import type{V3IncomeModel}from"../income/V3Income";
import"./coreDecisionCockpit.css";

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const money=(v:number|null)=>v==null?"—":rub.format(Math.round(v))+" ₽";
type Horizon=1|3|5|10;

export function CoreDecisionCockpit({home,positions,income}:{home:V3HomeViewModel;positions:PositionSnapshot[];income:V3IncomeModel}){
 const[monthly,setMonthly]=useState(12000),[growth,setGrowth]=useState(8),[horizon,setHorizon]=useState<Horizon>(5);
 const start=Math.max(0,home.value??0);
 const calc=useMemo(()=>{let capital=start,contributed=0;const months=horizon*12,rate=Math.pow(1+growth/100,1/12)-1;const points:{year:number;capital:number;contributed:number}[]=[];for(let i=1;i<=months;i++){capital=capital*(1+rate)+monthly;contributed+=monthly;if(i%12===0)points.push({year:i/12,capital,contributed});}return{capital,contributed,marketEffect:capital-start-contributed,points}},[start,monthly,growth,horizon]);
 const total=positions.reduce((s,x)=>s+x.currentValue,0),ranked=[...positions].sort((a,b)=>b.currentValue-a.currentValue),top1=total>0?(ranked[0]?.currentValue??0)/total*100:0,top3=total>0?ranked.slice(0,3).reduce((s,x)=>s+x.currentValue,0)/total*100:0;
 const classes=new Map<string,number>();for(const x of positions){const key=(x.instrumentType||"other").toLowerCase();classes.set(key,(classes.get(key)??0)+x.currentValue)}
 const classRows=[...classes.entries()].sort((a,b)=>b[1]-a[1]);
 return <div className="qc-decision">
  <section className="qc-health"><header><div><span>SNOWBALL+ CONTROL</span><h2>Карта портфеля</h2></div><small>LIVE · READ ONLY</small></header>
   <div className="qc-health-grid"><article><span>Позиций</span><strong>{positions.length}</strong><small>{classRows.length} классов</small></article><article><span>Топ-1</span><strong>{pct.format(top1)}%</strong><small>концентрация</small></article><article><span>Топ-3</span><strong>{pct.format(top3)}%</strong><small>капитала</small></article><article><span>Пассивный доход</span><strong>{money(income.total)}</strong><small>{money(income.monthly)} / мес</small></article></div>
   <div className="qc-allocation">{classRows.slice(0,6).map(([name,value])=><div key={name}><span>{name}</span><i><b style={{width:(total?Math.min(100,value/total*100):0)+"%"}}/></i><strong>{total?pct.format(value/total*100):"0"}%</strong></div>)}</div>
  </section>
  <section className="qc-plan"><header><div><span>СЦЕНАРНЫЙ ПЛАН</span><h2>Капитал и пополнения</h2></div><small>не прогноз</small></header>
   <div className="qc-plan-controls"><label>Пополнение / мес.<input inputMode="numeric" type="number" min="0" step="1000" value={monthly} onChange={e=>setMonthly(Math.max(0,Number(e.target.value)||0))}/></label><label>Сценарная доходность<input inputMode="decimal" type="number" min="-50" max="100" step="0.5" value={growth} onChange={e=>setGrowth(Math.max(-50,Math.min(100,Number(e.target.value)||0)))}/></label><div className="qc-horizons">{([1,3,5,10] as Horizon[]).map(y=><button key={y} className={horizon===y?"active":""} onClick={()=>setHorizon(y)}>{y}г</button>)}</div></div>
   <div className="qc-plan-summary"><article><span>Старт</span><strong>{money(start)}</strong></article><article><span>Новые взносы</span><strong>{money(calc.contributed)}</strong></article><article><span>Сценарный эффект</span><strong>{money(calc.marketEffect)}</strong></article><article><span>Капитал через {horizon}г</span><strong>{money(calc.capital)}</strong></article></div>
   <div className="qc-plan-bars">{calc.points.map(x=>{const max=Math.max(calc.capital,1);return <div key={x.year}><span>{x.year}г</span><i><b style={{height:Math.max(4,x.capital/max*100)+"%"}}/></i><strong>{rub.format(Math.round(x.capital/1000))}k</strong></div>})}</div>
   <p>Модель использует постоянное ежемесячное пополнение и выбранную пользователем постоянную годовую ставку. Это сценарий для планирования, а не обещание или прогноз доходности.</p>
  </section>
 </div>
}