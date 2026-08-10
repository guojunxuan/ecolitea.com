import assert from "node:assert/strict";
import test from "node:test";

import { getFooterContactItems } from "../src/components/Footer/contact";

test("footer contact items trim and order safe address, phone, and email rows", () => {
  assert.deepEqual(
    getFooterContactItems({
      address: "  Shenzhen, China  ",
      email: " hello@example.test ",
      phone: "+86 755 1234 5678",
    }),
    [
      { kind: "address", text: "Shenzhen, China" },
      {
        href: "tel:+8675512345678",
        kind: "phone",
        text: "+86 755 1234 5678",
      },
      {
        href: "mailto:hello@example.test",
        kind: "email",
        text: "hello@example.test",
      },
    ],
  );
});

test("footer contact items omit empty or unusable contact values", () => {
  assert.deepEqual(
    getFooterContactItems({ address: " ", email: "", phone: "abc" }),
    [],
  );
  assert.deepEqual(getFooterContactItems(undefined), []);
  assert.deepEqual(getFooterContactItems(null), []);
});
