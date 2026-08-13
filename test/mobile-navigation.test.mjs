import assert from "node:assert/strict";
import test from "node:test";
import * as mobileNavigation from "../src/components/Header/MobileNav/navigation.js";
import {
  getMobileNavigationAction,
  getMobileNavigationBranch,
  initialMobileNavigationState,
  reduceMobileNavigation,
} from "../src/components/Header/MobileNav/navigation.js";

void test("classifies dropdown tabs as submenus and other tabs as links", () => {
  assert.equal(getMobileNavigationAction({ enableDropdown: true }), "submenu");
  assert.equal(getMobileNavigationAction({ enableDropdown: false }), "link");
});

void test("maps a list navigation group", () => {
  const landingLink = { label: "All teas", url: "/tea" };
  const links = [{ label: "Green tea", url: "/tea/green" }];

  assert.deepEqual(
    getMobileNavigationBranch({
      listLinks: {
        landingLink,
        links,
        tag: "Tea collection",
      },
      style: "list",
    }),
    {
      kind: "list",
      label: "Tea collection",
      landingLink,
      links,
    },
  );
});

void test("maps a featured navigation group", () => {
  const landingLink = { label: "All gifts", url: "/gifts" };
  const links = [{ label: "Tea sets", url: "/gifts/tea-sets" }];

  assert.deepEqual(
    getMobileNavigationBranch({
      featuredLink: {
        label: "Seasonal picks",
        landingLink,
        links,
        tag: "Gift guide",
      },
      style: "featured",
    }),
    {
      featuredLabel: "Seasonal picks",
      kind: "featured",
      label: "Gift guide",
      landingLink,
      links,
    },
  );
});

void test("returns no branch for unsupported navigation groups", () => {
  assert.equal(getMobileNavigationBranch({ style: "default" }), null);
  assert.equal(getMobileNavigationBranch(null), null);
});

void test("moves through mobile navigation levels and back to the initial state", () => {
  assert.deepEqual(initialMobileNavigationState, {
    activeItemIndex: undefined,
    activeTabIndex: undefined,
    level: 1,
  });

  const tabState = reduceMobileNavigation(initialMobileNavigationState, {
    index: 2,
    type: "OPEN_TAB",
  });
  assert.deepEqual(tabState, {
    activeItemIndex: undefined,
    activeTabIndex: 2,
    level: 2,
  });

  const itemState = reduceMobileNavigation(tabState, {
    index: 1,
    type: "OPEN_ITEM",
  });
  assert.deepEqual(itemState, {
    activeItemIndex: 1,
    activeTabIndex: 2,
    level: 3,
  });

  assert.deepEqual(
    reduceMobileNavigation(itemState, { type: "BACK" }),
    tabState,
  );
  assert.deepEqual(
    reduceMobileNavigation(tabState, { type: "BACK" }),
    initialMobileNavigationState,
  );
  assert.deepEqual(
    reduceMobileNavigation(itemState, { type: "RESET" }),
    initialMobileNavigationState,
  );
});

void test("selects focus targets through drilldown, back, and reset transitions", () => {
  assert.equal(
    typeof mobileNavigation.getMobileNavigationFocusTarget,
    "function",
  );

  const getFocusTarget = mobileNavigation.getMobileNavigationFocusTarget;
  const levelOneState = initialMobileNavigationState;
  const levelTwoState = reduceMobileNavigation(levelOneState, {
    index: 2,
    type: "OPEN_TAB",
  });
  const levelThreeState = reduceMobileNavigation(levelTwoState, {
    index: 1,
    type: "OPEN_ITEM",
  });
  const returnedLevelTwoState = reduceMobileNavigation(levelThreeState, {
    type: "BACK",
  });
  const returnedLevelOneState = reduceMobileNavigation(returnedLevelTwoState, {
    type: "BACK",
  });

  assert.deepEqual(getFocusTarget(levelOneState, levelTwoState), {
    level: 2,
    type: "back",
  });
  assert.deepEqual(getFocusTarget(levelTwoState, levelThreeState), {
    level: 3,
    type: "back",
  });
  assert.deepEqual(getFocusTarget(levelThreeState, returnedLevelTwoState), {
    index: 1,
    level: 2,
    type: "source",
  });
  assert.deepEqual(
    getFocusTarget(returnedLevelTwoState, returnedLevelOneState),
    {
      index: 2,
      level: 1,
      type: "source",
    },
  );
  assert.equal(
    getFocusTarget(
      levelThreeState,
      reduceMobileNavigation(levelThreeState, { type: "RESET" }),
    ),
    undefined,
  );
});

void test("ignores OPEN_ITEM when no tab is active", () => {
  assert.equal(
    reduceMobileNavigation(initialMobileNavigationState, {
      index: 1,
      type: "OPEN_ITEM",
    }),
    initialMobileNavigationState,
  );
});

void test("preserves state for unknown actions", () => {
  const existingState = {
    activeItemIndex: undefined,
    activeTabIndex: 2,
    level: 2,
  };

  assert.strictEqual(
    reduceMobileNavigation(existingState, { type: "UNKNOWN" }),
    existingState,
  );
});
