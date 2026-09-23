# 2026-09-23 — Samurai chapter cockpit pass

## Trigger
The latest Samsung recording confirmed that the fallback trust gates are working and the main Home poster is much stronger. The remaining weaknesses were structural:
- secondary pages still stacked a workspace identity rail and a large cinematic title as two separate banners;
- Assets / Analysis / Income / Goal still shared too much of the same red-sun header treatment;
- the compact data-state chip truncated into ambiguous text such as “Резервный исто…”;
- Home still exposed a tiny residual page scrollbar despite visually fitting the important content.

## Implemented
- Consolidated Samurai workspace chrome + page head into a tighter “chapter cockpit”.
- Added distinct workspace motifs without adding new layout blocks:
  - Assets: formation grid / roster lines;
  - Analysis: radar / sight geometry;
  - Income: treasury seal / ledger bands;
  - Goal: torii / path geometry.
- Improved trust-gate microcopy legibility while preserving fail-closed semantics and zero invented financial values.
- Added short Samurai-only state-chip labels (LIVE / РЕЗЕРВ / ОШИБКА etc.) while keeping full canonical state text in the accessible label and expanded detail sheet.
- Reduced Goal first-screen height slightly.
- Enforced the Samurai Home one-screen contract and removed the residual document scrollbar seen in the Samsung recording.
- Added reduced-motion-safe ambient chapter motion.
- No broker/API, finance calculations, trust logic or DNA behavior changed.