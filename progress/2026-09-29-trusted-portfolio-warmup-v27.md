# QVANIX Trusted Portfolio Warmup v27 — 2026-09-29

This pass adds a production canary for the broker dashboard after service startup.

- After the existing broker/history warmup succeeds, production calls buildDashboard once.
- The canary logs only booleans, position count and source availability; it never logs account identity, balances, holdings, tokens or cashflows.
- This both warms the same path the light Core uses and proves whether the deployed runtime can compose a trusted dashboard before a user opens the app.
- server-base.js is now covered by the v2 production workflow and syntax checks.

The active product remains light QVANIX Financial Core. DNA remains frozen.
