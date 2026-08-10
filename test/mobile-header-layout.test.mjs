import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mobileNav = readFileSync(
  new URL("../src/components/Header/MobileNav/index.tsx", import.meta.url),
  "utf8",
);
const stylesheet = readFileSync(
  new URL(
    "../src/components/Header/MobileNav/index.module.scss",
    import.meta.url,
  ),
  "utf8",
);
const menuIcon = readFileSync(
  new URL("../src/graphics/MenuIcon/index.tsx", import.meta.url),
  "utf8",
);
const searchIcon = readFileSync(
  new URL("../src/graphics/SearchIcon/index.tsx", import.meta.url),
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

const getSelfClosingTags = (source, componentName) =>
  source.match(new RegExp(`<${componentName}\\b[^>]*\\/>`, "gs")) ?? [];

test("uses the approved three-column 60px mobile header geometry", () => {
  const menuBar = getBlock(stylesheet, ".menuBar");
  const menuBarContainer = getBlock(stylesheet, ".menuBarContainer");
  const panelHeader = getBlock(stylesheet, ".panelHeader");

  assert.match(menuBar, /height:\s*60px\s*;/);
  assert.match(menuBarContainer, /height:\s*60px\s*;/);
  assert.match(
    menuBarContainer,
    /grid-template-columns:\s*29fr\s+42fr\s+29fr\s*;/,
  );
  assert.match(panelHeader, /min-height:\s*60px\s*;/);
  assert.match(panelHeader, /grid-template-columns:\s*29fr\s+42fr\s+29fr\s*;/);
});

test("sets the mobile logo dimensions in the stylesheet", () => {
  const logo = getBlock(stylesheet, ".logo");
  const logoSvg = getBlock(logo, "svg");

  assert.match(logoSvg, /width:\s*auto\s*;/);
  assert.match(logoSvg, /height:\s*30px\s*;/);
});

test("renders exactly two plain full logos without prop overrides", () => {
  assert.deepEqual(getSelfClosingTags(mobileNav, "FullLogo"), [
    "<FullLogo />",
    "<FullLogo />",
  ]);
});

test("renders the approved plain mobile action icon components", () => {
  assert.deepEqual(getSelfClosingTags(mobileNav, "MenuIcon"), [
    "<MenuIcon />",
    "<MenuIcon />",
  ]);
  assert.deepEqual(getSelfClosingTags(mobileNav, "SearchIcon"), [
    "<SearchIcon />",
  ]);
});

test("keeps the mobile action icons at their approved intrinsic sizes", () => {
  assert.match(menuIcon, /<svg\b[^>]*\bheight="25"/s);
  assert.match(menuIcon, /<svg\b[^>]*\bwidth="25"/s);
  assert.match(searchIcon, /<svg\b[^>]*\bheight="26"/s);
  assert.match(searchIcon, /<svg\b[^>]*\bwidth="25"/s);
});
