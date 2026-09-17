# Living World Pixi loader boundary — clean recovery v2

- Base: factual `main` `8de62f5b1ff8fb649f1b1cc2bbc6f42fa8c91cf3`.
- Source delta: stale PR #378 only; its merge base is `532e1a804bae139d081a690907ff4605515cdb91`, so the stale branch is not continued.
- Scope: add a regression that rejects direct `Pixi Assets.load(...)` calls in Living World TS/TSX sources and register it in the canonical `test:core` gate.
- Architecture remains: one runtime owner, one Pixi Application, one ticker, deferred Pixi, browser-native reviewed-asset loading, caller-owned `Sprite.from(...)`.
- No production runtime, finance, broker/API, Data Trust, Metric Drill-down, v1, bundle budget, or security policy changes.
- Merge requires fresh-main race check and full CI. Render verification follows any merge.
