# QVANIX analytics core

The analytics layer is deterministic and explainable. It must never depend on an LLM for numerical results.

Current v1 methodology implemented in `metrics.ts`:
- TWR from the normalized portfolio index;
- Max Drawdown from running peak;
- annualized volatility from daily TWR-index returns (`σ_daily × √252`);
- Sharpe against the available CBR risk-free rate;
- Sortino using downside deviation below the same minimum acceptable return proxy;
- HHI concentration and `1 / HHI` effective equally weighted positions;
- transparent Health Score v1.0 with component weights and renormalization when a component is unavailable.

The portfolio and IMOEX lines must always share one Y scale. Never independently rescale comparison series.

History shorter than the intended 12-month window must be labeled as the actually available period rather than presented as a full-year sample.

Future additions: drift-based rebalancing, historical-bootstrap Monte Carlo (P10/P50/P90), dividend YoC/growth, look-through and advanced risk metrics.
