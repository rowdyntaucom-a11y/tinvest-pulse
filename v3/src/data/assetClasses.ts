import{classifyPosition,type AssetClassFilter}from"../../../v2/src/features/analytics/holdingsExplorer";

export type V3AssetClass=Exclude<AssetClassFilter,"all">;

export function assetClassKey(instrumentType:unknown):V3AssetClass{
  return classifyPosition(instrumentType);
}

export function assetClassLabel(value:V3AssetClass|string){
  switch(value){
    case"shares":return"Акции";
    case"bonds":return"Облигации";
    case"funds":return"Фонды";
    case"currency":return"Валюта";
    case"futures":return"Фьючерсы";
    default:return"Другое";
  }
}

export function positionAssetClassLabel(instrumentType:unknown){
  return assetClassLabel(assetClassKey(instrumentType));
}
