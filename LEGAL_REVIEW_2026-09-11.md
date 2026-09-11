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

The current required checkbox combines consent to personal-data processing, acceptance of the Privacy Policy and acceptance of the Public Offer. Since 2025-09-01, Article 9(1) of Federal Law 152-FZ requires consent to personal-data processing to be оформлено отдельно from other information/documents the subject confirms/signs.

Required product change:
- Offer acceptance: separate action/checkbox or acceptance event, with offer version + timestamp.
- Privacy Policy: link/notice; acknowledgment is not the same thing as consent.
- Personal-data consent: separate standalone consent document/control only for processing that actually relies on consent as the legal basis; store consent version, timestamp and evidence.
- Marketing advertising consent: separate optional control.

Do not publish the supplied combined Checkbox 1 verbatim.

### P0 — Roskomnadzor notification timing

Article 22(1) of 152-FZ generally requires notification **before beginning personal-data processing**, subject to statutory exceptions. Do not open real-user registration/collection until the operator has resolved the notification requirement and filed the required notice when applicable.

### P0 — localization must cover the real data flow

Before real users, select the actual Russian hosting provider and confirm primary auth/user DB, portfolio data, consent ledger, logs/backups containing personal data and supporting systems comply with the localization design. Do not assume that placing only the main DB in Russia is sufficient.

### P0 — cross-border transfer assessment

Telegram sign-in, foreign/crypto exchanges, email/analytics providers and future external APIs may involve transfer to foreign persons/entities. Article 12 cross-border requirements must be assessed separately before such transfers. The Privacy Policy must distinguish Russian localization from later lawful cross-border transfer.

### P0 — privacy policy is too short for production

Expand it to a per-purpose structure covering operator identity/contact details; each purpose; data and subject categories; legal basis; processing actions/methods; retention/termination conditions; deletion/destruction procedure; processors/transfers; security summary; request procedure; cookie/analytics treatment; cross-border logic; policy version/effective date.

### P0 — blanket `3 years after account deletion` must be replaced

Use purpose-specific retention. Portfolio/auth/marketing data should not automatically inherit an accounting retention period. Exact statutory periods for fiscal/payment records must be confirmed with counsel/accounting.

### P0 — refund/service-rendered wording needs consumer-law rewrite

Do not rely on wording that the service is fully rendered at activation to eliminate statutory withdrawal/refund rights. Cancellation/refund mechanics must be reviewed against current Russian consumer law.

### P0 — recurring payment-details refusal

Before paid subscriptions, implement an electronic control that prevents further recurring use of previously supplied payment details after the consumer refuses their use. Terms must not imply that a `24 hours before renewal` rule overrides mandatory law.

### P1 — marketing consent wording is too broad

Separate service/transactional notifications from advertising. Marketing should be a distinct opt-in with actual channels and revocation/evidence controls.

### P1 — third-party list must be real and complete

Before publication identify the actual Russian hosting provider, payment provider, broker/API providers, Telegram/auth provider, email/push provider, analytics/error-monitoring provider and support tooling as applicable. Do not claim anonymization unless implementation guarantees it.

### P1 — security/compliance operating controls are missing

Internal controls need access control/least privilege, encryption/token protection, audit logging, incident response, backups/restoration, deletion/destruction procedures, processor controls and periodic compliance review. Broker/API credentials must never be stored in frontend/localStorage/repository; use server-side encrypted storage and read-only permissions wherever possible.

### P1 — investment-advice disclaimer alone is not enough

Product behavior must match the disclaimer. Prefer portfolio facts, calculators, risk diagnostics, scenarios, screeners and user-authored alerts. Avoid system-generated personalized buy/sell outputs unless QVANIX later adopts a separately legally reviewed investment-adviser model.

### P1 — offer acceptance should be evidentially explicit

Log offer version, timestamp, user/account ID, the action constituting acceptance and pricing/tariff version where relevant.

### P1 — English version

Keep EN as a courtesy translation and RU contractually controlling, synchronize versions, do not state QVANIX is `Russian-registered` until the real provider status is known, and do not omit mandatory information present in RU.

## Required publication checklist

- [ ] Real operator legal status selected.
- [ ] Full operator details inserted; no square-bracket placeholders remain.
- [ ] Real support/claims/data-rights email active.
- [ ] Russian hosting/localization architecture selected and verified.
- [ ] Roskomnadzor processing notification requirement resolved/filed before processing begins when applicable.
- [ ] Cross-border-transfer inventory and required procedure completed.
- [ ] Privacy policy expanded to production-grade per-purpose structure.
- [ ] Separate personal-data consent implemented where consent is the legal basis.
- [ ] Offer acceptance separated from PD consent and versioned.
- [ ] Marketing consent separated and optional.
- [ ] Refund/cancellation wording reviewed.
- [ ] Electronic refusal from recurring payment details implemented before subscriptions.
- [ ] Actual payment provider/processors/third parties inserted.
- [ ] Security/internal PD controls documented.
- [ ] Final RU text reviewed by qualified Russian counsel.
- [ ] EN synchronized to approved RU version.

## Publication decision

**Blocked.** The supplied drafts are a good structural starting point, but they are not yet clean enough to place on the live site/app. Keep them as source material only until the P0 items above are resolved and placeholders are filled.