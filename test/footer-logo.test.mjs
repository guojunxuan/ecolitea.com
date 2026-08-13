import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const footer = readFileSync(
  new URL("../src/components/Footer/index.tsx", import.meta.url),
  "utf8",
);
const stylesheet = readFileSync(
  new URL("../src/components/Footer/index.module.scss", import.meta.url),
  "utf8",
);

const getBlock = (source, selector) => {
  const selectorIndex = source.indexOf(selector);
  assert.notEqual(selectorIndex, -1, `Expected to find ${selector}`);

  const openingBraceIndex = source.indexOf("{", selectorIndex);
  assert.notEqual(
    openingBraceIndex,
    -1,
    `Expected ${selector} to open a block`,
  );

  let depth = 0;

  for (let index = openingBraceIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;

    if (depth === 0) return source.slice(openingBraceIndex + 1, index);
  }

  assert.fail(`Expected ${selector} to close its block`);
};

test("directly renders FullLogo as a link to the homepage", () => {
  assert.match(footer, /import\s+\{\s*FullLogo\s*\}/);
  assert.match(footer, /import\s+Link\s+from\s+["']next\/link["']/);
  assert.match(
    footer,
    /<Link[\s\S]*?aria-label=["']Go to Ecolitea homepage["'][\s\S]*?href=["']\/["'][\s\S]*?prefetch=\{false\}[\s\S]*?<FullLogo\s*\/>[\s\S]*?<\/Link>/,
  );
  assert.doesNotMatch(footer, /@components\/Media/);
  assert.doesNotMatch(footer, /getFooterLogoResource/);
});

test("sizes the directly rendered footer svg", () => {
  const logo = getBlock(stylesheet, ".logo");
  const logoSvg = getBlock(logo, "svg");

  assert.match(logoSvg, /display:\s*block\s*;/);
  assert.match(logoSvg, /width:\s*100%\s*;/);
  assert.match(logoSvg, /height:\s*auto\s*;/);
  assert.doesNotMatch(logo, /img\s*\{/);
});
