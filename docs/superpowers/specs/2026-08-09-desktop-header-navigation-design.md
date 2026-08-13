# Desktop Header Navigation Design

## Goal

Apply the approved Tektron-inspired desktop Header proportions without changing the existing Payload Mega Menu schema, content rendering, full-width behavior, or hover animation.

## Confirmed Layout

- The desktop Top Bar remains a scrolling information ticker and is 34px high.
- The main desktop Header is 90px high.
- Header content is capped at 1220px.
- The desktop layout is a three-column grid: 19% logo, 66% navigation, 15% search and CTA.
- Navigation is right aligned and never wraps.
- The existing 1170px mobile-header breakpoint remains the desktop/mobile handoff.
- Search remains an icon-only future site-search trigger.
- The desktop CMS CTA remains visible.

## Dynamic Navigation Overflow

The system must not encode the number of menu items in CSS or JSX. A pure overflow helper receives measured menu-item widths, the available navigation width, the current gap, and the More trigger width. It returns the count of leading tabs that fit.

The React component measures rendered labels using an off-screen measurement row and recomputes through `ResizeObserver`. If any tab does not fit, the leading items remain in the primary right-aligned row and all remaining tabs appear under a `More` trigger. A direct overflow tab remains a link; a dropdown overflow tab opens its existing Mega Menu content on hover.

## Preserved Mega Menu

- Payload `tabs`, `description`, `descriptionLinks`, and `navItems` data fields do not change.
- Default, List, and Featured Mega Menu content variants do not change.
- Mega Menu remains fixed and full width, with its current 16-column, 4/12 content split and hover animation.
- Overflow only changes the trigger location for a tab; it does not change the tab's Mega Menu content.

## Validation

- Add Node tests for the pure overflow calculation: all tabs fit, an overflow trigger is accounted for, and no available width leaves no primary tab.
- Run TypeScript validation and inspect 1440px and 1170px browser states. Verify a right-aligned primary row, More behavior, preserved Mega Menu, CTA visibility, and mobile handoff.
