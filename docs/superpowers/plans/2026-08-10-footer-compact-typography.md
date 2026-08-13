# Footer Compact Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved Tektron-inspired compact desktop Footer proportions and typography without changing CMS content, component markup, responsive breakpoint behavior, or accessibility interactions.

**Architecture:** Keep the existing Footer component and its 1220px centered container. Change only the SCSS layout tokens and typography/spacing declarations, with a source-level layout contract test written first to preserve the exact approved hierarchy.

**Tech Stack:** Next.js, React, Payload CMS, Sass modules, Node.js built-in test runner

---

### Task 1: Apply the approved compact Footer scale

**Files:**

- Modify: `test/footer-layout.test.mjs`
- Modify: `src/components/Footer/index.module.scss`

- [x] **Step 1: Write the failing layout contract tests**

Update the desktop proportion assertion to require `20fr / 55fr / 25fr`. Add assertions requiring navigation/newsletter headings at `13px / 600`, desktop navigation links at `12px / 400`, tagline at `12px`, newsletter copy and contact text at `11px`, and copyright at `10px`. Keep the mobile navigation link override at `16px` so touch navigation remains readable.

- [x] **Step 2: Run the focused test and verify RED**

Run: `node --test test/footer-layout.test.mjs`

Expected: FAIL because the current stylesheet still uses `24fr / 46fr / 30fr`, headings at `12px / 500`, desktop links at `15px`, and larger supporting text.

- [x] **Step 3: Implement the minimal SCSS changes**

In `src/components/Footer/index.module.scss`, apply:

```scss
.content {
  grid-template-columns: minmax(0, 20fr) minmax(0, 55fr) minmax(0, 25fr);
  gap: clamp(28px, 3vw, 48px);
  padding: clamp(54px, 6vw, 80px) 0 clamp(48px, 5vw, 72px);
}

.tagline {
  font-size: 12px;
}

.navigationHeading,
.mobileNavigationHeading,
.newsletter h2 {
  font-size: 13px;
  font-weight: 600;
}

.navigationLink {
  font-size: 12px;
  font-weight: 400;
}

.newsletter p,
.contact {
  font-size: 11px;
}

.copyright {
  font-size: 10px;
}
```

Also tighten desktop-only vertical margins and control dimensions to match the approved visual, while leaving the existing mobile breakpoint overrides and minimum touch targets intact.

- [x] **Step 4: Run focused and full Footer verification**

Run:

```bash
node --test test/footer-*.test.mjs
pnpm test:footer-schema
pnpm exec tsx --test test/footer-social-icons.test.ts
pnpm exec tsc --noEmit --incremental false
pnpm exec prettier --check src/components/Footer/index.module.scss test/footer-layout.test.mjs docs/superpowers/plans/2026-08-10-footer-compact-typography.md
git diff --check
```

Expected: all tests and checks pass with exit code 0.

- [x] **Step 5: Review the running desktop Footer**

Verify the existing site at desktop width: Header and Footer remain aligned to 1220px; the four navigation groups remain in one row; headings remain at least as large as links; long labels no longer feel crowded; the mobile accordion and 44px touch targets remain unchanged.

- [x] **Step 6: Commit the focused change**

```bash
git add docs/superpowers/plans/2026-08-10-footer-compact-typography.md test/footer-layout.test.mjs src/components/Footer/index.module.scss
git commit -m "style: compact footer typography"
```
