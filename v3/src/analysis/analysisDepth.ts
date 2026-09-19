import type{HistoryPoint,PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{calculatePortfolioAnalytics,type PortfolioAnalytics}from"../../../v2/src/features/analytics/metrics";
import{calculateRelativePerformance,type RelativePerformance}from"../../../v2/src/features/analytics/relativePerformance";
import{calculateRollingRisk,type RollingRiskResult}from"../../../v2/src/features/analytics/rollingRisk";
import{calculateTailRisk,type TailRiskResult}from"../../../v2/src/features/analytics/tailRisk";

export type V3AnalysisDepth={
  portfolio:PortfolioAnalytics;
  relative:RelativePerformance;
  rolling:RollingRiskResult;
  tail:TailRiskResult;
};

const analyticsHistory=(history:HistoryPoint[])=>history.map(point=>({
  date:point.date,
  portfolio:point.portfolio,
  imoex:point.imoex,
}));

const analyticsPositions=(items:PositionSnapshot[])=>items.map(item=>({
  ticker:item.ticker,
  name:item.name,
  instrumentType:item.instrumentType,
  currentValue:item.currentValue,
}));

export function buildV3AnalysisDepth(history:HistoryPoint[],items:PositionSnapshot[],riskFreeRate:number|null):V3AnalysisDepth{
  const h=analyticsHistory(history),p=analyticsPositions(items);
  return{
    portfolio:calculatePortfolioAnalytics(h,p,riskFreeRate),
    relative:calculateRelativePerformance(h),
    rolling:calculateRollingRisk(h),
    tail:calculateTailRisk(h),
  };
}

export function buildV3RelativeDepth(history:HistoryPoint[]):RelativePerformance{
  return calculateRelativePerformance(analyticsHistory(history));
}
