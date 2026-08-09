# Footer Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy Payload-branded Footer with the approved ECOLITEA dark Footer, backed by the existing `footer` Global, with sortable CMS navigation/social rows, a 24/46/30 desktop layout, an accessible mobile accordion, and a non-functional newsletter placeholder.

**Architecture:** Extend the existing Payload Global rather than adding a new Global. Keep navigation links using the project `link()` field and `CMSLink`, render the logo through the existing `Media` component, map CMS social platform values to controlled local icon components, and keep accordion state in the Footer client component using a small pure helper. Preserve the existing global fetch/cache path and `afterChange` layout revalidation.

**Tech Stack:** Next.js App Router, React, TypeScript, Payload CMS Globals/Arrays, CSS Modules + Sass, Node's built-in test runner, generated Payload types/import map.

---

## Task 1: Lock the Footer behavior with pure helper tests

**Files:**

- Create: `src/components/Footer/navigation.js`
- Create: `src/globals/footerSocials.js`
- Create: `test/footer-navigation.test.mjs`
- Create: `test/footer-socials.test.mjs`

- [ ] **Step 1: Write the failing accordion behavior test**

Create `test/footer-navigation.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { getNextFooterAccordionItem } from '../src/components/Footer/navigation.js'

test('opens a closed footer navigation group', () => {
  assert.equal(getNextFooterAccordionItem(null, 'products'), 'products')
})

test('closes the currently open footer navigation group', () => {
  assert.equal(getNextFooterAccordionItem('products', 'products'), null)
})

test('switches directly to another footer navigation group', () => {
  assert.equal(getNextFooterAccordionItem('products', 'company'), 'company')
})
```

- [ ] **Step 2: Run the test and confirm the expected failure**

Run:

```bash
node --test test/footer-navigation.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/components/Footer/navigation.js`.

- [ ] **Step 3: Add the minimum accordion helper**

Create `src/components/Footer/navigation.js`:

```js
export const getNextFooterAccordionItem = (currentItem, requestedItem) =>
  currentItem === requestedItem ? null : requestedItem
```

- [ ] **Step 4: Write the failing social validation/label tests**

Create `test/footer-socials.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  footerSocialPlatformLabels,
  validateFooterSocialURL,
  validateUniqueSocialPlatforms,
} from '../src/globals/footerSocials.js'

test('provides an admin label for every supported social platform', () => {
  assert.deepEqual(footerSocialPlatformLabels, {
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
    linkedin: 'LinkedIn',
    x: 'X',
    tiktok: 'TikTok',
  })
})

test('accepts empty and unique social platform arrays', () => {
  assert.equal(validateUniqueSocialPlatforms(undefined), true)
  assert.equal(
    validateUniqueSocialPlatforms([{ platform: 'facebook' }, { platform: 'instagram' }]),
    true,
  )
})

test('rejects duplicate social platforms', () => {
  assert.equal(
    validateUniqueSocialPlatforms([{ platform: 'facebook' }, { platform: 'facebook' }]),
    'Each social platform can only be added once.',
  )
})

test('requires a valid HTTPS social URL', () => {
  assert.equal(validateFooterSocialURL('https://example.com/account'), true)
  assert.equal(validateFooterSocialURL('http://example.com/account'), 'Use an HTTPS URL.')
  assert.equal(validateFooterSocialURL('not-a-url'), 'Enter a valid URL.')
})
```

- [ ] **Step 5: Run the social test and confirm the expected failure**

Run:

```bash
node --test test/footer-socials.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/globals/footerSocials.js`.

- [ ] **Step 6: Add the minimum platform definitions and validator**

Create `src/globals/footerSocials.js`:

```js
export const footerSocialPlatformLabels = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  x: 'X',
  tiktok: 'TikTok',
}

export const footerSocialPlatformOptions = Object.entries(footerSocialPlatformLabels).map(
  ([value, label]) => ({ label, value }),
)

export const validateFooterSocialURL = (value) => {
  if (!value) return 'URL is required.'

  try {
    return new URL(value).protocol === 'https:' ? true : 'Use an HTTPS URL.'
  } catch {
    return 'Enter a valid URL.'
  }
}

export const validateUniqueSocialPlatforms = (rows) => {
  if (!Array.isArray(rows)) return true

  const platforms = rows.map((row) => row?.platform).filter(Boolean)
  return new Set(platforms).size === platforms.length
    ? true
    : 'Each social platform can only be added once.'
}
```

- [ ] **Step 7: Run both tests**

Run:

```bash
node --test test/footer-navigation.test.mjs test/footer-socials.test.mjs
```

Expected: 7 tests pass, 0 fail.

- [ ] **Step 8: Commit the behavior contract**

```bash
git add src/components/Footer/navigation.js src/globals/footerSocials.js test/footer-navigation.test.mjs test/footer-socials.test.mjs
git commit -m "test: define footer interaction behavior"
```

## Task 2: Extend the existing Footer Global and preserve native Array management

**Files:**

- Modify: `src/globals/Footer.ts`
- Create: `src/globals/CustomRowLabelFooterColumns.tsx`
- Create: `src/globals/CustomRowLabelSocialLinks.tsx`
- Create: `test/footer-types.test.ts`
- Modify (generated): `src/app/(payload)/admin/importMap.js`
- Modify (generated, isolated commit): `src/payload-types.ts`

- [ ] **Step 1: Add Footer-specific Row Label components**

Create `src/globals/CustomRowLabelFooterColumns.tsx`:

```tsx
'use client'

import type { PayloadClientReactComponent, RowLabelComponent } from 'payload'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

const CustomRowLabelFooterColumns: PayloadClientReactComponent<RowLabelComponent> = () => {
  const { data } = useRowLabel<{ label?: string }>()

  return data.label || 'Navigation group'
}

export default CustomRowLabelFooterColumns
```

Create `src/globals/CustomRowLabelSocialLinks.tsx`:

```tsx
'use client'

import type { PayloadClientReactComponent, RowLabelComponent } from 'payload'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

import { footerSocialPlatformLabels } from './footerSocials.js'

const CustomRowLabelSocialLinks: PayloadClientReactComponent<RowLabelComponent> = () => {
  const { data } = useRowLabel<{ platform?: keyof typeof footerSocialPlatformLabels }>()

  return data.platform ? footerSocialPlatformLabels[data.platform] : 'Social link'
}

export default CustomRowLabelSocialLinks
```

These are separate from `CustomRowLabelTabs`; Main Menu and Footer can evolve independently while retaining Payload's native drag handle, collapse, duplicate, and delete UI.

- [ ] **Step 2: Add a compile-time schema contract**

Create `test/footer-types.test.ts`:

```ts
import type { Footer } from '@root/payload-types'

type Expect<T extends true> = T
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false

type FooterSchemaContract = [
  Expect<HasKey<Footer, 'brand'>>,
  Expect<HasKey<Footer, 'socialLinks'>>,
  Expect<HasKey<Footer, 'columns'>>,
  Expect<HasKey<Footer, 'newsletter'>>,
  Expect<HasKey<Footer, 'contact'>>,
  Expect<HasKey<Footer, 'companyName'>>,
  Expect<HasKey<Footer, 'copyrightText'>>,
]

export type { FooterSchemaContract }
```

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: FAIL because the current generated `Footer` type contains only `columns`.

- [ ] **Step 3: Extend `src/globals/Footer.ts`**

Keep the existing slug/access/hook and replace its `fields` with these top-level groups/arrays:

```ts
fields: [
  {
    name: 'brand',
    type: 'group',
    fields: [
      {
        name: 'logo',
        type: 'upload',
        relationTo: 'media',
        required: true,
      },
      {
        name: 'logoAlt',
        type: 'text',
        required: true,
      },
      {
        name: 'tagline',
        type: 'textarea',
        required: true,
      },
    ],
  },
  {
    name: 'socialLinks',
    type: 'array',
    admin: {
      components: {
        RowLabel: '@root/globals/CustomRowLabelSocialLinks',
      },
    },
    fields: [
      {
        name: 'platform',
        type: 'select',
        options: footerSocialPlatformOptions,
        required: true,
      },
      {
        name: 'url',
        type: 'text',
        required: true,
        validate: validateFooterSocialURL,
      },
    ],
    maxRows: 6,
    validate: validateUniqueSocialPlatforms,
  },
  {
    name: 'columns',
    type: 'array',
    admin: {
      components: {
        RowLabel: '@root/globals/CustomRowLabelFooterColumns',
      },
    },
    fields: [
      {
        name: 'label',
        type: 'text',
        required: true,
      },
      {
        name: 'navItems',
        type: 'array',
        fields: [link({ appearances: false })],
      },
    ],
    maxRows: 4,
    minRows: 1,
  },
  {
    name: 'newsletter',
    type: 'group',
    fields: [
      { name: 'heading', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: true },
      { name: 'emailPlaceholder', type: 'text', required: true },
    ],
  },
  {
    name: 'contact',
    type: 'group',
    fields: [
      { name: 'address', type: 'textarea' },
      { name: 'phone', type: 'text' },
      { name: 'email', type: 'email' },
    ],
  },
  { name: 'companyName', type: 'text', required: true },
  { name: 'copyrightText', type: 'text', required: true },
],
```

Add these imports:

```ts
import {
  footerSocialPlatformOptions,
  validateFooterSocialURL,
  validateUniqueSocialPlatforms,
} from './footerSocials.js'
```

Do not add a new Global or change `fetchGlobals()`/the Footer `afterChange` hook.

- [ ] **Step 4: Regenerate the admin import map**

Run:

```bash
pnpm generate:importmap
```

Expected: `src/app/(payload)/admin/importMap.js` gains imports and mappings for both new Row Label components.

Verify:

```bash
rg -n "CustomRowLabelFooterColumns|CustomRowLabelSocialLinks" 'src/app/(payload)/admin/importMap.js'
```

Expected: both component names appear in imports and the component map.

- [ ] **Step 5: Regenerate Payload types in an isolated generated-artifact commit**

The file already contains semicolon-only generator formatting changes. Do not mix it into the schema commit. Run the official generator once after the schema is final:

```bash
pnpm generate:types
```

Inspect the meaningful generated Footer changes:

```bash
git diff --word-diff=plain -- src/payload-types.ts | sed -n '/export interface Footer/,/export interface MainMenu/p'
```

Expected: `Footer` and `FooterSelect` gain `brand`, `socialLinks`, expanded `columns`, `newsletter`, `contact`, `companyName`, and `copyrightText`. No hand editing of the generated file.

- [ ] **Step 6: Run schema/helper/type verification**

```bash
node --test test/footer-socials.test.mjs
pnpm exec tsc --noEmit
git diff --check
```

Expected: all pass.

- [ ] **Step 7: Commit schema and import-map changes, then generated types separately**

```bash
git add src/globals/Footer.ts src/globals/CustomRowLabelFooterColumns.tsx src/globals/CustomRowLabelSocialLinks.tsx test/footer-types.test.ts 'src/app/(payload)/admin/importMap.js'
git commit -m "feat: extend footer content model"
git add src/payload-types.ts
git commit -m "chore: regenerate footer payload types"
```

## Task 3: Add the controlled social icon set

**Files:**

- Create: `src/graphics/LinkedInIcon/index.tsx`
- Create: `src/graphics/TikTokIcon/index.tsx`
- Create: `src/components/Footer/socialIcons.tsx`

- [ ] **Step 1: Add accessible-by-parent LinkedIn and TikTok SVG components**

Create `src/graphics/LinkedInIcon/index.tsx`:

```tsx
import * as React from 'react'

export const LinkedInIcon: React.FC = () => {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.2 3H4.8C3.806 3 3 3.806 3 4.8v22.4c0 .994.806 1.8 1.8 1.8h22.4c.994 0 1.8-.806 1.8-1.8V4.8c0-.994-.806-1.8-1.8-1.8zM10.7 25H7V13h3.7v12zM8.85 11.36A2.155 2.155 0 1 1 8.85 7.05a2.155 2.155 0 0 1 0 4.31zM25 25h-3.7v-5.84c0-1.39-.03-3.18-1.94-3.18-1.94 0-2.24 1.52-2.24 3.08V25h-3.7V13h3.55v1.64h.05c.49-.94 1.7-1.94 3.5-1.94 3.74 0 4.43 2.46 4.43 5.66V25z" />
    </svg>
  )
}
```

Create `src/graphics/TikTokIcon/index.tsx`:

```tsx
import * as React from 'react'

export const TikTokIcon: React.FC = () => {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.46 3c.36 3.09 2.08 4.94 5.04 5.14v3.47c-1.71.17-3.22-.4-5-1.48v6.49c0 8.24-8.98 10.82-13.34 6.92-2.8-2.5-3.43-6.96-1.36-10.05 2.13-3.17 6.18-4.1 9.3-2.4v3.65c-.56-.18-1.07-.43-1.65-.51-1.4-.19-2.75.26-3.66 1.34-1.48 1.76-.95 4.6 1.06 5.71 2.45 1.35 5.9-.04 6.19-3.44.04-.5.02-1 .02-1.5V3h3.4z" />
    </svg>
  )
}
```

The parent anchor owns the accessible label, so the SVGs do not add a title or focus target. Do not introduce a new icon dependency or load runtime icon assets from a CDN.

- [ ] **Step 2: Create the exhaustive frontend icon mapping**

Create `src/components/Footer/socialIcons.tsx`:

```tsx
import { FacebookIcon } from '@root/graphics/FacebookIcon/index'
import { InstagramIcon } from '@root/graphics/InstagramIcon/index'
import { LinkedInIcon } from '@root/graphics/LinkedInIcon/index'
import { TikTokIcon } from '@root/graphics/TikTokIcon/index'
import { TwitterIconAlt } from '@root/graphics/TwitterIconAlt/index'
import { YoutubeIcon } from '@root/graphics/YoutubeIcon/index'

export const footerSocialIcons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedInIcon,
  x: TwitterIconAlt,
  tiktok: TikTokIcon,
} as const
```

- [ ] **Step 3: Verify types and formatting**

```bash
pnpm exec tsc --noEmit
git diff --check
```

Expected: both pass.

- [ ] **Step 4: Commit the icon set**

```bash
git add src/graphics/LinkedInIcon/index.tsx src/graphics/TikTokIcon/index.tsx src/components/Footer/socialIcons.tsx
git commit -m "feat: add footer social icon set"
```

## Task 4: Replace the legacy Footer markup with the approved CMS-driven structure

**Files:**

- Modify: `src/components/Footer/index.tsx`

- [ ] **Step 1: Remove all legacy-only imports and path logic**

Delete imports/usages for:

```text
BackgroundGrid
NewsletterSignUp
Payload3D
Text
FormComponent
validateEmail
ArrowIcon
DiscordIcon
usePathname
```

Delete `allowedSegments`, pathname parsing, `isCloudPage`, `BackgroundGrid`, hardcoded Payload social anchors, and `Payload3D`.

- [ ] **Step 2: Add the new data and UI imports/state**

Use:

```tsx
import { CMSLink } from '@components/CMSLink/index'
import { Gutter } from '@components/Gutter/index'
import { Media } from '@components/Media/index'
import React, { useId, useState } from 'react'

import { getNextFooterAccordionItem } from './navigation.js'
import { footerSocialIcons } from './socialIcons'
```

Inside the component:

```tsx
const {
  brand,
  columns: columnsFromProps,
  companyName,
  contact,
  copyrightText,
  newsletter,
  socialLinks: socialLinksFromProps,
} = props
const columns = columnsFromProps ?? []
const socialLinks = socialLinksFromProps ?? []
const [openColumnID, setOpenColumnID] = useState<null | string>(null)
const accordionID = useId()
const currentYear = new Date().getFullYear()
```

- [ ] **Step 3: Render the desktop/mobile shared three-container structure**

The top-level hierarchy is `footer.footer[data-theme="dark"]` → `Gutter.gutter` → `div.container`. Inside the container, `div.content` contains `section.brand`, `nav.navigation[aria-label="Footer"]`, and `section.details` in that order. `div.copyright` follows `div.content` as its sibling. Do not insert content-container separators or decorative background components.

Logo behavior:

```tsx
{brand?.logo && typeof brand.logo !== 'string' ? (
  <Media alt={brand.logoAlt || ''} className={classes.logo} resource={brand.logo} />
) : null}
```

Social behavior:

```tsx
<ul aria-label="Social media" className={classes.socialLinks}>
  {socialLinks?.map(({ id, platform, url }) => {
    if (!platform || !url) return null
    const Icon = footerSocialIcons[platform]
    return (
      <li key={id || platform}>
        <a
          aria-label={footerSocialPlatformLabels[platform]}
          className={classes.socialLink}
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Icon />
        </a>
      </li>
    )
  })}
</ul>
```

Import `footerSocialPlatformLabels` from `@root/globals/footerSocials.js` for the anchor labels.

- [ ] **Step 4: Render dynamic desktop navigation and a separate semantic mobile accordion**

Reuse the same `columns` data but render two breakpoint-controlled views inside the same `<nav>`. This avoids using the mobile `hidden` state for desktop content and keeps both accessibility trees unambiguous.

Desktop view:

```tsx
<div
  className={classes.desktopNavigation}
  style={{ '--footer-column-count': Math.max(columns?.length || 1, 1) } as React.CSSProperties}
>
  {columns?.map((column, index) => (
    <section className={classes.navigationGroup} key={column.id || `desktop-column-${index}`}>
      <h2 className={classes.navigationHeading}>{column.label}</h2>
      <div className={classes.navigationLinks}>
        {column.navItems?.map(({ id, link }) => (
          <CMSLink className={classes.navigationLink} key={id || link.label} {...link} />
        ))}
      </div>
    </section>
  ))}
</div>
```

Mobile view:

```tsx
<div className={classes.mobileNavigation}>
  {columns?.map((column, index) => {
    const columnID = column.id || `column-${index}`
    const panelID = `${accordionID}-${columnID}`
    const isOpen = openColumnID === columnID

    return (
      <div className={classes.navigationGroup} key={columnID}>
        <button
          aria-controls={panelID}
          aria-expanded={isOpen}
          className={classes.navigationTrigger}
          onClick={() =>
            setOpenColumnID((current) => getNextFooterAccordionItem(current, columnID))
          }
          type="button"
        >
          <span>{column.label}</span>
          <span aria-hidden="true" className={classes.navigationArrow} />
        </button>
        <div className={classes.navigationPanel} hidden={!isOpen} id={panelID}>
          {column.navItems?.map(({ id, link }) => (
            <CMSLink className={classes.navigationLink} key={id || link.label} {...link} />
          ))}
        </div>
      </div>
    )
  })}
</div>
```

CSS displays only `.desktopNavigation` above 1170px and only `.mobileNavigation` at/below 1170px. The mobile HTML `hidden` attribute remains authoritative, so closed links are absent from sequential keyboard navigation.

- [ ] **Step 5: Render the newsletter placeholder and optional contact rows**

```tsx
<div className={classes.newsletter}>
  <h2>{newsletter?.heading}</h2>
  <p>{newsletter?.description}</p>
  <div className={classes.subscribePlaceholder}>
    <input
      aria-label="Email address"
      disabled
      placeholder={newsletter?.emailPlaceholder || ''}
      type="email"
    />
    <button disabled type="button">Subscribe</button>
  </div>
</div>
<address className={classes.contact}>
  {contact?.address ? <p>{contact.address}</p> : null}
  {contact?.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : null}
  {contact?.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : null}
</address>
```

No `<form>`, submit handler, fetch, server action, collection, or database write is allowed in phase 1.

- [ ] **Step 6: Render the generated year copyright**

```tsx
<p>
  © {currentYear} {companyName}. {copyrightText}
</p>
```

- [ ] **Step 7: Run unit/type checks before styling**

```bash
node --test test/footer-navigation.test.mjs test/footer-socials.test.mjs
pnpm exec tsc --noEmit
```

Expected: all pass. A visually unstyled Footer is acceptable at this checkpoint.

- [ ] **Step 8: Commit the semantic Footer structure**

```bash
git add src/components/Footer/index.tsx
git commit -m "feat: render cms-driven footer content"
```

## Task 5: Implement the approved desktop and mobile visual system

**Files:**

- Modify: `src/components/Footer/index.module.scss`

- [ ] **Step 1: Replace the legacy grid/background styles**

Remove `.topBorder`, BackgroundGrid rules, `.payload3dContainer`, legacy 16-column utility assumptions, and old newsletter form styles.

Use these structural desktop values:

```scss
@use '@scss/common' as *;

$footer-content-max: 1220px;
$footer-transition: 220ms ease;

.footer {
  background: var(--color-base-1000);
  color: var(--color-base-0);
}

.container {
  max-width: $footer-content-max;
  margin: 0 auto;
}

.content {
  display: grid;
  grid-template-columns: minmax(0, 24fr) minmax(0, 46fr) minmax(0, 30fr);
  gap: clamp(2rem, 3.5vw, 4.5rem);
  padding: clamp(4.5rem, 7vw, 7.5rem) 0;
}

.desktopNavigation {
  display: grid;
  grid-template-columns: repeat(var(--footer-column-count, 1), minmax(0, 1fr));
  gap: clamp(1.5rem, 2.5vw, 3rem);
}

.mobileNavigation {
  display: none;
}

.copyright {
  border-top: 1px solid rgb(255 255 255 / 18%);
  padding: 1.35rem 0 1.75rem;
}
```

The inline CSS variable on `.desktopNavigation` keeps 1–4 groups equal without hardcoded names or count-specific classes.

- [ ] **Step 2: Style brand/social/navigation/details without internal separators**

Requirements:

- Logo is left aligned, constrained by width/height, and uses `object-fit: contain`.
- Tagline has readable muted contrast and a max line length.
- Social anchors are ordered exactly as the CMS Array; use a horizontal flex row and circular/quiet hover treatment.
- Desktop navigation headings are uppercase or small-label styled; links remain one per line.
- No border between Brand, Navigation, and Details.
- Newsletter field group is left aligned and capped near `286px`, not stretched across the whole 30% column.
- Contact `<address>` uses `font-style: normal`; phone/email have visible hover/focus states.
- Disabled newsletter controls must look deliberately unavailable, not broken; preserve readable contrast.

- [ ] **Step 3: Add the exact 1170px mobile handoff**

Use the project breakpoint mixin:

```scss
@include mobile-header-break {
  .content {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 3.5rem 0 3rem;
  }

  .brand {
    order: 1;
  }

  .desktopNavigation {
    display: none;
  }

  .mobileNavigation {
    display: block;
  }

  .navigation {
    order: 2;
    margin-top: 2.5rem;
  }

  .details {
    order: 3;
    margin-top: 2.5rem;
  }

  .subscribePlaceholder {
    max-width: none;
    width: 100%;
  }
}
```

The DOM naturally supplies the approved mobile order: logo → tagline → social → accordion → newsletter → address/phone/email → copyright.

- [ ] **Step 4: Style the Tektron-style accordion**

The trigger exists only in the mobile view. Style it as follows:

```scss
.navigationTrigger {
  @include btnReset;
  width: 100%;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: inherit;
  text-align: left;
}

.navigationArrow {
  width: 0.55rem;
  height: 0.55rem;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: rotate(45deg);
  transition: transform $footer-transition;
}

.navigationTrigger[aria-expanded='true'] .navigationArrow {
  transform: rotate(225deg);
}

.navigationPanel:not([hidden]) {
  padding: 0 0 1.5rem;
}
```

Do not add separator lines between accordion groups unless the approved design is revised.

- [ ] **Step 5: Verify Sass, types, and whitespace**

```bash
pnpm exec tsc --noEmit
git diff --check
```

Expected: both pass.

- [ ] **Step 6: Commit the responsive visual system**

```bash
git add src/components/Footer/index.module.scss src/components/Footer/index.tsx
git commit -m "style: implement responsive footer layout"
```

## Task 6: Verify CMS behavior, responsiveness, accessibility, and absence of newsletter side effects

**Files:**

- Modify if necessary: `test/footer-navigation.test.mjs`
- Modify if necessary: `test/footer-socials.test.mjs`
- Modify only for discovered defects: Footer implementation files from Tasks 2–5

- [ ] **Step 1: Run the complete targeted automated suite**

```bash
node --test test/footer-navigation.test.mjs test/footer-socials.test.mjs test/mobile-navigation.test.mjs test/desktop-navigation-overflow.test.mjs
pnpm exec tsc --noEmit
git diff --check
```

Expected: all Node tests pass, TypeScript exits 0, and diff check is clean.

- [ ] **Step 2: Start the branch service on port 3001**

```bash
pnpm dev --port 3001
```

Expected: frontend and Payload admin are available at `http://localhost:3001`.

- [ ] **Step 3: Verify Payload admin Array management**

At `/admin/globals/footer`, verify:

- Navigation rows display their `label`, not `Column 01`.
- Social rows display `Facebook`, `Instagram`, etc., not `Row 01`.
- Native Payload drag handles reorder both arrays and the saved frontend order follows.
- Navigation allows 1–4 rows and refuses a fifth.
- Social allows up to 6 rows and rejects duplicate platforms.
- Social URL rejects invalid/non-HTTPS input.
- Footer edits revalidate the frontend layout without a manual rebuild.

- [ ] **Step 4: Verify desktop at 1171px and wider**

Test at 1440px and exactly 1171px:

- Inner content is capped at 1220px and aligned with Header content.
- Columns measure approximately 24% / 46% / 30% before gaps.
- 1, 2, 3, and 4 navigation groups divide the middle region equally in one row.
- Newsletter controls are left aligned and capped near 286px.
- There are no internal vertical or horizontal divider lines.
- The only line is between content and copyright.
- Current year matches the system year.
- Social links preserve CMS order and open with `target="_blank" rel="noopener noreferrer"`.
- Phone and email use `tel:` and `mailto:`.

- [ ] **Step 5: Verify mobile at 1170px and common phone widths**

Test at exactly 1170px, 390px, and 360px:

- Content order matches the approved mobile sequence.
- All accordion groups start closed.
- Opening one group closes the previously open group.
- Arrow direction follows `aria-expanded`.
- Closed panel links cannot be reached with Tab.
- Keyboard Space/Enter toggles each semantic button.
- Newsletter placeholder spans the available mobile width.
- Optional address/phone/email rows disappear cleanly when empty.

- [ ] **Step 6: Verify the newsletter is truly placeholder-only**

In the browser Network panel:

- Clicking the disabled button is impossible.
- Typing is impossible because the input is disabled.
- No request is made to `/api`, Form Builder, HubSpot, or any newsletter endpoint.
- Saving the Footer Global stores only the placeholder copy/contact fields, not subscriber data.

- [ ] **Step 7: Search for forbidden legacy Footer dependencies**

```bash
rg -n "BackgroundGrid|Payload3D|NewsletterSignUp|payloadcms|DiscordIcon|isCloudPage|allowedSegments" src/components/Footer
```

Expected: no matches.

- [ ] **Step 8: Review final change scope**

```bash
git status --short
git diff --stat 96372fd..HEAD
git log --oneline -8
```

Expected: Footer feature files and the isolated generated artifacts are committed. `.superpowers/` and `tsconfig.tsbuildinfo` remain outside commits. No unrelated Header, Cloud, Docs, or Main Menu source is changed.

- [ ] **Step 9: Commit only defect corrections found during verification**

If verification required fixes, stage only this explicit Footer allowlist (Git ignores unchanged paths):

```bash
git add src/components/Footer/index.tsx src/components/Footer/index.module.scss src/components/Footer/navigation.js src/components/Footer/socialIcons.tsx src/globals/Footer.ts src/globals/footerSocials.js src/globals/CustomRowLabelFooterColumns.tsx src/globals/CustomRowLabelSocialLinks.tsx src/graphics/LinkedInIcon/index.tsx src/graphics/TikTokIcon/index.tsx test/footer-navigation.test.mjs test/footer-socials.test.mjs test/footer-types.test.ts 'src/app/(payload)/admin/importMap.js' src/payload-types.ts
git commit -m "fix: address footer verification findings"
```

If no corrections were needed, do not create an empty commit.

## Task 7: Populate every Footer module with local verification content

**Files:**

- Create: `src/scripts/footerVerificationData.js`
- Create: `src/scripts/seedFooterVerification.ts`
- Create: `src/scripts/fixtures/ecolitea-footer-verification.svg`
- Create: `test/footer-verification-data.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write a failing completeness test for the verification content**

The test must require one populated brand, six unique social platforms, four non-empty navigation groups, newsletter placeholder copy, address/phone/email, company name, and copyright text. Every navigation row must contain a renderable custom link with a label and local URL.

Run:

```bash
node --test test/footer-verification-data.test.mjs
```

Expected: FAIL because `src/scripts/footerVerificationData.js` does not exist.

- [ ] **Step 2: Implement the pure verification data builder**

Export `buildFooterVerificationData({ logo })` from `src/scripts/footerVerificationData.js`. Use representative ECOLITEA content and these four groups: `Products`, `Solutions`, `Resources`, and `Company`. Use stable local routes such as `/`, `/partners`, `/community-help`, `/privacy`, and `/styleguide`; do not depend on deleted `/docs` or `/cloud` routes. Include all six supported social platforms with valid HTTPS URLs.

- [ ] **Step 3: Add an idempotent local-only Payload seed script**

`seedFooterVerification.ts` must:

- refuse to run when `NODE_ENV === 'production'`;
- initialize Payload from the project config;
- read the current `footer` Global and save a timestamped JSON snapshot under `os.tmpdir()` before updating it;
- find the verification logo by filename, creating it from `src/scripts/fixtures/ecolitea-footer-verification.svg` only when absent;
- update only the `footer` Global through Payload Local API with `overrideAccess: true`;
- print the backup path, media ID, Footer Global ID, and counts for navigation/social rows;
- be idempotent: a second run must reuse the same media record and produce the same Footer field values;
- never update Pages, Posts, Main Menu, Top Bar, Users, or other Collections/Globals.

Add this package script:

```json
"seed:footer-verification": "payload run ./src/scripts/seedFooterVerification.ts"
```

- [ ] **Step 4: Run automated checks**

```bash
node --test test/footer-verification-data.test.mjs
pnpm exec tsc --noEmit
git diff --check
```

Expected: all pass.

- [ ] **Step 5: Commit the repeatable verification content tooling**

```bash
git add src/scripts/footerVerificationData.js src/scripts/seedFooterVerification.ts src/scripts/fixtures/ecolitea-footer-verification.svg test/footer-verification-data.test.mjs package.json
git commit -m "test: add footer verification content seed"
```

- [ ] **Step 6: Populate the local CMS after the Footer schema is active**

```bash
pnpm seed:footer-verification
```

Expected: the script succeeds, reports a backup path, and writes all Footer modules. Run it a second time and confirm it reuses the same verification media ID without creating duplicates.

- [ ] **Step 7: Verify real CMS rendering and stability**

With the service on port 3001, verify at 1440px, 1171px, 1170px, and 390px that every seeded module renders, four desktop navigation groups stay in one row, the mobile accordion is single-open, all six social icons render in CMS order, contact links use the correct protocols, the year is generated at runtime, and the newsletter produces no network request. Refresh repeatedly and edit/save one Footer label in admin to confirm Global revalidation remains stable.

## Final self-review checklist

- [ ] Existing `footer` Global is extended; no new Global or fetch path exists.
- [ ] Footer navigation and social Arrays retain native Payload sorting controls.
- [ ] Footer-specific Row Labels read `label` and `platform` independently of Main Menu.
- [ ] Desktop layout is 24/46/30 inside a 1220px maximum container.
- [ ] Dynamic navigation supports 1–4 equal groups without hardcoded positions.
- [ ] Mobile switch is exactly at the existing 1170px breakpoint.
- [ ] Mobile accordion is single-open, semantic, and removes hidden links from Tab order.
- [ ] Logo/tagline/social/contact/copyright are CMS driven as specified.
- [ ] Newsletter is visibly a placeholder and has no functional submission path.
- [ ] Only one divider exists between content and copyright.
- [ ] Legacy Payload/Cloud/Footer decoration code is removed.
- [ ] Generated import map and Payload types match the schema.
- [ ] A local-only, idempotent seed populates every Footer module and saves a recoverable pre-update snapshot.
- [ ] Real CMS content has been rendered and checked across the desktop/mobile boundary.
- [ ] Existing unrelated `.superpowers/` and `tsconfig.tsbuildinfo` are not committed.
