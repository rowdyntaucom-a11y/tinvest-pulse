export type AnalyticsHistoryContractPoint={
 date:string;
 portfolio:number|null;
 imoex:number|null;
};

export function normalizePortfolioAnalyticsHistory<T extends AnalyticsHistoryContractPoint>(history:T[]):T[]{
 const finitePortfolio=history
  .map(point=>point.portfolio)
  .filter((value):value is number=>typeof value==="number"&&Number.isFinite(value));
 const first=finitePortfolio[0]??null;
 const legacyDecimal=first!=null
  && Math.abs(first)<0.5
  && finitePortfolio.every(value=>Math.abs(value)<2);
 if(!legacyDecimal)return history;
 return history.map(point=>({
  ...point,
  portfolio:typeof point.portfolio==="number"&&Number.isFinite(point.portfolio)
   ?1+point.portfolio
   :point.portfolio,
 }));
}
