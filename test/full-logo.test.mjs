import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const fullLogo = readFileSync(
  new URL("../src/graphics/FullLogo/index.tsx", import.meta.url),
  "utf8",
);

test("uses the cleaned Figma ECOLITEA vector lockup", () => {
  assert.match(fullLogo, /viewBox="0 0 250 75"/);
  assert.match(fullLogo, /height=\{75\}/);
  assert.match(fullLogo, /aria-hidden="true"/);
  assert.match(fullLogo, /data-logo-part="brand-name"/);
  assert.match(fullLogo, /data-logo-part="brand-tagline"/);
  assert.equal(fullLogo.match(/<path\b/g)?.length, 2);
  assert.equal(fullLogo.match(/fill="currentColor"/g)?.length, 2);
  assert.equal(fullLogo.match(/\bd="[Mm][^"]+"/g)?.length, 2);
  assert.doesNotMatch(fullLogo, /opacity=/);
});

test("contains no presentation-card artwork or font dependency", () => {
  assert.doesNotMatch(fullLogo, /<rect\b|<filter\b|<text\b|font-family/i);
  assert.doesNotMatch(fullLogo, /#F5F5F5|#FFFCFC|#E8E8E3|dropShadow/i);
});
