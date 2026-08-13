# Mobile Header and Footer Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize the approved mobile Header geometry, add semantic Footer contact icons, enlarge and visually unify Footer social icons, and preserve the approved 1220px / 15px / 14px Footer baseline.

**Architecture:** Keep the existing MobileNav and Footer component boundaries. Add a pure typed contact-item builder plus local icon maps, then let Footer render those normalized rows; keep Payload responsible for values and order while code remains responsible for safe icon artwork.

**Tech Stack:** Next.js 15, React 19, Payload CMS 3, TypeScript, Sass modules, Node.js test runner, tsx

---

## File Map

- `src/components/Header/MobileNav/index.tsx`: remove the competing utility-class Logo height.
- `src/components/Header/MobileNav/index.module.scss`: make 30px the authoritative mobile Logo height.
- `src/components/Footer/contact.ts`: convert optional CMS contact fields into safe, renderable rows.
- `src/components/Footer/contactIcons.tsx`: map contact-row kinds to local SVG components.
- `src/components/Footer/index.tsx`: render the semantic contact icon list.
- `src/components/Footer/index.module.scss`: apply the approved Footer typography baseline and icon/list sizing.
- `src/components/Footer/socialIcons.tsx`: keep the generated platform union exhaustive while switching to the normalized Footer icon set.
- `src/graphics/LocationIcon/index.tsx`, `PhoneIcon/index.tsx`, `EmailIcon/index.tsx`: focused decorative contact icons.
- `src/graphics/FooterSocialIcons/index.tsx`: Footer-only monochrome social artwork that does not change icons used elsewhere.
- `test/mobile-header-layout.test.mjs`: Header geometry contract.
- `test/footer-contact.test.ts`: pure contact normalization contract.
- `test/footer-contact-icons.test.ts`: contact icon-map exhaustiveness and renderability.
- `test/footer-social-icons.test.ts`: platform-map exhaustiveness, renderability, and normalized SVG contract.
- `test/footer-layout.test.mjs`: Footer typography, contact-list, and social sizing contract.

### Task 1: Normalize Footer Baseline and Mobile Header Geometry

**Files:**

- Create: `test/mobile-header-layout.test.mjs`
- Modify: `test/footer-layout.test.mjs`
- Modify: `src/components/Header/MobileNav/index.tsx`
- Modify: `src/components/Header/MobileNav/index.module.scss`
- Modify: `src/components/Footer/index.module.scss`

- [ ] **Step 1: Write the failing Header geometry test**

Create `test/mobile-header-layout.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(
  new URL("../src/components/Header/MobileNav/index.tsx", import.meta.url),
  "utf8",
);
const stylesheet = readFileSync(
  new URL(
    "../src/components/Header/MobileNav/index.module.scss",
    import.meta.url,
  ),
  "utf8",
);
const menuIcon = readFileSync(
  new URL("../src/graphics/MenuIcon/index.tsx", import.meta.url),
  "utf8",
);
const searchIcon = readFileSync(
  new URL("../src/graphics/SearchIcon/index.tsx", import.meta.url),
  "utf8",
);

test("uses the approved mobile Header geometry", () => {
  assert.match(stylesheet, /grid-template-columns:\s*29fr\s+42fr\s+29fr\s*;/);
  assert.match(stylesheet, /height:\s*60px\s*;/);
  assert.match(stylesheet, /\.logo[\s\S]*?svg\s*\{[\s\S]*?height:\s*30px\s*;/);
});

test("uses SCSS as the single mobile Logo size authority", () => {
  assert.doesNotMatch(component, /h-\[30px\]/);
  assert.equal((component.match(/<FullLogo\s*\/>/g) || []).length, 2);
});

test("preserves the approved mobile Menu and Search glyph sizes", () => {
  assert.match(menuIcon, /height="25"/);
  assert.match(menuIcon, /width="25"/);
  assert.match(searchIcon, /height="26"/);
  assert.match(searchIcon, /width="25"/);
});
```

- [ ] **Step 2: Update the existing Footer baseline assertions before production changes**

In `test/footer-layout.test.mjs`, require:

```js
assert.match(stylesheet, /max-width:\s*1220px\s*;/);
assert.match(heading, /font-size:\s*15px\s*;/);
assert.match(heading, /font-weight:\s*600\s*;/);
assert.match(navigationLink, /font-size:\s*14px\s*;/);
assert.match(navigationLink, /font-weight:\s*400\s*;/);
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
node --test test/mobile-header-layout.test.mjs test/footer-layout.test.mjs
```

Expected: FAIL because the Logo SCSS is 20px, the component still carries `h-[30px]`, the working Footer width is 1280px, and the Footer heading is 13px.

- [ ] **Step 4: Implement the minimal Header and Footer baseline changes**

In both `PanelHeader` and `MobileNav`, replace:

```tsx
<FullLogo className="w-auto h-[30px]" />
```

with:

```tsx
<FullLogo />
```

In `src/components/Header/MobileNav/index.module.scss`, set:

```scss
.logo {
  svg {
    width: auto;
    height: 30px;
  }
}
```

In `src/components/Footer/index.module.scss`, normalize only the approved baseline declarations:

```scss
$footer-max-width: 1220px;

.navigationHeading,
.mobileNavigationHeading,
.newsletter h2 {
  font-size: 15px;
  font-weight: 600;
}

.navigationLink {
  font-size: 14px;
  font-weight: 400;
}
```

Do not alter the 20/55/25 column ratio or the mobile 16px navigation-link override.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run:

```bash
node --test test/mobile-header-layout.test.mjs test/footer-layout.test.mjs test/mobile-navigation.test.mjs
```

Expected: all tests pass.

- [ ] **Step 6: Commit Task 1**

```bash
git add test/mobile-header-layout.test.mjs test/footer-layout.test.mjs src/components/Header/MobileNav/index.tsx src/components/Header/MobileNav/index.module.scss src/components/Footer/index.module.scss
git diff --cached --check
git commit -m "style: normalize mobile header and footer type"
```

### Task 2: Build Safe Contact Rows and Contact Icons

**Files:**

- Create: `src/components/Footer/contact.ts`
- Create: `src/components/Footer/contactIcons.tsx`
- Create: `src/graphics/LocationIcon/index.tsx`
- Create: `src/graphics/PhoneIcon/index.tsx`
- Create: `src/graphics/EmailIcon/index.tsx`
- Create: `test/footer-contact.test.ts`
- Create: `test/footer-contact-icons.test.ts`

- [ ] **Step 1: Write failing contact normalization tests**

Create `test/footer-contact.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { getFooterContactItems } from "../src/components/Footer/contact";

test("builds address, telephone, and email Footer rows", () => {
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

test("omits empty or unusable Footer contact rows", () => {
  assert.deepEqual(
    getFooterContactItems({ address: " ", email: "", phone: "abc" }),
    [],
  );
  assert.deepEqual(getFooterContactItems(undefined), []);
});
```

- [ ] **Step 2: Write the failing contact icon-map test**

Create `test/footer-contact-icons.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";

import { footerContactIcons } from "../src/components/Footer/contactIcons";

test("maps every Footer contact kind to a React-renderable icon", () => {
  assert.deepEqual(Object.keys(footerContactIcons), [
    "address",
    "phone",
    "email",
  ]);

  for (const Icon of Object.values(footerContactIcons)) {
    assert.ok(React.isValidElement(React.createElement(Icon)));
  }
});
```

- [ ] **Step 3: Run both tests and verify RED**

Run:

```bash
pnpm exec tsx --test test/footer-contact.test.ts test/footer-contact-icons.test.ts
```

Expected: FAIL with module-not-found errors for `contact` and `contactIcons`.

- [ ] **Step 4: Implement the typed contact-item builder**

Create `src/components/Footer/contact.ts`:

```ts
import type { Footer } from "@root/payload-types";

import { getFooterEmailHref, getFooterPhoneHref } from "./content.js";

export type FooterContactItem =
  | { kind: "address"; text: string }
  | { href: string; kind: "phone" | "email"; text: string };

const getText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const getFooterContactItems = (
  contact: Footer["contact"] | null | undefined,
): FooterContactItem[] => {
  const address = getText(contact?.address);
  const phone = getText(contact?.phone);
  const email = getText(contact?.email);
  const phoneHref = getFooterPhoneHref(phone);
  const emailHref = getFooterEmailHref(email);
  const items: FooterContactItem[] = [];

  if (address) items.push({ kind: "address", text: address });
  if (phone && phoneHref)
    items.push({ href: phoneHref, kind: "phone", text: phone });
  if (email && emailHref)
    items.push({ href: emailHref, kind: "email", text: email });

  return items;
};
```

- [ ] **Step 5: Implement the three local contact SVG components**

Create `src/graphics/LocationIcon/index.tsx`:

```tsx
import * as React from "react";

export const LocationIcon: React.FC = () => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <path
      d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
```

Create `src/graphics/PhoneIcon/index.tsx`:

```tsx
import * as React from "react";

export const PhoneIcon: React.FC = () => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <path
      d="M7 3h3l1.5 4-2 1.5a16 16 0 0 0 6 6l1.5-2L21 14v3c0 2-2 4-4 4C9.3 20.3 3.7 14.7 3 7c0-2 2-4 4-4Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
  </svg>
);
```

Create `src/graphics/EmailIcon/index.tsx`:

```tsx
import * as React from "react";

export const EmailIcon: React.FC = () => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <rect
      height="14"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.6"
      width="18"
      x="3"
      y="5"
    />
    <path
      d="m4 7 8 6 8-6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
  </svg>
);
```

- [ ] **Step 6: Implement the exhaustive contact icon map**

Create `src/components/Footer/contactIcons.tsx`:

```tsx
import type { ComponentType } from "react";

import { EmailIcon } from "@root/graphics/EmailIcon";
import { LocationIcon } from "@root/graphics/LocationIcon";
import { PhoneIcon } from "@root/graphics/PhoneIcon";

import type { FooterContactItem } from "./contact";

type FooterContactKind = FooterContactItem["kind"];

export const footerContactIcons = {
  address: LocationIcon,
  phone: PhoneIcon,
  email: EmailIcon,
} as const satisfies Record<FooterContactKind, ComponentType>;
```

- [ ] **Step 7: Run the contact tests and verify GREEN**

Run:

```bash
pnpm exec tsx --test test/footer-contact.test.ts test/footer-contact-icons.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 8: Commit Task 2**

```bash
git add src/components/Footer/contact.ts src/components/Footer/contactIcons.tsx src/graphics/LocationIcon/index.tsx src/graphics/PhoneIcon/index.tsx src/graphics/EmailIcon/index.tsx test/footer-contact.test.ts test/footer-contact-icons.test.ts
git diff --cached --check
git commit -m "feat: add footer contact icon model"
```

### Task 3: Render the Semantic Footer Contact List

**Files:**

- Modify: `src/components/Footer/index.tsx`
- Modify: `src/components/Footer/index.module.scss`
- Modify: `test/footer-layout.test.mjs`

- [ ] **Step 1: Add failing contact-list style assertions**

Append to `test/footer-layout.test.mjs`:

```js
test("lays out Footer contact rows with a fixed icon column", () => {
  const contactList = getBlock(stylesheet, ".contactList");
  const contactItem = getBlock(stylesheet, ".contactItem");
  const contactIcon = getBlock(stylesheet, ".contactIcon");

  assert.match(contactList, /gap:\s*11px\s*;/);
  assert.match(contactList, /list-style:\s*none\s*;/);
  assert.match(
    contactItem,
    /grid-template-columns:\s*20px\s+minmax\(0,\s*1fr\)\s*;/,
  );
  assert.match(contactItem, /gap:\s*10px\s*;/);
  assert.match(contactIcon, /width:\s*16px\s*;/);
  assert.match(contactIcon, /height:\s*16px\s*;/);
});
```

- [ ] **Step 2: Run the Footer layout test and verify RED**

Run:

```bash
node --test test/footer-layout.test.mjs
```

Expected: FAIL because `.contactList`, `.contactItem`, and `.contactIcon` do not exist.

- [ ] **Step 3: Replace the plain contact markup with normalized rows**

In `src/components/Footer/index.tsx`, import:

```tsx
import { getFooterContactItems } from "./contact";
import { footerContactIcons } from "./contactIcons";
```

Create the rows after the existing Footer normalization:

```tsx
const contactItems = getFooterContactItems(contact);
```

Replace the current three direct contact children with:

```tsx
<address className={classes.contact}>
  <ul className={classes.contactList}>
    {contactItems.map((item) => {
      const Icon = footerContactIcons[item.kind];

      return (
        <li className={classes.contactItem} key={item.kind}>
          <span aria-hidden="true" className={classes.contactIcon}>
            <Icon />
          </span>
          {"href" in item ? (
            <a href={item.href}>{item.text}</a>
          ) : (
            <span className={classes.contactText}>{item.text}</span>
          )}
        </li>
      );
    })}
  </ul>
</address>
```

Remove the now-unused `getFooterPhoneHref` and `getFooterEmailHref` imports and local href variables from `Footer/index.tsx`; those helpers remain consumed by `contact.ts`.

- [ ] **Step 4: Add contact list styles without removing mobile touch targets**

In `src/components/Footer/index.module.scss`, keep `.contact` as the outer `address` and add:

```scss
.contactList {
  display: flex;
  flex-direction: column;
  gap: 11px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.contactItem {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  min-width: 0;
}

.contactIcon {
  display: block;
  width: 16px;
  height: 16px;
  color: var(--color-base-200);

  svg {
    display: block;
    width: 16px;
    height: 16px;
  }
}

.contactText {
  min-width: 0;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
```

Change the existing `.contact p` selector to `.contactText` semantics and keep the existing `.contact a` hover/focus rules. Inside `@include mobile-header-break`, keep `.contact a` at `min-height: 44px`.

- [ ] **Step 5: Run the contact, layout, and TypeScript checks**

Run:

```bash
node --test test/footer-layout.test.mjs
pnpm exec tsx --test test/footer-contact.test.ts test/footer-contact-icons.test.ts
pnpm exec tsc --noEmit --incremental false
```

Expected: all checks pass.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/components/Footer/index.tsx src/components/Footer/index.module.scss test/footer-layout.test.mjs
git diff --cached --check
git commit -m "feat: render footer contact icons"
```

### Task 4: Normalize and Enlarge Footer Social Icons

**Files:**

- Create: `src/graphics/FooterSocialIcons/index.tsx`
- Modify: `src/components/Footer/socialIcons.tsx`
- Modify: `src/components/Footer/index.module.scss`
- Modify: `test/footer-social-icons.test.ts`
- Modify: `test/footer-layout.test.mjs`

- [ ] **Step 1: Strengthen the social icon test before changing artwork**

Extend `test/footer-social-icons.test.ts`:

```ts
import { renderToStaticMarkup } from "react-dom/server";

test("every Footer social icon uses normalized monochrome SVG output", () => {
  for (const Icon of Object.values(footerSocialIcons)) {
    const markup = renderToStaticMarkup(React.createElement(Icon));

    assert.match(markup, /viewBox="0 0 24 24"/);
    assert.match(markup, /(?:fill|stroke)="currentColor"/);
    assert.doesNotMatch(markup, /fill="white"/);
    assert.doesNotMatch(markup, /width="32"|height="32"/);
  }
});
```

- [ ] **Step 2: Add failing social sizing assertions**

Append to `test/footer-layout.test.mjs`:

```js
test("uses readable Footer social icon dimensions", () => {
  const socialLinks = getBlock(stylesheet, ".socialLinks");
  const socialLink = getBlock(stylesheet, ".socialLink");
  const socialGlyph = getBlock(socialLink, "span,");
  const mobileBreakpoint = getBlock(stylesheet, "@include mobile-header-break");
  const mobileSocialLink = getBlock(mobileBreakpoint, ".socialLink");

  assert.match(socialLinks, /gap:\s*10px\s*;/);
  assert.match(socialLink, /width:\s*36px\s*;/);
  assert.match(socialLink, /height:\s*36px\s*;/);
  assert.match(socialLink, /opacity:\s*0\.85\s*;/);
  assert.match(socialGlyph, /width:\s*24px\s*;/);
  assert.match(socialGlyph, /height:\s*24px\s*;/);
  assert.match(mobileSocialLink, /width:\s*40px\s*;/);
  assert.match(mobileSocialLink, /height:\s*40px\s*;/);
});
```

- [ ] **Step 3: Run the social tests and verify RED**

Run:

```bash
pnpm exec tsx --test test/footer-social-icons.test.ts
node --test test/footer-layout.test.mjs
```

Expected: FAIL because current icons use mixed 32px artwork and fixed white fills, while CSS renders 32px boxes and 18px inner SVGs.

- [ ] **Step 4: Add the Footer-only normalized social icon set**

Create `src/graphics/FooterSocialIcons/index.tsx`. Export exactly these components:

```tsx
export const FooterFacebookIcon: React.FC;
export const FooterInstagramIcon: React.FC;
export const FooterYoutubeIcon: React.FC;
export const FooterLinkedInIcon: React.FC;
export const FooterXIcon: React.FC;
export const FooterTikTokIcon: React.FC;
```

For each component:

- use a root `<svg aria-hidden="true" viewBox="0 0 24 24">`;
- use only platform glyph paths, not a full-canvas background circle;
- use `fill="currentColor"` or `stroke="currentColor"` consistently;
- omit fixed `width` and `height` attributes so CSS is authoritative;
- preserve recognizable official platform proportions inside the shared 24×24 view box.

Use the existing local components in `src/graphics/FacebookIcon`, `InstagramIcon`, `YoutubeIcon`, `LinkedInIcon`, `TwitterIconAlt`, and `TikTokIcon` as the path-data source. Do not import a new icon package and do not modify those shared components, because they may have consumers outside Footer.

- [ ] **Step 5: Point the exhaustive Footer map at the new set**

Update `src/components/Footer/socialIcons.tsx` imports while preserving the generated-union contract:

```tsx
import {
  FooterFacebookIcon,
  FooterInstagramIcon,
  FooterLinkedInIcon,
  FooterTikTokIcon,
  FooterXIcon,
  FooterYoutubeIcon,
} from "@root/graphics/FooterSocialIcons";

export const footerSocialIcons = {
  facebook: FooterFacebookIcon,
  instagram: FooterInstagramIcon,
  youtube: FooterYoutubeIcon,
  linkedin: FooterLinkedInIcon,
  x: FooterXIcon,
  tiktok: FooterTikTokIcon,
} as const satisfies Record<FooterSocialPlatform, ComponentType>;
```

- [ ] **Step 6: Apply approved desktop and mobile social sizes**

In `src/components/Footer/index.module.scss`, set:

```scss
.socialLinks {
  gap: 10px;
}

.socialLink {
  width: 36px;
  height: 36px;
  opacity: 0.85;

  span,
  svg {
    width: 24px;
    height: 24px;
  }
}
```

Inside `@include mobile-header-break`, add:

```scss
.socialLink {
  width: 40px;
  height: 40px;
}
```

Keep the existing hover, focus-visible, and reduced-motion rules.

- [ ] **Step 7: Run social, layout, and type checks**

Run:

```bash
pnpm exec tsx --test test/footer-social-icons.test.ts
node --test test/footer-layout.test.mjs
pnpm exec tsc --noEmit --incremental false
```

Expected: all checks pass.

- [ ] **Step 8: Commit Task 4**

```bash
git add src/graphics/FooterSocialIcons/index.tsx src/components/Footer/socialIcons.tsx src/components/Footer/index.module.scss test/footer-social-icons.test.ts test/footer-layout.test.mjs
git diff --cached --check
git commit -m "style: enlarge footer social icons"
```

### Task 5: Full Regression and Visual Verification

**Files:**

- No planned source changes. If a verification command fails, stop and return to the task whose contract failed before making or committing further changes.

- [ ] **Step 1: Run the complete focused test matrix**

Run:

```bash
node --test test/mobile-navigation.test.mjs test/mobile-header-layout.test.mjs test/footer-*.test.mjs
pnpm test:footer-schema
pnpm exec tsx --test test/footer-contact.test.ts test/footer-contact-icons.test.ts test/footer-social-icons.test.ts
```

Expected: all Header/Footer tests pass with zero failures.

- [ ] **Step 2: Run compile and formatting verification**

Run:

```bash
pnpm exec tsc --noEmit --incremental false
pnpm exec prettier --check src/components/Header/MobileNav/index.tsx src/components/Header/MobileNav/index.module.scss src/components/Footer src/graphics/LocationIcon src/graphics/PhoneIcon src/graphics/EmailIcon src/graphics/FooterSocialIcons test/mobile-header-layout.test.mjs test/footer-layout.test.mjs test/footer-contact.test.ts test/footer-contact-icons.test.ts test/footer-social-icons.test.ts
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 3: Compile the Footer Sass module directly**

Create an isolated Sass load-path alias to `src/css`, compile into that same temporary directory, and remove it after a successful check:

```bash
footer_sass_dir="$(mktemp -d /tmp/ecolitea-footer-sass.XXXXXX)"
ln -s /Users/jason/ecolitea.com/src/css "$footer_sass_dir/@scss"
pnpm exec sass --load-path="$footer_sass_dir" src/components/Footer/index.module.scss "$footer_sass_dir/footer.css"
rm -r "$footer_sass_dir"
```

Expected: exit 0 with no Sass error and no generated CSS in the repository. Resolve and inspect `footer_sass_dir` before the cleanup command; do not run cleanup if it is empty or does not begin with `/tmp/ecolitea-footer-sass.`.

- [ ] **Step 4: Verify the running site at desktop and mobile widths**

At 390px:

- Header is 60px with centered 30px Logo and unchanged Menu/Search glyph sizes.
- Footer social icons are 24px inside 40px boxes.
- Contact rows show 16px icons, wrap safely, and phone/email retain usable touch targets.
- Accordion behavior remains unchanged.

Above 1170px:

- Footer remains centered at 1220px.
- Navigation headings are 15px and links are 14px.
- Social icons are 24px inside 36px boxes.
- Address, phone, and email align on the 20px icon column.

- [ ] **Step 5: Inspect the final commit range and working tree**

Run:

```bash
git log --oneline --decorate -8
git status --short
git diff --check
```

Expected: implementation commits contain only the planned files. `.superpowers/` and `tsconfig.tsbuildinfo` remain untracked and are not staged.
