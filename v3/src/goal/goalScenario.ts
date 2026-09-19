import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import{calculateGoalProjection,type GoalProjectionInput,type GoalProjectionResult}from"../../../v2/src/features/goals/goalProjection";
import{calculateMonteCarlo,type MonteCarloResult}from"../../../v2/src/features/analytics/monteCarlo";

export type V3GoalScenarioInput=GoalProjectionInput;

export function calculateV3GoalScenario(input:V3GoalScenarioInput):GoalProjectionResult{
  return calculateGoalProjection(input);
}

export function calculateV3GoalBootstrap(history:HistoryPoint[],currentCapital:number,horizonYears:number):MonteCarloResult{
  const years=Number.isInteger(horizonYears)?Math.max(1,Math.min(10,horizonYears)):1;
  const analytics=history.map(point=>({date:point.date,portfolio:point.portfolio,imoex:point.imoex}));
  return calculateMonteCarlo(analytics,currentCapital,years*252,2000,5);
}
