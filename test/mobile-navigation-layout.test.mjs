import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mobileNavigationSource = readFileSync(
  new URL("../src/components/Header/MobileNav/index.tsx", import.meta.url),
  "utf8",
);
const desktopNavigationSource = readFileSync(
  new URL("../src/components/Header/DesktopNav/index.tsx", import.meta.url),
  "utf8",
);
const stylesheet = readFileSync(
  new URL(
    "../src/components/Header/MobileNav/index.module.scss",
    import.meta.url,
  ),
  "utf8",
);

const getComponentSource = (startMarker, endMarker) => {
  const start = mobileNavigationSource.indexOf(startMarker);
  const end = mobileNavigationSource.indexOf(endMarker, start);

  assert.notEqual(start, -1, `Missing component marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing component marker: ${endMarker}`);

  return mobileNavigationSource.slice(start, end);
};

void test("renders three persistent navigation panels in one track", () => {
  assert.match(
    mobileNavigationSource,
    /<div\s+className=\{classes\.navigationTrack\}\s+data-level=\{navigationState\.level\}\s*>/,
  );

  for (const [level, panelClass] of [
    [1, "levelOnePanel"],
    [2, "levelTwoPanel"],
    [3, "levelThreePanel"],
  ]) {
    assert.match(
      mobileNavigationSource,
      new RegExp(
        `className=\\{classes\\.${panelClass}\\}[\\s\\S]*?data-level="${level}"`,
      ),
    );
  }
});

void test("keeps branch destinations separate from drilldown controls", () => {
  const drilldownRowSource = getComponentSource(
    "const DrilldownRow",
    "const BackRow",
  );

  assert.match(
    drilldownRowSource,
    /className=\{classes\.branchTitle\}[\s\S]*?<button[\s\S]*?className=\{classes\.drilldownButton\}/,
  );
  assert.match(drilldownRowSource, /aria-label=\{`Open \$\{label\} submenu`\}/);
});

void test("uses destination back titles without synthetic view-all links", () => {
  assert.ok(mobileNavigationSource.includes("Back to {parentLabel}"));
  assert.doesNotMatch(mobileNavigationSource, /View all/i);
});

void test("does not repeat the level-two category title on level three", () => {
  assert.doesNotMatch(mobileNavigationSource, /classes\.branchHeading/);
  assert.doesNotMatch(stylesheet, /\.branchHeading\s*\{/);
});

void test("keeps final links free of directional arrows", () => {
  const finalLinkSource = getComponentSource(
    "const FinalLink",
    "const DrilldownRow",
  );

  assert.match(finalLinkSource, /className=\{classes\.finalLink\}/);
  assert.doesNotMatch(finalLinkSource, /ArrowIcon/);
});

void test("keeps a described final link title and description in one copy wrapper", () => {
  const finalLinkSource = getComponentSource(
    "const FinalLink",
    "const DrilldownRow",
  );

  assert.match(finalLinkSource, /const finalTitle = title \?\? link\?\.label;/);
  assert.match(
    finalLinkSource,
    /label=\{description \? undefined : finalTitle\}[\s\S]*?\{description && \([\s\S]*?className=\{classes\.finalLinkCopy\}[\s\S]*?className=\{classes\.finalLinkTitle\}>\{finalTitle\}<\/span>[\s\S]*?className=\{classes\.itemDescription\}>\{description\}<\/span>/,
  );
});

void test("does not expose mobile landing links in desktop navigation", () => {
  assert.doesNotMatch(desktopNavigationSource, /landingLink/);
});

void test("makes only the active navigation level interactive", () => {
  for (const level of [1, 2, 3]) {
    assert.match(
      mobileNavigationSource,
      new RegExp(`aria-hidden=\\{navigationState\\.level !== ${level}\\}`),
    );
    assert.match(
      mobileNavigationSource,
      new RegExp(`inert=\\{navigationState\\.level !== ${level}\\}`),
    );
  }
});

void test("resets reducer state when the modal closes", () => {
  assert.match(
    mobileNavigationSource,
    /React\.useEffect\(\(\) => \{\s*if \(!isMenuOpen\) \{\s*dispatchNavigation\(\{ type: "RESET" \}\);\s*\}\s*\}, \[isMenuOpen\]\);/,
  );
});

void test("clips a three-page horizontal track inside a dedicated viewport", () => {
  assert.match(
    mobileNavigationSource,
    /className=\{classes\.navigationViewport\}[\s\S]*?className=\{classes\.navigationTrack\}/,
  );
  assert.match(
    stylesheet,
    /\.navigationViewport\s*\{[\s\S]*?flex:\s*1\s+1\s+auto;[\s\S]*?min-height:\s*0;[\s\S]*?overflow:\s*hidden;/,
  );
  assert.match(
    stylesheet,
    /\.mobileMenuPanel\s*\{[\s\S]*?width:\s*77vw;[\s\S]*?max-width:\s*320px;/,
  );
  assert.match(
    stylesheet,
    /\.navigationTrack\s*\{[\s\S]*?width:\s*300%;[\s\S]*?transition:\s*transform\s+340ms\s+cubic-bezier\(0\.22,\s*0\.75,\s*0\.25,\s*1\);/,
  );
  assert.match(
    stylesheet,
    /&\[data-level=["']2["']\]\s*\{[\s\S]*?translateX\(-33\.3333%\)/,
  );
  assert.match(
    stylesheet,
    /&\[data-level=["']3["']\]\s*\{[\s\S]*?translateX\(-66\.6666%\)/,
  );
  assert.match(
    stylesheet,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.navigationTrack\s*\{[\s\S]*?transition:\s*none;/,
  );
});

void test("gives every navigation page isolated vertical scrolling", () => {
  assert.match(
    stylesheet,
    /\.levelOnePanel,\s*\n\.levelTwoPanel,\s*\n\.levelThreePanel\s*\{[\s\S]*?flex:\s*0\s+0\s+33\.3333%;[\s\S]*?width:\s*33\.3333%;[\s\S]*?min-width:\s*0;[\s\S]*?overflow-y:\s*auto;[\s\S]*?overflow-x:\s*hidden;/,
  );
});

void test("matches the approved split-row and back-row geometry", () => {
  assert.match(
    stylesheet,
    /\.branchRow\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s+52px;[\s\S]*?min-height:\s*54px;/,
  );
  assert.match(
    stylesheet,
    /\.branchTitle\s*\{[\s\S]*?padding:\s*10px\s+16px;[\s\S]*?font-weight:\s*500;[\s\S]*?letter-spacing:\s*-0\.01em;[\s\S]*?overflow-wrap:\s*anywhere;/,
  );
  assert.match(
    stylesheet,
    /\.levelOnePanel\s+\.branchTitle\s*\{[\s\S]*?font-size:\s*16px;/,
  );
  assert.match(
    stylesheet,
    /\.levelTwoPanel\s+\.branchTitle\s*\{[\s\S]*?font-size:\s*15px;/,
  );
  assert.match(
    stylesheet,
    /\.drilldownButton\s*\{[\s\S]*?width:\s*52px;[\s\S]*?min-height:\s*54px;/,
  );
  assert.match(
    stylesheet,
    /\.backRow\s*\{[\s\S]*?grid-template-columns:\s*48px\s+minmax\(0,\s*1fr\);[\s\S]*?height:\s*54px;/,
  );
  assert.match(
    stylesheet,
    /\.backButton\s*\{[\s\S]*?width:\s*48px;[\s\S]*?height:\s*54px;/,
  );
  assert.match(
    stylesheet,
    /\.backTitle\s*\{[\s\S]*?height:\s*54px;[\s\S]*?font-size:\s*14px;[\s\S]*?font-weight:\s*500;[\s\S]*?white-space:\s*nowrap;/,
  );
});

void test("keeps direct level-one destinations on the primary row scale", () => {
  assert.match(stylesheet, /\.finalLink\s*\{[\s\S]*?padding:\s*11px\s+16px;/);
  assert.match(
    stylesheet,
    /\.levelOnePanel\s+\.finalLink\s*\{[\s\S]*?min-height:\s*54px;[\s\S]*?font-size:\s*16px;[\s\S]*?font-weight:\s*500;[\s\S]*?letter-spacing:\s*-0\.01em;/,
  );
});

void test("uses compact final-link, description, group, and featured typography", () => {
  assert.match(
    stylesheet,
    /\.finalLink\s*\{[\s\S]*?min-height:\s*44px;[\s\S]*?font-size:\s*15px;[\s\S]*?font-weight:\s*400;[\s\S]*?overflow-wrap:\s*anywhere;/,
  );
  assert.match(
    stylesheet,
    /\.finalLinkCopy\s*\{[\s\S]*?flex-direction:\s*column;/,
  );
  assert.match(
    stylesheet,
    /\.itemDescription\s*\{[\s\S]*?font-size:\s*13px;[\s\S]*?line-height:\s*1\.45;/,
  );
  assert.match(
    stylesheet,
    /\.featuredContent\s*\{[\s\S]*?margin:\s*12px;[\s\S]*?padding:\s*16px;[\s\S]*?background:\s*var\(--theme-elevation-50\);/,
  );
});

void test("exposes consistent focus, hover, and pressed feedback", () => {
  assert.match(
    stylesheet,
    /\.branchTitle,\s*\n\.drilldownButton,\s*\n\.backButton,\s*\n\.backTitle,\s*\n\.finalLink\s*\{[\s\S]*?&:focus-visible\s*\{[\s\S]*?outline:\s*2px\s+solid\s+var\(--theme-success-600\);[\s\S]*?outline-offset:\s*-3px;[\s\S]*?@include\s+mouseHover\s*\{[\s\S]*?background:\s*var\(--theme-elevation-50\);[\s\S]*?&:active\s*\{[\s\S]*?background:\s*var\(--theme-success-50\);/,
  );
});

void test("never truncates or clamps navigation labels", () => {
  assert.doesNotMatch(stylesheet, /text-overflow:\s*ellipsis/i);
  assert.doesNotMatch(stylesheet, /-webkit-line-clamp/i);
  assert.doesNotMatch(stylesheet, /(?:^|[^-])line-clamp/i);
});
