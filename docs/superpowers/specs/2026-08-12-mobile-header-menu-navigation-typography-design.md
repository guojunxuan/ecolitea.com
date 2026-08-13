# Mobile Header Menu Navigation Typography Design

**Date:** 2026-08-12

**Status:** Approved visual direction; awaiting written-spec review

## Goal

Refine the mobile Header menu's navigation headings and links using the information hierarchy and compact rhythm of the Tektron mobile navigation as a reference. Preserve Ecolitea's existing Untitled Sans typography, theme colors, icons, CMS content model, and two-level drawer interaction.

## Approved Direction

The approved direction is **B — Compact and practical**.

The design prioritizes scan speed and information density over oversized display typography. Headings and links remain visually distinct, but spacing stays compact enough for menus with many entries. This is a hierarchy and layout reference only; the implementation must not imitate Tektron's brand styling.

## Scope

This design changes the presentation and mobile-only drill-down behavior of navigation headings and links inside the existing mobile drawer:

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
- existing Payload menu content meanings and desktop rendering; the schema gains only the landing links required by expandable titles;
- existing direct-link destinations and CMS-authored grouping semantics;
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
- Direct links render as one full-width anchor without an arrow.
- A row that has both a landing destination and children is split into a title anchor and an independent right-side arrow button.
- Activating the title navigates to its landing destination; only activating the arrow button opens level two.

### Back row

- Height: 54px, matching the standard navigation row.
- The return region spans the same full width as every navigation row.
- It contains two sibling controls: an independent left-arrow button and a parent-title anchor. Interactive elements are never nested.
- The parent-title area displays `Back to` and the actual parent menu name as one continuous label on a shared baseline, for example `Back to Products`.
- The complete label uses one consistent 14px size, 500 weight, line height, and normal theme text color; `Back to` is not visually de-emphasized.
- Horizontal padding: 0 16px.
- The left-arrow button has its own 48px-wide target; the parent-title anchor fills all remaining width.
- Only the left-arrow button changes the drawer level. Activating the parent title navigates to the parent landing page.
- A subtle theme-derived background and bottom separator distinguish the navigation control from the current page content.
- It remains the first focus target after entering a submenu.

### Group headings

- Font size: 14px.
- Line height: 1.25.
- Font weight: 600.
- No forced uppercase transformation.
- No exaggerated tracking.
- Bottom spacing before links: 8px.
- Top-level group spacing: 20px.

### Secondary navigation rows

- Every secondary row occupies its own row in a single column.
- Font size: 15px.
- Font weight: 400 for final links and 500 for drill-down categories and primary/default links.
- Minimum interactive height: 44px.
- Short labels remain on one line when space allows.
- Long labels wrap naturally and are never truncated or ellipsized.
- Wrapped rows retain sufficient vertical padding to preserve the 44px minimum target.
- Horizontal padding aligns to the 16px drawer grid.
- A level-two category with children uses the same split-control pattern as level one: title anchor on the left, independent drill-down arrow button on the right.
- Activating a category title navigates to that category's landing page; only the arrow opens level three.

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

At the second level, a List item appears as a drill-down category using its existing `tag` as the row title. Selecting it slides to the third level, where its existing `links` render as a single-column list of final destinations. Every final link occupies its own row. The previous two-column concept is explicitly rejected because it weakens scan order and creates inconsistent wrapping for long labels.

### Featured items

At the second level, a Featured item appears as a drill-down category using its existing `tag` as the row title. Selecting it slides to the third level, where the existing rich-text label and links may use a restrained background derived from the existing Ecolitea theme colors. It must remain text-led and compact:

- 14px / 600 group label;
- existing rich-text featured label with controlled compact spacing;
- each featured destination displayed as a full-width link row;
- no new image field, uploaded artwork, or image dependency.

## Separators and Arrows

- Use the existing theme border color for 1px separators.
- First-level rows retain full-width separators.
- Secondary groups use one separator at the group boundary; links may use lighter internal separators where needed for scanability.
- Only independent buttons that open another menu level use a right-side arrow. First-level submenu controls and second-level List or Featured category controls share the same existing `ArrowIcon` component, rendered size, stroke treatment, and right-facing orientation.
- Final destination links never display a right-side arrow.
- The shared drill-down arrow occupies a fixed end column, is vertically centered against a single-line label, and remains centered against the full row when a long label wraps.
- The fixed arrow column must not compress or overlap long labels.
- The Back control is the only directional exception and retains a left-facing arrow to preserve its return meaning.

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

## Navigation Levels and Motion

The mobile drawer uses a three-page horizontal track:

1. Level one displays the existing `tabs`.
2. Level two displays the selected tab's direct destinations and its `navItems` as either final links or drill-down categories.
3. Level three displays the selected List or Featured item's existing final `links`.

Moving forward slides the current page left and brings the next page in from the right. Back performs the inverse movement and restores focus to the trigger that opened the page. The target duration is approximately 340ms using a restrained ease-out curve. Under `prefers-reduced-motion: reduce`, page changes occur without translation animation.

Every Back control is populated from the navigation stack rather than hard-coded text. At level two it identifies the root menu; at level three it identifies the selected level-one parent, such as `Products`. `Back to` and the parent name remain on one line at the standard 54px navigation-row height.

Every level uses the same activation rule:

- title text is an anchor and navigates to that item's landing URL;
- a right arrow is a separate button and is the only control that advances to a child level;
- a left arrow is a separate button and is the only control that returns to the previous level;
- final links contain no arrow because they have no child level.

Direct destinations may finish at level one or level two; the interface does not force every path to have three levels.

No level renders a separate `View all …` row. The linked category title already provides the landing-page destination, so a duplicate full-category link would add noise without adding a new action.

## Component and Data Boundaries

This split interaction requires a landing URL for every expandable title. Existing top-level tabs can use their current direct-link fields, but List and Featured groups currently have a text `tag` without a group landing link. The Payload schema therefore requires one focused extension:

- add a required landing link alongside `listLinks.tag`;
- add a required landing link alongside `featuredLink.tag`;
- require a direct link for any top-level tab that also enables a dropdown.

Existing List and Featured groups must be backfilled with their category landing destinations before the split interaction is enabled. Payload types must be regenerated after the schema update.

The existing data maps to the mobile levels as follows:

- `tabs` become level-one rows;
- `descriptionLinks` and `defaultLink` remain final level-two destinations;
- `listLinks.tag` / `featuredLink.tag` and their new landing links become linked level-two drill-down categories;
- `listLinks.links` and `featuredLink.links` become final level-three destinations.

The schema and generated types change, but the desktop mega-menu does not need a behavioral or visual change. Its existing renderer can continue to ignore the new group landing-link fields and display the same tags and child links in place. Focused desktop regression tests must prove the new CMS fields do not alter its markup or interaction.

Expected implementation changes are limited to:

- `src/components/Header/MobileNav/index.module.scss`;
- `src/components/Header/MobileNav/index.tsx` for the mobile-only level stack, forward/back navigation, focus restoration, and class hooks;
- `src/globals/MainMenu.ts` for expandable-title landing links;
- regenerated `src/payload-types.ts`;
- a focused content backfill or migration for existing expandable groups;
- focused mobile-navigation style tests under `test/`.

The implementation changes mobile rendering and state management but must not refactor unrelated Header or desktop navigation code.

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
3. All level-two and level-three rows use a single-column layout with a 44px minimum target.
4. Long secondary labels wrap naturally without `text-overflow: ellipsis`, line clamping, or clipping.
5. Default and description-link destinations remain final level-two links; List and Featured groups drill into final level-three links.
6. Expandable rows render sibling anchor and button controls: titles navigate, only right-arrow buttons advance, final links display no arrow, and only left-arrow buttons go back.
7. Arrow alignment does not reduce the readable text column or overlap wrapped labels.
8. Hover, pressed/current, and keyboard-focus styles remain visible with Ecolitea theme colors.
9. Forward navigation slides left, Back slides right, trigger focus is restored per level, and reduced-motion mode removes translation animation.
10. Each Back region spans the full drawer width, matches the 54px navigation-row height, and displays `Back to` plus the correct linked parent menu name on one line.
11. `Back to` and the parent name use identical typography and color, and no `View all …` rows are rendered at any level.
12. Expandable titles cannot be published without a landing destination after the content backfill is complete.
13. Existing scrim close, route-change close, desktop handoff, and desktop navigation tests continue to pass without desktop component changes.
14. Visual inspection at 320px, 375px, and 390px confirms consistent rhythm and usable scrolling.
15. Type checking, focused tests, Sass compilation, formatting checks, and `git diff --check` pass.

## Approved Visual Reference

The latest visual direction is stored in the local brainstorming companion as `mobile-nav-static-v10.html`. It demonstrates the Tektron-inspired single-line Back region with uniform typography, separately activated title links and drill-down arrows, three-level horizontal motion, no duplicate View All rows, and arrow-free final links.
