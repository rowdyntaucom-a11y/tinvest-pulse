# 2026-09-23 — Samurai Home Variant B scroll story

Decision: use the second layout concept as the architectural direction for Samurai Home.

## Why the concept looked richer than the current app

The concept was rendered as one cinematic image, so lighting, saturation, moon/gate scale, fog and subject placement were solved together. The live app instead reused the older fal.ai Ronin master behind many independently-authored CSS overlays. Over time the Home hero was also compressed to ~30svh and darkened by several gradients so more widgets could fit into one screen. The result preserved data density but flattened the artwork and made the theme feel like a background underneath a dashboard.

## New architecture

- Samurai Home is now a two-stage vertical story.
- Stage 1 is a full-viewport cinematic scene with only Capital/Result and a deliberate "more analytics" cue.
- Stage 2 is the analytics terminal: opening-date context, portfolio/IMOEX/excess, TWR/XIRR/income/assets, chart and formation.
- The fixed six-tab navigation remains available on both stages.
- Scrolling is owned by Samurai Home only and uses proximity snap instead of a hard mandatory trap.
- The hero art is rendered on its own pseudo-layer with slightly stronger saturation/contrast/brightness so UI overlays are not affected.
- Dark overlays were reduced and the art again owns almost the entire first viewport.
- Analytics controls are allowed to breathe: secondary metrics use a 2x2 layout and the chart is materially taller.
- Reduced-motion users get non-animated scrolling/cue behavior.

## Boundary

This is a composition/art-direction change only. Broker reads, trust rules, formulas, since-inception math, navigation destinations and DNA are unchanged.
