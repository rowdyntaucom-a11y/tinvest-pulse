# QVANIX v124 — Strategy Rolling Windows

- Base: merged v123 `0e57abf893ecdfc84629eaad8e352b765838a226`.
- Extends Portfolio Lab beyond one full-period A/B outcome into overlapping rolling historical comparisons.
- User can inspect 21/63/126/252 trading-day windows (roughly 1/3/6/12 months).
- Aligns A and B by exact common dates and computes return gap per identical window.
- Reports A/B lead frequency, median gap, strongest historical advantage for each side, and a compact chronology rail.
- Fails closed when both scenarios or enough common history are unavailable.
- Lead frequency is explicitly not a probability, recommendation, forecast or winner selection.
- Mobile cards stack with 11px secondary copy.
- Regression is wired into mandatory `npm test`.
