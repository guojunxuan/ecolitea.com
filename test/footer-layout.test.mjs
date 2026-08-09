import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

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

test("uses the approved centered desktop proportions and dynamic navigation columns", () => {
  const content = getBlock(stylesheet, ".content");
  const desktopNavigation = getBlock(stylesheet, ".desktopNavigation");

  assert.match(stylesheet, /max-width:\s*1220px\s*;/);
  assert.match(
    content,
    /grid-template-columns:\s*minmax\(0,\s*24fr\)\s+minmax\(0,\s*46fr\)\s+minmax\(0,\s*30fr\)\s*;/,
  );
  assert.match(
    desktopNavigation,
    /grid-template-columns:\s*repeat\(var\(--footer-column-count,\s*1\),\s*minmax\(0,\s*1fr\)\)\s*;/,
  );
});

test("renders only the desktop navigation tree by default", () => {
  const desktopNavigation = getBlock(stylesheet, ".desktopNavigation");
  const mobileNavigation = getBlock(stylesheet, ".mobileNavigation");

  assert.match(desktopNavigation, /display:\s*grid\s*;/);
  assert.match(mobileNavigation, /display:\s*none\s*;/);
});

test("hands navigation and content layout to mobile at the shared header breakpoint", () => {
  const mobileBreakpoint = getBlock(stylesheet, "@include mobile-header-break");
  const mobileContent = getBlock(mobileBreakpoint, ".content");
  const mobileDesktopNavigation = getBlock(
    mobileBreakpoint,
    ".desktopNavigation",
  );
  const mobileMobileNavigation = getBlock(
    mobileBreakpoint,
    ".mobileNavigation",
  );

  assert.match(mobileContent, /display:\s*flex\s*;/);
  assert.match(mobileContent, /flex-direction:\s*column\s*;/);
  assert.match(mobileDesktopNavigation, /display:\s*none\s*;/);
  assert.match(mobileMobileNavigation, /display:\s*block\s*;/);
});

test("caps the desktop newsletter control and lets it fill the mobile column", () => {
  const subscribePlaceholder = getBlock(stylesheet, ".subscribePlaceholder");
  const mobileBreakpoint = getBlock(stylesheet, "@include mobile-header-break");
  const mobileSubscribePlaceholder = getBlock(
    mobileBreakpoint,
    ".subscribePlaceholder",
  );

  assert.match(subscribePlaceholder, /max-width:\s*286px\s*;/);
  assert.match(mobileSubscribePlaceholder, /max-width:\s*none\s*;/);
  assert.match(mobileSubscribePlaceholder, /width:\s*100%\s*;/);
});

test("keeps the copyright rule as the footer content sole divider", () => {
  const copyright = getBlock(stylesheet, ".copyright");

  assert.match(copyright, /border-top:\s*1px\s+solid\s+[^;]+;/);
});

test("removes legacy decorative footer selectors", () => {
  for (const selector of [
    "topBorder",
    "background",
    "payload3dContainer",
    "BackgroundGrid",
  ]) {
    assert.doesNotMatch(stylesheet, new RegExp(`\\.${selector}\\b`, "i"));
  }
});
