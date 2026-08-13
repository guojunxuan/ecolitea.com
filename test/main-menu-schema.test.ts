import type { ArrayField, CollapsibleField, GroupField } from "payload";

import assert from "node:assert/strict";
import test from "node:test";

import { MainMenu } from "../src/globals/MainMenu";
import { validateMainMenuTabs } from "../src/globals/mainMenuValidation";

const tabsField = MainMenu.fields.find(
  (field): field is ArrayField =>
    "name" in field && field.name === "tabs" && field.type === "array",
);
assert.ok(tabsField, "MainMenu must define tabs as an array");
const dropdownField = tabsField.fields.find(
  (field): field is CollapsibleField =>
    field.type === "collapsible" && field.label === "Dropdown Menu",
);
assert.ok(
  dropdownField,
  "MainMenu tabs must define the Dropdown Menu collapsible",
);
const navItemsField = dropdownField.fields.find(
  (field): field is ArrayField =>
    "name" in field && field.name === "navItems" && field.type === "array",
);
assert.ok(navItemsField, "MainMenu tabs must define navItems");
for (const groupName of ["listLinks", "featuredLink"]) {
  const group = navItemsField.fields.find(
    (field): field is GroupField =>
      "name" in field && field.name === groupName && field.type === "group",
  );
  assert.ok(group, `MainMenu navItems must define ${groupName}`);
  assert.ok(
    group.fields.some(
      (field) =>
        "name" in field &&
        field.name === "landingLink" &&
        field.type === "group",
    ),
    `${groupName} must define landingLink`,
  );
}

const customLink = (url: string) => ({ type: "custom" as const, url });

void test("requires a landing link for an expandable top-level tab", () => {
  assert.equal(
    validateMainMenuTabs([
      {
        enableDirectLink: false,
        enableDropdown: true,
        label: "Products",
      },
    ]),
    "Products must enable and configure its Direct Link before it can open a submenu.",
  );
});

void test("requires landing links for List and Featured drilldown groups", () => {
  assert.equal(
    validateMainMenuTabs([
      {
        enableDirectLink: true,
        enableDropdown: true,
        label: "Products",
        link: customLink("/products"),
        navItems: [
          { listLinks: { links: [], tag: "Organic Tea" }, style: "list" },
        ],
      },
    ]),
    "Products → Organic Tea requires a Landing Link.",
  );

  assert.equal(
    validateMainMenuTabs([
      {
        enableDirectLink: true,
        enableDropdown: true,
        label: "Resources",
        link: customLink("/resources"),
        navItems: [
          { featuredLink: { links: [], tag: "Impact" }, style: "featured" },
        ],
      },
    ]),
    "Resources → Impact requires a Landing Link.",
  );
});

void test("requires selected List and Featured drilldown groups to be configured", () => {
  assert.equal(
    validateMainMenuTabs([
      {
        enableDirectLink: true,
        enableDropdown: true,
        label: "Products",
        link: customLink("/products"),
        navItems: [{ style: "list" }],
      },
    ]),
    "Products → Untitled group requires a Landing Link.",
  );

  assert.equal(
    validateMainMenuTabs([
      {
        enableDirectLink: true,
        enableDropdown: true,
        label: "Products",
        link: customLink("/products"),
        navItems: [{ style: "featured" }],
      },
    ]),
    "Products → Untitled group requires a Landing Link.",
  );
});

void test("requires non-empty tags for List and Featured drilldown groups", () => {
  assert.equal(
    validateMainMenuTabs([
      {
        enableDirectLink: true,
        enableDropdown: true,
        label: "Products",
        link: customLink("/products"),
        navItems: [
          {
            listLinks: {
              landingLink: customLink("/products/organic-tea"),
              links: [],
              tag: "   ",
            },
            style: "list",
          },
        ],
      },
    ]),
    "Products → Untitled group requires a non-empty Tag.",
  );

  assert.equal(
    validateMainMenuTabs([
      {
        enableDirectLink: true,
        enableDropdown: true,
        label: "Products",
        link: customLink("/products"),
        navItems: [
          {
            featuredLink: {
              landingLink: customLink("/products/featured"),
              links: [],
              tag: "\t",
            },
            style: "featured",
          },
        ],
      },
    ]),
    "Products → Untitled group requires a non-empty Tag.",
  );
});

void test("accepts direct, List, and Featured landing destinations", () => {
  assert.equal(
    validateMainMenuTabs([
      {
        enableDirectLink: true,
        enableDropdown: true,
        label: "Products",
        link: customLink("/products"),
        navItems: [
          {
            listLinks: {
              landingLink: customLink("/products/organic-tea"),
              links: [],
              tag: "Organic Tea",
            },
            style: "list",
          },
          {
            featuredLink: {
              landingLink: customLink("/stories"),
              links: [],
              tag: "Tea Stories",
            },
            style: "featured",
          },
        ],
      },
    ]),
    true,
  );
});

void test("attaches strict validation to the tabs array", () => {
  assert.equal(tabsField.validate, validateMainMenuTabs);
});
