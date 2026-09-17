import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dna = readFileSync(new URL("../src/features/dna/DnaWorkspace.tsx", import.meta.url), "utf8");
for (const debugCopy of ["PIXIJS / WEBGL", "XP CORE", "WorldState v", "СЛЕДУЮЩИЙ ЭТАП", "XP Engine → WorldState"]) {
  assert.equal(dna.includes(debugCopy), false, `production DNA workspace must not expose debug copy: ${debugCopy}`);
}
assert.match(dna, /<h2>ЖИВОЙ МИР<\/h2>/, "Living World identity remains visible");
assert.match(dna, /УРОВЕНЬ \{state\.level\}/, "user-facing level remains visible");
assert.match(dna, /<WorldSessionStage state=\{state\} \/>/, "single world runtime surface remains mounted");

const navCss = readFileSync(new URL("../src/features/navigation/navigation.css", import.meta.url), "utf8");
assert.match(navCss, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/, "portrait mobile nav must preserve five-column architecture");
assert.doesNotMatch(navCss, /grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/, "portrait mobile nav must not regress to six microtype columns");

const mobileControls = readFileSync(new URL("../src/mobileControlLayer.css", import.meta.url), "utf8");
assert.match(mobileControls, /\.context-help,\s*\.qv-personalize\s*\{[\s\S]*left:\s*10px !important;[\s\S]*right:\s*auto !important;/, "portrait secondary utilities must share one rail");
assert.match(mobileControls, /\.context-help\s*\{\s*bottom:\s*calc\(74px \+ env\(safe-area-inset-bottom\)\) !important;/, "help target must clear primary navigation");
assert.match(mobileControls, /\.qv-personalize\s*\{\s*bottom:\s*calc\(122px \+ env\(safe-area-inset-bottom\)\) !important;/, "personalization target must stack above help");
assert.match(mobileControls, /min-width:\s*44px;[\s\S]*min-height:\s*44px;/, "mobile utility targets must preserve 44px minimum touch size");
assert.doesNotMatch(mobileControls, /\.context-help\s*\{[\s\S]{0,100}right:\s*84px/, "help must not return to a competing right-side portrait lane");

const trustIndicator = readFileSync(new URL("../src/features/shared/DataTrustIndicator.tsx", import.meta.url), "utf8");
assert.match(trustIndicator, /Локальная резервная копия/, "fallback source must have human-readable copy");
assert.match(trustIndicator, /Обновлено/, "freshness must be phrased for users");
assert.doesNotMatch(trustIndicator, /<small>\{trust\.sourceId\}/, "raw source identifier must never be rendered directly");

console.log("production UX cleanup regression passed");
