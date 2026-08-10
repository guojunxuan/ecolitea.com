import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { footerSocialIcons } from "../src/components/Footer/socialIcons";

test("footer social icons include the exact supported platform keys", () => {
  assert.deepEqual(Object.keys(footerSocialIcons), [
    "facebook",
    "instagram",
    "youtube",
    "linkedin",
    "x",
    "tiktok",
  ]);
});

test("every footer social icon renders a normalized current-color svg", () => {
  for (const [platform, Icon] of Object.entries(footerSocialIcons)) {
    const markup = renderToStaticMarkup(React.createElement(Icon));
    const rootSvg = markup.match(/^<svg\b[^>]*>/)?.[0];

    assert.ok(rootSvg, `${platform} should render an svg root`);
    assert.match(
      rootSvg,
      /\saria-hidden="true"/,
      `${platform} should be hidden from assistive technology`,
    );
    assert.match(
      rootSvg,
      /\sviewBox="0 0 24 24"/,
      `${platform} should use the normalized viewBox`,
    );
    assert.doesNotMatch(
      rootSvg,
      /\s(?:width|height)=/,
      `${platform} should inherit its rendered size`,
    );
    assert.match(
      markup,
      /\s(?:fill|stroke)="currentColor"/,
      `${platform} should inherit its visible color`,
    );
    assert.doesNotMatch(
      markup,
      /fill="white"/i,
      `${platform} should not force a white fill`,
    );
    assert.doesNotMatch(
      markup,
      /\s(?:width|height)="32(?:px)?"/,
      `${platform} should not retain legacy 32px dimensions`,
    );
  }
});
