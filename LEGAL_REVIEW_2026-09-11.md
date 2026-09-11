# QVANIX legal review — 2026-09-11

Status: **DO NOT PUBLISH YET**.

Reviewed user-supplied drafts:
- `QVANIX_Юридические_документы_RU.pdf`
- `QVANIX_Legal_Documents_EN.pdf`

This is a product/legal-readiness review, not a substitute for final review by qualified Russian counsel.

## What is good and can be retained

- Separate RU and EN versions, with EN presented as a courtesy translation and RU intended to control in case of inconsistency.
- Public offer + separate personal-data/privacy document structure.
- Explicit statement that QVANIX is an analytics/tracking tool and is not intended to provide individualized investment recommendations.
- Non-prechecked consent controls.
- Separate optional marketing consent concept.
- Storage of consent timestamp/document version.
- Russian-hosting/localization intent.
- Placeholder checklist for operator details, hosting, payment provider, URLs, email and Roskomnadzor data.

## Blocking issues before publication

### P0 — separate personal-data consent from other documents

The current required checkbox combines:
- consent to personal-data processing;
- acceptance of the Privacy Policy;
- acceptance of the Public Offer.

Since 2025-09-01, Article 9(1) of Federal Law 152-FZ requires consent to personal-data processing to be оформлено отдельно from other information/documents the subject confirms/signs.

**Required product change:**
- Offer acceptance: separate action/checkbox or acceptance event, with offer version + timestamp.
- Privacy Policy: link/notice; acknowledgment is not the same thing as consent.
- Personal-data consent: separate standalone consent document/control only for processing that actually relies on consent as the legal basis; store consent version, timestamp and evidence.
- Marketing advertising consent: separate optional control.

Do not publish the supplied combined Checkbox 1 verbatim.

### P0 — Roskomnadzor notification timing

Article 22(1) of 152-FZ generally requires notification **before beginning personal-data processing**, subject to the remaining statutory exceptions.

Operational rule for QVANIX: do not open real-user registration/collection until the operator has resolved the notification requirement and filed the required notice when applicable. The safe trigger is `before processing starts`, not merely `sometime after launch`.

### P0 — localization must cover the real data flow, not only the main DB

From 2025-07-01, when collecting personal data of Russian citizens, recording/systematization/accumulation/storage/update/extraction using databases outside Russia is generally prohibited subject to statutory exceptions. The supplied text's RU-hosting intent is correct but must be implemented across the collection architecture.

Before real users:
- select the actual Russian hosting provider;
- confirm primary auth/user DB, portfolio data, consent ledger, logs/backups containing personal data and supporting systems comply with the localization design;
- document any exception relied upon rather than assuming one.

### P0 — cross-border transfer assessment

The product plan includes Telegram sign-in, foreign/crypto exchanges, possible email/analytics providers and future external APIs. Some integrations may involve transfer to foreign persons/entities.

Article 12 requires a separate cross-border-transfer notification before starting such transfer. The operator must evaluate the recipient/country and current statutory procedure.

Do not state broadly that `all data is stored in Russia` if integrations later transmit personal data abroad. The Privacy Policy must distinguish Russian localization from later lawful cross-border transfer.

### P0 — privacy policy is too short for production

Article 18.1 requires an operator policy/local acts that, for each processing purpose, determine relevant personal-data categories, subject categories, methods, processing/storage periods and destruction procedure, plus other compliance measures.

The supplied draft should be expanded at least to include:
- operator identity/contact details;
- each processing purpose;
- categories/list of personal data per purpose;
- categories of subjects;
- legal basis per purpose;
- processing actions/methods;
- storage/processing period or termination condition per purpose;
- deletion/destruction procedure;
- third-party/processors and transfer logic;
- security-measure summary;
- user-request procedure;
- cookie/analytics treatment;
- cross-border logic if applicable;
- policy version/effective date.

### P0 — blanket `3 years after account deletion` must be replaced

The current draft applies one retention period to all user data and justifies it by tax/accounting purposes. That is too broad. Different datasets/purposes have different retention needs, and portfolio/auth/marketing data should not automatically be retained merely because accounting documents may need retention.

Use a purpose-specific retention schedule. Ask counsel/accounting to confirm exact statutory periods for fiscal/payment records. Keep only data actually required for the applicable purpose/law.

### P0 — refund/service-rendered wording needs consumer-law rewrite

Current wording says the service is deemed rendered when the paid period is activated and generally denies refunds for the unused part of the period except where law requires otherwise.

Article 32 of the Russian Consumer Protection Law allows a consumer to withdraw from a services contract at any time subject to payment of actual expenses connected with performance. A contractual clause should not be drafted as though activation alone extinguishes that right.

Rewrite cancellation/refund mechanics with counsel. Do not rely on `service fully rendered at activation` to deny statutory withdrawal rights.

### P0 — digital subscription payment-details refusal (effective 2026-03-01)

Current law prohibits using previously supplied bank/payment-instrument details for periodic online-subscription charges after the consumer has refused their use. The service must accept such refusal electronically.

Required product/terms change before paid subscriptions:
- electronic control to disable recurring use of stored payment details / auto-renewal;
- backend state preventing further recurring charges after refusal;
- terms must not imply that a `24 hours before renewal` rule overrides this statutory right.

### P1 — marketing consent wording is too broad

The optional checkbox currently combines `informational and promotional materials`. Service/transactional notifications should be separated from advertising. Advertising over telecom networks requires prior consent and the sender bears the proof burden.

Recommended model:
- service notifications: handled under service/contract necessity where appropriate;
- advertising/marketing: separate opt-in specifying channels (for example email/push/Telegram as actually used), with revocation mechanism and consent evidence.

### P1 — third-party list must be real and complete

Before publication replace all placeholders and identify the actual processors/recipients needed for production, e.g. as applicable:
- Russian hosting provider;
- payment provider;
- broker/API providers;
- Telegram/auth provider;
- email/push provider;
- analytics/error-monitoring provider;
- support tooling.

Do not claim that an analytics provider receives only anonymized data unless the technical implementation actually guarantees anonymization.

### P1 — security/compliance operating controls are missing

Article 19 requires legal, organizational and technical measures. In addition to public text, QVANIX needs internal controls such as:
- threat/security assessment appropriate to the system;
- access control/least privilege;
- encryption/token protection;
- audit logging;
- incident response;
- backups/restoration policy;
- deletion/destruction procedure;
- control of processors;
- periodic compliance review.

Existing product rule stays mandatory: broker/API credentials/tokens must not be stored in frontend/localStorage/repository; use server-side encrypted storage and read-only permissions wherever possible.

### P1 — investment-advice disclaimer alone is not enough

The public offer correctly says QVANIX is not an investment adviser and does not provide individualized investment recommendations. This must also be true in product behavior.

Under Articles 6.1/6.2 of Federal Law 39-FZ, individualized investment recommendations are regulated investment-consulting activity. A disclaimer or `explicit confirmation before order` does not automatically make personalized buy/sell recommendations non-regulated.

Product rule:
- calculators, portfolio facts, risk diagnostics, scenario analysis, screeners and user-authored alerts are preferred;
- avoid system-generated personalized `buy/sell this security` or `this instrument fits your risk/return goals` outputs unless QVANIX later adopts a legally reviewed investment-adviser model.

### P1 — offer acceptance should be evidentially explicit

The draft says simply starting to use the service and/or payment accepts the offer. This can work conceptually, but for a consumer SaaS product it is safer to make the acceptance event explicit and loggable:
- offer version;
- timestamp;
- user/account ID;
- action that constituted acceptance;
- pricing/tariff version where relevant.

### P1 — English version

Keep EN as a courtesy translation and state RU prevails contractually. However:
- synchronize document versions;
- do not say QVANIX is `Russian-registered` until the real provider status is known;
- never let the EN text omit mandatory consumer/data-protection information present in RU.

## Required publication checklist

Before legal pages or registration go live:

- [ ] Real operator legal status selected (self-employed / IP / LLC or other lawful model).
- [ ] Full operator details inserted; no square-bracket placeholders remain.
- [ ] Real support/claims/data-rights email active.
- [ ] Russian hosting/localization architecture selected and verified.
- [ ] Roskomnadzor processing notification requirement resolved/filed before processing begins.
- [ ] Cross-border-transfer inventory completed; Article 12 notifications/procedure handled where applicable.
- [ ] Privacy policy expanded to production-grade per-purpose structure.
- [ ] Separate personal-data consent implemented where consent is the legal basis.
- [ ] Offer acceptance separated from PD consent and versioned.
- [ ] Marketing consent separated and optional.
- [ ] Refund/cancellation wording reviewed against consumer law.
- [ ] Electronic refusal from recurring payment details implemented before subscriptions.
- [ ] Actual payment provider inserted and payment/receipt model reviewed.
- [ ] Actual processors/third parties inserted.
- [ ] Security/internal PD controls documented.
- [ ] Final RU text reviewed by qualified Russian counsel.
- [ ] EN synchronized to approved RU version.

## Publication decision

**Blocked.** The supplied drafts are a good structural starting point, but they are not yet legally clean enough to place on the live site/app. Keep them as source material only until the P0 items above are resolved and placeholders are filled.