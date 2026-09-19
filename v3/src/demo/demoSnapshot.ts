import type{PortfolioSnapshot}from"../../../v2/src/lib/portfolioApi";

// Static, synthetic product-tour fixture. It is intentionally isolated from broker data and must never be presented as LIVE.
export const V3_DEMO_SNAPSHOT:PortfolioSnapshot={
 accountName:"Демо-портфель",value:1248600,profit:148600,profitPct:13.51,passiveIncome:86420,averageMonthlyPassiveIncome:7202,averageAnnualPassiveIncome:86420,positions:5,xirr:.142,cagr:.118,riskFreeRate:.12,riskFreeRateDate:"2026-09-01",nextRateMeeting:null,startDate:"2024-01-15",updatedAt:"2026-09-19T12:00:00.000Z",source:"portfolio",
 positionItems:[
  {figi:null,instrumentUid:"demo-equity-a",ticker:"DEMO-A",name:"Акции · ядро",instrumentType:"share",quantity:100,averagePrice:3200,costBasis:320000,currentPrice:3680,currentValue:368000,expectedYield:48000,weight:.2947,bond:null},
  {figi:null,instrumentUid:"demo-ofz-a",ticker:"OFZ-D1",name:"ОФЗ · длинные",instrumentType:"bond",quantity:300,averagePrice:920,costBasis:276000,currentPrice:970,currentValue:291000,expectedYield:15000,weight:.2331,bond:null},
  {figi:null,instrumentUid:"demo-equity-b",ticker:"DEMO-B",name:"Акции · дивиденды",instrumentType:"share",quantity:80,averagePrice:2800,costBasis:224000,currentPrice:3150,currentValue:252000,expectedYield:28000,weight:.2018,bond:null},
  {figi:null,instrumentUid:"demo-ofz-b",ticker:"OFZ-D2",name:"ОФЗ · средние",instrumentType:"bond",quantity:220,averagePrice:900,costBasis:198000,currentPrice:940,currentValue:206800,expectedYield:8800,weight:.1656,bond:null},
  {figi:null,instrumentUid:"demo-cash",ticker:"CASH",name:"Резерв",instrumentType:"currency",quantity:1,averagePrice:130800,costBasis:130800,currentPrice:130800,currentValue:130800,expectedYield:0,weight:.1048,bond:null}
 ],
 history:[
  {date:"2024-01-15",portfolio:0,imoex:0,value:1000000,invested:1000000},{date:"2024-05-15",portfolio:.031,imoex:.024,value:1056000,invested:1025000},{date:"2024-09-15",portfolio:.047,imoex:.018,value:1098000,invested:1050000},{date:"2025-01-15",portfolio:.063,imoex:.039,value:1142000,invested:1075000},{date:"2025-05-15",portfolio:.079,imoex:.051,value:1194000,invested:1100000},{date:"2025-09-15",portfolio:.091,imoex:.058,value:1227000,invested:1125000},{date:"2026-01-15",portfolio:.103,imoex:.071,value:1261000,invested:1150000},{date:"2026-05-15",portfolio:.109,imoex:.075,value:1275000,invested:1175000},{date:"2026-09-19",portfolio:.118,imoex:.081,value:1248600,invested:1100000}
 ]
};
