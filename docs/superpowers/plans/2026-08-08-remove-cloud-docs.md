# Remove Cloud and Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Payload Cloud and developer-documentation features while retaining local Payload users, MongoDB content management, media, Top Bar, and a future-ready site-search button.

**Architecture:** Delete the Cloud route group and all code that only communicates with the remote Cloud API. Delete Docs routes, collections, documentation renderers, and DocSearch; replace the header integration with a presentational search button. Retain community-help Algolia indexing and local `Users`, `Media`, and database configuration.

**Tech Stack:** Next.js, Payload CMS, React, TypeScript, Sass, pnpm.

---

### Task 1: Establish removal contracts

**Files:**

- Test: source contract checks using `rg`

- [ ] **Step 1: Record the expected initial state**

```bash
rg -n -S '@cloud|payload-cloud-types|@docsearch/react|DocSearch|collections/Docs' src package.json
```

Expected: exit `0` with existing Cloud and Docs references.

- [ ] **Step 2: Verify the initial state**

Run the command above and confirm it finds only features being removed.

### Task 2: Remove Cloud routes and remote account integration

**Files:**

- Delete: `src/app/(frontend)/(cloud)/`
- Delete: `src/providers/Auth/`, `src/payload-cloud-types.ts`, `src/app/_data/{me,plans,project,team,templates,token}.ts`
- Delete: `src/access.ts`, `src/utilities/{check-team-roles,generate-route-path,merge-project-environment,use-cloud-api}.ts`
- Modify: `src/providers/index.tsx`, `src/components/Header/{DesktopNav,MobileNav}/index.tsx`, `src/components/Avatar/`, `src/features.ts`, `src/app/(frontend)/layout.tsx`
- Delete: `src/components/NewProject/`, `src/components/TemplateCardsBlock/`, `src/app/(frontend)/types.ts`

- [ ] **Step 1: Remove Cloud-only files and imports**

Remove the Cloud route group, remote Cloud API client, account provider, Cloud-only project blocks, avatar UI, and Cloud feature flag. Preserve `src/collections/Users.ts`, `src/payload.config.ts` MongoDB adapter, and R2 media configuration.

- [ ] **Step 2: Verify no remote Cloud dependency remains**

```bash
rg -n -S '@cloud|payload-cloud-types|NEXT_PUBLIC_CLOUD_CMS_URL|useAuth\(|use-cloud-api' src package.json
```

Expected: exit `1`.

### Task 3: Remove Docs and replace its search integration

**Files:**

- Delete: `src/app/(frontend)/(pages)/docs/`, `src/collections/Docs/`, `src/collections/DocsFeedback/`
- Delete: `src/components/{RenderDocs,DocsNavigation,DocsFeedback,SyncDocsButton,RefreshMdxToLexicalButton,VersionSelector}/`, `src/components/Header/Docsearch/`, `src/css/docsearch.scss`
- Delete: `src/fields/addToDocs/`, `src/scripts/{fetchDocs,syncDocs,generateLLMs}.ts`
- Modify: `src/payload.config.ts`, `src/collections/Posts.ts`, `src/components/Header/{DesktopNav,MobileNav}/index.tsx`, `src/components/RichText/index.tsx`, `src/features.ts`
- Create: `src/components/Header/SiteSearchButton/index.tsx`

- [ ] **Step 1: Replace DocSearch before deleting it**

Create a button using the existing `SearchIcon`, with `aria-label="Search site"` and no external query or index dependency. Render it in both header variants.

- [ ] **Step 2: Delete Docs modules and CMS registrations**

Remove Docs collections, routes, sync endpoints, admin actions, document-only blocks, post-to-docs field, documentation renderer, and feature flag. Keep `syncToAlgolia` because it indexes Community Help rather than Docs.

- [ ] **Step 3: Verify Docs and DocSearch removal**

```bash
rg -n -S '@docsearch/react|DocSearch|collections/Docs|RenderDocs|fetchDocs|syncDocs|NEXT_PUBLIC_ENABLE_DOCS' src package.json
```

Expected: exit `1`.

### Task 4: Restore global header coverage and remove unused dependencies

**Files:**

- Modify: `src/app/(frontend)/not-found.tsx`, `src/app/(frontend)/(pages)/layout.tsx`, `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Ensure Top Bar is passed on the fallback header**

Fetch `topBar` together with existing globals in `not-found.tsx` and render `<Header {...mainMenu} topBar={topBar} />`.

- [ ] **Step 2: Remove unused packages**

Remove `@docsearch/react`, `@stripe/react-stripe-js`, `@stripe/stripe-js`, `stripe`, and `react-cookie` from the workspace manifest and lockfile. Do not remove `algoliasearch` or `@payloadcms/storage-s3`.

- [ ] **Step 3: Verify and build**

```bash
corepack pnpm exec tsc --noEmit
corepack pnpm build:skipDocs
git diff --check
```

Expected: all commands exit `0`.
