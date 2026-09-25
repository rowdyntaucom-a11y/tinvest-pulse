# QVANIX — Samsung recording 1000031731 hierarchy polish

Date: 2026-09-25

## Source

User-provided Samsung recording `1000031731.mp4`.

## What improved

The previous 1730 cascade fix held:
- Assets / Income Atlas titles no longer collapse into the old narrow header column;
- the “НИЖЕ · МАРШРУТ ПРОВЕРКИ” cue no longer overlaps the final Assets row;
- Assets chapter list is readable;
- Analysis and Income Atlas screens are structurally coherent;
- Goal first scene remains one of the strongest Samurai screens;
- Operations + Integrity remain visible as real product depth.

## What the 1731 recording exposed

1. **Home duplicated its history identity.**
   The large outer “История портфеля” heading was immediately followed by the Atlas “История и результат”. Both were correct, but together they wasted a large portion of the viewport and made fail-closed Home feel like two stacked titles.

2. **Home source verification could pass behind the fixed bottom navigation while manually scrolling.**
   The source gate needed to behave as an intentional second scroll chapter with safe margins.

3. **Analysis / Income verification routes were too transparent over the bright red sun and Ronin artwork.**
   The structure was good, but secondary copy lost contrast.

4. **Goal Lab checkboxes were native white browser squares.**
   Functionally correct, visually inconsistent with the Samurai shell.

## Correction

Added `samuraiRecording1731Polish.css`.

It:
- removes the redundant outer Home analytics heading only in fail-closed Home;
- pulls the Atlas higher so the first deep Home screen starts with the actual functional preview;
- turns the source-verification block into a deliberate second scroll chapter with scroll margins and bottom-nav safe space;
- adds a restrained dark reading lane to the deep verification route without hiding the Samurai world;
- increases verification secondary-copy contrast;
- replaces native white Goal checkboxes with Samurai-authored square controls while preserving checkbox semantics and focus visibility;
- improves Goal toggle typography on Samsung widths.

## Validation

PR #694:
- v3 build: PASS;
- full v3 tests: PASS;
- V3 free-preview artifact: PASS.

No financial calculations, broker source contracts, trust decisions, Goal math, Operations normalization, or DNA WORLD behavior changed.

## Resume direction

Samurai is now stable enough to return to the planned Snowball+ functional breadth.

Next active functional surface:
1. Report;
2. category drill-down;
3. currency drill-down;
then:
4. payout/calendar breadth;
5. rebalancing workflow;
6. Portfolio Lab;
7. technical discovery / fallen-assets tooling;
8. user-facing screener.

Do not fan incomplete modules into Cosmos/Nord until Samurai defines the reference behavior.
