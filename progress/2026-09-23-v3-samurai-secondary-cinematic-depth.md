# 2026-09-23 — Samurai secondary cinematic depth

Source: Samsung recording `1000031415.mp4`.

## Recording finding

The browser/document scrollbar regression addressed by PRs #620 and #621 is no longer visible.

The remaining grey vertical pill on the far-right edge is a Samsung system overlay, not page scroll chrome. In sampled frames from Home, Analytics story, Assets, Analysis, Income and Goal it occupies the same fixed screen span, independent of QVANIX content and workspace position. That behavior matches the Samsung Edge handle rather than a web scrollbar.

## UX finding

The secondary fail-closed chapters are technically clean now, but they are still too compressed into one cockpit-sized viewport. Assets, Analysis, Income and Goal read as dense panels rather than a world with atmosphere. This conflicts with the newer approved direction: **FIRST SCREEN MUST ANSWER. DEPTH MAY SCROLL.**

## Change

- Preserve the fixed visual-viewport app shell so browser/root scroll chrome does not return.
- Make the chapter workspace itself the only intentional vertical scroll owner.
- Hide its scrollbar while preserving touch scrolling and overscroll containment.
- Expand the primary chapter instruments:
  - Assets formation map;
  - Analysis radar;
  - Income treasury ledger.
- Push route/action detail lower so the first viewport reads as a scene and primary instrument instead of a wall of widgets.
- Give Goal the same scene → decision → route rhythm with more vertical breathing room.
- Keep the six-item bottom navigation fixed and unchanged.
- No finance, API, trust, navigation semantics, DNA behavior or data methodology changed.

## Regression guard

`samuraiCompactMetrics.test.ts` now guards the internal scroll owner, hidden-scrollbar approach and the larger cinematic instrument/depth geometry.
