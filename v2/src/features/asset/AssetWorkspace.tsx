import { useEffect, useMemo, useState } from "react";
import type { PositionSnapshot } from "../../lib/portfolioApi";
import {
  loadAssetHistory,
  type AssetHistorySeries,
} from "../../lib/assetHistoryApi";
import { usePayoutSnapshot } from "../../lib/payoutSnapshot";
import { buildIncomeSourceRows } from "../income/incomeSourceRows";
import { InstrumentBadge } from "../portfolio/InstrumentBadge";
import {
  loadInstrumentBadges,
  type InstrumentBadgePayload,
} from "../portfolio/instrumentBadges";
import {
  deriveQvanixFundamentalInterpretation,
  formatAssetFundamentalMetric,
  loadAssetFundamentals,
  unavailableAssetFundamentals,
  type AssetFundamentalsSnapshot,
} from "../portfolio/assetFundamentals";
import "./assetWorkspace.css";
import { evaluateAssetHistoryTrust, evaluateFundamentalsTrust } from "../../lib/dataTrust";
import { DataTrustIndicator } from "../shared/DataTrustIndicator";

type View =
  | "overview"
  | "fundamentals"
  | "history"
  | "income"
  | "risk"
  | "position";
const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function typeLabel(value: string) {
  const v = value.toLowerCase();
  return v.includes("bond")
    ? "Облигация"
    : v.includes("share")
      ? "Акция"
      : v.includes("etf") || v.includes("fund")
        ? "Фонд"
        : v.includes("currenc")
          ? "Валюта"
          : v.includes("future")
            ? "Фьючерс"
            : "Инструмент";
}
function isBond(position: PositionSnapshot) {
  return position.instrumentType.toLowerCase().includes("bond");
}
function quote(position: PositionSnapshot, value: number) {
  return `${money.format(value)} ${isBond(position) ? "%" : "₽"}`;
}
function fundamentalsUnavailableCopy(
  reason: AssetFundamentalsSnapshot["reason"],
) {
  if (reason === "UNSUPPORTED_INSTRUMENT")
    return {
      title: "ПОКАЗАТЕЛИ НЕ ПОДДЕРЖИВАЮТСЯ",
      detail:
        "Для этого типа инструмента фундаментальные показатели не публикуются.",
    };
  if (reason === "API_ERROR" || reason === "NO_VERIFIED_SOURCE")
    return {
      title: "НЕ УДАЛОСЬ ЗАГРУЗИТЬ ПОКАЗАТЕЛИ",
      detail:
        "Проверьте соединение и повторите попытку позже. Данные позиции остаются доступными.",
    };
  if (reason === "INVALID_PAYLOAD")
    return {
      title: "ОТВЕТ НЕ ПРОШЁЛ ПРОВЕРКУ",
      detail:
        "Непроверенные значения скрыты; попробуйте обновить данные позже.",
    };
  return {
    title: "НЕТ ПОКАЗАТЕЛЕЙ В ОФИЦИАЛЬНОМ ОТВЕТЕ",
    detail:
      "T‑Invest ответил для этого актива, но не вернул пригодных метрик. Нулевые значения не подменяют отсутствующие.",
  };
}
function matchSeries(position: PositionSnapshot, rows: AssetHistorySeries[]) {
  const ids = [position.instrumentUid, position.figi].filter(Boolean);
  const matches = rows.filter(
    (row) => row.instrumentId && ids.includes(row.instrumentId),
  );
  return matches.length === 1 ? matches[0] : null;
}

export function AssetWorkspace({
  position,
  portfolioValue,
  onBack,
}: {
  position: PositionSnapshot;
  portfolioValue: number;
  onBack: () => void;
}) {
  const [view, setView] = useState<View>("overview");
  const [scoreView, setScoreView] = useState(false);
  const [fundamentals, setFundamentals] = useState<AssetFundamentalsSnapshot>(
    () => unavailableAssetFundamentals(),
  );
  const [fundamentalsLoading, setFundamentalsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState<AssetHistorySeries | null>(null);
  const [historyTrustInput, setHistoryTrustInput] = useState({ available: false, source: null as string | null, latestPointAt: null as string | null, requested: 0, availableSeries: 0, points: 0 });
  const [badges, setBadges] = useState<InstrumentBadgePayload | null>(null);
  const { calendar } = usePayoutSnapshot(true);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setFundamentalsLoading(true);
    setHistoryLoading(true);
    setHistory(null);
    if (position.instrumentUid)
      void loadAssetFundamentals(position.instrumentUid, controller.signal)
        .then((value) => {
          if (active) setFundamentals(value);
        })
        .finally(() => {
          if (active) setFundamentalsLoading(false);
        });
    else {
      setFundamentals(unavailableAssetFundamentals("UNSUPPORTED_INSTRUMENT"));
      setFundamentalsLoading(false);
    }
    void loadAssetHistory(
      controller.signal,
      position.instrumentUid ?? position.figi ?? undefined,
    )
      .then((value) => {
        if (active) {
          const matched = matchSeries(position, value.series);
          setHistory(matched);
          setHistoryTrustInput({ available: value.available, source: value.source, latestPointAt: matched?.points.at(-1)?.date ?? null, requested: value.requested, availableSeries: value.availableSeries, points: matched?.points.length ?? 0 });
        }
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    void loadInstrumentBadges().then((value) => {
      if (active) setBadges(value);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [position]);
  const income = useMemo(
    () =>
      calendar
        ? (buildIncomeSourceRows(
            calendar.actual.items,
            calendar.events,
            [position],
            Number.MAX_SAFE_INTEGER,
          ).find(
            (row) => row.figi?.toUpperCase() === position.figi?.toUpperCase(),
          ) ?? null)
        : null,
    [calendar, position],
  );
  const interpretation = deriveQvanixFundamentalInterpretation(fundamentals);
  const fundamentalsTrust = evaluateFundamentalsTrust({ loading: fundamentalsLoading, ...fundamentals }, Date.now());
  const historyTrust = evaluateAssetHistoryTrust(historyTrustInput, Date.now());
  const unavailableCopy = fundamentalsUnavailableCopy(fundamentals.reason);
  const basis = position.currentValue - position.expectedYield;
  const pnlPct = basis > 0 ? position.expectedYield / basis : null;
  const groups = [
    [
      "ОЦЕНКА",
      [
        "marketCap",
        "peRatioTtm",
        "priceToSalesTtm",
        "priceToBookTtm",
        "evToEbitdaTtm",
      ],
    ],
    ["РЕНТАБЕЛЬНОСТЬ", ["roeTtm", "roaTtm", "roicTtm"]],
    ["ФИНАНСЫ", ["revenueTtm", "ebitdaTtm", "netIncomeTtm", "netDebtToEbitda"]],
    ["ДЕНЕЖНЫЙ ПОТОК И ДИВИДЕНДЫ", ["freeCashFlowTtm", "dividendYield"]],
  ] as const;
  return (
    <div className="asset-workspace">
      <button className="asset-back" onClick={onBack}>
        ← НАЗАД
      </button>
      <section className="panel asset-hero">
        <InstrumentBadge payload={badges} position={position} size="detail" />
        <div>
          <span>
            {typeLabel(position.instrumentType)} · {position.ticker}
          </span>
          <h2>{position.name}</h2>
          <small>
            {fundamentals.source === "T_INVEST"
              ? "T‑Invest · проверенные данные"
              : "Фундаментальные данные недоступны"}
          </small>
        </div>
        <div className="asset-hero__numbers">
          <strong>
            {position.currentPrice > 0
              ? quote(position, position.currentPrice)
              : "—"}
          </strong>
          <span>
            {money.format(position.currentValue)} ₽ ·{" "}
            {pct.format(position.weight * 100)}% портфеля
          </span>
          <b
            className={
              position.expectedYield >= 0 ? "is-positive" : "is-negative"
            }
          >
            {position.expectedYield >= 0 ? "+" : ""}
            {money.format(position.expectedYield)} ₽ P/L
          </b>
        </div>
      </section>
      <nav className="asset-nav" aria-label="Инструмент">
        {(
          [
            ["overview", "ОБЗОР"],
            ["fundamentals", "ПОКАЗАТЕЛИ"],
            ["history", "ИСТОРИЯ"],
            ["income", "ДОХОД"],
            ["risk", "РИСК"],
            ["position", "ПОЗИЦИЯ"],
          ] as Array<[View, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            className={view === key ? "is-active" : ""}
            onClick={() => setView(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      {view === "overview" && (
        <section className="panel asset-grid">
          <article>
            <span>СТОИМОСТЬ</span>
            <strong>{money.format(position.currentValue)} ₽</strong>
          </article>
          <article>
            <span>ДОЛЯ</span>
            <strong>{pct.format(position.weight * 100)}%</strong>
          </article>
          <article>
            <span>НЕРЕАЛИЗОВАННЫЙ P/L</span>
            <strong>
              {position.expectedYield >= 0 ? "+" : ""}
              {money.format(position.expectedYield)} ₽
            </strong>
          </article>
          <article>
            <span>ДОХОД · ФАКТ</span>
            <strong>
              {income?.fact ? `${money.format(income.fact)} ₽` : "—"}
            </strong>
          </article>
          <p>
            Цена, стоимость и accumulated expectedYield приходят из снимка
            портфеля брокера. P/L не называется дневной доходностью.
          </p>
        </section>
      )}
      {view === "fundamentals" && (
        <section className="panel">
          <div className="asset-dual">
            <button
              className={scoreView ? "is-active" : ""}
              onClick={() => setScoreView(true)}
            >
              ОЦЕНКА QVANIX
            </button>
            <button
              className={!scoreView ? "is-active" : ""}
              onClick={() => setScoreView(false)}
            >
              ПОКАЗАТЕЛИ
            </button>
          </div>
          {fundamentalsLoading ? (
            <div className="asset-unavailable">
              <strong>ЗАГРУЖАЕМ ПОКАЗАТЕЛИ</strong>
              <p>Основные данные позиции уже доступны.</p>
            </div>
          ) : scoreView ? (
            <div className="asset-unavailable">
              <strong>МЕТОДИКА ЕЩЁ НЕ АКТИВИРОВАНА</strong>
              <p>{interpretation.note}</p>
              <button onClick={() => setScoreView(false)}>
                Открыть классические показатели
              </button>
            </div>
          ) : fundamentals.available ? (
            <div className="fundamental-groups">
              {groups.map(([label, keys]) => (
                <div key={label}>
                  <h3>{label}</h3>
                  {fundamentals.metrics
                    .filter((m) => (keys as readonly string[]).includes(m.key))
                    .map((m) => (
                      <article key={m.key}>
                        <span>{m.label}</span>
                        <strong>{formatAssetFundamentalMetric(m)}</strong>
                      </article>
                    ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="asset-unavailable">
              <strong>{unavailableCopy.title}</strong>
              <p>{unavailableCopy.detail}</p>
            </div>
          )}
          <p className="method-note">
            Источник:{" "}
            {fundamentals.source === "T_INVEST"
              ? "официальный T‑Invest GetAssetFundamentals"
              : "недоступен"}
            {fundamentals.updatedAt
              ? ` · ${date.format(new Date(fundamentals.updatedAt))}`
              : ""}
            .
          </p>
          <DataTrustIndicator trust={fundamentalsTrust} />
        </section>
      )}
      {view === "history" && (
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">ТЕКУЩИЙ ИНСТРУМЕНТ · НЕ ПОРТФЕЛЬ</span>
              <h2>ИСТОРИЯ ЦЕНЫ</h2>
            </div>
            <small>
              {history ? `${history.points.length} точек` : "нет покрытия"}
            </small>
          </div>
          {historyLoading ? (
            <div className="asset-unavailable">
              Загружаем историю инструмента…
            </div>
          ) : history ? (
            <div
              className="asset-history"
              role="img"
              aria-label={`История ${position.ticker}`}
            >
              {history.points.slice(-60).map((p, i, a) => {
                const values = a.map((x) => x.value),
                  min = Math.min(...values),
                  max = Math.max(...values);
                return (
                  <i
                    key={p.date}
                    title={`${date.format(new Date(p.date))}: ${quote(position, p.value)}`}
                    style={{
                      height: `${10 + ((p.value - min) / Math.max(1, max - min)) * 90}%`,
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="asset-unavailable">
              Недостаточно подтверждённой истории или UID не входит в покрытие
              endpoint.
            </div>
          )}
          <p className="method-note">
            Точки: официальный T‑Invest GetCandles. Пропуски не интерполируются.
          </p>
          {!historyLoading && <DataTrustIndicator trust={historyTrust} />}
        </section>
      )}
      {view === "income" && (
        <section className="panel asset-grid">
          <article>
            <span>ПОЛУЧЕНО · ФАКТ</span>
            <strong>
              {income?.fact ? `${money.format(income.fact)} ₽` : "—"}
            </strong>
          </article>
          <article>
            <span>12М · ПОДТВЕРЖДЕНО</span>
            <strong>
              {income?.forecast ? `${money.format(income.forecast)} ₽` : "—"}
            </strong>
          </article>
          <article>
            <span>YoC · ПОДТВЕРЖДЁННАЯ БАЗА</span>
            <strong>
              {income?.yoc12m != null
                ? `${pct.format(income.yoc12m * 100)}%`
                : "—"}
            </strong>
          </article>
          <p>
            Переиспользуется Income core: факт после налога и отдельное
            официальное расписание до налога не складываются.
          </p>
        </section>
      )}
      {view === "risk" && (
        <section className="panel asset-grid">
          <article>
            <span>КОНЦЕНТРАЦИЯ</span>
            <strong>{pct.format(position.weight * 100)}%</strong>
          </article>
          <article>
            <span>ВКЛАД В РИСК</span>
            <strong>—</strong>
            <small>нет подтверждённого instrument-level boundary</small>
          </article>
          <p>
            Доля позиции — наблюдаемый показатель концентрации, не VaR и не
            рекомендация.
          </p>
        </section>
      )}
      {view === "position" && (
        <section className="panel asset-grid">
          <article>
            <span>КОЛИЧЕСТВО</span>
            <strong>{money.format(position.quantity)}</strong>
          </article>
          <article>
            <span>СРЕДНЯЯ ЦЕНА</span>
            <strong>
              {position.averagePrice > 0
                ? quote(position, position.averagePrice)
                : "—"}
            </strong>
          </article>
          <article>
            <span>СТОИМОСТЬ ПРИОБРЕТЕНИЯ</span>
            <strong>
              {position.costBasis > 0
                ? `${money.format(position.costBasis)} ₽`
                : "—"}
            </strong>
          </article>
          <article>
            <span>ТЕКУЩАЯ СТОИМОСТЬ</span>
            <strong>{money.format(position.currentValue)} ₽</strong>
          </article>
          <article>
            <span>P/L</span>
            <strong>
              {position.expectedYield >= 0 ? "+" : ""}
              {money.format(position.expectedYield)} ₽{" "}
              {pnlPct == null ? "" : `· ${pct.format(pnlPct * 100)}%`}
            </strong>
          </article>
          <article>
            <span>ДОЛЯ ПОРТФЕЛЯ</span>
            <strong>
              {portfolioValue > 0
                ? `${pct.format((position.currentValue / portfolioValue) * 100)}%`
                : "—"}
            </strong>
          </article>
        </section>
      )}
    </div>
  );
}
