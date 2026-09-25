# QVANIX saved chat — equity fundamentals resume

Date: 2026-09-25

## Resume from here
Current product main after feature PR #717:
`b6f8125154cfd5d6ea75374a8890ddb369ab964b`

Render service:
- `qvanix-v3-preview`
- URL: `https://qvanix-v3-preview-1jso.onrender.com`
- deploy `dep-dar6m28ae00c73e62gs0` is LIVE on the feature SHA above.

## Confirmed immediately before this checkpoint
- Samsung recording `1000031745.mp4`: Screener remains inline and no longer jumps back to the top.
- Bond Intelligence v1 is already merged and deployed.
- Equity Fundamentals Depth v1 is now merged and deployed.
- GitHub v3 build + full v3 tests PASS.
- V3 free preview artifact PASS.
- Codex automated review was unavailable due its usage quota; there were no review threads.

## New Assets sequence
1. Состав
2. Результат
3. Отрасли
4. **Акции — Equity Intelligence**
5. Облигации — Bond Intelligence
6. Позиции
Then the existing Samurai Operations / Integrity / Report / Categories / Currency chapters continue.

## Equity Intelligence contract
- data source: existing private server boundary around official T-Invest `GetAssetFundamentals`;
- exact current-position `instrumentUid` identity only;
- zero and unsupported values fail closed;
- no fake metrics, scraping or silent fallback;
- no QVANIX score yet;
- no buy/sell or cheap/expensive verdict;
- explicit company/capital/metric coverage;
- metric tabs are interactive;
- tap company → canonical Asset Intelligence workspace.

## What to do when the user continues
First process the user's Samsung recording/screenshot of the deployed Equity Intelligence chapter, if supplied. Fix any real-device interaction/layout issue before adding another large system.

If the chapter is accepted, the next planned large functional layer is:
**broad-market dividend discovery**, followed by remaining Atlas-to-functional navigation.

Do not return to DNA/Living World or cross-shell art work unless the user explicitly reprioritizes it.
