import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { footerContactIcons } from "../src/components/Footer/contactIcons";

test("footer contact icons exactly cover every contact kind", () => {
  assert.deepEqual(Object.keys(footerContactIcons), [
    "address",
    "phone",
    "email",
  ]);
});

test("every footer contact icon renders a decorative CSS-sized SVG", () => {
  for (const Icon of Object.values(footerContactIcons)) {
    const markup = renderToStaticMarkup(React.createElement(Icon));
    const openingSvgTag = markup.match(/^<svg\b[^>]*>/)?.[0];

    assert.ok(openingSvgTag);
    assert.match(openingSvgTag, /\saria-hidden="true"/);
    assert.match(openingSvgTag, /\sviewBox="0 0 24 24"/);
    assert.match(openingSvgTag, /\s(?:stroke|fill)="currentColor"/);
    assert.doesNotMatch(openingSvgTag, /\s(?:width|height)=/);
  }
});
