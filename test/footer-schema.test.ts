import assert from "node:assert/strict";
import test from "node:test";

import type { ArrayField, ArrayFieldValidation, GroupField } from "payload";

import { Footer } from "../src/globals/Footer";

const brandField = Footer.fields.find(
  (field): field is GroupField =>
    "name" in field && field.name === "brand" && field.type === "group",
);
const socialLinksField = Footer.fields.find(
  (field): field is ArrayField =>
    "name" in field && field.name === "socialLinks" && field.type === "array",
);

assert.ok(brandField, "Footer must define brand as a group field");
assert.deepEqual(
  brandField.fields.map((field) => ("name" in field ? field.name : undefined)),
  ["description"],
  "Footer brand must expose only the independently rendered description",
);
assert.ok(socialLinksField, "Footer must define socialLinks as an array field");
assert.equal(typeof socialLinksField.validate, "function");
assert.equal(socialLinksField.maxRows, 6);

const validate = socialLinksField.validate as ArrayFieldValidation;
const options: Parameters<ArrayFieldValidation>[1] = {
  ...socialLinksField,
  blockData: {},
  data: {},
  maxRows: socialLinksField.maxRows,
  path: ["socialLinks"],
  preferences: { fields: {} },
  req: {
    t: ((key: string) => key) as never,
  } as never,
  required: socialLinksField.required ?? false,
  siblingData: {},
};

const uniqueRows = [
  { platform: "facebook" },
  { platform: "instagram" },
  { platform: "youtube" },
  { platform: "linkedin" },
  { platform: "x" },
  { platform: "tiktok" },
];

test("preserves Payload array limits while enforcing unique social platforms", async () => {
  assert.equal(await validate(uniqueRows, options), true);
  assert.notEqual(
    await validate([...uniqueRows, { platform: "legacy" }], options),
    true,
  );
  assert.equal(
    await validate(
      [{ platform: "facebook" }, { platform: "facebook" }],
      options,
    ),
    "Each social platform can only be added once.",
  );
});
