# QVANIX v3 — mobile readability floor

Date: 2026-09-19

## Why
The canonical UX direction says readability wins over artificial density and explicitly rejects 8–9px text as a normal phone solution. Earlier density passes still compressed persistent navigation, Home actions, history metadata and holdings metadata below a comfortable real-device reading floor.

## Change
- Added a final `readability.css` layer so readability policy wins over older density experiments without rewriting financial/workspace styles.
- Established 10px as the minimum normal compact-copy floor in this pass and 44px as the base actionable target floor.
- Raised persistent context/navigation, Home metadata/actions, history controls/legend, holdings metadata, allocation legend and data-state copy.
- On <=430px, increased key card/control breathing room where needed instead of shrinking copy.
- On <=359px, preserves legibility by retaining two-column Home actions and compacting spacing rather than reducing font size.
- Added landscape handling for the fixed bottom navigation.
- No financial methodology, data contracts, trust gates or routing semantics changed.

## Regression
`mobileReadabilityFloor.test.ts` locks the final stylesheet import, 10px compact-copy policy, 44px touch floor, phone breakpoints and guards this new layer against reintroducing 7–9px font declarations.

## Validation target
Run full v3 tests, TypeScript/Vite build and repository security checks in CI before merge. Real Samsung/Android screenshots remain the final visual validation source.
