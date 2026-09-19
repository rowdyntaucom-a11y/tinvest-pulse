import type{PayoutCalendar}from"../../../v2/src/lib/payoutsApi";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{evaluatePayoutTrust}from"../../../v2/src/lib/dataTrust";
import{separateTrustedIncomeData}from"../../../v2/src/features/income/incomeDataTrust";
import{getIncomeIntegrity}from"../../../v2/src/features/income/incomeIntegrity";
import{buildIncomeCalendarVisual}from"../../../v2/src/features/income/incomeCalendarVisual";
import{buildIncomeSourceRows}from"../../../v2/src/features/income/incomeSourceRows";
import{buildRealizedIncomeHistory,calculateIncomeSourceConcentration,calculateIncomeStability}from"../../../v2/src/features/income/incomeHistory";
import{calculateIncomeComparablePeriod}from"../../../v2/src/features/income/incomeComparables";
import{buildBondIncomeLinkage}from"../../../v2/src/features/income/bondIncomeLinkage";

export function buildV3IncomeDepth(calendar:PayoutCalendar,positions:PositionSnapshot[],nowMs:number){
  const payoutTrust=evaluatePayoutTrust({
    available:calendar.available,
    stale:calendar.stale,
    generatedAt:calendar.generatedAt,
    eligibleAssets:calendar.coverage.eligibleAssets,
    resolvedAssets:calendar.coverage.resolvedAssets,
    coverageRatio:calendar.coverage.coverageRatio,
    scheduleComplete:calendar.integrity.complete,
  },nowMs);
  const trustedIncome=separateTrustedIncomeData(calendar,payoutTrust.safeToCalculate);
  const integrity=getIncomeIntegrity(calendar,false);
  const calendarMonths=buildIncomeCalendarVisual(trustedIncome.futureEvents,calendar.period.from,12);
  const sourceRows=buildIncomeSourceRows(trustedIncome.actualEvents,trustedIncome.futureEvents,positions,Number.MAX_SAFE_INTEGER);
  const realizedHistory=buildRealizedIncomeHistory(trustedIncome.actualEvents,calendar.actual.observation);
  const concentration=calculateIncomeSourceConcentration(trustedIncome.actualEvents);
  const stability=calculateIncomeStability(realizedHistory);
  const comparable=calculateIncomeComparablePeriod(realizedHistory.months);
  const bondLinkage=buildBondIncomeLinkage(positions,trustedIncome.futureEvents);
  return{payoutTrust,trustedIncome,integrity,calendarMonths,sourceRows,realizedHistory,concentration,stability,comparable,bondLinkage};
}
