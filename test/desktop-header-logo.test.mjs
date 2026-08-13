import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const stylesheet = readFileSync(
  new URL(
    "../src/components/Header/DesktopNav/index.module.scss",
    import.meta.url,
  ),
  "utf8",
);
const desktopNav = readFileSync(
  new URL(
    "../src/components/Header/DesktopNav/index.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("sizes the desktop ECOLITEA logo at 39px high", () => {
  const logoStart = stylesheet.indexOf(".logo {");
  const logoEnd = stylesheet.indexOf("\n}", logoStart);
  const logo = stylesheet.slice(logoStart, logoEnd);

  assert.notEqual(logoStart, -1);
  assert.match(logo, /svg\s*\{/);
  assert.match(logo, /height:\s*39px\s*;/);
  assert.match(logo, /width:\s*auto\s*;/);
});

test("names the desktop logo link for the Ecolitea homepage", () => {
  assert.match(desktopNav, /aria-label="Go to Ecolitea homepage"/);
});
