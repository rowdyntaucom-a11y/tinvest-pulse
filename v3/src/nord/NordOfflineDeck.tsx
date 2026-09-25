import type{V3Workspace}from"../app/model";
export function NordOfflineDeck({onNavigate}:{onNavigate?:(workspace:V3Workspace)=>void}){
 return <><section className="nord-home-v3__offline-deck"><article className="nord-home-v3__offline-compass"><header><span>FORMATION COMPASS</span><b>ᛟ</b></header><div><i/><i/><b>—</b><small>TOP-3</small></div><footer><span>Состав и концентрация после подтверждения</span></footer></article><article className="nord-home-v3__offline-tide"><header><span>TREASURY TIDE</span><b>ᚠ</b></header><strong>—</strong><small>Фактический доход</small><div aria-hidden="true"><i/><i/><i/><i/></div><footer><span>Средний месяц</span><b>—</b></footer></article></section></>;
}
