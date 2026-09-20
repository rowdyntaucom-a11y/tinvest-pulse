# QVANIX v3 — Mobile readability pass

Date: 2026-09-20

## Why
The canonical roadmap explicitly retires the old rule that everything must fit on one phone screen and says readability wins over artificial density. Real Samsung/Android use is a primary regression target, while several legacy compact rules still reduced ordinary labels and explanatory text to 6.5–9px.

## Implemented
- Added a final, isolated readability layer loaded after the existing v3 styles so legacy density rules cannot silently shrink normal UI copy again.
- Established a 10px minimum for compact captions/labels in the touched mobile shell and 11–13px for explanatory/body/section text.
- Raised persistent context header and bottom-navigation labels to a readable floor.
- Raised Pult labels, timestamps, action labels, history legends and history detail copy without changing financial hierarchy or calculations.
- Raised portfolio-row metadata while preserving compact actionable rows and touch-safe height.
- Raised Analysis, Income and Goal explanatory copy; depth is allowed to scroll instead of being compressed.
- Restored secondary asset identity text on 320–359px instead of hiding it solely to save height.
- Kept all financial methodology, trust gates, demo isolation and canonical Asset Workspace unchanged.

## Responsive policy
This pass follows `FIRST SCREEN MUST ANSWER. DEPTH MAY SCROLL.` It does not attempt to force every workspace into one viewport. Pulse remains the dedicated screenshot/no-scroll surface.

## Regression
`mobileReadability.test.ts` locks the stylesheet import, readable mobile floors, touch-safe asset rows and the absence of 7–9px declarations in the new override layer.
