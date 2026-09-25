# QVANIX — Samsung 1743 Screener inline fix

Date: 2026-09-25

## Evidence
Recording `1000031743.mp4` showed that the prior bottom-runway fix did not solve the fail-closed Analysis jump: the public Screener could become visible and the page could still return upward to the verification route.

## Root correction
The fail-closed Screener is no longer mounted as a detached final Analysis chapter.

In DATA LOCK:
- the Screener component mounts only after the user taps the Atlas **Screener** card;
- it renders inside that same inline Atlas detail;
- there is no separate bottom target and no background async Screener mount changing the Analysis document height;
- the inline tool slot has explicit anchoring protection and reserved loading height.

Trusted Analysis keeps the deep Screener chapter.

## Validation
Merged PR: #713
Main commit: `4a3e9bebba0f710f6c5b672eae2f48e3bd298502`

Final gates:
- v3 build: PASS;
- full v3 tests: PASS;
- V3 free-preview artifact: PASS.

## UX rule
Public fail-closed tools should open at the card that invoked them whenever possible. Do not mount a public asynchronous tool far below an Atlas card merely to make it globally available.
