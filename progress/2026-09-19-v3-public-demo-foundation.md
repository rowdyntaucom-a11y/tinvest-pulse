# QVANIX v3 — public demo foundation

Date: 2026-09-19

## Why
The roadmap requires a public read-only demo before broader scale/growth work. The live v3 entry path currently starts broker loading immediately, so there was no safe product-tour surface without credentials.

## Implemented
- `/demo` and `/v3/demo` resolve to a static v3 demo root;
- demo route performs no broker portfolio request, timer refresh or focus refresh;
- isolated synthetic fixture exercises Home, Portfolio, Analysis, Income and Goal with coherent values/history;
- persistent `ДЕМО · Синтетические данные · без подключения брокера` disclosure is visible above the product shell;
- Home trust chip says `DEMO`, not `LIVE`;
- screenshot/Pulse export is disabled for demo data so synthetic values cannot be shared as a confirmed portfolio;
- live route and its refresh/fail-closed ownership remain unchanged;
- regression verifies route isolation, disclosure, fixture coherence and Pulse lockout.

## Data honesty
The fixture is synthetic and intentionally uses DEMO/OFZ-D identifiers rather than pretending to be a current broker snapshot. No financial methodology changed. Demo values are presentation fixtures, not forecasts or recommendations.

## Validation gate
Run dependency security check, production build and full v3 regression suite. Merge only when relevant v3 CI is green, then verify the exact merged SHA on Render.
