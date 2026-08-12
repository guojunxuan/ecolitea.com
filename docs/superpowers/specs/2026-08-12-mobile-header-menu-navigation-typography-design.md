# Mobile Header Menu Navigation Typography Design

**Date:** 2026-08-12

**Status:** Approved visual direction; awaiting written-spec review

## Goal

Refine the mobile Header menu's navigation headings and links using the information hierarchy and compact rhythm of the Tektron mobile navigation as a reference. Preserve Ecolitea's existing Untitled Sans typography, theme colors, icons, CMS content model, and two-level drawer interaction.

## Approved Direction

The approved direction is **B — Compact and practical**.

The design prioritizes scan speed and information density over oversized display typography. Headings and links remain visually distinct, but spacing stays compact enough for menus with many entries. This is a hierarchy and layout reference only; the implementation must not imitate Tektron's brand styling.

## Scope

This design changes only the presentation of navigation headings and navigation links inside the existing mobile drawer:

- first-level navigation rows;
- the Back row and optional description links;
- default navigation items with title and description;
- list groups and their links;
- featured navigation groups and their links;
- separators, arrows, pressed/current states, hover behavior, and keyboard focus styling.

The following remain unchanged:

- the 60px mobile Header and its 29 / 42 / 29 Menu–Logo–Search geometry;
- the 77vw drawer with a 320px maximum width;
- the light theme and existing Ecolitea theme variables;
- Payload `MainMenu` fields and generated types;
- direct-link versus submenu behavior;
- Back navigation, focus restoration, route-change cleanup, scrim close behavior, and desktop breakpoint handoff;
- the inactive mobile search placeholder.

## Typography and Spacing

### First-level navigation

- Font family: existing `var(--font-body)` / Untitled Sans.
- Font size: 16px.
- Font weight: 500.
- Letter spacing: subtle existing brand tightening, no more than `-0.01em`.
- Row height: 54px minimum.
- Horizontal padding: 16px.
- Direct links render without an arrow.
- Submenu triggers keep a right-aligned arrow.

### Back row

- Height: 54px.
- Font size: 14px.
- Font weight: 500.
- Horizontal padding: 16px.
- Icon-to-label gap: approximately 10px.
- It remains the first focus target after entering a submenu.

### Group headings

- Font size: 14px.
- Line height: 1.25.
- Font weight: 600.
- No forced uppercase transformation.
- No exaggerated tracking.
- Bottom spacing before links: 8px.
- Top-level group spacing: 20px.

### Secondary navigation links

- Every secondary navigation link occupies its own row in a single column.
- Font size: 15px.
- Font weight: 400 for ordinary list links and 500 for primary/default links.
- Minimum interactive height: 44px.
- Short labels remain on one line when space allows.
- Long labels wrap naturally and are never truncated or ellipsized.
- Wrapped rows retain sufficient vertical padding to preserve the 44px minimum target.
- Horizontal padding aligns to the 16px drawer grid.

### Descriptions

- Font size: 13px.
- Line height: approximately 1.45.
- Color: existing muted Ecolitea theme text color.
- Descriptions wrap naturally and do not reduce the linked title's interactive area.

## Content-Type Treatment

### Description links

Optional submenu-level description links appear immediately after the Back row. Each link occupies one full-width row with a 44px minimum target and a right-aligned arrow.

### Default items

A default item remains one full-width clickable block:

- the 15px / 500 title and arrow share the first line;
- the optional 13px description sits below the title;
- the entire title-and-description block activates the destination;
- a subtle bottom separator distinguishes adjacent items.

### List items

List items use a 14px / 600 group heading followed by a single-column list. Every link occupies its own row. The previous two-column concept is explicitly rejected because it weakens scan order and creates inconsistent wrapping for long labels.

### Featured items

Featured content may use a restrained background derived from the existing Ecolitea theme colors. It must remain text-led and compact:

- 14px / 600 group label;
- existing rich-text featured label with controlled compact spacing;
- each featured destination displayed as a full-width link row;
- no new image field, uploaded artwork, or image dependency.

## Separators and Arrows

- Use the existing theme border color for 1px separators.
- First-level rows retain full-width separators.
- Secondary groups use one separator at the group boundary; links may use lighter internal separators where needed for scanability.
- Arrows remain the project's existing `ArrowIcon` components.
- Arrows are visually smaller than link text, fixed at the row's right edge, and must not compress or overlap long labels.
- Arrow direction continues to communicate the existing action: enter submenu, go back, or follow a destination.

## Interaction States

- Default: theme text on the existing drawer background.
- Hover on fine pointers: subtle theme-derived background change; no layout movement.
- Pressed/current: restrained light brand-color background plus the normal text color.
- Keyboard focus: visible 2px brand-color outline with sufficient offset and contrast.
- Disabled/unavailable, if introduced by existing content behavior: reduced emphasis while retaining legibility.
- State must not be communicated by color alone.
- Motion honors the existing reduced-motion behavior.

## Accessibility

- All interactive rows retain native anchor or button semantics.
- Every target is at least 44px high; first-level rows remain 54px.
- Naturally wrapped link text remains fully readable.
- No navigation label uses truncation or ellipsis.
- Existing accessible names, focus trap, Back focus behavior, trigger focus restoration, and route-change close behavior remain unchanged.
- Separators are decorative and must not add screen-reader noise.

## Component and Data Boundaries

No Payload schema or data migration is required. Existing `tabs`, `descriptionLinks`, `defaultLink`, `listLinks`, and `featuredLink` data continue to drive the menu.

Expected implementation changes are limited to:

- `src/components/Header/MobileNav/index.module.scss`;
- `src/components/Header/MobileNav/index.tsx` only if small class or state hooks are required for styling;
- focused mobile-navigation style tests under `test/`.

The implementation should prefer CSS-only changes and must not refactor unrelated Header or desktop navigation code.

## Responsive and Overflow Rules

- The approved styling applies only below the existing 1171px mobile Header breakpoint.
- The drawer continues to scroll vertically within the viewport.
- Labels wrap naturally within the space left after reserving the arrow column.
- Very long unbroken content uses safe overflow wrapping rather than clipping the drawer.
- The layout must remain usable at 320px, 375px, and 390px viewport widths.

## Verification

Implementation validation must cover:

1. First-level rows retain 54px minimum height, 16px text, 500 weight, and 16px horizontal padding.
2. Group headings use 14px / 600 without forced uppercase or exaggerated letter spacing.
3. All secondary links use a single-column layout with a 44px minimum target.
4. Long secondary labels wrap naturally without `text-overflow: ellipsis`, line clamping, or clipping.
5. Default, List, Featured, and description-link variants follow the same single-row-per-link rule.
6. Arrow alignment does not reduce the readable text column or overlap wrapped labels.
7. Hover, pressed/current, and keyboard-focus styles remain visible with Ecolitea theme colors.
8. Existing submenu, Back, focus restoration, scrim close, route-change close, and desktop handoff tests continue to pass.
9. Visual inspection at 320px, 375px, and 390px confirms consistent rhythm and usable scrolling.
10. Type checking, focused tests, Sass compilation, formatting checks, and `git diff --check` pass.

## Approved Visual Reference

The final visual direction is stored in the local brainstorming companion as `mobile-nav-complete-ui-v2.html`. It covers the closed Header, first-level drawer, Default, single-column List, Featured, and interaction-state views.
