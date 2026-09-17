# Living World mount policy clean recovery v2

Factual base: `4b1c9f88ea4d34e18efd6def980bd90785bf33c8`.

This pass clean-transplants only the still-relevant regression intent from stale PR #381. It verifies the existing `resolveWorldAssetMountDecision(...)` boundary: reviewed art mounts only when canonical manifest readiness and browser-native load success agree; missing, failed, or non-ready assets preserve procedural fallback.

No production runtime, Pixi Application/ticker ownership, asset files, financial formulas, broker/API, Data Trust, Metric Drill-down, navigation, v1, bundle budget, or security policy is changed. Direct Pixi `Assets.load(...)` remains prohibited.

Release gate: full current GitHub CI, review-thread audit, factual-main race check, narrow-diff verification, then at most one Living World squash merge in this pass and Render verification when observable.
