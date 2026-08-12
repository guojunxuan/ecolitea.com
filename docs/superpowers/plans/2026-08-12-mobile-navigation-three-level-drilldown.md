# Mobile Navigation Three-Level Drilldown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Ecolitea mobile navigation with three-level horizontal drilldown, separately activated title links and arrow buttons, uniform single-line Back rows, and arrow-free final links without changing desktop menu presentation or behavior.

**Architecture:** Extend only expandable menu groups with landing links, then map the existing Payload `tabs → navItems → links` data into a mobile-only three-page track. A pure navigation module classifies rows and owns the level reducer; `MobileNav` owns modal state, focus restoration, and React rendering. Desktop navigation continues reading the same existing labels and child links and deliberately ignores the new group landing-link fields.

**Tech Stack:** Next.js 15, React 19, Payload CMS 3, TypeScript, Sass modules, Node.js test runner, `tsx`.

---

## File Structure

- Modify `src/globals/MainMenu.ts`: add List/Featured landing-link fields and attach menu validation.
- Create `src/globals/mainMenuValidation.ts`: pure validation for expandable titles and landing destinations.
- Modify `src/payload-types.ts`: generated Payload types after the schema change.
- Modify `src/components/Header/MobileNav/navigation.js`: pure row classification and three-level reducer.
- Modify `src/components/Header/MobileNav/index.tsx`: render the three panels and manage focus/modal cleanup.
- Modify `src/components/Header/MobileNav/index.module.scss`: compact typography, split controls, 54px Back row, and horizontal motion.
- Modify `test/mobile-navigation.test.mjs`: pure model and reducer coverage.
- Create `test/main-menu-schema.test.ts`: schema/validation contract.
- Create `test/mobile-navigation-layout.test.mjs`: static UI/style contract and desktop-isolation assertions.

## Rollout Constraint

Expandable titles cannot behave as links until their landing destinations exist. Add the fields and strict validator together, then open the existing Main Menu global, populate every required destination in that single edit, and save only after all validation errors are resolved. Do not guess URLs or copy the first child link as a landing page.

---

### Task 1: Add testable Main Menu landing-link validation

**Files:**

- Create: `src/globals/mainMenuValidation.ts`
- Create: `test/main-menu-schema.test.ts`

- [ ] **Step 1: Write the failing validation tests**

Create `test/main-menu-schema.test.ts`:

```ts
import assert from 'node:assert/strict'
import test from 'node:test'

import { validateMainMenuTabs } from '../src/globals/mainMenuValidation'

const customLink = (url: string) => ({ type: 'custom' as const, url })

test('requires a landing link for an expandable top-level tab', () => {
  assert.equal(
    validateMainMenuTabs([
      {
        label: 'Products',
        enableDropdown: true,
        enableDirectLink: false,
      },
    ]),
    'Products must enable and configure its Direct Link before it can open a submenu.',
  )
})

test('requires landing links for List and Featured drilldown groups', () => {
  assert.equal(
    validateMainMenuTabs([
      {
        label: 'Products',
        enableDropdown: true,
        enableDirectLink: true,
        link: customLink('/products'),
        navItems: [
          {
            style: 'list',
            listLinks: { tag: 'Organic Tea', links: [] },
          },
        ],
      },
    ]),
    'Products → Organic Tea requires a Landing Link.',
  )

  assert.equal(
    validateMainMenuTabs([
      {
        label: 'Resources',
        enableDropdown: true,
        enableDirectLink: true,
        link: customLink('/resources'),
        navItems: [
          {
            style: 'featured',
            featuredLink: { tag: 'Impact', links: [] },
          },
        ],
      },
    ]),
    'Resources → Impact requires a Landing Link.',
  )
})

test('accepts direct, List, and Featured landing destinations', () => {
  assert.equal(
    validateMainMenuTabs([
      {
        label: 'Products',
        enableDropdown: true,
        enableDirectLink: true,
        link: customLink('/products'),
        navItems: [
          {
            style: 'list',
            listLinks: {
              tag: 'Organic Tea',
              landingLink: customLink('/products/organic-tea'),
              links: [],
            },
          },
          {
            style: 'featured',
            featuredLink: {
              tag: 'Tea Stories',
              landingLink: customLink('/stories'),
              links: [],
            },
          },
        ],
      },
    ]),
    true,
  )
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm exec tsx --test test/main-menu-schema.test.ts
```

Expected: FAIL because `src/globals/mainMenuValidation.ts` does not exist.

- [ ] **Step 3: Implement the pure validator**

Create `src/globals/mainMenuValidation.ts`:

```ts
type LinkValue = {
  reference?: unknown
  type?: 'custom' | 'reference' | null
  url?: null | string
}

type NavigationGroup = {
  featuredLink?: {
    landingLink?: LinkValue
    tag?: null | string
  }
  listLinks?: {
    landingLink?: LinkValue
    tag?: null | string
  }
  style?: 'default' | 'featured' | 'list' | null
}

type NavigationTab = {
  enableDirectLink?: boolean | null
  enableDropdown?: boolean | null
  label?: null | string
  link?: LinkValue
  navItems?: NavigationGroup[] | null
}

const hasDestination = (link?: LinkValue): boolean => {
  if (!link) return false
  if (link.type === 'custom') return Boolean(link.url?.trim())
  if (link.type === 'reference') return Boolean(link.reference)
  return false
}

export const validateMainMenuTabs = (tabs?: NavigationTab[] | null): true | string => {
  for (const tab of tabs ?? []) {
    if (!tab.enableDropdown) continue

    const tabLabel = tab.label?.trim() || 'Expandable menu item'

    if (!tab.enableDirectLink || !hasDestination(tab.link)) {
      return `${tabLabel} must enable and configure its Direct Link before it can open a submenu.`
    }

    for (const item of tab.navItems ?? []) {
      const group = item.style === 'list' ? item.listLinks : item.style === 'featured' ? item.featuredLink : undefined

      if (!group) continue

      const groupLabel = group.tag?.trim() || 'Untitled group'
      if (!hasDestination(group.landingLink)) {
        return `${tabLabel} → ${groupLabel} requires a Landing Link.`
      }
    }
  }

  return true
}
```

- [ ] **Step 4: Run the validation tests**

Run:

```bash
pnpm exec tsx --test test/main-menu-schema.test.ts
```

Expected: 3 passing tests.

- [ ] **Step 5: Commit the pure validation unit**

```bash
git add src/globals/mainMenuValidation.ts test/main-menu-schema.test.ts
git commit -m "test: define mobile menu landing validation"
```

---

### Task 2: Extend the Payload schema and populate landing destinations

**Files:**

- Modify: `src/globals/MainMenu.ts`
- Modify (generated): `src/payload-types.ts`
- Test: `test/main-menu-schema.test.ts`

- [ ] **Step 1: Add a failing schema contract test**

Append to `test/main-menu-schema.test.ts`:

```ts
import type { ArrayField, CollapsibleField, GroupField } from 'payload'

import { MainMenu } from '../src/globals/MainMenu'

const tabsField = MainMenu.fields.find(
  (field): field is ArrayField => 'name' in field && field.name === 'tabs' && field.type === 'array',
)

assert.ok(tabsField, 'MainMenu must define tabs as an array')

const dropdownField = tabsField.fields.find(
  (field): field is CollapsibleField =>
    field.type === 'collapsible' && field.label === 'Dropdown Menu',
)

assert.ok(dropdownField, 'MainMenu tabs must define the Dropdown Menu collapsible')

const navItemsField = dropdownField.fields.find(
  (field): field is ArrayField => 'name' in field && field.name === 'navItems' && field.type === 'array',
)

assert.ok(navItemsField, 'MainMenu tabs must define navItems')

for (const groupName of ['listLinks', 'featuredLink']) {
  const group = navItemsField.fields.find(
    (field): field is GroupField => 'name' in field && field.name === groupName && field.type === 'group',
  )

  assert.ok(group, `MainMenu navItems must define ${groupName}`)
  assert.ok(
    group.fields.some(
      (field) => 'name' in field && field.name === 'landingLink' && field.type === 'group',
    ),
    `${groupName} must define landingLink`,
  )
}

test('attaches strict validation to the tabs array', () => {
  assert.equal(tabsField.validate, validateMainMenuTabs)
})
```

- [ ] **Step 2: Run the schema contract and verify it fails**

Run:

```bash
pnpm exec tsx --test test/main-menu-schema.test.ts
```

Expected: FAIL because neither group has `landingLink` and the tabs array has no validator.

- [ ] **Step 3: Add reusable Landing Link fields without changing desktop rendering**

In `src/globals/MainMenu.ts`, import the validator:

```ts
import { validateMainMenuTabs } from './mainMenuValidation'
```

Attach it to the `tabs` array:

```ts
{
  name: 'tabs',
  type: 'array',
  validate: validateMainMenuTabs,
}
```

Add only the `validate` property to the existing tabs object; retain its current `admin` and `fields` properties verbatim.

Inside both `featuredLink.fields` and `listLinks.fields`, place this field immediately after `tag`:

```ts
link({
  appearances: false,
  disableLabel: true,
  overrides: {
    name: 'landingLink',
    label: 'Landing Link',
  },
})
```

Do not reference `landingLink` from `DesktopNav`.

- [ ] **Step 4: Generate Payload types**

Run:

```bash
pnpm generate:types
```

Expected: exit code 0; `MainMenu.navItems[].listLinks` and `.featuredLink` each gain a `landingLink` group in `src/payload-types.ts`.

- [ ] **Step 5: Run schema and type checks**

Run:

```bash
pnpm exec tsx --test test/main-menu-schema.test.ts
pnpm exec tsc --noEmit
```

Expected: schema tests pass and TypeScript exits 0.

- [ ] **Step 6: Populate required content before continuing**

Run the local site:

```bash
pnpm dev
```

In Payload Admin, open **Globals → Main Menu** and complete these fields:

1. For every tab with Dropdown enabled, also enable Direct Link and choose its category landing page.
2. For every List group, choose its Landing Link.
3. For every Featured group, choose its Landing Link.
4. Save Main Menu; the save must succeed with no validation error.

Do not invent destinations. If a category has no landing page, stop and ask the content owner whether to create a page or keep that category non-expandable.

- [ ] **Step 7: Commit the schema and generated types**

```bash
git add src/globals/MainMenu.ts src/payload-types.ts test/main-menu-schema.test.ts
git commit -m "feat: add mobile menu landing links"
```

---

### Task 3: Build the pure three-level navigation model

**Files:**

- Modify: `src/components/Header/MobileNav/navigation.js`
- Modify: `test/mobile-navigation.test.mjs`

- [ ] **Step 1: Add failing row-classification and reducer tests**

Replace `test/mobile-navigation.test.mjs` with:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getMobileNavigationAction,
  getMobileNavigationBranch,
  initialMobileNavigationState,
  reduceMobileNavigation,
} from '../src/components/Header/MobileNav/navigation.js'

test('classifies direct links and expandable tabs', () => {
  assert.equal(getMobileNavigationAction({ enableDropdown: true }), 'submenu')
  assert.equal(getMobileNavigationAction({ enableDropdown: false }), 'link')
})

test('maps List and Featured groups to third-level branches', () => {
  const listBranch = getMobileNavigationBranch({
    style: 'list',
    listLinks: {
      tag: 'Organic Tea',
      landingLink: { type: 'custom', url: '/products/organic-tea' },
      links: [{ link: { label: 'Green Tea', type: 'custom', url: '/green-tea' } }],
    },
  })

  assert.deepEqual(listBranch, {
    kind: 'list',
    label: 'Organic Tea',
    landingLink: { type: 'custom', url: '/products/organic-tea' },
    links: [{ link: { label: 'Green Tea', type: 'custom', url: '/green-tea' } }],
  })

  const featuredBranch = getMobileNavigationBranch({
    style: 'featured',
    featuredLink: {
      tag: 'Tea Stories',
      landingLink: { type: 'custom', url: '/stories' },
      label: { root: { children: [] } },
      links: [],
    },
  })

  assert.equal(featuredBranch.kind, 'featured')
  assert.equal(featuredBranch.label, 'Tea Stories')
  assert.equal(featuredBranch.landingLink.url, '/stories')
  assert.deepEqual(featuredBranch.links, [])
  assert.deepEqual(featuredBranch.featuredLabel, { root: { children: [] } })
})

test('returns null for final Default items', () => {
  assert.equal(
    getMobileNavigationBranch({
      style: 'default',
      defaultLink: { link: { label: 'Contact', type: 'custom', url: '/contact' } },
    }),
    null,
  )
})

test('moves forward and back through three navigation levels', () => {
  const levelTwo = reduceMobileNavigation(initialMobileNavigationState, {
    index: 2,
    type: 'OPEN_TAB',
  })
  assert.deepEqual(levelTwo, { activeItemIndex: undefined, activeTabIndex: 2, level: 2 })

  const levelThree = reduceMobileNavigation(levelTwo, {
    index: 1,
    type: 'OPEN_ITEM',
  })
  assert.deepEqual(levelThree, { activeItemIndex: 1, activeTabIndex: 2, level: 3 })

  assert.deepEqual(reduceMobileNavigation(levelThree, { type: 'BACK' }), levelTwo)
  assert.deepEqual(
    reduceMobileNavigation(levelTwo, { type: 'BACK' }),
    initialMobileNavigationState,
  )
  assert.deepEqual(
    reduceMobileNavigation(levelThree, { type: 'RESET' }),
    initialMobileNavigationState,
  )
})
```

- [ ] **Step 2: Run the tests and verify the new cases fail**

Run:

```bash
node --test test/mobile-navigation.test.mjs
```

Expected: the original classifier passes; branch and reducer imports fail.

- [ ] **Step 3: Implement the pure model**

Replace `src/components/Header/MobileNav/navigation.js` with:

```js
export const getMobileNavigationAction = ({ enableDropdown }) =>
  enableDropdown ? 'submenu' : 'link'

export const getMobileNavigationBranch = (item) => {
  if (item?.style === 'list' && item.listLinks) {
    return {
      kind: 'list',
      label: item.listLinks.tag || '',
      landingLink: item.listLinks.landingLink,
      links: item.listLinks.links || [],
    }
  }

  if (item?.style === 'featured' && item.featuredLink) {
    return {
      featuredLabel: item.featuredLink.label,
      kind: 'featured',
      label: item.featuredLink.tag || '',
      landingLink: item.featuredLink.landingLink,
      links: item.featuredLink.links || [],
    }
  }

  return null
}

export const initialMobileNavigationState = {
  activeItemIndex: undefined,
  activeTabIndex: undefined,
  level: 1,
}

export const reduceMobileNavigation = (state, action) => {
  switch (action.type) {
    case 'OPEN_TAB':
      return { activeItemIndex: undefined, activeTabIndex: action.index, level: 2 }
    case 'OPEN_ITEM':
      if (state.activeTabIndex === undefined) return state
      return { ...state, activeItemIndex: action.index, level: 3 }
    case 'BACK':
      if (state.level === 3) return { ...state, activeItemIndex: undefined, level: 2 }
      return initialMobileNavigationState
    case 'RESET':
      return initialMobileNavigationState
    default:
      return state
  }
}
```

- [ ] **Step 4: Run the pure model tests**

Run:

```bash
node --test test/mobile-navigation.test.mjs
```

Expected: 4 passing tests.

- [ ] **Step 5: Commit the model**

```bash
git add src/components/Header/MobileNav/navigation.js test/mobile-navigation.test.mjs
git commit -m "feat: model three-level mobile navigation"
```

---

### Task 4: Render split title/arrow controls and three persistent panels

**Files:**

- Modify: `src/components/Header/MobileNav/index.tsx`
- Create: `test/mobile-navigation-layout.test.mjs`

- [ ] **Step 1: Write the failing component contract test**

Create `test/mobile-navigation-layout.test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const mobileNav = readFileSync(
  new URL('../src/components/Header/MobileNav/index.tsx', import.meta.url),
  'utf8',
)
const desktopNav = readFileSync(
  new URL('../src/components/Header/DesktopNav/index.tsx', import.meta.url),
  'utf8',
)

test('renders three persistent mobile navigation panels', () => {
  assert.match(mobileNav, /classes\.navigationTrack/)
  assert.match(mobileNav, /classes\.levelOnePanel/)
  assert.match(mobileNav, /classes\.levelTwoPanel/)
  assert.match(mobileNav, /classes\.levelThreePanel/)
})

test('separates landing links from drilldown buttons', () => {
  assert.match(mobileNav, /classes\.branchTitle/)
  assert.match(mobileNav, /classes\.drilldownButton/)
  assert.match(mobileNav, /aria-label=\{`Open \$\{[^}]+\} submenu`\}/)
})

test('uses parent-aware Back rows and omits duplicate View All links', () => {
  assert.match(mobileNav, /Back to \{parentLabel\}/)
  assert.doesNotMatch(mobileNav, /View all/i)
})

test('keeps new group landing links out of desktop rendering', () => {
  assert.doesNotMatch(desktopNav, /landingLink/)
})
```

- [ ] **Step 2: Run the layout contract and verify it fails**

Run:

```bash
node --test test/mobile-navigation-layout.test.mjs
```

Expected: FAIL because the current component conditionally swaps only two views.

- [ ] **Step 3: Import the new model functions and replace `activeTab` state**

In `src/components/Header/MobileNav/index.tsx`, import:

```tsx
import {
  getMobileNavigationAction,
  getMobileNavigationBranch,
  initialMobileNavigationState,
  reduceMobileNavigation,
} from './navigation.js'
```

Inside `MobileNav`, replace `activeTab` state with:

```tsx
const [navigationState, dispatchNavigation] = React.useReducer(
  reduceMobileNavigation,
  initialMobileNavigationState,
)
```

Reset it whenever the modal closes, the pathname changes, or the desktop breakpoint activates:

```tsx
const closeMenu = React.useCallback(() => {
  dispatchNavigation({ type: 'RESET' })
  closeAllModals()
}, [closeAllModals])
```

- [ ] **Step 4: Add exact split-row and Back-row primitives**

Add these components above `MobileMenuModal`:

```tsx
const DrilldownRow = ({
  arrowRef,
  label,
  landingLink,
  onDrilldown,
  onLinkActivate,
}) => (
  <li className={classes.branchRow}>
    <CMSLink
      {...landingLink}
      className={classes.branchTitle}
      label={label}
      onClick={onLinkActivate}
    />
    <button
      aria-label={`Open ${label} submenu`}
      className={classes.drilldownButton}
      onClick={onDrilldown}
      ref={arrowRef}
      type="button"
    >
      <ArrowIcon className={classes.drilldownArrow} rotation={45} />
    </button>
  </li>
)

const BackRow = ({
  arrowRef,
  landingLink,
  onBack,
  onLinkActivate,
  parentLabel,
}) => (
  <div className={classes.backRow}>
    <button
      aria-label={`Back to ${parentLabel}`}
      className={classes.backArrowButton}
      onClick={onBack}
      ref={arrowRef}
      type="button"
    >
      <ArrowIcon rotation={225} />
    </button>
    <CMSLink
      {...landingLink}
      className={classes.backTitle}
      onClick={onLinkActivate}
    >
      Back to {parentLabel}
    </CMSLink>
  </div>
)

```

Add `FinalLink` in Step 5, where its description and child-content behavior are defined. It must never render `ArrowIcon`.

- [ ] **Step 5: Render all three panels inside one track**

Replace `MobileNavItems` and `SubMenuItems` with this complete `NavigationLevels` component. Add `description?: null | string` and `children?: React.ReactNode` to `FinalLink`; render `label=""` when children are supplied so the CMS label is not duplicated.

```tsx
type NavigationTab = NonNullable<MainMenu['tabs']>[number]

type MobileNavigationState = {
  activeItemIndex?: number
  activeTabIndex?: number
  level: 1 | 2 | 3
}

const FinalLink = ({
  children,
  description,
  link,
  onLinkActivate,
}: {
  children?: React.ReactNode
  description?: null | string
  link: React.ComponentProps<typeof CMSLink>
  onLinkActivate: React.ComponentProps<typeof CMSLink>['onClick']
}) => (
  <CMSLink
    {...link}
    className={classes.finalLink}
    label={children || description ? '' : link.label}
    onClick={onLinkActivate}
  >
    {children ||
      (description ? (
        <span className={classes.finalLinkCopy}>
          <span>{link.label}</span>
          <span className={classes.itemDescription}>{description}</span>
        </span>
      ) : undefined)}
  </CMSLink>
)

const NavigationLevels = ({
  backArrowRefs,
  dispatchNavigation,
  levelOneArrowRefs,
  levelTwoArrowRefs,
  navigationState,
  onBack,
  onLinkActivate,
  tabs,
}: {
  backArrowRefs: React.MutableRefObject<Record<number, HTMLButtonElement | null>>
  dispatchNavigation: React.Dispatch<
    | { index: number; type: 'OPEN_ITEM' | 'OPEN_TAB' }
    | { type: 'BACK' | 'RESET' }
  >
  levelOneArrowRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>
  levelTwoArrowRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>
  navigationState: MobileNavigationState
  onBack: () => void
  onLinkActivate: React.ComponentProps<typeof CMSLink>['onClick']
  tabs: MainMenu['tabs']
}) => {
  const activeTab: NavigationTab | undefined =
    (tabs || [])[navigationState.activeTabIndex ?? -1]
  const activeItem =
    (activeTab?.navItems || [])[navigationState.activeItemIndex ?? -1]
  const activeBranch = getMobileNavigationBranch(activeItem)

  return (
    <div className={classes.navigationViewport}>
      <div
        className={classes.navigationTrack}
        data-level={navigationState.level}
      >
        <section
          aria-hidden={navigationState.level !== 1}
          className={[classes.navigationPanel, classes.levelOnePanel].join(' ')}
          inert={navigationState.level !== 1}
        >
          <div className={classes.groupTitle}>Menu</div>
          {(tabs || []).map((tab, index) => {
            if (getMobileNavigationAction(tab) === 'link') {
              return (
                <FinalLink
                  key={tab.id || index}
                  link={{ ...tab.link, label: tab.label }}
                  onLinkActivate={onLinkActivate}
                />
              )
            }

            return (
              <DrilldownRow
                arrowRef={(element) => {
                  levelOneArrowRefs.current[index] = element
                }}
                key={tab.id || index}
                label={tab.label}
                landingLink={tab.link}
                onDrilldown={() =>
                  dispatchNavigation({ index, type: 'OPEN_TAB' })
                }
                onLinkActivate={onLinkActivate}
              />
            )
          })}
        </section>

        <section
          aria-hidden={navigationState.level !== 2}
          className={[classes.navigationPanel, classes.levelTwoPanel].join(' ')}
          inert={navigationState.level !== 2}
        >
          <BackRow
            arrowRef={(element) => {
              backArrowRefs.current[2] = element
            }}
            landingLink={{ type: 'custom', url: '/' }}
            onBack={onBack}
            onLinkActivate={onLinkActivate}
            parentLabel="Main menu"
          />
          <div className={classes.groupTitle}>{activeTab?.label}</div>
          {(activeTab?.descriptionLinks || []).map((entry, index) => (
            <FinalLink
              key={entry.id || index}
              link={entry.link}
              onLinkActivate={onLinkActivate}
            />
          ))}
          {(activeTab?.navItems || []).map((item, index) => {
            if (item.style === 'default' && item.defaultLink) {
              return (
                <FinalLink
                  description={item.defaultLink.description}
                  key={item.id || index}
                  link={item.defaultLink.link}
                  onLinkActivate={onLinkActivate}
                />
              )
            }

            const branch = getMobileNavigationBranch(item)
            if (!branch) return null

            return (
              <DrilldownRow
                arrowRef={(element) => {
                  levelTwoArrowRefs.current[index] = element
                }}
                key={item.id || index}
                label={branch.label}
                landingLink={branch.landingLink}
                onDrilldown={() =>
                  dispatchNavigation({ index, type: 'OPEN_ITEM' })
                }
                onLinkActivate={onLinkActivate}
              />
            )
          })}
        </section>

        <section
          aria-hidden={navigationState.level !== 3}
          className={[classes.navigationPanel, classes.levelThreePanel].join(' ')}
          inert={navigationState.level !== 3}
        >
          <BackRow
            arrowRef={(element) => {
              backArrowRefs.current[3] = element
            }}
            landingLink={activeTab?.link}
            onBack={onBack}
            onLinkActivate={onLinkActivate}
            parentLabel={activeTab?.label || 'Parent menu'}
          />
          <div className={classes.groupTitle}>{activeBranch?.label}</div>
          {activeBranch?.kind === 'featured' && activeBranch.featuredLabel && (
            <RichText
              className={classes.featuredContent}
              content={activeBranch.featuredLabel}
            />
          )}
          {(activeBranch?.links || []).map((entry, index) => (
            <FinalLink
              key={entry.id || index}
              link={entry.link}
              onLinkActivate={onLinkActivate}
            />
          ))}
        </section>
      </div>
    </div>
  )
}
```

Render `NavigationLevels` directly below `PanelHeader` inside `MobileMenuModal`. Pass all refs, `navigationState`, `dispatchNavigation`, `handleBack`, `onLinkActivate`, and `tabs`. Do not render any `View all …` row and do not place `ArrowIcon` inside `FinalLink`.

- [ ] **Step 6: Implement per-level Back links and focus restoration**

Use these refs in `MobileMenuModal`:

```tsx
const backArrowRefs = React.useRef<Record<number, HTMLButtonElement | null>>({})
const levelOneArrowRefs = React.useRef<Array<HTMLButtonElement | null>>([])
const levelTwoArrowRefs = React.useRef<Array<HTMLButtonElement | null>>([])
const restoreFocusRef = React.useRef<
  | { index: number; level: 1 | 2 }
  | undefined
>()
```

When going back:

```tsx
const handleBack = () => {
  if (navigationState.level === 3 && navigationState.activeItemIndex !== undefined) {
    restoreFocusRef.current = { index: navigationState.activeItemIndex, level: 2 }
  } else if (navigationState.activeTabIndex !== undefined) {
    restoreFocusRef.current = { index: navigationState.activeTabIndex, level: 1 }
  }

  dispatchNavigation({ type: 'BACK' })
}
```

Focus the Back arrow after forward movement and restore the originating arrow after Back:

```tsx
React.useEffect(() => {
  if (!isMenuOpen) return

  const restoreTarget = restoreFocusRef.current
  const frame = window.requestAnimationFrame(() => {
    if (restoreTarget?.level === navigationState.level) {
      const refs = restoreTarget.level === 1 ? levelOneArrowRefs : levelTwoArrowRefs
      refs.current[restoreTarget.index]?.focus()
      restoreFocusRef.current = undefined
      return
    }

    if (navigationState.level > 1) {
      backArrowRefs.current[navigationState.level]?.focus()
    }
  })

  return () => window.cancelAnimationFrame(frame)
}, [isMenuOpen, navigationState.level])
```

For level two, render `BackRow` with `{ type: 'custom', url: '/' }` and `parentLabel="Main menu"`. For level three, use the active top-level tab's `link` and `label`, producing `Back to Products`-style text.

- [ ] **Step 7: Run component, model, and TypeScript tests**

Run:

```bash
node --test test/mobile-navigation.test.mjs test/mobile-navigation-layout.test.mjs
pnpm exec tsc --noEmit
```

Expected: all navigation tests pass and TypeScript exits 0.

- [ ] **Step 8: Commit the React structure**

```bash
git add src/components/Header/MobileNav/index.tsx test/mobile-navigation-layout.test.mjs
git commit -m "feat: render three-level mobile menu"
```

---

### Task 5: Implement the compact layout and horizontal slide motion

**Files:**

- Modify: `src/components/Header/MobileNav/index.module.scss`
- Modify: `test/mobile-navigation-layout.test.mjs`

- [ ] **Step 1: Add failing style-contract assertions**

Append to `test/mobile-navigation-layout.test.mjs`:

```js
const stylesheet = readFileSync(
  new URL('../src/components/Header/MobileNav/index.module.scss', import.meta.url),
  'utf8',
)

test('uses a three-page horizontal track with reduced-motion support', () => {
  assert.match(stylesheet, /\.navigationTrack\s*\{[\s\S]*width:\s*300%/)
  assert.match(stylesheet, /\[data-level=["']2["']\][\s\S]*translateX\(-33\.3333%\)/)
  assert.match(stylesheet, /\[data-level=["']3["']\][\s\S]*translateX\(-66\.6666%\)/)
  assert.match(stylesheet, /transition:\s*transform\s+340ms/)
  assert.match(stylesheet, /prefers-reduced-motion:\s*reduce/)
})

test('matches the approved row geometry and split controls', () => {
  assert.match(stylesheet, /\.branchRow\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+52px/)
  assert.match(stylesheet, /\.backRow\s*\{[\s\S]*height:\s*54px/)
  assert.match(stylesheet, /\.backTitle\s*\{[\s\S]*font-size:\s*14px[\s\S]*font-weight:\s*500/)
  assert.match(stylesheet, /\.finalLink\s*\{[\s\S]*min-height:\s*44px/)
})
```

- [ ] **Step 2: Run the style contract and verify it fails**

Run:

```bash
node --test test/mobile-navigation-layout.test.mjs
```

Expected: structural tests pass; new style assertions fail.

- [ ] **Step 3: Replace two-level content styles with the approved track**

In `src/components/Header/MobileNav/index.module.scss`, keep the existing Header geometry and modal/panel rules. Replace `.subMenuItems` and the old content layout with:

```scss
.navigationViewport {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.navigationTrack {
  display: flex;
  width: 300%;
  height: 100%;
  transform: translateX(0);
  transition: transform 340ms cubic-bezier(0.22, 0.75, 0.25, 1);

  &[data-level='2'] {
    transform: translateX(-33.3333%);
  }

  &[data-level='3'] {
    transform: translateX(-66.6666%);
  }
}

.navigationPanel {
  flex: 0 0 33.3333%;
  width: 33.3333%;
  height: 100%;
  overflow-y: auto;
  background: var(--theme-bg);
  overscroll-behavior: contain;
}

@media (prefers-reduced-motion: reduce) {
  .navigationTrack {
    transition: none;
  }
}
```

- [ ] **Step 4: Add split-row, Back-row, and final-link styles**

Add:

```scss
.branchRow,
.backRow {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 52px;
  width: 100%;
  min-height: 54px;
  border-bottom: 1px solid var(--theme-border-color);
}

.branchTitle {
  display: flex;
  min-width: 0;
  align-items: center;
  padding: 10px 16px;
  color: var(--theme-text);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
  text-decoration: none;
}

.drilldownButton {
  @include btnReset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  min-height: 54px;
  border-left: 1px solid var(--theme-border-color);
  cursor: pointer;
}

.drilldownArrow {
  width: 13px;
  height: 13px;
}

.backRow {
  grid-template-columns: 48px minmax(0, 1fr);
  height: 54px;
  background: var(--theme-elevation-50);
}

.backArrowButton {
  @include btnReset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 54px;
  border-right: 1px solid var(--theme-border-color);
  cursor: pointer;

  svg {
    width: 13px;
    height: 13px;
  }
}

.backTitle {
  display: flex;
  min-width: 0;
  align-items: center;
  height: 54px;
  padding: 0 16px;
  color: var(--theme-text);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
}

.finalLink {
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  padding: 11px 16px;
  border-bottom: 1px solid var(--theme-border-color);
  color: var(--theme-text);
  font-size: 15px;
  font-weight: 400;
  line-height: 1.35;
  overflow-wrap: anywhere;
  text-decoration: none;
}
```

Use the existing theme variables for hover/pressed backgrounds. Apply the same visible focus treatment to `.branchTitle`, `.drilldownButton`, `.backArrowButton`, `.backTitle`, and `.finalLink`:

```scss
.branchTitle,
.drilldownButton,
.backArrowButton,
.backTitle,
.finalLink {
  &:focus-visible {
    outline: 2px solid var(--theme-success-600);
    outline-offset: -3px;
  }

  @include mouseHover {
    background: var(--theme-elevation-50);
  }

  &:active {
    background: var(--theme-success-50);
  }
}
```

Do not add an arrow pseudo-element to `.finalLink`.

- [ ] **Step 5: Normalize descriptions and Featured content**

Use these approved values:

```scss
.groupTitle {
  margin: 0 0 8px;
  color: var(--theme-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
}

.itemDescription {
  margin-top: 3px;
  color: var(--theme-elevation-600);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;
}

.featuredContent {
  margin: 12px;
  padding: 16px;
  background: var(--theme-elevation-50);
}
```

Do not force group headings to uppercase and do not add `View all …` content.

- [ ] **Step 6: Run focused navigation tests**

Run:

```bash
node --test test/mobile-navigation.test.mjs test/mobile-navigation-layout.test.mjs test/mobile-header-layout.test.mjs test/desktop-navigation-overflow.test.mjs
```

Expected: all tests pass.

- [ ] **Step 7: Compile Sass and TypeScript through the production build**

Run:

```bash
pnpm exec tsc --noEmit
pnpm build:skipDocs
```

Expected: both commands exit 0; Sass emits no selector or variable errors.

- [ ] **Step 8: Commit styling and motion**

```bash
git add src/components/Header/MobileNav/index.module.scss test/mobile-navigation-layout.test.mjs
git commit -m "style: add mobile menu drilldown motion"
```

---

### Task 6: Verify interaction, accessibility, desktop isolation, and final diff

**Files:**

- Verify: `src/components/Header/MobileNav/index.tsx`
- Verify: `src/components/Header/MobileNav/index.module.scss`
- Verify: `src/components/Header/DesktopNav/index.tsx`
- Verify: `src/globals/MainMenu.ts`
- Verify: `src/payload-types.ts`
- Verify: `test/main-menu-schema.test.ts`
- Verify: `test/mobile-navigation.test.mjs`
- Verify: `test/mobile-navigation-layout.test.mjs`
- Verify: `test/mobile-header-layout.test.mjs`
- Verify: `test/desktop-navigation-overflow.test.mjs`

- [ ] **Step 1: Run the complete focused test set**

```bash
pnpm exec tsx --test test/main-menu-schema.test.ts
node --test test/mobile-navigation.test.mjs test/mobile-navigation-layout.test.mjs test/mobile-header-layout.test.mjs test/desktop-navigation-overflow.test.mjs
pnpm exec tsc --noEmit
```

Expected: all tests pass and TypeScript exits 0.

- [ ] **Step 2: Run production compilation**

```bash
pnpm build:skipDocs
```

Expected: Next.js production build completes successfully.

- [ ] **Step 3: Inspect mobile behavior at 320px, 375px, and 390px**

At each width, verify this exact sequence:

1. Open the drawer; it remains 77vw with a 320px maximum width.
2. Click a level-one title; navigation closes and the landing URL opens.
3. Reopen, then click only its arrow; level one slides left and level two enters from the right.
4. Confirm the Back row is 54px and reads `Back to Main menu` in one uniform 14px/500 style.
5. Click the Back title; it navigates to `/`. Click only the Back arrow; it returns to level one.
6. Enter level two again and click a List/Featured title; it navigates to that group's Landing Link.
7. Reopen and click only the group arrow; level two slides left and level three enters.
8. Confirm the level-three Back row uses the active top-level parent, for example `Back to Products`.
9. Confirm every final link has no arrow and there is no `View all …` row.
10. Confirm long labels wrap without clipping or horizontal scroll.

- [ ] **Step 4: Verify keyboard and focus behavior**

Using only Tab, Shift+Tab, Enter, and Space:

1. Open the menu and reach both the title anchor and adjacent arrow button independently.
2. Activate an arrow; focus moves to the new level's Back arrow.
3. Activate Back; focus returns to the arrow that opened the child level.
4. Confirm inactive panels are not tabbable because they are inert.
5. Confirm Escape/scrim behavior from the existing modal still closes the menu.
6. Confirm route changes and crossing 1171px reset the navigation to level one.

- [ ] **Step 5: Verify reduced motion**

Enable `prefers-reduced-motion: reduce` in browser developer tools. Repeat forward and Back navigation.

Expected: panels change immediately with no horizontal translation animation; focus behavior remains identical.

- [ ] **Step 6: Verify desktop is unchanged above 1170px**

At 1440px:

1. Open every desktop dropdown.
2. Confirm tab hover/focus, More overflow, columns, group labels, child links, Featured content, and CTA are unchanged.
3. Confirm no Landing Link field is rendered as a new desktop menu item.

- [ ] **Step 7: Review only the intended diff**

Run:

```bash
git diff --check
git status --short
git diff -- src/globals/MainMenu.ts src/payload-types.ts src/components/Header/MobileNav/index.tsx src/components/Header/MobileNav/index.module.scss src/components/Header/MobileNav/navigation.js test/main-menu-schema.test.ts test/mobile-navigation.test.mjs test/mobile-navigation-layout.test.mjs
```

Expected: no whitespace errors; no `.superpowers/` preview files or `tsconfig.tsbuildinfo` are staged.

- [ ] **Step 8: Commit any final verification-only corrections**

If verification required code corrections:

```bash
git add src/globals/MainMenu.ts src/payload-types.ts src/components/Header/MobileNav/index.tsx src/components/Header/MobileNav/index.module.scss src/components/Header/MobileNav/navigation.js test/main-menu-schema.test.ts test/mobile-navigation.test.mjs test/mobile-navigation-layout.test.mjs
git commit -m "fix: finalize mobile menu drilldown"
```

If no corrections were required, do not create an empty commit.
