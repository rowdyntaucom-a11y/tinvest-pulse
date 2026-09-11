# QVANIX Terminal / Trader-Quant — decision record

Source reviewed: `QVANIX_advanced_tools_and_math.pdf` supplied by the user on 2026-09-11.

## Product decision

Adopt the idea of a separate **QVANIX Terminal / Pro mode**. Do not turn the default retail/mobile shell into a dense trading terminal. The advanced layer must reuse the same deterministic portfolio core, but heavy realtime/quant modules should remain separate services when they arrive.

Core rule remains unchanged: calculations come from deterministic code and explicit data sources; LLM may translate user intent into structured parameters later, but it never invents or calculates financial values.

## TAKE NOW / nearest deterministic depth

1. **Benchmark-relative analytics** — tracking error, information ratio, beta/correlation with strict sample gates. Initial version already implemented in the current v2 risk workspace.
2. **Historical/empirical tail risk** — add historical VaR + CVaR / Expected Shortfall only after the minimum return-history gate is satisfied. Do not fit a normal distribution merely to produce a number.
3. **Correlation matrix** — useful Pro view once per-asset price histories are available and cleaned. Show pair count / date coverage.
4. **Historical scenario stress framework** — deterministic shocks/scenarios labelled as `stress scenario, not forecast`; source and date of every shock must be traceable.
5. **Performance attribution groundwork** — position/class contribution first. Full Brinson attribution is gated on reliable benchmark constituent/sector weights and returns.
6. **Bond analytics** — maturity ladder, issuer concentration, coupon type, currency/nominal dimensions, and verified duration/yield semantics. This remains ahead of most trading-specific modules because it directly improves the existing user portfolio use case.
7. **Pro-mode information architecture** — keep the normal app simple and introduce Terminal only when it has enough real modules to justify the switch.

## TAKE NEXT, but with stronger model/data gates

### Portfolio optimization
- Start with **minimum-variance / risk-parity** diagnostics because they do not require invented expected returns.
- Markowitz efficient frontier is acceptable only with explicit expected-return assumptions, constraints, sample window and sensitivity warnings.
- Black-Litterman comes later. User views must be explicit structured inputs. LLM may eventually translate text into P/Q/Omega, but the matrix math remains deterministic.
- Output must be framed as scenario/diagnostic allocation, not an individualized buy/sell instruction.

### Technical analysis
- OHLCV charts and deterministic indicators (SMA/EMA/MACD/RSI/Bollinger/ATR/Stochastic/VWAP) are accepted for Terminal mode.
- Custom alerts should be based on **user-authored rules**, not system-generated personalized trade recommendations.
- Intraday/order-book features require a separate market-data architecture and a cost review before production.

### Backtesting
- Accepted as a separate service / job queue, not part of the current Node monolith.
- Required correctness controls: next-bar execution, commissions, slippage, corporate actions, delistings/survivorship-bias controls, look-ahead prevention, out-of-sample / walk-forward testing and record of parameter trials.
- Deflated Sharpe is useful only after the engine records the number of trials and sufficient trade/return history.
- Paper trading is accepted later as a sandbox; no real-money auto-execution in the current product plan.

### Options
- Greeks/IV/payoff visualizer are accepted for a later dedicated service after a trustworthy option-chain source is selected.
- Black-Scholes is only for instruments for which its assumptions are appropriate; use instrument/venue-specific model choices instead of universal formulas.
- Portfolio risk must not treat option nominal value as simple cash exposure.

### External API
- Read-only REST/webhooks/SDK can become a high-tier feature after auth scopes, rate limits and audit logging exist.
- Write/trading scopes are not part of the approved MVP.

## DO NOT PRODUCTIZE YET / requires legal or venue-specific validation

1. **Personalized trade signals/recommendations.** Explicit confirmation before an order does not by itself remove investment-advice regulation risk. QVANIX should stay on information, calculators, scenarios, screeners and user-authored alerts unless the legal operating model changes.
2. **Generic liquidation-price formula.** Margin/liquidation rules differ by broker, exchange, portfolio margin system, fees and maintenance tiers. Any future calculator must be venue-specific and source its rules.
3. **Tax-loss harvesting / FIFO-LIFO-HIFO recommendations for Russia.** Tax-lot and broker-reporting rules require a dedicated current tax/legal review before QVANIX tells a Russian user which lot to sell.
4. **Kelly as position-sizing advice.** If ever included, keep it in strategy statistics / educational sandbox with explicit uncertainty and fractional-Kelly context; never turn it into an automatic recommended order size.
5. **Russian Fama-French factors.** Do not synthesize factor data without a documented market dataset and reproducible factor-portfolio construction.

## Architecture decision

Do not put realtime market data, option chains or backtests into the existing web process.

Future service boundaries:
- `market-data-service`: OHLCV/order book/realtime streams, Redis hot cache + time-series storage.
- `quant-analytics-service`: CVaR, PCA, correlation, optimization, factor models, attribution jobs.
- `options-service`: chains, IV, Greeks, strategy payoff.
- `backtest-engine`: queued isolated jobs with resource quotas.
- `alerts-service`: evaluates safe DSL rules and emits push/webhooks.
- API gateway: separate read-only scopes/rate limits for external access.

No paid/realtime infrastructure is provisioned until the user approves the cost model.

## Roadmap order for QVANIX

The uploaded document proposes technical analysis first. For the current project, reorder slightly to exploit the analytics core already built and the user's real portfolio needs:

1. Finish current Portfolio / Analytics / Income / Bond depth.
2. Tail risk: historical VaR + CVaR, correlation, scenario stress.
3. Pro-mode shell + technical analysis foundation.
4. Risk parity / minimum variance, then constrained Markowitz; Black-Litterman later.
5. Options service.
6. Backtesting + paper trading + read-only API/webhooks.
7. Full Brinson attribution + tax tooling after data/legal prerequisites.

This preserves the uploaded document's core strategy — occupy the space between a retail tracker and a full terminal — without sacrificing data honesty, mobile simplicity or Russian regulatory safety.