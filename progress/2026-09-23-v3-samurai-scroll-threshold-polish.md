# 2026-09-23 — Samurai scroll threshold polish

Source: Samsung recording `1000031410.mp4`.

## What the recording confirmed

- Variant B is the right architecture.
- The first viewport now has the desired atmosphere: moon, torii, rain and samurai read as the product, not as a background.
- The remaining weak point is the transition between floors. During a partial swipe there is a long black trough before Analytics becomes the visual focus.
- The untrusted analytics floor is better than the old empty dashboard, but it still reads darker/flatter than the cinematic first stage.

## Patch

- Keep the first viewport composition and Capital panel.
- Reduce the heavy black fade at the bottom of the scene so the wet-ground artwork survives closer to the threshold.
- Add a thin visual threshold layer so the stage change feels intentional.
- Start the Analytics header closer to the page boundary.
- Reveal more of the Samurai artwork beneath Analytics instead of covering it with a ~95% opaque black layer.
- Tighten the untrusted trust-gate height and spacing so it feels like one authored shrine/data gate rather than another full-screen form.
- Preserve proximity snapping, fixed nav and reduced-motion behavior.

No finance/API/trust/data changes.
