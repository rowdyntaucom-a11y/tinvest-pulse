# QVANIX — Legal Readiness Checklist

Status: draft compliance checklist. Final legal texts are **not published yet**.

## Documents to receive and review
- RU: public offer / terms, privacy policy, and two separate consent texts / checkbox labels.
- EN: matching English versions for bilingual presentation.
- RU version is intended to be legally controlling; EN is an informational translation and must state this explicitly.

## Publication blockers
Do not publish final legal documents or open public registration until all applicable items below are resolved:
- Operator requisites are complete: legal status, full name / entity name, INN/OGRN/OGRNIP if applicable, address as required, and contact email. No square-bracket placeholders in production.
- Roskomnadzor notification is submitted **before personal-data processing starts**, unless a specific statutory exception applies.
- Infrastructure for Russian citizens' personal data satisfies current Russian localization requirements before first real-user collection. Primary collection/storage path must not rely on databases located outside the Russian Federation where Article 18(5) applies.
- The exact data map is known: registration/account data, support messages, broker connection metadata, analytics identifiers, logs, cookies/telemetry, payment/billing data, and any third-party processors.
- Processor/vendor list and cross-border transfer status are documented. If cross-border transfer exists, the separate Article 12 procedure/notification must be checked before enabling it.
- Security and retention rules are defined: access control, encryption/secret storage, backup, deletion/withdrawal handling, incident procedure, and retention periods.

## Consent UX requirements
Current 152-FZ requirements must be checked against the final registration/payment flows before release.
- Personal-data consent must be specific, informed, conscious and unambiguous.
- Since 01.09.2025, consent to personal-data processing must be оформлено separately from other information/documents the user confirms or signs.
- Consent controls must not be pre-selected. The system must store evidence of the user's affirmative action and the consent version/timestamp.
- Acceptance of the public offer and personal-data consent should be separate controls where both are required.
- Marketing consent, if ever added, must be separate from service-required processing and must not block use of the core service when not legally necessary.

## Bilingual rule
- Russian legal text is the controlling version.
- English pages should contain a clear clause that the English text is provided for convenience and, in case of inconsistency, the Russian version prevails, subject to mandatory law.
- RU and EN versions must stay version-synchronized; material legal changes require updating both and recording the effective date.

## Current legal checkpoints verified on 2026-09-11
- 152-FZ Article 22: the operator generally notifies the authorized authority before starting personal-data processing, subject to statutory exceptions.
- 152-FZ Article 18(5), as amended effective 01.07.2025: when collecting personal data of Russian citizens, specified collection/storage operations may not use databases outside Russia except statutory exceptions.
- 152-FZ Article 9, as amended effective 01.09.2025: consent must be separate from other information/documents the subject confirms/signs.

## Hosting candidates to assess before public registration
- Yandex Cloud
- VK Cloud
- Selectel

Selection criteria: data-center location in Russia, contractual processor terms, security controls, backups, logging, incident support, DPA/processing terms, cost, and operational fit for QVANIX.

## Next action when source documents arrive
1. Review the supplied RU/EN texts against the actual QVANIX product/data flows and current law.
2. Mark every placeholder, unsupported promise, missing processor, retention gap, consent mismatch, and translation inconsistency.
3. Produce a table: `what must be replaced before publication`.
4. Only after the legal texts and operator details are approved, integrate legal pages and unselected consent controls into the site/app.
5. Re-check the law and Roskomnadzor requirements immediately before public registration opens.

> This checklist is an engineering/compliance control and does not replace individualized advice from a qualified Russian lawyer where a legal interpretation is uncertain or the product model changes.
