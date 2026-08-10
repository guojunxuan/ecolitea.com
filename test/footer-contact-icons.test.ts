import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";

import { footerContactIcons } from "../src/components/Footer/contactIcons";

test("footer contact icons exactly cover every renderable contact kind", () => {
  assert.deepEqual(Object.keys(footerContactIcons), [
    "address",
    "phone",
    "email",
  ]);

  for (const icon of Object.values(footerContactIcons)) {
    assert.ok(React.isValidElement(React.createElement(icon)));
  }
});
