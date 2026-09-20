# QVANIX v3 — guided demo conversion

## Why
The public demo already has a strict synthetic-data trust boundary. The next S0 gap was comprehension: a first-time visitor could see the product but had no compact explanation of how to read its hierarchy or where to go next.

## Change
- Added a demo-only four-step product tour covering Pult, Analytics, Income and Goal.
- Kept the tour outside live runtime and outside financial calculation code.
- Added an explicit `/v3/` handoff to the user's live portfolio surface only at the end of the tour.
- Copy reinforces TWR-first hierarchy, fact-vs-expectation separation and scenario-not-forecast semantics.
- Tour is dismissible/reopenable, mobile-safe, short-height-safe and keeps 44px action targets.
- No network analytics SDK, broker request, credential path or financial methodology change was introduced.

## Trust boundary
`DemoRoot` remains fixture-only. `LiveRoot` does not mount the guide. The guide itself contains no fetch/storage calls and states that real values require the configured read-only live source.

## Regression
`demoGuide.test.ts` locks demo-only mounting, copy/CTA, network isolation and mobile interaction floor. It is registered in the full v3 test command.
