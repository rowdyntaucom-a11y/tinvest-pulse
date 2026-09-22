# V3 four production worlds — 2026-09-22

Generated one controlled fal.ai FLUX 2 Turbo portrait candidate for each approved visual direction: Samurai, Cosmos, Light and Aurora. The one-shot autorun was disabled immediately after all four results completed.

Home now uses a neutral `v3-production-theme-art` layer instead of the rejected CSS-drawn Samurai sun/mountains/figure primitives. Existing shell IDs remain stable: Samurai→samurai, Cosmos→carbon, Light→horizon/minimal, Aurora→aurora. Canonical financial UI and data remain React-rendered above the artwork; no text, figures, charts or financial values are baked into generated art.

Temporary preset/autorun hooks were removed after generation. The protected POST art pipeline from #531 remains server-only and separately gated. No financial methodology, broker adapter or Asset Workspace contract changed.

The generated candidates are currently served from fal media URLs. A later asset-hardening pass should vendor approved binaries locally once binary transfer is available, without changing the visual contract.
