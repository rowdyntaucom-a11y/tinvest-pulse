# QVANIX · Mobile navigation touch recovery v1

Date: 2026-09-15

## Trigger

Samsung screen recording of the current v2 preview showed visible touch indicators on primary navigation controls without a corresponding workspace transition. Confirmed examples in the recording include repeated taps on `Анализ`, `Доход`, `Главная` and `DNA` while long/deep workspaces remained visible.

## Root cause

The mobile primary navigation is `position: fixed`, but it is rendered inside `.topbar`. Personalization CSS creates sibling stacking contexts for `.topbar` and `.app-view` with the same `z-index: 2`. On long mobile workspaces the scroll owner can therefore remain above the fixed-nav descendant for hit testing even while the nav is visually visible.

Two global fixed utilities also occupied primary navigation territory on mobile:

- personalization control at the lower left;
- context help at the lower right.

Because their component CSS may load after navigation CSS, older positional overrides were not a reliable final cascade owner.

## Recovery

Added a final-loaded `mobileControlLayer.css` which:

- raises the mobile `.topbar` stacking context above `.app-view`;
- explicitly restores pointer/touch ownership to `.mobile-primary-nav` and its buttons;
- uses `touch-action: manipulation` for direct tap handling;
- keeps the existing distinct raised DNA action;
- moves personalization above the primary row;
- moves context help above the primary row and left of the DNA action so neither utility covers a primary target;
- preserves a separate landscape placement.

No navigation state model or financial/data logic changed.

## Regression coverage

`uxNavigation.test.ts` now checks:

- canonical primary workspace ids remain unchanged;
- the interaction layer gives mobile navigation a higher stacking contract;
- primary buttons retain direct pointer/touch ownership;
- floating utility offsets preserve the primary row;
- the interaction layer is imported after the existing shell/readability CSS so the cascade is deterministic.

## Boundaries

- no financial formulas changed;
- no broker/API/data contracts changed;
- no Living World runtime or Pixi code changed;
- no binary assets added;
- no CSS/test/security gate weakened.

## Device follow-up

After merge and Render deploy, re-run the same Samsung path from the recording: deep Portfolio Structure → `Анализ` → `Доход` → `Главная` → `Цель` → `DNA`, including repeated taps near the floating personalization/help controls. Every tap must change the active workspace immediately and DNA must open the current Living World.
