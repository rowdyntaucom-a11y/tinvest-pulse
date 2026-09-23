# Living World checkpoint — mobile visibility

Date: 2026-09-23
Starting main: `777a436d71cb68e7166562e2273a6c47d9e98775`.

## Evidence
Samsung recording after #570 confirmed the wanderer improvement, but the phone composition still let shell chrome/background dominate the Living World. Entry could briefly read as an empty dark panel while Pixi booted.

## Changes
- Added an immediate lightweight world entry plate behind the canonical Pixi stage so DNA never opens onto an unexplained empty black field.
- Reframed portrait camera around the inhabited band (workshop, wanderer, mine) with a smaller 1.035 push-in, preserving canonical 1600x900 projection and focus panning.
- Reduced mobile title/copy obstruction and shell lens opacity so authored world pixels receive more of the first viewport.
- Kept HUD readable while reducing its visual dominance.
- Added regression coverage for entry state, camera framing and one-runtime ownership.

## Boundaries
No new Pixi Application, ticker, runtime owner, rAF, filter, blur or texture. No fal.ai credits. Finance, broker/API, Data Trust, Pulse and formulas unchanged.
