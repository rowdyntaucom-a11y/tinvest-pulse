# QVANIX v135 — Income Event Freshness

- Adds snapshot-age and event-horizon evidence to Income / Data Trust.
- Snapshot age derives only from API generatedAt and the current load timestamp.
- FACT latest date uses FACT events only.
- Future nearest/farthest horizon uses FUTURE HIGH events only; LOW events cannot extend the trusted horizon.
- Exact-FIGI shares are exposed independently for FACT and HIGH future events.
- >24h snapshot is visibly stale; missing generatedAt remains unknown rather than guessed.
- Explicitly states that the end of the known HIGH horizon is not evidence that later payouts will not occur.
