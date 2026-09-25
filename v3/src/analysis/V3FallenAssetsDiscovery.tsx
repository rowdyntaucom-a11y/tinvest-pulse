import{useEffect,useMemo,useState}from"react";
import{loadAssetHistory,type AssetHistoryPayload}from"../../../v2/src/lib/assetHistoryApi";
import{scanFallenAssets,type DiscoveryWindow}from"./fallenAssetDiscovery";
import"../styles/samuraiFallenAssets.css";

const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const num=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
function p(value:number|null|undefined){
 if(typeof value!=="number"||!Number.isFinite(value))return"—";
 const sign=value>0?"+":"";
 return sign+pct.format(value*100)+"%";
}
function bucketLabel(value:"DEEP_30"|"DOWN_20"|"DOWN_10"|"NEAR_HIGH"){
 if(value==="DEEP_30")return"−30% и глубже";
 if(value==="DOWN_20")return"−20…−30%";
 if(value==="DOWN_10")return"−10…−20%";
 return"менее −10%";
}

export function V3FallenAssetsDiscovery(){
 const[window,setWindow]=useState<DiscoveryWindow>(12);
 const[payload,setPayload]=useState<AssetHistoryPayload|null>(null);
 const[loading,setLoading]=useState(true);
 useEffect(()=>{
  const controller=new AbortController();
  setLoading(true);
  void loadAssetHistory(controller.signal).then(setPayload).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[]);
 const scan=useMemo(()=>scanFallenAssets(payload?.series??[],window),[payload,window]);

 return <section className="sam-fallen" aria-label="Технический поиск просевших позиций">
  <header className="sam-fallen__head">
   <div><span>08 · TECHNICAL DISCOVERY</span><h2>Просадки и восстановление</h2><p>Фактический скан доступной истории текущих позиций. Сортировка идёт по глубине отклонения от максимума выбранного окна и не является сигналом к покупке.</p></div>
   <i aria-hidden="true">落</i>
  </header>

  <div className="sam-fallen__windows" role="group" aria-label="Окно технического сканера">
   {([3,6,12] as DiscoveryWindow[]).map(value=><button type="button" key={value} className={window===value?"is-active":""} onClick={()=>setWindow(value)}>{value}М</button>)}
  </div>

  {loading?<div className="sam-fallen__gate">Получаем подтверждённую историю позиций…</div>:!payload?.available?<div className="sam-fallen__gate is-warning"><strong>История позиций недоступна</strong><small>QVANIX не строит технический discovery без подтверждённых ценовых рядов.</small></div>:<>
   <div className="sam-fallen__coverage">
    <article><span>Запрошено рядов</span><strong>{payload.requested}</strong><small>{payload.source??"источник не указан"}</small></article>
    <article><span>Доступно</span><strong>{payload.availableSeries}</strong><small>{payload.from??"—"} → {payload.to??"—"}</small></article>
    <article><span>Отброшено сканером</span><strong>{scan.rejected}</strong><small>конфликт или мало точек</small></article>
   </div>
   <div className="sam-fallen__rows">
    {scan.rows.length?scan.rows.map(row=><article key={row.key} className={"sam-fallen__row is-"+row.bucket.toLowerCase()}>
     <header><div><strong>{row.label}</strong><small>{row.observations} точек · {row.from} → {row.to}</small></div><em>{bucketLabel(row.bucket)}</em></header>
     <div className="sam-fallen__metrics">
      <div><span>От максимума</span><b className="is-negative">{p(row.drawdownFromHigh)}</b></div>
      <div><span>От минимума</span><b className={row.reboundFromLow>0?"is-positive":""}>{p(row.reboundFromLow)}</b></div>
      <div><span>За окно</span><b className={row.windowReturn!=null&&row.windowReturn<0?"is-negative":row.windowReturn!=null&&row.windowReturn>0?"is-positive":""}>{p(row.windowReturn)}</b></div>
      <div><span>Max DD</span><b className="is-negative">{p(row.maxDrawdown)}</b></div>
      <div><span>К SMA50</span><b>{p(row.distanceSma50)}</b></div>
      <div><span>К SMA200</span><b>{p(row.distanceSma200)}</b></div>
     </div>
     <div className="sam-fallen__range"><i style={{left:Math.max(0,Math.min(100,(row.latest-row.low)/Math.max(1e-9,row.high-row.low)*100))+"%"}}/><span>{num.format(row.low)}</span><b>{num.format(row.latest)}</b><span>{num.format(row.high)}</span></div>
    </article>):<div className="sam-fallen__gate">В выбранном окне нет пригодных ценовых рядов.</div>}
   </div>
  </>}

  <footer>Discovery v1 работает только по ценовой истории, которую вернул текущий broker-history источник. Он не оценивает фундаментальную стоимость, новости, ликвидность или «дешевизну» бумаги и не выдаёт команды купить/продать.</footer>
 </section>;
}
