# 2026-09-23 — Remove broker portfolio name from theme chrome

Decision from phone review: the T-Investments account name is user/broker metadata, not part of QVANIX visual identity.

## Change
- Removed the hardcoded "КРЯХТЯЩИЙ ФОНД" label from the Samurai hero.
- Replaced that slot with the functional label "КАПИТАЛ".
- Removed `model.accountName` from the shared Home theme chrome, so other shells also no longer weave the broker account name into their visual identity.
- Kept `accountName` in the data/view-model contract for data fidelity and possible neutral metadata/detail surfaces later.

No finance, API, trust, navigation, or DNA changes.
