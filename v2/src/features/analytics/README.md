# QVANIX analytics core

The analytics layer is deterministic and explainable. It must never depend on an LLM for numerical results.

Current methodology implemented in `metrics.ts`:
- TWR from the normalized portfolio index;
- Max Drawdown from running peak;
- annualized volatility from daily TWR-index returns (`σ_daily × √252`);
- Sharpe against the available CBR risk-free rate;
- Sortino using downside deviation below the same minimum acceptable return proxy;
- HHI concentration and `1 / HHI` effective equally weighted positions;
- transparent Health Score v1.0 with component weights and renormalization when a component is unavailable.

Drawdown recovery diagnostics in `recoveryDiagnostics.ts` use the same portfolio TWR index. A completed recovery is recorded only when the index regains the prior peak. Active drawdowns stay separate from completed episodes. Recovery statistics fail closed below 60 daily return observations; 252 observations marks a mature sample. The module reports historical episode depth and calendar durations only and does not forecast a future recovery date.

Monte Carlo scenario diagnostics in `monteCarlo.ts` use deterministic historical block bootstrap v2. The engine resamples contiguous 5-trading-day blocks of actual daily portfolio TWR returns rather than sampling every day independently, preserving a limited amount of short-horizon serial structure without inventing an expected return or volatility model. The scenario gate remains 60 valid daily returns for preview and 252 for a mature sample. P10 / P50 / P90 are distribution percentiles, not forecasts or guarantees. Future contributions, withdrawals, taxes and commissions are not inferred. Daily TWR moves outside the current integrity band (`<= -50%` or `>= +50%`) are excluded from the bootstrap sample and the excluded count is exposed to the UI instead of being hidden.

Benchmark-relative analytics use only overlapping portfolio / IMOEX dates. Tracking Error, Information Ratio, Beta and correlation stay gated until the paired-return sample is sufficient; no coefficient is extrapolated from missing benchmark observations.

Tail risk uses historical one-day portfolio TWR returns. VaR 95% / CVaR (Expected Shortfall) are withheld below the configured history gate and are explicitly historical risk diagnostics, not maximum-loss forecasts.

Allocation diagnostics in `allocationDiagnostics.ts` are a Pro/Terminal calculation boundary, not a trade recommendation. The engine aligns all selected assets on one common daily-return sample and fails closed below 60 common returns; 252 common returns marks a mature sample. It exposes three risk-only scenarios: equal weight as a control, long-only minimum variance solved deterministically on the sample covariance matrix, and equal-risk-contribution solved by deterministic cyclic coordinate updates. Expected returns, target prices and LLM-derived assumptions are not inputs. Every output retains per-asset sample volatility, portfolio sample volatility and risk-contribution shares so the result can be audited before any future UI integration.

The portfolio and IMOEX lines must always share one Y scale. Never independently rescale comparison series.

History shorter than the intended 12-month window must be labeled as the actually available period rather than presented as a full-year sample.

Future additions remain gated by reliable data and explicit methodology: historical position-level return attribution, verified issuer-level bond concentration, duration/YTM semantics, and any further optimization or Terminal analytics that require new market-data assumptions.
