import test from "node:test";
import assert from "node:assert/strict";
import { getMobileNavigationAction } from "../src/components/Header/MobileNav/navigation.js";

test("opens a submenu only for dropdown tabs", () => {
  assert.equal(getMobileNavigationAction({ enableDropdown: true }), "submenu");
  assert.equal(getMobileNavigationAction({ enableDropdown: false }), "link");
});
