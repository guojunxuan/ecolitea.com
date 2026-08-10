# Mobile Header and Footer Icon Design

**Date:** 2026-08-10
**Status:** Approved visual direction; awaiting written-spec review

## Goal

Refine the mobile Header to preserve the Tektron-inspired Menu / Logo / Search balance, add icon-led contact rows to the existing Footer, and make Footer social icons easier to see and activate. Keep all existing CMS content fields, navigation behavior, link safety handling, and accessibility semantics.

## Scope

This design covers three focused changes:

1. Normalize mobile Header sizing and remove the current Logo height conflict.
2. Render address, phone, and email as a semantic icon list inside the existing Footer contact area.
3. Replace the mixed Footer social SVG artwork with one visually consistent local icon set and increase its rendered size.

It does not add site search behavior, change the mobile drawer interaction, change Footer CMS fields, introduce Elementor, or add an icon-upload workflow.

## Mobile Header

### Geometry

The mobile Header remains 60px high and keeps the approved three-column ratio:

| Region | Track | Content                                 |
| ------ | ----: | --------------------------------------- |
| Left   |  29fr | Menu button and 25×25px Menu SVG        |
| Center |  42fr | Centered Logo with a 30px visual height |
| Right  |  29fr | Search button and 25×26px Search SVG    |

At a 390px viewport, the tracks are approximately 113px / 164px / 113px. Each control remains centered within its track. Menu and Search buttons retain the full 60px Header height so the interactive area remains larger than the visible SVG.

### Logo rule

The current component supplies a 30px height utility while the SCSS supplies a 20px SVG height. The implementation will remove that conflict and establish one authoritative 30px mobile Logo height. Width remains automatic so the original Logo aspect ratio is preserved.

### Behavior

The Menu button continues to open and close the existing modal drawer. The Search button remains the existing inert placeholder for the future site-search feature. The Header breakpoint, modal focus trap, submenu behavior, route-change cleanup, and desktop handoff remain unchanged.

## Footer Contact Icon List

### Component structure

The design borrows the spatial pattern of Elementor's `elementor-icon-list-items` but uses the project's existing React and CSS Module architecture:

```text
Footer
└─ address.contact
   └─ ul.contactList
      ├─ li.contactItem → LocationIcon + address text
      ├─ li.contactItem → PhoneIcon + tel link
      └─ li.contactItem → EmailIcon + mailto link
```

The project will not import Elementor, copy Elementor classes, or depend on Elementor CSS. Three focused local SVG components will live with the existing graphics assets. The Footer will continue to use `getFooterPhoneHref` and `getFooterEmailHref` to produce safe telephone and email links.

### Visual rules

- Contact SVG: 16×16px.
- Fixed icon column: 20px.
- Icon-to-text gap: 10px.
- Row gap: 11px.
- Address icon and text align to the first text line.
- Phone and email icons align to their link text.
- Icons use the brighter Footer muted color; contact text keeps the existing muted hierarchy.
- Long address text continues to wrap inside the details column.
- Existing mobile link touch-target rules remain active for phone and email.

Absent CMS values render no empty row and no orphaned icon.

## Footer Social Icons

### Management boundary

CMS editors continue to control:

- which supported platform appears;
- each platform URL;
- row ordering through the existing draggable array.

The platform-to-component map remains in `src/components/Footer/socialIcons.tsx`. This design does not allow arbitrary image or SVG uploads. Keeping the map code-owned prevents inconsistent icon proportions, unsafe SVG uploads, and per-row visual drift.

### Artwork and sizing

The six supported platforms—Facebook, Instagram, YouTube, LinkedIn, X, and TikTok—will use one consistent monochrome SVG style. Each component must use `currentColor`, a compatible square view box, and no embedded fixed white fill.

Rendered sizing:

| Context        | Interactive box |     SVG |
| -------------- | --------------: | ------: |
| Desktop Footer |         36×36px | 24×24px |
| Mobile Footer  |         40×40px | 24×24px |

The row gap becomes 10px. Default opacity increases from 0.72 to at least 0.85; hover and keyboard focus remain fully opaque. Existing accessible labels, external-link attributes, CMS order, focus outline, and reduced-motion behavior remain unchanged.

## Data and Schema Impact

No Payload field changes are required. `brand`, `socialLinks`, `contact.address`, `contact.phone`, and `contact.email` continue to supply all rendered data. Therefore this change does not require a Payload migration, import-map regeneration, or `src/payload-types.ts` regeneration.

## File Boundaries

Expected implementation changes are limited to:

- `src/components/Header/MobileNav/index.tsx`
- `src/components/Header/MobileNav/index.module.scss`
- `src/components/Footer/index.tsx`
- `src/components/Footer/index.module.scss`
- `src/components/Footer/socialIcons.tsx`
- focused icon components under `src/graphics/`
- existing focused Header/Footer tests under `test/`

The current unrelated working-tree changes to Footer width and navigation-link typography are user-owned and must be preserved rather than overwritten.

## Accessibility

- Menu, Logo, and Search retain their accessible names.
- Visible SVGs remain decorative where their adjacent text or link already supplies the name.
- Contact information remains inside an `address` landmark.
- Phone and email remain native anchors with `tel:` and `mailto:` destinations.
- Social links retain platform-specific `aria-label` values.
- Social icon enlargement must not reduce the focus outline clearance.
- Mobile interactive targets remain at least 44px where the existing component already guarantees that minimum.

## Verification

Implementation verification must cover:

1. A failing-then-passing Header style contract for 60px height, 29/42/29 tracks, 30px Logo, and unchanged Menu/Search SVG sizes.
2. Footer rendering tests for address, phone, and email rows with the correct icon and no empty row when a value is absent.
3. Social icon tests proving all six generated platform keys still map to renderable React components.
4. Footer layout tests for 24px social SVGs, 36px desktop boxes, 40px mobile boxes, and 10px row gap.
5. TypeScript, Prettier, Sass compilation, existing Header/Footer test suites, and `git diff --check`.
6. Visual checks at 390px mobile width and a desktop viewport above the 1170px handoff.

## Approved Visual Reference

The approved mockup is stored in the local brainstorming companion as `mobile-header-footer-icons-v1.html`. It shows a 390px viewport with the mobile Header, enlarged social icons, semantic contact rows, mobile navigation accordions, newsletter placeholder, and copyright divider.
