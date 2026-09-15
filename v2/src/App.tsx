import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { QvanixBoard } from "./features/board/QvanixBoard";
import { WorldSessionStage } from "./features/world/WorldSessionStage";
import { useWorldPhaseClock } from "./features/world/useWorldPhaseClock";
import { buildWorldRuntimeStateFromQualityInputs } from "./features/dna/worldRuntimeState";
import { HistoryChart } from "./features/portfolio/HistoryChart";
import { PortfolioWorkspace } from "./features/portfolio/PortfolioWorkspace";
import { MetricSparkline } from "./features/shared/MetricSparkline";
import { calculatePortfolioAnalytics } from "./features/analytics/metrics";
import {
  calculateAllocationDrift,
  PERSONAL_STRATEGY_V1,
} from "./features/analytics/drift";
import { RebalanceScenarioDetails } from "./features/analytics/RebalanceScenarioDetails";
import { MonteCarloPanel } from "./features/analytics/MonteCarloPanel";
import { RiskWorkspace } from "./features/analytics/RiskWorkspace";
import { annualReturnRatioToPercent } from "./features/analytics/returnUnits";
import { IncomeWorkspace } from "./features/income/IncomeWorkspace";
import { KeyRateWidget } from "./features/macro/KeyRateWidget";
import { PersonalizationControl } from "./features/settings/PersonalizationControl";
import {
  loadPortfolio,
  loadPortfolioHistory,
  type PortfolioSnapshot,
} from "./lib/portfolioApi";
import { resolveCanonicalAsset } from "./features/asset/assetIdentity";
import { PrimaryNavigation } from "./features/navigation/PrimaryNavigation";
import { SectionSelector } from "./features/navigation/SectionSelector";
import { ANALYTICS_SECTIONS } from "./features/navigation/navigationModel";
import {
  loadUiPreferences,
  normalizeUiPreferences,
  saveUiPreferences,
  type UiPreferenceStorage,
  type UiPreferences,
  type UiWorkspace,
} from "./lib/uiPreferences";

const loadGoalWorkspace = () => import("./features/goals/GoalWorkspace");
const loadAssetWorkspace = () => import("./features/asset/AssetWorkspace");
const GoalWorkspace = lazy(() =>
  loadGoalWorkspace().then((module) => ({ default: module.GoalWorkspace })),
);
const HoldingsExplorer = lazy(() =>
  import("./features/analytics/HoldingsExplorer").then((module) => ({
    default: module.HoldingsExplorer,
  })),
);
const AssetWorkspace = lazy(() =>
  loadAssetWorkspace().then((module) => ({ default: module.AssetWorkspace })),
);
const PulseMode = lazy(() =>
  import("./features/pulse/PulseMode").then((module) => ({
    default: module.PulseMode,
  })),
);

const pctSigned = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});
const pctPlain = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });
const number = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

type Tab = UiWorkspace;
type AnalyticsView = "overview" | "risk" | "health" | "drift" | "montecarlo";

function signedRatio(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${pctSigned.format(value * 100)}%`;
}

function plainRatio(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${pctPlain.format(value * 100)}%`;
}

function signedPoints(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${pctSigned.format(value * 100)} п.п.`;
}

function browserStorage(): UiPreferenceStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const EMPTY: PortfolioSnapshot = {
  accountName: "Кряхтящий фонд",
  value: 0,
  profit: 0,
  profitPct: 0,
  passiveIncome: 0,
  averageMonthlyPassiveIncome: 0,
  averageAnnualPassiveIncome: 0,
  positions: 0,
  positionItems: [],
  xirr: null,
  cagr: null,
  riskFreeRate: null,
  riskFreeRateDate: null,
  nextRateMeeting: null,
  startDate: null,
  updatedAt: null,
  history: [],
  source: "fallback",
};

export default function App() {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot>(EMPTY);
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(() =>
    loadUiPreferences(browserStorage()),
  );
  const [tab, setTab] = useState<Tab>(uiPreferences.defaultWorkspace);
  const [analyticsView, setAnalyticsView] = useState<AnalyticsView>("overview");
  const [selectedAsset, setSelectedAsset] = useState<
    PortfolioSnapshot["positionItems"][number] | null
  >(null);
  const [assetReturnTab, setAssetReturnTab] = useState<Tab>("portfolio");
  const [portfolioStatus, setPortfolioStatus] = useState<
    "LOADING" | "LIVE" | "FALLBACK"
  >("LOADING");
  const [pulseMode, setPulseMode] = useState(false);
  const worldLocalDate = useWorldPhaseClock(tab === "dna");

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.qvTheme = uiPreferences.theme;
    root.dataset.qvDensity = uiPreferences.density;
    root.dataset.qvMotion = uiPreferences.motion;
    saveUiPreferences(uiPreferences, browserStorage());
  }, [uiPreferences]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const next = await loadPortfolio();
      if (active) {
        setSnapshot((current) => ({
          ...next,
          history: current.history.length ? current.history : next.history,
        }));
        setPortfolioStatus(next.source === "fallback" ? "FALLBACK" : "LIVE");
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!selectedAsset || portfolioStatus === "LOADING") return;
    setSelectedAsset((current) =>
      resolveCanonicalAsset(current, snapshot.positionItems),
    );
  }, [snapshot.positionItems, portfolioStatus]);

  useEffect(() => {
    const preload = () => {
      void loadGoalWorkspace();
      void loadAssetWorkspace();
    };
    const idle = window.requestIdleCallback?.(preload, { timeout: 2500 });
    const timer = idle == null ? window.setTimeout(preload, 1200) : null;
    return () => {
      if (idle != null) window.cancelIdleCallback?.(idle);
      if (timer != null) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const history = await loadPortfolioHistory();
      if (active && history.length)
        setSnapshot((current) => ({ ...current, history }));
    };
    const timer = window.setTimeout(() => void load(), 700);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const analytics = useMemo(
    () =>
      calculatePortfolioAnalytics(
        snapshot.history,
        snapshot.positionItems,
        snapshot.riskFreeRate,
      ),
    [snapshot.history, snapshot.positionItems, snapshot.riskFreeRate],
  );
  const drift = useMemo(
    () =>
      calculateAllocationDrift(snapshot.positionItems, PERSONAL_STRATEGY_V1),
    [snapshot.positionItems],
  );
  const dnaRuntimeState = useMemo(
    () =>
      buildWorldRuntimeStateFromQualityInputs(
        {
          twr: analytics.twr,
          healthScore: analytics.healthScore,
          contributionStreakMonths: null,
          passiveIncomeGrowth: null,
        },
        {
          persistedXp: undefined,
          progression: { level: 1, xpToNext: null },
          weather: "neutral",
          localDate: worldLocalDate,
        },
      ),
    [analytics.twr, analytics.healthScore, worldLocalDate],
  );
  const dnaWorldState = dnaRuntimeState.world;
  const openAsset = (position: PortfolioSnapshot["positionItems"][number]) => {
    setAssetReturnTab(tab);
    setSelectedAsset(position);
  };
  const navigateToTab = (nextTab: Tab) => {
    setSelectedAsset(null);
    setTab(nextTab);
  };

  const updateUiPreferences = (
    patch: Partial<
      Pick<
        UiPreferences,
        "theme" | "density" | "motion" | "defaultWorkspace" | "pinnedModules"
      >
    >,
  ) => {
    setUiPreferences((current) =>
      normalizeUiPreferences({ ...current, ...patch }),
    );
  };
  const resetUiPreferences = () =>
    setUiPreferences(normalizeUiPreferences(null));

  const xirr = annualReturnRatioToPercent(snapshot.xirr);
  const startDate = snapshot.startDate
    ? new Date(snapshot.startDate).toLocaleDateString("ru-RU")
    : "—";
  const analyticsMature = analytics.historyDays >= 365;
  const historyLabel = analytics.historyDays
    ? `${analytics.historyDays} дней`
    : "нет истории";

  return (
    <main
      className="app-shell"
      data-qv-theme={uiPreferences.theme}
      data-qv-density={uiPreferences.density}
      data-qv-motion={uiPreferences.motion}
    >
      <div className="qv-ambient" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-block">
          <div className="eyebrow">QVANIX · АНАЛИТИКА ПОРТФЕЛЯ</div>
          <h1>QVANIX</h1>
          <p>
            {snapshot.accountName} · финансовое ядро, аналитика и живой мир без
            лишнего дублирования.
          </p>
        </div>
        <KeyRateWidget
          rate={snapshot.riskFreeRate}
          rateDate={snapshot.riskFreeRateDate}
          nextMeeting={snapshot.nextRateMeeting}
        />
        <PrimaryNavigation active={tab} onNavigate={navigateToTab} onPulse={() => setPulseMode(true)} />
      </header>

      <section
        className={`app-view ${selectedAsset ? "asset-view" : `${tab}-view`}`}
      >
        {portfolioStatus === "LOADING" ? (
          <section
            className="workspace-loading"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="loading-line loading-line--hero" />
            <div className="loading-line" />
            <div className="loading-panel" />
            <strong>ЗАГРУЖАЕМ ПОРТФЕЛЬ</strong>
            <span>Значения появятся после ответа брокера</span>
          </section>
        ) : snapshot.positionItems.length === 0 ? (
          <section className="panel portfolio-empty" aria-live="polite"><span className="eyebrow">ПОРТФЕЛЬ</span><h2>Портфель пока пуст</h2><p>Когда подтверждённые позиции появятся в подключённом счёте, QVANIX построит структуру и аналитику. Фиктивные нулевые показатели не показываются.</p><button type="button" onClick={() => navigateToTab("portfolio")}>Открыть раздел портфеля</button></section>
        ) : selectedAsset ? (
          <Suspense
            fallback={
              <section className="asset-shell-loading panel">
                <strong>{selectedAsset.ticker}</strong>
                <span>{selectedAsset.name}</span>
                <b>
                  {new Intl.NumberFormat("ru-RU", {
                    maximumFractionDigits: 0,
                  }).format(selectedAsset.currentValue)}{" "}
                  ₽
                </b>
                <small>Загружаем подробности…</small>
              </section>
            }
          >
            <AssetWorkspace
              position={selectedAsset}
              portfolioValue={snapshot.value}
              onBack={() => {
                setSelectedAsset(null);
                setTab(assetReturnTab);
              }}
            />
          </Suspense>
        ) : (
          <>
            {tab === "board" && (
              <QvanixBoard
                snapshot={snapshot}
                analytics={analytics}
                xirrPercent={xirr}
                pinnedModules={uiPreferences.pinnedModules}
                onNavigate={({
                  workspace,
                  analyticsView: boardAnalyticsView,
                }) => {
                  if (boardAnalyticsView) setAnalyticsView(boardAnalyticsView);
                  navigateToTab(workspace);
                }}
              />
            )}

            {tab === "portfolio" && (
              <PortfolioWorkspace snapshot={snapshot} onOpenAsset={openAsset} />
            )}

            {tab === "analytics" && (
              <div className="analytics-layout">
                <SectionSelector
                  workspace="Аналитика"
                  value={analyticsView}
                  groups={ANALYTICS_SECTIONS}
                  onChange={setAnalyticsView}
                  aside={<span className={analyticsMature ? "sample-badge sample-badge--mature" : "sample-badge"}>{analyticsMature ? "12 МЕС." : `ПРЕДВ. · ${historyLabel}`}</span>}
                />

                {analyticsView === "overview" && (
                  <div className="analytics-overview">
                    <section className="analytics-topline">
                      <article className="score-card">
                        <span className="metric-label">
                          ЗДОРОВЬЕ ПОРТФЕЛЯ · v{analytics.healthVersion}
                        </span>
                        <strong>
                          {analytics.healthScore == null
                            ? "—"
                            : Math.round(analytics.healthScore)}
                        </strong>
                        <small>
                          {analyticsMature
                            ? "Расчёт на зрелой истории"
                            : `Предварительно · история ${historyLabel}`}
                        </small>
                      </article>
                      <article className="metric-card">
                        <span className="metric-label">
                          XIRR · ЛИЧНАЯ ДОХОДНОСТЬ
                        </span>
                        <strong>
                          {xirr == null ? "—" : `${pctSigned.format(xirr)}%`}
                        </strong>
                        <small>Учитывает даты денежных потоков</small>
                      </article>
                      <article className="metric-card">
                        <span className="metric-label">
                          TWR · ДОХОДНОСТЬ ПОРТФЕЛЯ
                        </span>
                        <strong>{signedRatio(analytics.twr)}</strong>
                        <MetricSparkline
                          values={snapshot.history.map(
                            (point) => point.portfolio,
                          )}
                          label="TWR-индекс · последние 30 доступных дневных точек"
                        />
                        <small>Без влияния размера довнесений</small>
                      </article>
                    </section>
                    <section className="panel history-panel">
                      <div className="panel-head">
                        <div>
                          <span className="eyebrow">ИНДЕКС TWR</span>
                          <h2>ПОРТФЕЛЬ И IMOEX</h2>
                        </div>
                        <small>
                          {analytics.historyPoints
                            ? `${analytics.historyPoints} точек`
                            : "история загружается"}
                        </small>
                      </div>
                      <HistoryChart points={snapshot.history} />
                    </section>
                    <Suspense fallback={null}>
                      <HoldingsExplorer
                        positions={snapshot.positionItems}
                        onOpenAsset={openAsset}
                      />
                    </Suspense>
                  </div>
                )}

                {analyticsView === "risk" && (
                  <RiskWorkspace
                    analytics={analytics}
                    history={snapshot.history}
                    positions={snapshot.positionItems}
                    riskFreeRate={snapshot.riskFreeRate}
                    analyticsMature={analyticsMature}
                    historyLabel={historyLabel}
                  />
                )}

                {analyticsView === "health" && (
                  <section className="panel health-panel">
                    <div className="panel-head">
                      <div>
                        <span className="eyebrow">МЕТОДИКА v1.0</span>
                        <h2>ЗДОРОВЬЕ ПОРТФЕЛЯ</h2>
                      </div>
                      <small>
                        {analyticsMature ? "полная выборка" : "предварительно"}
                      </small>
                    </div>
                    <div className="health-components">
                      {analytics.components.map((component) => (
                        <div className="health-row" key={component.key}>
                          <div>
                            <strong>{component.label}</strong>
                            <span>{component.note}</span>
                          </div>
                          <div className="health-weight">
                            {Math.round(component.weight * 100)}%
                          </div>
                          <div className="health-points">
                            {component.points == null
                              ? "—"
                              : `${number.format(component.points)} п.`}
                          </div>
                          <i>
                            <span
                              style={{
                                width: `${(component.normalized ?? 0) * 100}%`,
                              }}
                            />
                          </i>
                        </div>
                      ))}
                    </div>
                    <p className="method-note">
                      Итоговый балл прозрачен и версионируется. На истории
                      короче 12 месяцев компоненты риска остаются видимыми, но
                      итоговая оценка помечается как предварительная.
                    </p>
                  </section>
                )}

                {analyticsView === "drift" && (
                  <section className="panel drift-panel">
                    <div className="panel-head">
                      <div>
                        <span className="eyebrow">
                          СТРАТЕГИЯ v{drift.strategy.version}
                        </span>
                        <h2>ЦЕЛЬ И ФАКТ</h2>
                      </div>
                      <small>{drift.strategy.name}</small>
                    </div>
                    <div className="drift-summary">
                      <article>
                        <span>СТАТУС</span>
                        <strong
                          className={
                            drift.withinTolerance
                              ? "is-ok"
                              : drift.available
                                ? "is-watch"
                                : ""
                          }
                        >
                          {drift.available
                            ? drift.withinTolerance
                              ? "В ДОПУСКЕ"
                              : "ВНЕ ДОПУСКА"
                            : "НЕТ ДАННЫХ"}
                        </strong>
                        <small>контроль структуры, не торговый сигнал</small>
                      </article>
                      <article>
                        <span>МАКС. ОТКЛОНЕНИЕ</span>
                        <strong>
                          {drift.maxAbsoluteDrift == null
                            ? "—"
                            : `${pctPlain.format(drift.maxAbsoluteDrift * 100)} п.п.`}
                        </strong>
                        <small>по целевым классам</small>
                      </article>
                      <article>
                        <span>ВНЕ МОДЕЛИ</span>
                        <strong>
                          {pctPlain.format(drift.unassignedWeight * 100)}%
                        </strong>
                        <small>активы без целевого класса</small>
                      </article>
                    </div>
                    <div className="drift-rows">
                      {drift.rows.map((row) => (
                        <div
                          className={`drift-row ${row.outsideTolerance ? "is-outside" : ""}`}
                          key={row.key}
                        >
                          <div className="drift-row__title">
                            <strong>{row.label}</strong>
                            <span>
                              цель {pctPlain.format(row.target * 100)}%
                            </span>
                          </div>
                          <div className="drift-row__numbers">
                            <b>{pctPlain.format(row.actual * 100)}%</b>
                            <span>{signedPoints(row.delta)}</span>
                          </div>
                          <div
                            className="drift-track"
                            aria-label={`${row.label}: факт ${pctPlain.format(row.actual * 100)}%, цель ${pctPlain.format(row.target * 100)}%`}
                          >
                            <i
                              style={{
                                width: `${Math.min(100, Math.max(0, row.actual * 100))}%`,
                              }}
                            />
                            <b
                              style={{
                                left: `${Math.min(100, Math.max(0, row.target * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <RebalanceScenarioDetails
                      drift={drift}
                      positions={snapshot.positionItems}
                    />
                    <p className="method-note">
                      Диагностика отклонений сравнивает фактические доли с
                      целями. Порог: абсолютное отклонение ≥{" "}
                      {pctPlain.format(drift.strategy.absoluteTolerance * 100)}{" "}
                      п.п. или относительное ≥{" "}
                      {pctPlain.format(drift.strategy.relativeTolerance * 100)}
                      %. Это сигнал проверить структуру стратегии, а не команда
                      купить или продать.
                    </p>
                  </section>
                )}

                {analyticsView === "montecarlo" && (
                  <MonteCarloPanel
                    history={snapshot.history}
                    currentValue={snapshot.value}
                  />
                )}
              </div>
            )}

            {tab === "income" && (
              <IncomeWorkspace
                passiveIncome={snapshot.passiveIncome}
                averageMonthlyPassiveIncome={
                  snapshot.averageMonthlyPassiveIncome
                }
                startDate={startDate}
                positions={snapshot.positionItems}
                onOpenAsset={openAsset}
              />
            )}

            {tab === "goals" && (
              <Suspense
                fallback={
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <span className="eyebrow">QVANIX GOAL</span>
                        <h2>ЦЕЛЬ</h2>
                      </div>
                      <small>загрузка сценария</small>
                    </div>
                  </section>
                }
              >
                <GoalWorkspace currentCapital={snapshot.value} />
              </Suspense>
            )}

            {tab === "dna" && (
              <div className="dna-layout">
                <section className="world-panel world-panel--view">
                  <div className="world-panel__head">
                    <div>
                      <span className="eyebrow">
                        QVANIX DNA · PIXIJS / WEBGL
                      </span>
                      <h2>ЖИВОЙ МИР</h2>
                    </div>
                    <div className="dna-state">
                      <span>УРОВЕНЬ {dnaWorldState.level}</span>
                      <strong>XP CORE</strong>
                      <small>
                        WorldState v{dnaWorldState.version} · сигналы{" "}
                        {Math.round(dnaWorldState.qualityCoverage * 100)}%
                      </small>
                    </div>
                  </div>
                  <div className="world-frame">
                    <WorldSessionStage state={dnaWorldState} />
                  </div>
                  <div className="dna-next">
                    <span>СЛЕДУЮЩИЙ ЭТАП</span>
                    <strong>
                      XP Engine → WorldState → события мира → renderer
                    </strong>
                    <p>
                      Renderer получает уже разрешённое состояние мира и не
                      считает финансовые метрики внутри Pixi. Погода, время
                      суток и semantic events пока не меняют арт до отдельного
                      production mapping.
                    </p>
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </section>
      {pulseMode && (
        <Suspense fallback={null}>
          <PulseMode
            snapshot={snapshot}
            live={portfolioStatus === "LIVE"}
            onClose={() => setPulseMode(false)}
          />
        </Suspense>
      )}

      <PersonalizationControl
        preferences={uiPreferences}
        onChange={updateUiPreferences}
        onReset={resetUiPreferences}
      />
    </main>
  );
}
