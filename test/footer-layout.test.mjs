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
    /grid-template-columns:\s*minmax\(0,\s*20fr\)\s+minmax\(0,\s*55fr\)\s+minmax\(0,\s*25fr\)\s*;/,
  );
  assert.match(
    desktopNavigation,
    /grid-template-columns:\s*repeat\(var\(--footer-column-count,\s*1\),\s*minmax\(0,\s*1fr\)\)\s*;/,
  );
});

test("uses the approved footer navigation typography hierarchy", () => {
  const description = getBlock(stylesheet, ".description");
  const heading = getBlock(stylesheet, ".navigationHeading");
  const navigationLink = getBlock(stylesheet, "\n.navigationLink {");
  const newsletter = getBlock(stylesheet, "\n.newsletter {");
  const newsletterCopy = getBlock(newsletter, "p");
  const contact = getBlock(stylesheet, ".contact");
  const copyright = getBlock(stylesheet, ".copyright");

  assert.match(description, /font-size:\s*12px\s*;/);
  assert.match(
    stylesheet,
    /\.navigationHeading,\s*\.mobileNavigationHeading,\s*\.newsletter h2\s*{/,
  );
  assert.match(heading, /font-size:\s*14px\s*;/);
  assert.match(heading, /font-weight:\s*600\s*;/);
  assert.match(navigationLink, /font-size:\s*13px\s*;/);
  assert.match(navigationLink, /font-weight:\s*400\s*;/);
  assert.match(newsletterCopy, /font-size:\s*11px\s*;/);
  assert.match(contact, /font-size:\s*11px\s*;/);
  assert.match(copyright, /font-size:\s*10px\s*;/);
});

test("sizes footer social controls and glyphs consistently", () => {
  const socialLinks = getBlock(stylesheet, "\n.socialLinks {");
  const socialLink = getBlock(stylesheet, "\n.socialLink {");
  const socialGlyph = getBlock(socialLink, "span,");

  assert.match(socialLinks, /gap:\s*10px\s*;/);
  assert.match(socialLink, /width:\s*36px\s*;/);
  assert.match(socialLink, /height:\s*36px\s*;/);
  assert.match(socialLink, /opacity:\s*0?\.85\s*;/);
  assert.match(socialLink, /span,\s*svg\s*{/);
  assert.match(socialGlyph, /display:\s*block\s*;/);
  assert.match(socialGlyph, /width:\s*24px\s*;/);
  assert.match(socialGlyph, /height:\s*24px\s*;/);
});

test("enlarges footer social controls at the mobile header breakpoint", () => {
  const mobileBreakpoint = getBlock(stylesheet, "@include mobile-header-break");
  const mobileSocialLink = getBlock(mobileBreakpoint, ".socialLink");

  assert.match(mobileSocialLink, /width:\s*40px\s*;/);
  assert.match(mobileSocialLink, /height:\s*40px\s*;/);
});

test("uses the approved mobile navigation link size", () => {
  const mobileBreakpoint = getBlock(stylesheet, "@include mobile-header-break");
  const mobileNavigationLink = getBlock(mobileBreakpoint, ".navigationLink");

  assert.match(mobileNavigationLink, /font-size:\s*13px\s*;/);
});

test("renders only the desktop navigation tree by default", () => {
  const desktopNavigation = getBlock(stylesheet, ".desktopNavigation");
  const mobileNavigation = getBlock(stylesheet, ".mobileNavigation");

  assert.match(desktopNavigation, /display:\s*grid\s*;/);
  assert.match(mobileNavigation, /display:\s*none\s*;/);
});

test("wraps long desktop navigation headings within their grid tracks", () => {
  const navigationHeading = getBlock(stylesheet, ".navigationHeading");

  assert.match(navigationHeading, /overflow-wrap:\s*anywhere\s*;/);
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

test("lets long mobile navigation labels wrap without moving the arrow", () => {
  const mobileBreakpoint = getBlock(stylesheet, "@include mobile-header-break");
  const navigationTrigger = getBlock(mobileBreakpoint, ".navigationTrigger");
  const navigationLabel = getBlock(navigationTrigger, "> span:first-child");

  assert.match(navigationLabel, /min-width:\s*0\s*;/);
  assert.match(navigationLabel, /overflow-wrap:\s*anywhere\s*;/);
});

test("places the horizontal content divider on the copyright row", () => {
  const copyright = getBlock(stylesheet, ".copyright");

  assert.match(copyright, /border-top:\s*1px\s+solid\s+[^;]+;/);
});

test("wraps long copyright text within the footer container", () => {
  const copyright = getBlock(stylesheet, ".copyright");
  const copyrightParagraph = getBlock(copyright, "p");

  assert.match(copyrightParagraph, /overflow-wrap:\s*anywhere\s*;/);
});

test("gives mobile contact anchors a minimum touch target", () => {
  const mobileBreakpoint = getBlock(stylesheet, "@include mobile-header-break");
  const mobileContact = getBlock(mobileBreakpoint, ".contact");
  const mobileContactAnchor = getBlock(mobileContact, "a");

  assert.match(mobileContactAnchor, /display:\s*flex\s*;/);
  assert.match(mobileContactAnchor, /min-height:\s*44px\s*;/);
  assert.match(mobileContactAnchor, /align-items:\s*center\s*;/);
});

test("centers mobile contact icons beside touch-target links", () => {
  const mobileBreakpoint = getBlock(stylesheet, "@include mobile-header-break");
  const mobileContactLinkItem = getBlock(
    mobileBreakpoint,
    ".contactItem:has(a)",
  );

  assert.match(mobileContactLinkItem, /align-items:\s*center\s*;/);
});

test("lays out the footer contact list as unstyled stacked rows", () => {
  const contactList = getBlock(stylesheet, ".contactList");
  const contactItem = getBlock(stylesheet, ".contactItem");

  assert.match(contactList, /display:\s*flex\s*;/);
  assert.match(contactList, /flex-direction:\s*column\s*;/);
  assert.match(contactList, /gap:\s*11px\s*;/);
  assert.match(contactList, /margin:\s*0\s*;/);
  assert.match(contactList, /padding:\s*0\s*;/);
  assert.match(contactList, /list-style:\s*none\s*;/);
  assert.match(contactItem, /display:\s*grid\s*;/);
  assert.match(
    contactItem,
    /grid-template-columns:\s*20px\s+minmax\(0,\s*1fr\)\s*;/,
  );
  assert.match(contactItem, /gap:\s*10px\s*;/);
  assert.match(contactItem, /align-items:\s*start\s*;/);
  assert.match(contactItem, /min-width:\s*0\s*;/);
});

test("sizes footer contact icons consistently", () => {
  const contactIcon = getBlock(stylesheet, ".contactIcon");
  const contactIconSvg = getBlock(contactIcon, "svg");

  assert.match(contactIcon, /width:\s*16px\s*;/);
  assert.match(contactIcon, /height:\s*16px\s*;/);
  assert.match(contactIconSvg, /display:\s*block\s*;/);
  assert.match(contactIconSvg, /width:\s*16px\s*;/);
  assert.match(contactIconSvg, /height:\s*16px\s*;/);
});

test("lets footer contact text preserve lines and wrap safely", () => {
  const contactText = getBlock(stylesheet, ".contactText");

  assert.match(contactText, /min-width:\s*0\s*;/);
  assert.match(contactText, /white-space:\s*pre-line\s*;/);
  assert.match(contactText, /overflow-wrap:\s*anywhere\s*;/);
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
