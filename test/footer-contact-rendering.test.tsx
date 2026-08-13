import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { FooterContactItem } from "../src/components/Footer/contact";

import { FooterContactList } from "../src/components/Footer/ContactList";

const classNames = {
  contact: "contact",
  contactIcon: "contact-icon",
  contactItem: "contact-item",
  contactList: "contact-list",
  contactText: "contact-text",
};

const renderContactList = (items: FooterContactItem[]) =>
  renderToStaticMarkup(
    <FooterContactList classNames={classNames} items={items} />,
  );

const getTags = (markup: string, tagName: string) =>
  markup.match(new RegExp(`<${tagName}\\b[^>]*>`, "g")) ?? [];

void test("renders complete footer contacts as ordered semantic icon rows", () => {
  const markup = renderContactList([
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
  ]);
  const iconSpans = markup.match(
    /<span aria-hidden="true" class="contact-icon">/g,
  );
  const svgTags = getTags(markup, "svg");

  assert.match(markup, /^<address class="contact">/);
  assert.match(markup, /<ul class="contact-list">/);
  assert.equal(getTags(markup, "li").length, 3);
  assert.match(
    markup,
    /Shenzhen, China[\s\S]*\+86 755 1234 5678[\s\S]*hello@example\.test/,
  );
  assert.equal(getTags(markup, "a").length, 2);
  assert.match(markup, /href="tel:\+8675512345678"/);
  assert.match(markup, /href="mailto:hello@example\.test"/);
  assert.equal(iconSpans?.length, 3);
  assert.equal(svgTags.length, 3);
  for (const svgTag of svgTags) {
    assert.match(svgTag, /\saria-hidden="true"/);
  }
});

void test("renders an address-only contact without a link", () => {
  const markup = renderContactList([
    { kind: "address", text: "Shenzhen, China" },
  ]);

  assert.equal(getTags(markup, "li").length, 1);
  assert.match(markup, />Shenzhen, China<\/span>/);
  assert.equal(getTags(markup, "a").length, 0);
  assert.equal(getTags(markup, "svg").length, 1);
});

void test("renders no contact rows, links, or icons for an empty list", () => {
  const markup = renderContactList([]);

  assert.match(markup, /^<address class="contact">/);
  assert.match(markup, /<ul class="contact-list"><\/ul>/);
  assert.equal(getTags(markup, "li").length, 0);
  assert.equal(getTags(markup, "a").length, 0);
  assert.equal(getTags(markup, "svg").length, 0);
});
