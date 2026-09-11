# TInvest Pulse 2.0

Clean-room frontend for the next generation of «Кряхтящий фонд».

## Why v2 exists

The v1 prototype proved the product idea and the live T-Invest data path, but accumulated many generations of DOM/CSS/canvas runtime code. v2 separates the financial UI from the living-world renderer so either can evolve without degrading the other.

## Stack

- React + TypeScript + Vite — responsive web/PWA shell.
- PixiJS/WebGL — DNA WORLD only.
- Existing Node backend initially reused through `/api/*`.
- Planned product backend: modular Node service, PostgreSQL, Redis/BullMQ, encrypted read-only broker connections.

## Non-negotiables

1. One product, responsive layouts for phone, tablet and desktop.
2. DNA WORLD has one renderer and one controlled animation loop.
3. Financial screens do not run game loops.
4. No broker secret in frontend/localStorage.
5. No automatic trading. Rebalancing is scenario analysis with explicit user action outside the tracker.
6. Real portfolio calculations live in the data/analytics layer, never inside visual components.

## Current foundation

- Responsive dashboard shell.
- Current `/api/portfolio` adapter with safe fallback.
- PixiJS stage with WebGL preference, bounded device-pixel ratio, visibility pause and preserved 16:9 world coordinates.
- Real/preview DNA level controls.
- Separate modules prepared for Analytics, AI and Broker adapters.

## Local run

```bash
cd v2
npm install
npm run dev
```

The dev server proxies `/api` to `http://localhost:10000`, so the existing backend can run next to v2.

## Migration rule

v1 remains production until v2 passes visual, data-integrity and performance gates on both mobile and desktop. We do not rewrite working backend functionality merely for cosmetic parity.
