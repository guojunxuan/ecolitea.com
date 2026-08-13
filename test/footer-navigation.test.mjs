import assert from "node:assert/strict";
import test from "node:test";

import { getNextFooterAccordionItem } from "../src/components/Footer/navigation.js";

test("opens the requested item when no footer accordion item is open", () => {
  assert.equal(getNextFooterAccordionItem(null, "products"), "products");
});

test("closes the footer accordion item when it is requested again", () => {
  assert.equal(getNextFooterAccordionItem("products", "products"), null);
});

test("switches the open footer accordion item when a different item is requested", () => {
  assert.equal(getNextFooterAccordionItem("products", "company"), "company");
});
