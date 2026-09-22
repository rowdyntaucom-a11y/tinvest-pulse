# QVANIX v3 deep controls readability — 2026-09-22

Starting main: `e2616c97f16e4aaf5b25ddba5beca444f69b881d`.

The main-tab first-answer pass fixed hierarchy, but an audit of the deeper controls found two remaining mobile problems: several filter/year rails still used 32–36 px controls with 8 px labels, and the always-visible world trigger still paid for a fixed backdrop blur even after the Samsung scroll-jank correction.

This pass:
- raises Assets filters/sort, Holdings rails and Goal scenario-year controls to a 44 px phone touch target;
- raises their phone labels to a 10 px readability floor;
- keeps Income month cards and Holdings class cards comfortably touchable;
- applies the active shell material to these deep controls and their selected state;
- makes focus-visible treatment explicit;
- makes the fixed world trigger and open world menu use solid shell-matched materials on phone instead of live backdrop blur;
- keeps all six real world thumbnails unchanged;
- keeps intentional horizontal rails only where they are compact controls rather than page navigation.

No financial formulas, data contracts, navigation state, world selection state, Pulse behavior, fal.ai generation or DNA renderer changed.

Samsung validation after deploy: scroll Assets/Structure, Goal/Scenario and Income depth; open/close the world picker while scrolling. Check touch targets, label readability, no clipped controls, no horizontal page overflow and no return of the earlier scroll hitch.
