# QVANIX v3 — Pulse Screenshot Mode

Date: 2026-09-19

Starting main: `101b98b242c86fa2cfc24b3f8ad4986d983692ce`

## Product problem
The product has returned to the approved rule “FIRST SCREEN MUST ANSWER. DEPTH MAY SCROLL”, but the original one-screen concept still needs to exist as a dedicated output surface for T-Investments Pulse / Telegram / social sharing.

v2 had a basic Pulse overlay, but v3 did not yet have a screenshot-ready mode aligned with the current trust boundaries, responsive hierarchy and shell system.

## Implemented

### 1. Dedicated viewport-fixed Pulse mode
Added `V3PulseMode`:
- fixed to one phone viewport;
- maximum canvas width 430 px;
- 100dvh height;
- no internal page scrolling;
- hides the normal app navigation/control surface behind an opaque modal layer;
- supports Core / Horizon / Carbon shells;
- has a single close control.

### 2. Verified-data gate
Added `buildV3PulseSnapshot`.

Pulse content is available only when the Home snapshot is trusted.
If trust is lost:
- capital is not shown;
- profit is not shown;
- passive income is not shown;
- history is not shown;
- allocation is not shown.

No last-known, zero or invented replacement is substituted.

The Home entry button is disabled when the snapshot is not trusted.

### 3. Screenshot content hierarchy
The screenshot contains:
- QVANIX identity;
- portfolio identity;
- confirmed data state;
- capital hero;
- accumulated portfolio result;
- real passive income;
- XIRR when available;
- current position count;
- source timestamp;
- one strong history visual when a valid contiguous price/value segment exists;
- top current allocation weights;
- explicit methodology footer.

### 4. History honesty
The screenshot history is labelled as portfolio VALUE, not portfolio return.

Missing history points break the SVG into separate segments. QVANIX does not connect a line across a missing observation.

The footer explicitly states that portfolio value may include external cash flows and is not a daily-return chart.

If history cannot produce at least one two-point contiguous verified segment, the screenshot does not draw an artificial line.

### 5. Allocation honesty
The allocation strip uses only current normalized position weights.
The display shows the coverage of the top six displayed positions rather than inventing an “Other” category.

### 6. Modal accessibility
Pulse:
- uses `role=dialog` and `aria-modal=true`;
- focuses the close control on open;
- closes on Escape;
- keeps Tab on the only modal control;
- restores the previously focused element on close;
- locks document body scrolling while active.

### 7. Performance
Pulse JS and CSS are lazy-loaded only after the user taps the Home “ПУЛЬС” button.
The screenshot mode is not included in the eager first-screen path.

## Intentionally not added
- DOM-to-image / canvas screenshot dependency;
- automatic social posting;
- browser share API;
- public share link;
- image upload;
- daily return;
- benchmark comparison inside the share card;
- decorative fake metrics.

The current mode is designed for a clean native phone screenshot and is the foundation for future share/export flows.

## Regression coverage
Added:
- trusted snapshot / fail-closed regression;
- non-interpolated history geometry regression;
- screenshot UI/trust contract;
- modal accessibility contract;
- lazy JS/CSS bundle contract;
- Home trusted-entry contract.

## Validation required
- dependency security gate;
- production build;
- full v3 regression suite;
- inspect Pulse lazy JS/CSS output;
- exact-head CI;
- squash merge only if green;
- exact merged SHA LIVE on Render.

## Physical-device status
Still not physically validated:
- Samsung Internet screenshot;
- Chrome Android screenshot;
- 360 / 375 / 390 / 430 px real devices;
- Android browser chrome + 100dvh;
- safe areas;
- TalkBack;
- actual T-Investments Pulse upload/crop behavior.
