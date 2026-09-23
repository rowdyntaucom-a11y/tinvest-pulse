import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const css=readFileSync(new URL("../src/styles/samuraiMobileFirstScreen.css",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.tsx",import.meta.url),"utf8");
assert.match(main,/samuraiArtDirection\\.css";import"\\.\\/styles\\/samuraiMobileFirstScreen\\.css"/);\nassert.ok(main.indexOf("samuraiMobileFirstScreen.css")<main.indexOf("mobilePerformance.css"));
assert.match(css,/@media\(max-width:430px\)/);assert.match(css,/43svh/);assert.match(css,/--v3-stage-h/);
assert.match(css,/grid-template-areas:"twr cash count" "twr xirr count"/);
assert.match(css,/@media\(max-width:359px\)/);
assert.doesNotMatch(css,/url\(/);assert.doesNotMatch(css,/backdrop-filter/);assert.doesNotMatch(css,/animation:/);
console.log("samurai mobile first-screen regression: ok");