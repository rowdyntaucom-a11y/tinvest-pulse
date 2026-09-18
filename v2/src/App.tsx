import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { QvanixBoard } from "./features/board/QvanixBoard";
import { useWorldPhaseClock } from "./features/world/useWorldPhaseClock";
import { buildWorldRuntimeStateFromQualityInputs } from "./features/dna/worldRuntimeState";
import { resolveWorldQualityInputs } from "./features/dna/worldQualityPolicy";
import { DnaWorkspace } from "./features/dna/DnaWorkspace";
import { HistoryChart } from "./features/portfolio/HistoryChart";
import { PortfolioWorkspace } from "./features/portfolio/PortfolioWorkspace";
import { MetricSparkline } from "./features/shared/MetricSparkline";
import { calculatePortfolioAnalytics } from "./features/analytics/metrics";
import { calculateAllocationDrift, PERSONAL_STRATEGY_V1 } from "./features/analytics/drift";
import { RebalanceScenarioDetails } from "./features/analytics/RebalanceScenarioDetails";
import { MonteCarloPanel } from "./features/analytics/MonteCarloPanel";
import { RiskWorkspace } from "./features/analytics/RiskWorkspace";
import { annualReturnRatioToPercent } from "./features/analytics/returnUnits";
import { IncomeWorkspace } from "./features/income/IncomeWorkspace";
import { KeyRateWidget } from "./features/macro/KeyRateWidget";
import { PrimaryNavigation } from "./features/navigation/PrimaryNavigation";
import { SectionSelector } from "./features/navigation/SectionSelector";
import { ANALYTICS_SECTIONS } from "./features/navigation/navigationModel";
import { resolveWorkspaceGate } from "./features/navigation/workspaceGate";
import { ContextHelpTerm } from "./features/help/ContextHelpTerm";
import { DataTrustIndicator } from "./features/shared/DataTrustIndicator";
import { allowsConfirmedEmptyPortfolio, evaluateDataTrust, evaluateHistoryTrust, ownsLatestRequest, resolveMetricEligibility, type DataTrustStatus } from "./lib/dataTrust";
import { PersonalizationControl } from "./features/settings/PersonalizationControl";
import { loadPortfolio, loadPortfolioHistory, type PortfolioSnapshot } from "./lib/portfolioApi";
import { resolveCanonicalAsset } from "./features/asset/assetIdentity";
import { loadUiPreferences, normalizeUiPreferences, saveUiPreferences, type UiPreferenceStorage, type UiPreferences, type UiWorkspace } from "./lib/uiPreferences";

const loadGoalWorkspace = () => import("./features/goals/GoalWorkspace");
const loadAssetWorkspace = () => import("./features/asset/AssetWorkspace");
const GoalWorkspace = lazy(() => loadGoalWorkspace().then((module) => ({ default: module.GoalWorkspace })));
const HoldingsExplorer = lazy(() => import("./features/analytics/HoldingsExplorer").then((module) => ({ default: module.HoldingsExplorer })));
const AssetWorkspace = lazy(() => loadAssetWorkspace().then((module) => ({ default: module.AssetWorkspace })));
const PulseMode = lazy(() => import("./features/pulse/PulseMode").then((module) => ({ default: module.PulseMode })));

const pctSigned = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1, signDisplay: "exceptZero" });
const pctPlain = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });
const number = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
type Tab = UiWorkspace;
type AnalyticsView = "overview" | "risk" | "health" | "drift" | "montecarlo";
function signedRatio(value: number | null) { return value == null || !Number.isFinite(value) ? "—" : `${pctSigned.format(value * 100)}%`; }
function signedPoints(value: number | null) { return value == null || !Number.isFinite(value) ? "—" : `${pctSigned.format(value * 100)} п.п.`; }
function browserStorage(): UiPreferenceStorage | null { if (typeof window === "undefined") return null; try { return window.localStorage; } catch { return null; } }

const EMPTY: PortfolioSnapshot = { accountName: "Кряхтящий фонд", value: 0, profit: 0, profitPct: 0, passiveIncome: 0, averageMonthlyPassiveIncome: 0, averageAnnualPassiveIncome: 0, positions: 0, positionItems: [], xirr: null, cagr: null, riskFreeRate: null, riskFreeRateDate: null, nextRateMeeting: null, startDate: null, updatedAt: null, history: [], source: "fallback" };

export default function App() {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot>(EMPTY);
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(() => loadUiPreferences(browserStorage()));
  const [tab, setTab] = useState<Tab>(uiPreferences.defaultWorkspace);
  const [analyticsView, setAnalyticsView] = useState<AnalyticsView>("overview");
  const [selectedAsset, setSelectedAsset] = useState<PortfolioSnapshot["positionItems"][number] | null>(null);
  const [assetReturnTab, setAssetReturnTab] = useState<Tab>("portfolio");
  const [portfolioStatus, setPortfolioStatus] = useState<DataTrustStatus>("LOADING");
  const requestSequence = useRef(0);
  const lastSuccessfulLiveAt = useRef<string | null>(null);
  const [pulseMode, setPulseMode] = useState(false);
  const worldLocalDate = useWorldPhaseClock(tab === "dna");

  useEffect(() => { const root = document.documentElement; root.dataset.qvTheme = uiPreferences.theme; root.dataset.qvDensity = uiPreferences.density; root.dataset.qvMotion = uiPreferences.motion; root.dataset.qvDetail = uiPreferences.detailMode; saveUiPreferences(uiPreferences, browserStorage()); }, [uiPreferences]);
  useEffect(() => { let active = true; const refresh = async () => { const sequence = ++requestSequence.current; try { const next = await loadPortfolio(); if (ownsLatestRequest(sequence, requestSequence.current, active)) { if (next.source !== "fallback") lastSuccessfulLiveAt.current = new Date().toISOString(); setSnapshot((current) => ({ ...next, history: current.history.length ? current.history : next.history })); setPortfolioStatus(next.source === "fallback" ? "FALLBACK" : "LIVE"); } } catch { if (ownsLatestRequest(sequence, requestSequence.current, active)) setPortfolioStatus("ERROR"); } }; void refresh(); const timer = window.setInterval(refresh, 60_000); return () => { active = false; window.clearInterval(timer); }; }, []);
  useEffect(() => { if (!selectedAsset || portfolioStatus === "LOADING") return; setSelectedAsset((current) => resolveCanonicalAsset(current, snapshot.positionItems)); }, [snapshot.positionItems, portfolioStatus]);
  useEffect(() => { const preload = () => { void loadGoalWorkspace(); void loadAssetWorkspace(); }; const idle = window.requestIdleCallback?.(preload, { timeout: 2500 }); const timer = idle == null ? window.setTimeout(preload, 1200) : null; return () => { if (idle != null) window.cancelIdleCallback?.(idle); if (timer != null) window.clearTimeout(timer); }; }, []);
  useEffect(() => { let active = true; const load = async () => { const history = await loadPortfolioHistory(); if (active && history.length) setSnapshot((current) => ({ ...current, history })); }; const timer = window.setTimeout(() => void load(), 700); return () => { active = false; window.clearTimeout(timer); }; }, []);

  const analytics = useMemo(() => calculatePortfolioAnalytics(snapshot.history, snapshot.positionItems, snapshot.riskFreeRate), [snapshot.history, snapshot.positionItems, snapshot.riskFreeRate]);
  const portfolioTrust = useMemo(() => evaluateDataTrust({ sourceId: snapshot.source === "fallback" ? "LOCAL_FALLBACK" : snapshot.source.toUpperCase(), sourceType: snapshot.source === "fallback" ? "CACHE" : "BROKER", sourceState: portfolioStatus === "LOADING" ? "LOADING" : portfolioStatus === "ERROR" ? "ERROR" : snapshot.source === "fallback" ? "FALLBACK" : "LIVE", sourceTimestamp: snapshot.updatedAt, lastSuccessfulLiveAt: lastSuccessfulLiveAt.current, staleAfterMs: 5 * 60_000, coverage: snapshot.source === "fallback" ? "UNKNOWN" : "COMPLETE", hasData: snapshot.source !== "fallback", nowMs: Date.now() }), [portfolioStatus, snapshot.source, snapshot.updatedAt]);
  const historyTrust = useMemo(() => evaluateHistoryTrust(snapshot.history, Date.now()), [snapshot.history]);
  const twrEligibility = resolveMetricEligibility(historyTrust.portfolioTrust, ["LIVE_SOURCE", "COMPLETE_COVERAGE", "MATURE_HISTORY"], { historyPoints: historyTrust.portfolioPoints, minimumHistoryPoints: 2 });
  const xirrEligibility = resolveMetricEligibility(portfolioTrust, ["LIVE_SOURCE", "COMPLETE_COVERAGE", "DATED_CASHFLOWS"], { datedCashflows: snapshot.xirr == null ? 0 : 1 });
  const healthEligibility = resolveMetricEligibility(historyTrust.portfolioTrust, ["LIVE_SOURCE", "COMPLETE_COVERAGE", "MATURE_HISTORY"], { historyPoints: analytics.historyDays, minimumHistoryPoints: 365 });
  const relativeEligibility = resolveMetricEligibility(historyTrust.trust, ["LIVE_SOURCE", "COMPLETE_COVERAGE", "PAIRED_BENCHMARK"], { pairedPoints: historyTrust.pairedPoints, minimumPairedPoints: 2 });
  const drift = useMemo(() => calculateAllocationDrift(snapshot.positionItems, PERSONAL_STRATEGY_V1), [snapshot.positionItems]);
  const worldQualityInputs = resolveWorldQualityInputs({ twr: analytics.twr, healthScore: analytics.healthScore }, { twr: twrEligibility.allowed, health: healthEligibility.allowed });
  const dnaRuntimeState = useMemo(() => buildWorldRuntimeStateFromQualityInputs(worldQualityInputs, { persistedXp: undefined, progression: { level: 1, xpToNext: null }, weather: "neutral", localDate: worldLocalDate }), [worldQualityInputs.twr, worldQualityInputs.healthScore, worldLocalDate]);
  const dnaWorldState = dnaRuntimeState.world;
  const workspaceGate = resolveWorkspaceGate(tab, portfolioStatus);
  const openAsset = (position: PortfolioSnapshot["positionItems"][number]) => { setAssetReturnTab(tab); setSelectedAsset(position); };
  const navigateToTab = (nextTab: Tab) => { setSelectedAsset(null); setTab(nextTab); };
  const updateUiPreferences = (patch: Partial<Pick<UiPreferences, "theme" | "density" | "motion" | "detailMode" | "defaultWorkspace" | "pinnedModules">>) => setUiPreferences((current) => normalizeUiPreferences({ ...current, ...patch }));
  const resetUiPreferences = () => setUiPreferences(normalizeUiPreferences(null));
  const xirr = annualReturnRatioToPercent(snapshot.xirr);
  const startDate = snapshot.startDate ? new Date(snapshot.startDate).toLocaleDateString("ru-RU") : "—";
  const analyticsMature = analytics.historyDays >= 365;
  const historyLabel = analytics.historyDays ? `${analytics.historyDays} дней` : "нет истории";

  return <main className="app-shell" data-qv-theme={uiPreferences.theme} data-qv-density={uiPreferences.density} data-qv-motion={uiPreferences.motion} data-qv-detail={uiPreferences.detailMode}>
    <div className="qv-ambient" aria-hidden="true" />
    <header className="topbar">
      <div className="brand-block"><div className="eyebrow">QVANIX · АНАЛИТИКА ПОРТФЕЛЯ</div><h1>QVANIX</h1><p>{snapshot.accountName} · финансовое ядро, аналитика и живой мир без лишнего дублирования.</p></div>
      <DataTrustIndicator trust={tab === "analytics" ? historyTrust.trust : portfolioTrust} />
      <KeyRateWidget rate={snapshot.riskFreeRate} rateDate={snapshot.riskFreeRateDate} nextMeeting={snapshot.nextRateMeeting} />
      <PrimaryNavigation active={tab} onNavigate={navigateToTab} onPulse={() => setPulseMode(true)} />
    </header>
    <section className={`app-view ${selectedAsset ? "asset-view" : `${tab}-view`}`}>
      {workspaceGate === "WORKSPACE" && tab === "dna" ? <DnaWorkspace state={dnaWorldState} /> : workspaceGate === "LOADING" ? (
        <section className="workspace-loading" aria-live="polite" aria-busy="true"><div className="loading-line loading-line--hero" /><div className="loading-line" /><div className="loading-panel" /><strong>ЗАГРУЖАЕМ ПОРТФЕЛЬ</strong><span>Значения появятся после ответа брокера</span></section>
      ) : workspaceGate === "UNAVAILABLE" ? (
        <section className="portfolio-empty panel" role="status" aria-live="polite"><span className="eyebrow">ДАННЫЕ НЕ ПОДТВЕРЖДЕНЫ</span><h2>{portfolioStatus === "ERROR" ? "Не удалось загрузить портфель" : "Актуальные данные брокера недоступны"}</h2><p>QVANIX не показывает резервные или отсутствующие значения как реальный пустой портфель. Повторная загрузка произойдёт автоматически.</p></section>
      ) : snapshot.positions === 0 && !allowsConfirmedEmptyPortfolio(portfolioTrust, snapshot.positions) ? (
        <section className="portfolio-empty panel" role="status"><span className="eyebrow">ТЕКУЩЕЕ СОСТОЯНИЕ НЕ ПОДТВЕРЖДЕНО</span><h2>Состав портфеля временно недоступен</h2><p>Нулевая позиция не считается пустым портфелем, пока canonical Data Trust не подтвердит LIVE-снимок с полным покрытием.</p></section>
      ) : allowsConfirmedEmptyPortfolio(portfolioTrust, snapshot.positions) ? (
        <section className="portfolio-empty panel" role="status"><span className="eyebrow">LIVE · ДАННЫЕ ПОДТВЕРЖДЕНЫ</span><h2>Портфель пока пуст</h2><p>Брокер подтвердил актуальное состояние счёта: открытых позиций сейчас нет.</p></section>
      ) : selectedAsset ? (
        <Suspense fallback={<section className="asset-shell-loading panel"><strong>{selectedAsset.ticker}</strong><span>{selectedAsset.name}</span><b>{new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(selectedAsset.currentValue)} ₽</b><small>Загружаем подробности…</small></section>}><AssetWorkspace position={selectedAsset} portfolioValue={snapshot.value} onBack={() => { setSelectedAsset(null); setTab(assetReturnTab); }} /></Suspense>
      ) : <>
        {tab === "board" && <QvanixBoard snapshot={snapshot} analytics={analytics} xirrPercent={xirr} metricEligibility={{ twr: twrEligibility.allowed, xirr: xirrEligibility.allowed, health: healthEligibility.allowed }} pinnedModules={uiPreferences.pinnedModules} onNavigate={({ workspace, analyticsView: boardAnalyticsView }) => { if (boardAnalyticsView) setAnalyticsView(boardAnalyticsView); navigateToTab(workspace); }} />}
        {tab === "portfolio" && <PortfolioWorkspace snapshot={snapshot} onOpenAsset={openAsset} />}
        {tab === "analytics" && <div className="analytics-layout">
          <SectionSelector workspace="Аналитика" value={analyticsView} groups={ANALYTICS_SECTIONS} onChange={setAnalyticsView} aside={<span className={analyticsMature ? "sample-badge sample-badge--mature" : "sample-badge"}>{analyticsMature ? "12 МЕС." : `ПРЕДВ. · ${historyLabel}`}</span>} />
          {analyticsView === "overview" && <div className="analytics-overview"><section className="analytics-topline">
            <article className="score-card"><span className="metric-label">ЗДОРОВЬЕ ПОРТФЕЛЯ · v{analytics.healthVersion} <ContextHelpTerm topic="health" /></span><strong>{!healthEligibility.allowed || analytics.healthScore == null ? "—" : Math.round(analytics.healthScore)}</strong><small>{healthEligibility.allowed ? "Расчёт на подтверждённой зрелой истории" : `Недоступно · история не подтверждена (${historyLabel})`}</small></article>
            <article className="metric-card"><span className="metric-label">XIRR · ЛИЧНАЯ ДОХОДНОСТЬ <ContextHelpTerm topic="xirr" /></span><strong>{!xirrEligibility.allowed || xirr == null ? "—" : `${pctSigned.format(xirr)}%`}</strong><small>{xirrEligibility.allowed ? "Датированные денежные потоки подтверждены" : "Недоступно без подтверждённых датированных денежных потоков"}</small></article>
            <article className="metric-card"><span className="metric-label">TWR · ДОХОДНОСТЬ ПОРТФЕЛЯ <ContextHelpTerm topic="twr" /></span><strong>{twrEligibility.allowed ? signedRatio(analytics.twr) : "—"}</strong>{twrEligibility.allowed && <MetricSparkline values={snapshot.history.map((point) => point.portfolio)} label="TWR-индекс · последние 30 доступных дневных точек" />}<small>{twrEligibility.allowed ? "Без влияния размера довнесений" : "Недоступно без подтверждённой полной истории"}</small></article>
          </section><section className="panel history-panel"><div className="panel-head"><div><span className="eyebrow">ИНДЕКС TWR</span><h2>ПОРТФЕЛЬ И IMOEX</h2></div><small>{analytics.historyPoints ? `${analytics.historyPoints} точек` : "история загружается"}</small></div>{relativeEligibility.allowed ? <HistoryChart points={snapshot.history} /> : <div className="income-empty">Сравнение с IMOEX недоступно: нужны минимум две подтверждённые парные точки без пропусков.</div>}</section><Suspense fallback={null}><HoldingsExplorer positions={snapshot.positionItems} onOpenAsset={openAsset} /></Suspense></div>}
          {analyticsView === "risk" && <RiskWorkspace analytics={analytics} history={snapshot.history} positions={snapshot.positionItems} riskFreeRate={snapshot.riskFreeRate} analyticsMature={analyticsMature} historyLabel={historyLabel} />}
          {analyticsView === "health" && <section className="panel health-panel"><div className="panel-head"><div><span className="eyebrow">МЕТОДИКА v1.0</span><h2>ЗДОРОВЬЕ ПОРТФЕЛЯ <ContextHelpTerm topic="health" /></h2></div><small>{healthEligibility.allowed ? "полная выборка" : "история не подтверждена"}</small></div><div className="health-components">{analytics.components.map((component) => <div className="health-row" key={component.key}><div><strong>{component.label}</strong><span>{component.note}</span></div><div className="health-weight">{Math.round(component.weight * 100)}%</div><div className="health-points">{!healthEligibility.allowed || component.points == null ? "—" : `${number.format(component.points)} п.`}</div><i><span style={{ width: `${(component.normalized ?? 0) * 100}%` }} /></i></div>)}</div><p className="method-note">Итоговый балл прозрачен и версионируется. На истории короче 12 месяцев компоненты риска остаются видимыми, но итоговая оценка помечается как предварительная.</p></section>}
          {analyticsView === "drift" && <section className="panel drift-panel"><div className="panel-head"><div><span className="eyebrow">СТРАТЕГИЯ v{drift.strategy.version}</span><h2>ЦЕЛЬ И ФАКТ <ContextHelpTerm topic="rebalanceTolerance" /></h2></div><small>{drift.strategy.name}</small></div><div className="drift-summary"><article><span>СТАТУС</span><strong className={drift.withinTolerance ? "is-ok" : drift.available ? "is-watch" : ""}>{drift.available ? drift.withinTolerance ? "В ДОПУСКЕ" : "ВНЕ ДОПУСКА" : "НЕТ ДАННЫХ"}</strong><small>контроль структуры, не торговый сигнал</small></article><article><span>МАКС. ОТКЛОНЕНИЕ</span><strong>{drift.maxAbsoluteDrift == null ? "—" : `${pctPlain.format(drift.maxAbsoluteDrift * 100)} п.п.`}</strong><small>по целевым классам</small></article><article><span>ВНЕ МОДЕЛИ</span><strong>{pctPlain.format(drift.unassignedWeight * 100)}%</strong><small>активы без целевого класса</small></article></div><div className="drift-rows">{drift.rows.map((row) => <div className={`drift-row ${row.outsideTolerance ? "is-outside" : ""}`} key={row.key}><div className="drift-row__title"><strong>{row.label}</strong><span>цель {pctPlain.format(row.target * 100)}%</span></div><div className="drift-row__numbers"><b>{pctPlain.format(row.actual * 100)}%</b><span>{signedPoints(row.delta)}</span></div><div className="drift-track" aria-label={`${row.label}: факт ${pctPlain.format(row.actual * 100)}%, цель ${pctPlain.format(row.target * 100)}%`}><i style={{ width: `${Math.min(100, Math.max(0, row.actual * 100))}%` }} /><b style={{ left: `${Math.min(100, Math.max(0, row.target * 100))}%` }} /></div></div>)}</div><RebalanceScenarioDetails drift={drift} positions={snapshot.positionItems} /><p className="method-note">Диагностика отклонений сравнивает фактические доли с целями. Порог: абсолютное отклонение ≥ {pctPlain.format(drift.strategy.absoluteTolerance * 100)} п.п. или относительное ≥ {pctPlain.format(drift.strategy.relativeTolerance * 100)}%. Это сигнал проверить структуру стратегии, а не команда купить или продать.</p></section>}
          {analyticsView === "montecarlo" && <MonteCarloPanel history={snapshot.history} currentValue={snapshot.value} />}
        </div>}
        {tab === "income" && <IncomeWorkspace passiveIncome={snapshot.passiveIncome} averageMonthlyPassiveIncome={snapshot.averageMonthlyPassiveIncome} startDate={startDate} positions={snapshot.positionItems} onOpenAsset={openAsset} />}
        {tab === "goals" && <Suspense fallback={<section className="panel"><div className="panel-head"><div><span className="eyebrow">QVANIX GOAL</span><h2>ЦЕЛЬ</h2></div><small>загрузка сценария</small></div></section>}><GoalWorkspace currentCapital={snapshot.value} /></Suspense>}
      </>}
    </section>
    {pulseMode && <Suspense fallback={null}><PulseMode snapshot={snapshot} live={portfolioTrust.status === "LIVE"} onClose={() => setPulseMode(false)} /></Suspense>}
    <PersonalizationControl preferences={uiPreferences} onChange={updateUiPreferences} onReset={resetUiPreferences} />
  </main>;
}
