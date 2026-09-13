# QVANIX — Design System & Personalization Contract

Status: product requirement. This document defines how QVANIX must feel and behave visually while the financial core continues to mature.

## 1. Product identity

QVANIX must not look like a generic finance dashboard made from interchangeable cards. The first screen must communicate three things immediately:

1. **This is a serious analytical terminal** — dense real information, clear hierarchy, visible data quality and methodology states.
2. **This is a distinctive QVANIX product** — recognizable surfaces, motion language, typography, framing, transitions and signature visual effects.
3. **This is the user's workspace** — layout, density, pinned modules, themes and motion can be adapted without changing financial truth.

The design goal is not “more decoration”. Every visual layer must either improve hierarchy, orientation, data comprehension, state awareness or emotional identity.

## 2. Information architecture

Do not solve product depth by adding an endless row of top-level tabs.

Use a layered model:

- **Workspace shell** — fast access to major spaces: Portfolio, Analytics, Income, Terminal and DNA/Living World when its financial prerequisites are ready.
- **Module layer** — each workspace contains compact subviews and drill-downs for distinct investor questions.
- **Pinned layer** — selected high-value modules can appear on the user's first-screen board.
- **Quick layer** — command/search/favorites entry for jumping directly to a metric or module without navigating through several pages.

The mobile shell must preserve one-screen orientation. Advanced detail should open as compact drill-downs, horizontal pages, overlays or replacing detail regions instead of creating endless vertical scrolling.

## 3. First-screen experience

The home/launch composition must feel authored, not assembled.

Required visual hierarchy:

- **Hero state**: portfolio value + current portfolio state / performance context.
- **Signal rail**: small high-value live facts such as key rate, data freshness, market regime/benchmark context and portfolio alerts when deterministic data exists.
- **Module cluster**: 3–6 configurable compact modules selected from real Portfolio / Analytics / Income / Terminal outputs.
- **QVANIX signature layer**: subtle animated background / scan / depth / ambient response that creates identity without obscuring numbers.

The first screen should answer “what is happening, what changed, and where should I look deeper?” without issuing buy/sell instructions.

## 4. Personalization model

Personalization is a first-class product capability, not only a theme switcher.

### 4.1 Theme shells

Each theme changes more than colors. It may change:

- panel framing and corner geometry;
- glass / matte / metallic / luminous surface treatment;
- background depth and ambient effects;
- chart framing and grid language;
- button/chip treatment;
- section transitions;
- emphasis hierarchy;
- optional illustrations/background motifs where they do not compete with data.

Planned shells:

- **QVANIX Core** — dark analytical terminal, mint/cyan energy, high information density.
- **PS / Horizon** — console-inspired layered glass, soft blue-white light, floating depth, premium motion.
- **Carbon** — restrained black/graphite professional terminal.
- **Aurora** — deeper atmospheric gradients and reactive light for users who want a more expressive interface.
- **Minimal** — reduced decoration and maximum data clarity.

Names may evolve; the distinction between shells must remain structural, not palette-only.

### 4.2 Density

User-selectable density profiles:

- **Compact** — maximum information per viewport.
- **Balanced** — default mobile profile.
- **Focus** — larger primary metrics and fewer simultaneous modules.

Changing density must never change calculations or data coverage semantics.

### 4.3 Motion

Motion profiles:

- **Full** — signature QVANIX effects and transitions.
- **Reduced** — short transitions, no continuous decorative motion.
- **Off / accessibility** — no non-essential animation.

Honor `prefers-reduced-motion` and device capability.

### 4.4 Module customization

Users should eventually be able to:

- pin/unpin supported modules to the first-screen board;
- reorder supported modules;
- choose compact vs expanded variants where available;
- choose default workspace/subview;
- select favorite analytics;
- hide low-priority decorative layers;
- choose whether the launch screen emphasizes Portfolio / Analytics / Income / Terminal context.

Only presentation preferences may be persisted client-side. Broker credentials, financial secrets and trading permissions must never be stored with UI preferences.

## 5. Signature effects

Effects must be recognizable as QVANIX and performance-gated.

Candidate effect vocabulary:

- soft scanner sweep across the shell on launch / refresh;
- data-pulse glow when a metric genuinely updates;
- layered grid/parallax depth under panels;
- low-amplitude ambient particles/noise confined to background layers;
- subtle fill animations for progress, health, coverage and risk states;
- focus bloom on the active analytical module;
- transition morph between compact and expanded module states;
- contextual line/trace animation around data-quality or alert states;
- optional theme-specific background scene layers.

Forbidden:

- continuous motion that reduces chart readability;
- random flashing unrelated to data;
- animations whose intensity is derived from portfolio wealth;
- decorative effects that cause layout shift;
- effects that block touch targets or reduce text contrast.

## 6. Data-first visual rules

1. Numeric truth always outranks decoration.
2. Coverage / source / sample maturity should remain visible for non-obvious analytics.
3. Preview, mature, stale and unavailable states need visually distinct but calm treatments.
4. Positive/negative colors must not be the only carrier of meaning.
5. No chart or widget may imply precision not present in the source.
6. Empty or gated states must look intentionally designed, not broken.
7. Advanced modules should expose methodology through compact help, not permanent walls of text.

## 7. Responsive requirement

QVANIX must be responsive from small Android phones through tablets and desktop. Samsung/Android remains the primary mobile QA target, but no design should depend on one exact viewport.

Use adaptive composition rather than simple proportional shrinking:

- mobile: dense one-screen orientation, compact typography, horizontal/replaceable detail regions;
- tablet: two-column opportunities and larger charts;
- desktop: multi-pane analytical workspace with more simultaneous context.

The same feature can have different compositions by breakpoint while preserving the same deterministic data contract.

## 8. Performance budget

Visual identity cannot depend on an always-heavy renderer.

- Core Portfolio / Analytics / Income must remain usable before optional visual layers load.
- Heavy art / Pixi / Living World remains lazy-loaded.
- Theme and motion layers should prefer CSS/GPU-friendly transforms and opacity.
- Avoid large raster backgrounds in the critical path.
- Effects must degrade gracefully on lower-end devices.
- No new animation library unless bundle/runtime cost is justified by a unique requirement that cannot be met safely with current primitives.

## 9. Terminal relationship

Terminal should become a distinct advanced workspace only when several real modules justify it. Its visual identity can be denser and more technical than the default shell, but it still inherits QVANIX theme tokens and personalization.

Terminal should prioritize:

- correlation / covariance / risk contribution;
- allocation diagnostics;
- sourced stress and scenario tools;
- deterministic technical analysis when its data contract is ready;
- screeners/alerts only when user-authored and data-backed.

It must not become a decorative “pro mode” containing duplicated metrics.

## 10. DNA / Living World relationship

Living World remains after the financial core and primary workspaces reach the agreed quality bar.

The future world may be the most expressive QVANIX surface, but it must inherit the same product principles:

- financial truth calculated outside the renderer;
- no wealth-based visual superiority;
- accessibility and reduced-motion modes;
- deterministic state boundaries;
- share-safe privacy rules.

## 11. Implementation order

1. Finish current financial/data-quality/reliability work.
2. Establish shared design tokens and personalization schema.
3. Build configurable first-screen board and shell hierarchy.
4. Add theme shells one by one, beginning with QVANIX Core and PS/Horizon.
5. Add signature motion/effects with reduced-motion and device-quality gates.
6. Mature Terminal modules inside the layered navigation.
7. Perform device QA and visual-density tuning.
8. Resume Living World after the financial and shell quality bar is met.

## 12. Acceptance bar

A QVANIX screen is not accepted if it is merely clean.

It must be:

- **recognizably QVANIX** without seeing the logo;
- **informative at first glance**;
- **deep without feeling cluttered**;
- **customizable without changing financial semantics**;
- **alive through motion/state**, but calm enough for serious analysis;
- **responsive across device classes**;
- **visually differentiated from generic broker dashboards**.
