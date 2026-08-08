# Fixed Light Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove both footer theme selectors and make the site always initialize in light mode.

**Architecture:** Retain the Theme provider and `data-theme` CSS for components that depend on them. Simplify the provider to always emit `light`, then remove the two selector UIs, selector-only Sass, and now-unused icon modules.

**Tech Stack:** Next.js, React, TypeScript, Sass, pnpm.

---

### Task 1: Fix the global theme policy

**Files:**

- Modify: `src/providers/Theme/index.tsx:5-54`
- Test: source contract check using `rg`

- [x] **Step 1: Write the failing test**

```bash
rg -n "localStorage|getImplicitPreference|themeLocalStorageKey" src/providers/Theme/index.tsx
```

Expected: exit `0`; this proves the current provider can retain a user or system preference.

- [x] **Step 2: Run test to verify it fails**

Run the command above and confirm it finds the preference code.

- [x] **Step 3: Write minimal implementation**

```tsx
const [theme, setThemeState] = useState<Theme>(defaultTheme)
const setTheme = useCallback(() => {
  setThemeState(defaultTheme)
  document.documentElement.setAttribute('data-theme', defaultTheme)
}, [])
useEffect(() => {
  document.documentElement.setAttribute('data-theme', defaultTheme)
  setThemeState(defaultTheme)
}, [])
```

Remove imports used only by the discarded preference logic.

- [x] **Step 4: Run test to verify it passes**

```bash
rg -n "localStorage|getImplicitPreference|themeLocalStorageKey" src/providers/Theme/index.tsx
```

Expected: exit `1`.

### Task 2: Remove both visible selectors

**Files:**

- Modify: `src/components/Footer/index.tsx:3-79,173-198`
- Modify: `src/components/Footer/index.module.scss:158-208`
- Modify: `src/app/(frontend)/(cloud)/cloud/_components/CloudFooter/index.tsx:3-73`
- Modify: `src/app/(frontend)/(cloud)/cloud/_components/CloudFooter/classes.module.scss:46-95`
- Delete: `src/graphics/ThemeAutoIcon/index.tsx`
- Delete: `src/graphics/ThemeLightIcon/index.tsx`
- Delete: `src/graphics/ThemeDarkIcon/index.tsx`

- [x] **Step 1: Write the failing test**

```bash
rg -n "<select|ThemeAutoIcon|ThemeLightIcon|ThemeDarkIcon|Switch themes" src/components/Footer 'src/app/(frontend)/(cloud)/cloud/_components/CloudFooter'
```

Expected: exit `0`.

- [x] **Step 2: Run test to verify it fails**

Confirm the command finds the two selector implementations.

- [x] **Step 3: Write minimal implementation**

Remove selector-specific imports, refs, callbacks, effects, JSX, and Sass class blocks in both footer components. Delete the three icon files after their imports are removed.

- [x] **Step 4: Run test to verify it passes**

```bash
rg -n "<select|ThemeAutoIcon|ThemeLightIcon|ThemeDarkIcon|Switch themes" src/components/Footer 'src/app/(frontend)/(cloud)/cloud/_components/CloudFooter'
```

Expected: exit `1`.

### Task 3: Validate compilation and scope

**Files:**

- Verify: all modified files

- [x] **Step 1: Run validation**

```bash
corepack pnpm exec prettier --check src/providers/Theme/index.tsx src/components/Footer/index.tsx src/components/Footer/index.module.scss 'src/app/(frontend)/(cloud)/cloud/_components/CloudFooter/index.tsx' 'src/app/(frontend)/(cloud)/cloud/_components/CloudFooter/classes.module.scss'
corepack pnpm build:skipDocs
```

Expected: both commands exit `0`.

- [x] **Step 2: Review scope**

```bash
git diff --check
git diff --stat
```

Expected: no whitespace errors and no unrelated code changes.
