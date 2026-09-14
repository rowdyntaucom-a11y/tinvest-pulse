# QVANIX · progressive-depth UX principle

Date: 2026-09-14
Starting main: `ccfa5871a1d261c77a42a7bae4ab97124d9971dc`

## Product decision

The user approved Snowball as the primary UX reference for information presentation, flexibility and visual liveliness, while QVANIX must keep its own deterministic financial methodology, visual identity and Living World/DNA direction.

The earlier `one screen / no scroll` goal is no longer an absolute product constraint.

New rule:

- Primary workspace should remain glanceable: the most important state should be understandable quickly without navigation gymnastics.
- Do not shrink typography, labels, touch targets or charts merely to force every feature into one viewport.
- Prefer progressive disclosure: summary -> tap -> drill-down / expanded chart / segment details.
- Vertical scrolling is allowed when it materially improves readability, information density or flexibility.
- Avoid scroll when the same information can remain clear and comfortable in one viewport.
- Never introduce horizontal page scrolling as a substitute for responsive layout.

Success criterion changes from `everything fits on one screen` to `the user understands the important portfolio state in ~5 seconds and can go deeper with one tap`.

## UX reference synthesis

Target direction:

`QVANIX deterministic depth + Snowball readability/liveliness + HADL compact switchable widgets + QVANIX Living World/DNA`.

Do not copy competitor branding or layouts literally.

## Current visualization priority

1. Semantic visual system for asset classes / sectors / benchmark / income events.
2. Interactive compact Portfolio donut with tap-to-reveal details.
3. Truthful daily movers only if the data boundary exposes genuine daily change; cumulative broker P/L must never be relabelled as daily movement.
4. Deterministic narrative layer for already-calculated facts (for example relative Portfolio-vs-IMOEX spread), with no LLM-invented numbers.
5. Richer switchable charts / periods where historical coverage is real.
6. Reusable metric drill-down.
7. Income visual upgrade.
8. Separate reviewed DNA art pass using the established Figma/asset workflow rather than escalating hand-coded placeholder art.

Relative-performance area/spread and truthful metric sparklines are already implemented before this decision and form the first primitives of this direction.

## Methodology guardrails

- Keep TWR/XIRR distinctions and existing maturity/integrity gates.
- Missing history remains missing; no decorative interpolation or fabricated forecast fallback.
- No generic qualitative financial verdict unless its threshold/methodology is explicitly justified.
- Drift remains neutral target-vs-actual diagnostics, not a personalized buy/sell instruction.
- No real-money auto execution.

## Responsive rule

This is a general responsive decision, not Samsung-specific. Validate narrow Android, mainstream phones, large phones, iPhone safe areas, landscape, tablets and desktop. The user's Samsung recording is a physical-device sample, not a layout target.

## Development-history rule

Continue repository-owned history for meaningful passes: implementation, rationale, rejected approaches, release state and next priorities. Update durable project documents when a decision is intended to outlive a single implementation pass.
