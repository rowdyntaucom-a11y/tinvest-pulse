# QVANIX analytics core

The analytics layer is deterministic and explainable. It must never depend on an LLM for numerical results.

Current methodology:
- TWR from the normalized portfolio index;
- Max Drawdown from running peak;
- annualized volatility from daily TWR-index returns (`σ_daily × √252`);
- Sharpe against the available CBR risk-free rate;
- Sortino using downside deviation below the same minimum acceptable return proxy;
- HHI concentration and `1 / HHI` effective equally weighted positions;
- transparent Health Score v1.0 with component weights and visible availability state;
- benchmark-relative diagnostics only on the shared portfolio/IMOEX sample;
- historical-bootstrap Monte Carlo uses empirical returns and distribution outputs rather than a fake precise forecast;
- per-asset correlation uses paired daily returns and explicit sample gates;
- historical stress scenarios are accepted only through the versioned `stressScenarios.ts` boundary.

## Historical stress-scenario rules

A historical stress scenario is a deterministic scenario, not a forecast or recommendation.

- Every shock must be a sourced observed return with HTTPS provenance and a source date.
- Scenario event dates and schema version are mandatory.
- No crisis/shock values are bundled merely to make the UI look complete.
- Duplicate asset-class shocks are rejected.
- A whole-portfolio impact is withheld unless every positive current asset-class exposure is covered by a sourced shock.
- Partial coverage may expose only the covered contribution plus the missing asset classes; it must not be relabeled as total portfolio stress.
- Scenario catalogs must be reviewed/versioned separately before UI exposure.

The portfolio and IMOEX lines must always share one Y scale. Never independently rescale comparison series.

History shorter than the intended 12-month window must be labeled as the actually available period rather than presented as a full-year sample.

Future additions remain gated by data quality: richer rolling windows, sourced scenario catalogs, attribution depth, verified bond duration/yield semantics and later Pro/Terminal modules.
