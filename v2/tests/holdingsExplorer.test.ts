import assert from 'node:assert/strict'
import { aggregateHoldings, classifyPosition, filterAndSortHoldings, holdingDimension } from '../src/features/analytics/holdingsExplorer.ts'
import type { PositionSnapshot } from '../src/lib/portfolioApi.ts'
const base=(ticker:string,type:string,value:number,extra:Partial<PositionSnapshot>={}):PositionSnapshot=>({figi:ticker,instrumentUid:`uid-${ticker}`,ticker,name:ticker,instrumentType:type,quantity:1,averagePrice:value,costBasis:value,currentPrice:value,currentValue:value,expectedYield:value/10,weight:value/1000,bond:null,...extra})
const rows=[base('EQ','share',600),base('OFZ','bond',300,{bond:{maturityDate:null,nominal:1000,currency:'RUB',couponQuantityPerYear:null,floatingCoupon:null,perpetual:null,amortizing:null,issueKind:null,countryOfRisk:null,countryOfRiskName:null,sector:'Государственные',issuerUid:'ru',issuerName:'Минфин'}}),base('X','mystery',100)]
assert.equal(classifyPosition('ETF'),'funds')
assert.deepEqual(filterAndSortHoldings(rows,'bonds','value').map(x=>x.ticker),['OFZ'])
assert.deepEqual(filterAndSortHoldings(rows,'all','name').map(x=>x.ticker),['EQ','OFZ','X'])
assert.equal(holdingDimension(rows[2],'sector'),null)
const sectors=aggregateHoldings(rows,'sector')
assert.deepEqual(sectors.rows,[{label:'Государственные',value:300}])
assert.equal(sectors.unclassified,700)
console.log('holdings explorer tests passed')
