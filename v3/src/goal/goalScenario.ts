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


export type V3GoalContributionSolveResult={
  available:boolean;
  reason:string|null;
  requiredMonthlyContribution:number|null;
  deltaMonthlyContribution:number|null;
  projection:GoalProjectionResult|null;
};

function reachesGoal(result:GoalProjectionResult){
  return result.available&&result.scenarioGoalReachedMonth!=null;
}

export function solveV3RequiredMonthlyContribution(input:V3GoalScenarioInput):V3GoalContributionSolveResult{
  const base=calculateGoalProjection(input);
  if(!base.available)return{available:false,reason:base.reason,requiredMonthlyContribution:null,deltaMonthlyContribution:null,projection:null};

  const zero=calculateGoalProjection({...input,monthlyContribution:0});
  if(reachesGoal(zero))return{
    available:true,
    reason:null,
    requiredMonthlyContribution:0,
    deltaMonthlyContribution:-input.monthlyContribution,
    projection:zero,
  };

  let low=0;
  let high=Math.max(1000,input.monthlyContribution);
  let highProjection=calculateGoalProjection({...input,monthlyContribution:high});
  while(!reachesGoal(highProjection)&&high<1_000_000_000_000){
    low=high;
    high*=2;
    highProjection=calculateGoalProjection({...input,monthlyContribution:high});
  }
  if(!reachesGoal(highProjection))return{
    available:false,
    reason:"В пределах расчётного диапазона не удалось подобрать ежемесячное пополнение для достижения цели.",
    requiredMonthlyContribution:null,
    deltaMonthlyContribution:null,
    projection:null,
  };

  for(let i=0;i<56;i+=1){
    const mid=(low+high)/2;
    const result=calculateGoalProjection({...input,monthlyContribution:mid});
    if(reachesGoal(result)){high=mid;highProjection=result}else low=mid;
  }
  const required=Math.ceil(high/10)*10;
  const projection=calculateGoalProjection({...input,monthlyContribution:required});
  return{
    available:projection.available,
    reason:projection.available?null:projection.reason,
    requiredMonthlyContribution:projection.available?required:null,
    deltaMonthlyContribution:projection.available?required-input.monthlyContribution:null,
    projection:projection.available?projection:null,
  };
}
