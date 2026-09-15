# Narrow-phone subnav readability v1

## Scope
Visual/readability-only pass for very narrow phones (<=359px).

## Finding
The shared mobile readability layer kept `.subnav button` at 7.2px for normal phone widths but reduced it to 6.9px below 360px. This made navigation labels regress below the established secondary-copy readability floor exactly where scanning is hardest.

## Change
Keep `.subnav button` at 7.2px on <=359px and reduce letter-spacing from .035em to .02em to recover horizontal room without shrinking the glyphs.

## Safety
No component structure, values, navigation state, calculations, semantic colors, backend/API, storage, payouts/tax, TWR/XIRR, IMOEX, Portfolio/Income/Health/Risk/Drift logic, trading behavior, or DNA runtime state changed. The active Board/Q-LENS PR #289 is intentionally untouched.

## Validation gate
Merge only after diff review, full v2 CI, confirmation that main still equals the branch base SHA `ce4006cabe9c11fe41d55af62e6e379479cf446b`, and PR mergeability/race-check.
