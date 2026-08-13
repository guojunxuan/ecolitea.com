# Mobile Header Navigation Design

## Goal

Replace the current mobile header and full-width modal navigation with a compact, light-theme header and a left-side, drill-down navigation that follows the approved Tektron-inspired proportions.

## Confirmed Requirements

- Keep the site in its fixed light theme.
- Render an enabled CMS Top Bar as a single-line horizontal ticker on mobile.
- Use a 60px mobile header below the ticker.
- Reserve the header's usable width in a 29 / 42 / 29 ratio for menu, centered logo, and search.
- Keep the existing search icon as an inert future site-search trigger; do not render a search field.
- Do not render the Main Menu CTA in the mobile header or mobile navigation.
- Open navigation as a left-side panel, 77vw wide and capped at 320px, with a page scrim.
- Keep first-level menu rows at 54px and enter dropdown tabs as a second navigation layer with a Back control.
- Remove the obsolete hard-coded `/new` “New project” link.

## Component Boundaries

### `TopBar`

The component remains driven by existing Payload `message` and optional `link` fields. On mobile it repeats one accessible copy of that content for the visual ticker while hiding the duplicate from assistive technologies.

### `Header`

The wrapper remains responsible for header visibility while scrolling. CSS controls the mobile Top Bar height so the 30px ticker contributes to the page padding without JavaScript viewport checks.

### `MobileNav`

The component owns open/close and active dropdown state. It exposes three visual areas: the 29/42/29 bar, a left-side first-level panel, and an equal-width second-level panel. A full scrim closes all open mobile navigation layers.

## Interaction Rules

1. Selecting the hamburger opens the first-level panel and prevents the underlying page from receiving clicks.
2. Selecting a direct link navigates normally.
3. Selecting a dropdown-only tab opens its second layer without navigating.
4. Selecting a Back control returns to first level; selecting the scrim closes every navigation layer.
5. Route changes close every navigation layer.

## Validation

- Add a focused unit test for the pure mobile-navigation helpers: dropdown tabs enter a second layer and direct tabs remain direct links.
- Run type checking/build validation and inspect the mobile layout at a 390px-wide viewport.
