# Living World checkpoint — free preview artifact

Date: 2026-09-22
Base main: `b63d18e27b4010f92213bf65180332897a46c81b`

## Decision

Render deployment is not a release gate while paid Build Pipeline Minutes are exhausted. Reviewable Living World / DNA builds now have a provider-independent preview path in GitHub Actions.

## Implementation

- Added `.github/workflows/v3-free-preview.yml` for V3 pull requests and manual runs.
- The job uses Node 22, `npm ci`, the complete V3 regression suite, and the production Vite build before publishing anything.
- Only `v3/dist` is uploaded, as a 14-day GitHub Actions artifact. No server environment, broker token, fal.ai key, or API secret is copied into the artifact.
- Concurrency cancels stale preview jobs for the same PR/ref, avoiding unnecessary GitHub Actions consumption.
- Existing Render/API/fal server-side paths are untouched.

## Review contract

A preview artifact is valid only when the same job has passed the full V3 test suite and production build. Existing security/bundle CI remains authoritative; this workflow does not weaken or replace it.

## Living World invariants retained

This checkpoint changes delivery/review infrastructure only. It does not change the one-runtime/one-Pixi-Application ownership model, deferred Pixi, reduced-motion behavior, Samsung/mobile safeguards, financial methodology, broker/API, Data Trust, Pulse, or canonical formulas.

## Next Living World pass

Continue from factual latest `main` after this PR lands. Prioritize a substantial authored-world pass: settlement life/depth and wanderer/samurai presence while keeping the canonical camera/exploration model and mobile performance envelope.
