# QVANIX · Income tax bridge v1

Date: 2026-09-14
Starting main: `08795a1159ca6d8f27e2728574d95e14be480f45`
Branch: `qvanix-income-tax-bridge-v1`

## Product direction

Continue the approved Snowball-like direction: Income should answer not only `сколько выплат`, but also `до налога → удержано → на руки`, while keeping forecast and fact separate. Add a deterministic opt-in IIS deduction estimator without pretending QVANIX knows the user's full tax return.

## Implemented

- Added `Доход → Налоги` as a lazy-loaded subview so tax tooling does not inflate the first-load bundle.
- FACT tax bridge sums only explicit FACT payout fields: gross / tax / net. Missing gross/tax/net is left missing; QVANIX does not reverse-engineer tax from net.
- 12M bridge reuses the existing normalized confirmed payout schedule gross/tax/net and never adds it to realized FACT.
- Added user-input IIS long-term-savings deduction estimator:
  - annual IIS contribution;
  - long-term-savings base already consumed elsewhere;
  - 13% / 15% rate selector;
  - optional available paid NDFL cap.
- The estimator exposes eligible deduction base, theoretical tax effect and an estimated refundable amount only when the user explicitly provides available paid NDFL.
- User tax inputs are component-local and are not persisted.

## Current tax basis / official sources

Current implementation is based on FNS information checked on 2026-09-14:

- FNS `Налоговые вычеты на долгосрочные сбережения граждан`: https://www.nalog.gov.ru/rn77/taxation/taxes/ndfl/nalog_vichet/long_term_savings/
  - money contributed to an IIS opened from 01.01.2024 is included in the long-term-savings deduction framework;
  - combined annual base for the covered long-term-savings contributions is limited to 400,000 RUB;
  - early IIS termination without an eligible transfer can require restoration/payment of tax previously saved through the deduction.
- FNS `Как получить налоговый вычет по долгосрочным сбережениям`: https://www.nalog.gov.ru/rn46/news/activities_fts/16405134/
  - transition minimum term for agreements/IIS opened in 2024–2026 is 5 years;
  - FNS describes 13% / 15% refund examples for this deduction base.
- FNS simplified-deduction page: https://www.nalog.gov.ru/rn77/ndfl_easy/
  - simplified procedure includes deductions for IIS opened from 01.01.2024.

The UI intentionally does not claim automatic eligibility. Broker data does not expose the user's total NDFL paid, other long-term-savings usage, or every legal condition.

## Council review

- Quant/tax-method pass: explicit fact/forecast separation; missing payout tax fields fail closed; deduction base is capped deterministically; refundable estimate cannot exceed user-entered available NDFL.
- Code pass: pure `incomeTax.ts` boundary + regression; no backend route, broker request, storage, new dependency or secret.
- Responsive/mobile pass: tax workspace is progressive disclosure; 4 Income tabs become 2×2 on narrow phones rather than shrinking into unreadable labels; tax cards stack on narrow viewports.
- Release pass: tax UI is lazy-loaded; no trading behavior, personalized recommendation, final legal publication, payment flow or DNA state change.

## Guardrails / remaining

- Do not infer a user's actual right to the deduction solely from the account being an IIS.
- Do not automatically infer annual contribution totals until a dedicated verified operations boundary distinguishes eligible IIS funding from transfers/other cash flows.
- Do not calculate tax-loss-harvesting sell recommendations or lot-selection tax advice without a separate current tax/legal review.
- Tax rules are versioned here and must be re-verified when legislation changes.
