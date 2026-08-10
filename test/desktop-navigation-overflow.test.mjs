import test from "node:test";
import assert from "node:assert/strict";
import { getVisibleNavigationCount } from "../src/components/Header/DesktopNav/overflow.js";

test("keeps every tab visible when all tabs fit", () => {
  assert.equal(
    getVisibleNavigationCount({
      availableWidth: 330,
      gap: 10,
      itemWidths: [80, 90, 110],
      moreWidth: 50,
    }),
    3,
  );
});

test("accounts for the More trigger before choosing visible tabs", () => {
  assert.equal(
    getVisibleNavigationCount({
      availableWidth: 240,
      gap: 10,
      itemWidths: [80, 90, 110],
      moreWidth: 50,
    }),
    2,
  );
});

test("allows More to be the only primary trigger when no tab fits", () => {
  assert.equal(
    getVisibleNavigationCount({
      availableWidth: 50,
      gap: 10,
      itemWidths: [80],
      moreWidth: 50,
    }),
    0,
  );
});

test("reserves the navigation end inset before deciding which tabs fit", () => {
  assert.equal(
    getVisibleNavigationCount({
      availableWidth: 240,
      gap: 10,
      itemWidths: [80, 90, 110],
      moreWidth: 50,
      reservedEndSpace: 30,
    }),
    1,
  );
});
