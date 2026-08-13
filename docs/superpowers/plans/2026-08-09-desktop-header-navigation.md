# Desktop Header Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved 34px / 90px desktop Header with a 1220px 19/66/15 layout and dynamic More overflow menu while preserving Mega Menu behavior.

**Architecture:** Add a side-effect-free overflow helper for the measured width calculation. `DesktopNav` uses hidden label measurements and `ResizeObserver` to choose visible tabs at runtime; Mega Menu panels render independently from their top-level trigger so overflowed tabs retain the same content and interactions. Scoped Sass supplies the fixed desktop geometry and More menu surface.

**Tech Stack:** Next.js 15, React 19, Payload CMS, Sass modules, Node.js built-in test runner.

---

### Task 1: Add a tested overflow calculation helper

**Files:**
- Create: `src/components/Header/DesktopNav/overflow.js`
- Create: `test/desktop-navigation-overflow.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { getVisibleNavigationCount } from '../src/components/Header/DesktopNav/overflow.js'

test('keeps every tab visible when all tabs fit', () => {
  assert.equal(getVisibleNavigationCount({ availableWidth: 330, gap: 10, itemWidths: [80, 90, 110], moreWidth: 50 }), 3)
})

test('accounts for the More trigger before choosing visible tabs', () => {
  assert.equal(getVisibleNavigationCount({ availableWidth: 240, gap: 10, itemWidths: [80, 90, 110], moreWidth: 50 }), 2)
})

test('allows More to be the only primary trigger when no tab fits', () => {
  assert.equal(getVisibleNavigationCount({ availableWidth: 50, gap: 10, itemWidths: [80], moreWidth: 50 }), 0)
})
```

- [ ] **Step 2: Verify RED**

Run: `node --test test/desktop-navigation-overflow.test.mjs`

Expected: failure because `overflow.js` does not exist.

- [ ] **Step 3: Add the minimal helper**

```js
export const getVisibleNavigationCount = ({ availableWidth, gap, itemWidths, moreWidth }) => {
  for (let count = itemWidths.length; count >= 0; count -= 1) {
    const hasOverflow = count < itemWidths.length
    const itemTotal = itemWidths.slice(0, count).reduce((total, width) => total + width, 0)
    const gapCount = Math.max(count - 1, 0) + (hasOverflow && count > 0 ? 1 : 0)
    const total = itemTotal + gap * gapCount + (hasOverflow ? moreWidth : 0)

    if (total <= availableWidth) return count
  }

  return 0
}
```

- [ ] **Step 4: Verify GREEN**

Run: `node --test test/desktop-navigation-overflow.test.mjs`

Expected: three passing tests.

### Task 2: Apply fixed desktop dimensions

**Files:**
- Modify: `src/css/app.scss`
- Modify: `src/components/TopBar/index.module.scss`
- Modify: `src/components/Header/DesktopNav/index.module.scss`

- [ ] **Step 1: Set desktop Top Bar geometry**

Set `--top-bar-expanded-height: 34px` at the root. Keep the existing mobile override of 30px. Use the variable for the desktop Top Bar height and line-height so Header scroll-collapse behavior remains intact.

- [ ] **Step 2: Set Header container geometry**

At desktop sizes, set a 1220px maximum content frame. Create a local three-column grid with `grid-template-columns: 19fr 66fr 15fr`; keep the existing 1170px mobile breakpoint unchanged.

- [ ] **Step 3: Keep CTA and search in the right tool column**

Preserve `menuCta` rendering and the existing icon-only search trigger. Prevent the tool column from wrapping.

### Task 3: Add dynamic More overflow without changing Mega Menu content

**Files:**
- Modify: `src/components/Header/DesktopNav/index.tsx`
- Modify: `src/components/Header/DesktopNav/index.module.scss`
- Modify: `src/components/Header/DesktopNav/overflow.js`

- [ ] **Step 1: Measure labels and observe width changes**

Render an aria-hidden off-screen row of tab labels and a More label. Use `ResizeObserver` on the 66% navigation area; feed measured widths, computed CSS column gap, and More width to `getVisibleNavigationCount`.

- [ ] **Step 2: Render primary and overflow trigger lists**

Render `tabs.slice(0, visibleCount)` as the right-aligned primary row. When `visibleCount < tabs.length`, render a More trigger containing `tabs.slice(visibleCount)`. Do not encode a tab count in styling.

- [ ] **Step 3: Preserve Mega Menu triggers**

Render each dropdown's existing full-width panel independently of whether its parent tab is primary or overflowed. Hovering a dropdown tab inside More sets the same `activeTab`, background height, underline state, and panel content as hovering a primary tab.

- [ ] **Step 4: Keep direct links direct**

Use the existing `enableDirectLink` and `CMSLink` behavior for primary and overflowed direct tabs. Do not alter Payload fields.

### Task 4: Verify responsive behavior and commit

**Files:**
- Test: `test/desktop-navigation-overflow.test.mjs`
- Test: `test/mobile-navigation.test.mjs`

- [ ] **Step 1: Run unit tests and type checking**

Run: `node --test test/desktop-navigation-overflow.test.mjs test/mobile-navigation.test.mjs && pnpm exec tsc --noEmit`

Expected: four passing Node tests and TypeScript exit code 0.

- [ ] **Step 2: Browser verification**

At 1440px verify a 34px ticker, 90px Header, 1220px maximum content frame, right-aligned tabs, search, and CTA. Reduce width while remaining desktop to verify More appears without wrapping, then verify ≤1170px uses the existing mobile Header. Hover a dropdown tab in More and verify its current Mega Menu appears.

- [ ] **Step 3: Stage and commit only feature files**

Run: `git add docs/superpowers/specs/2026-08-09-desktop-header-navigation-design.md docs/superpowers/plans/2026-08-09-desktop-header-navigation.md test/desktop-navigation-overflow.test.mjs src/components/Header/DesktopNav/overflow.js src/components/Header/DesktopNav/index.tsx src/components/Header/DesktopNav/index.module.scss src/components/TopBar/index.module.scss src/css/app.scss && git commit -m "feat: refine desktop header navigation"`
