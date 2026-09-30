# QVANIX Desktop Legibility v46 — 2026-09-30

Real PC photos after v45 showed the desktop composition was finally using the monitor width, but the interface still read too small from normal viewing distance. The problem was no longer structure; it was typography and component scale. Several legacy history/deep-workspace selectors still carried phone-era 7–10px microtype, some with !important, so v45's wider layout alone could not solve readability.

## v46 changes

### Comfortable desktop scale
At >=1200px:
- desktop canvas expands to 1560px;
- left rail grows to 252px;
- header, navigation, page titles, balance, controls and tables all receive monitor-distance typography;
- primary portfolio value grows to 70px;
- asset identity, values and P/L cells move into the 11–14px range;
- controls and table rows receive larger hit targets.

At >=1600px:
- canvas expands to 1680px;
- rail grows to 270px.

### History chart correction
The legacy history component had hard-coded microtype with !important. v46 explicitly overrides it on desktop:
- period controls 11px / 38px high;
- chart axis and captions 10–12px;
- history detail cards 10–13px;
- chart height increased to 300px inside the figure.

### Result / Income / Analytics
- result hero metrics, truth cards and summary cards receive larger desktop typography;
- income metrics and road map scale up;
- quick analytics KPIs, concentration map and market rows are enlarged.

### Deep professional workspaces
Assets Depth, Analytics Depth, Income Depth, Market Intelligence and Tools now get explicit desktop typography instead of relying only on inherited scale. Navigation cards, method copy, workbench groups, glossary help and dense metric blocks all receive larger text and spacing.

## Guardrails
No financial formulas changed. No data contract changed. No trading. No fabricated data. Phone/tablet rules are untouched. DNA/Living World remains frozen.
