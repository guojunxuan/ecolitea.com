# Mobile Header Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved light-theme mobile header with a ticker Top Bar and a 77vw drill-down menu.

**Architecture:** Keep Payload's existing Main Menu data shape. Add a small pure helper that classifies a tab as either a direct link or a submenu trigger; `MobileNav` consumes it while the component CSS owns the visual layout and slide states. The CMS Top Bar keeps its existing fields and gains a mobile-only duplicate for seamless scrolling.

**Tech Stack:** Next.js 15, React 19, Payload CMS, Sass modules, Node.js built-in test runner.

---

### Task 1: Add a testable navigation classifier

**Files:**

- Create: `test/mobile-navigation.test.mjs`
- Create: `src/components/Header/MobileNav/navigation.js`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { getMobileNavigationAction } from "../src/components/Header/MobileNav/navigation.js";

test("opens a submenu only for dropdown tabs", () => {
  assert.equal(getMobileNavigationAction({ enableDropdown: true }), "submenu");
  assert.equal(getMobileNavigationAction({ enableDropdown: false }), "link");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/mobile-navigation.test.mjs`

Expected: failure because `navigation.js` does not exist.

- [ ] **Step 3: Add the minimal classifier**

```js
export const getMobileNavigationAction = ({ enableDropdown }) =>
  enableDropdown ? "submenu" : "link";
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/mobile-navigation.test.mjs`

Expected: one passing test.

### Task 2: Convert the Top Bar to a mobile ticker

**Files:**

- Modify: `src/components/TopBar/index.tsx`
- Modify: `src/components/TopBar/index.module.scss`
- Modify: `src/components/Header/index.module.scss`
- Modify: `src/css/app.scss`

- [ ] **Step 1: Render an accessible duplicated ticker track**

Use the existing `message` and optional `link` in two same-content spans. Keep the first copy accessible and set the duplicate to `aria-hidden="true"`.

- [ ] **Step 2: Style only the mobile track**

At the mobile-header breakpoint, set the Top Bar height to 30px, hide overflow, animate the track horizontally, and respect `prefers-reduced-motion`. Set `--top-bar-height: 30px` at the same breakpoint so page spacing remains correct.

- [ ] **Step 3: Preserve desktop behavior**

Keep the existing 48px desktop Top Bar layout and optional link label unchanged.

### Task 3: Build the three-column mobile header and side drawer

**Files:**

- Modify: `src/components/Header/MobileNav/index.tsx`
- Modify: `src/components/Header/MobileNav/index.module.scss`

- [ ] **Step 1: Use the classifier for first-level tab behavior**

Replace local dropdown branching with `getMobileNavigationAction`. Direct links stay as `CMSLink`; dropdown tabs are buttons that set the active tab and open the submenu layer.

- [ ] **Step 2: Remove stale and unapproved content**

Delete the hard-coded `/new` link, all crosshair/background decoration inside mobile navigation, and the mobile rendering of `menuCta`.

- [ ] **Step 3: Render the 29/42/29 bar**

Order the mobile bar as hamburger, centered existing `FullLogo`, search icon. Use real buttons for the hamburger and search trigger. Keep search inert for the later site-search feature.

- [ ] **Step 4: Render navigation as a panel**

Move the first-level list into a 77vw (max 320px) left-side panel. Add a close button, a pointer-operable scrim, 54px menu rows, and a separate equal-width second layer that includes Back. Route changes and scrim clicks call `closeAllModals`.

### Task 4: Verify responsive behavior

**Files:**

- Test: `test/mobile-navigation.test.mjs`

- [ ] **Step 1: Run the targeted unit test**

Run: `node --test test/mobile-navigation.test.mjs`

Expected: one passing test.

- [ ] **Step 2: Run static validation**

Run: `pnpm exec tsc --noEmit`

Expected: exit code 0.

- [ ] **Step 3: Run a production compilation check**

Run: `pnpm build:skipDocs`

Expected: Next.js compilation completes successfully.

- [ ] **Step 4: Inspect the development site at 390px**

Verify the 30px ticker, 60px header, centered logo, 77vw panel, direct navigation, Back behavior, and no `/new`, CTA, or visible search field.

### Task 5: Commit the implementation

**Files:**

- Modify: the files listed in Tasks 1–3
- Create: `docs/superpowers/specs/2026-08-08-mobile-header-navigation-design.md`
- Create: `docs/superpowers/plans/2026-08-08-mobile-header-navigation.md`

- [ ] **Step 1: Stage only the mobile-header implementation and design files**

Run: `git add docs/superpowers/specs/2026-08-08-mobile-header-navigation-design.md docs/superpowers/plans/2026-08-08-mobile-header-navigation.md test/mobile-navigation.test.mjs src/components/TopBar/index.tsx src/components/TopBar/index.module.scss src/components/Header/index.module.scss src/components/Header/MobileNav/index.tsx src/components/Header/MobileNav/index.module.scss src/components/Header/MobileNav/navigation.js src/css/app.scss`

- [ ] **Step 2: Commit the focused change**

Run: `git commit -m "feat: redesign mobile header navigation"`
