import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const ui=readFileSync(new URL("../src/report/V3PortfolioReportDepth.tsx",import.meta.url),"utf8");
for(const token of[
"V3ReportResultBreadthV194","V3ReportBasisCoverageV195","V3ReportPnlAttributionV196","V3ReportConcentrationV197",
"V3ReportReturnDistributionV198","V3ReportCategoryEfficiencyV199","V3ReportPositionScaleV200","V3ReportTrustV201"
])assert.ok(ui.includes(token),token);
for(const name of["reportResultBreadthV194","reportBasisCoverageV195","reportPnlAttributionV196","reportConcentrationV197","reportReturnDistributionV198","reportCategoryEfficiencyV199","reportPositionScaleV200","reportTrustV201"]){
 const s=readFileSync(new URL("../src/report/"+name+".ts",import.meta.url),"utf8");
 assert.doesNotMatch(s,/Math\.random|\bbuy signal\b|\bsell signal\b|рекоменд(овать|ация)/i,name);
}
assert.match(ui,/Это отчёт по текущему составу, а не TWR и не дневная доходность/);
console.log("report depth v194-v201 integration tests passed");