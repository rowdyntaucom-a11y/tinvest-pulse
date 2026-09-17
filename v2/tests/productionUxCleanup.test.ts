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

const trustIndicator = readFileSync(new URL("../src/features/shared/DataTrustIndicator.tsx", import.meta.url), "utf8");
assert.match(trustIndicator, /Локальная резервная копия/, "fallback source must have human-readable copy");
assert.match(trustIndicator, /Обновлено/, "freshness must be phrased for users");
assert.doesNotMatch(trustIndicator, /<small>\{trust\.sourceId\}/, "raw source identifier must never be rendered directly");

console.log("production UX cleanup regression passed");
