# QVANIX v216 — Core broker recovery integrity (2026-10-08)

A verified broker portfolio could be delayed or discarded when optional history recovery failed. This patch publishes the verified portfolio immediately and enriches history independently. A late history response is ignored if a newer refresh has already won or the workspace is unmounted.

The browser recovery cache now requires a recent, structurally valid broker-source snapshot. Expired, future-dated, fallback-source and malformed payloads are rejected before the financial UI renders them.

The header distinguishes current verified LIVE/BASE data from a saved CACHE snapshot while a broker source is unavailable. No trading permissions, financial formulas or broker API contracts were changed.

The v3 test gate includes the v216 regression.
