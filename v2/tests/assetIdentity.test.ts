import assert from 'node:assert/strict'
import { resolveCanonicalAsset } from '../src/features/asset/assetIdentity.ts'
import type { PositionSnapshot } from '../src/lib/portfolioApi.ts'
const row=(uid:string|null,figi:string|null,value:number):PositionSnapshot=>({instrumentUid:uid,figi,ticker:figi??'—',name:figi??'—',instrumentType:'share',quantity:1,averagePrice:1,costBasis:1,currentPrice:value,currentValue:value,expectedYield:0,weight:1,bond:null})
const old=row('uid-1','figi-1',10); const refreshed=row('uid-1','figi-1',12)
assert.equal(resolveCanonicalAsset(old,[refreshed]),refreshed)
assert.equal(resolveCanonicalAsset(row(null,'figi-1',10),[refreshed]),refreshed)
assert.equal(resolveCanonicalAsset(row(null,null,10),[refreshed]),null)
assert.equal(resolveCanonicalAsset(old,[refreshed,row('uid-1','other',20)]),null)
assert.equal(resolveCanonicalAsset(old,[]),null)
console.log('asset identity tests passed')
