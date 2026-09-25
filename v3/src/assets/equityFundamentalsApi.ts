import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{loadAssetFundamentals,unavailableAssetFundamentals}from"../../../v2/src/features/portfolio/assetFundamentals";
import{isEquityPosition,type EquityFundamentalRow}from"./equityFundamentalsModel";

const CONCURRENCY=4;

export async function loadEquityFundamentals(positions:PositionSnapshot[],signal?:AbortSignal):Promise<EquityFundamentalRow[]>{
 const equities=positions.filter(isEquityPosition);
 const rows:Array<EquityFundamentalRow|undefined>=new Array(equities.length);
 let cursor=0;
 const worker=async()=>{
  while(cursor<equities.length){
   if(signal?.aborted)throw new DOMException("Aborted","AbortError");
   const index=cursor++;
   const position=equities[index];
   const uid=position.instrumentUid?.trim();
   if(!uid){
    rows[index]={position,snapshot:unavailableAssetFundamentals("UNSUPPORTED_INSTRUMENT")};
    continue;
   }
   try{
    const snapshot=await loadAssetFundamentals(uid,signal);
    rows[index]={position,snapshot};
   }catch(error){
    if(error instanceof DOMException&&error.name==="AbortError")throw error;
    rows[index]={position,snapshot:unavailableAssetFundamentals("API_ERROR")};
   }
  }
 };
 const workers=Math.min(CONCURRENCY,equities.length);
 await Promise.all(Array.from({length:workers},()=>worker()));
 return rows.filter((row):row is EquityFundamentalRow=>Boolean(row));
}
