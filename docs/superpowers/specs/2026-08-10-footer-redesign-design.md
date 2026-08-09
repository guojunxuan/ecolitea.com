# Footer Redesign Design

## Objective

Replace the current Payload-branded footer with an ECOLITEA footer inspired by the information architecture of Tektron and Hyperlite. The redesign must remain managed through the existing Payload `footer` Global, preserve native Payload array interactions, support one to four dynamic navigation groups, and use the same `1170px` desktop/mobile handoff as the Header.

## Scope

This redesign covers:

- Footer visual structure and responsive behavior.
- Footer Global schema and admin organization.
- Dynamic navigation groups and native drag ordering.
- Brand logo, tagline, social links, contact information, and copyright management.
- Newsletter placeholder UI without a submission integration.
- Removal of obsolete Payload-branded visuals and Cloud-specific footer behavior.

It does not cover:

- Newsletter API submission, form storage, HubSpot, or any other marketing integration.
- Changes to Main Menu behavior.
- Changes to Header, account management, authentication, or Cloud storage.

## Visual Structure

### Desktop: wider than 1170px

The footer spans the full viewport with a solid dark background. Its inner content is centered and capped at `1220px`, matching the Header alignment.

The primary content row has three containers:

1. Brand container: `24%`
   - CMS-managed logo for a dark background.
   - CMS-managed logo alternative text.
   - CMS-managed brand tagline.
   - CMS-managed, ordered social links.
2. Dynamic navigation container: `46%`
   - One to four CMS-managed navigation groups.
   - Groups remain on one row and divide the navigation container equally.
   - Each group contains a title and an ordered list of CMS links.
3. Newsletter and contact container: `30%`
   - Newsletter heading.
   - Newsletter description.
   - Email input and submit button as non-functional placeholders.
   - Address.
   - Phone.
   - Email.

The content containers use spacing only. There are no vertical divider lines between them.

The newsletter input group is left-aligned and capped at approximately `286px`; it does not fill the entire third container.

### Copyright row

The copyright row is a separate second layer. A single low-contrast horizontal line separates it from the primary content row. It contains:

- The current year, generated at render time.
- CMS-managed company name.
- CMS-managed copyright text.

Example output:

`© 2026 ECOLITEA. All rights reserved.`

### Mobile: 1170px and below

The Footer switches at the same `1170px` breakpoint as the Header. Its order is:

1. Logo.
2. Brand tagline.
3. Social icons.
4. Navigation accordion.
5. Newsletter placeholder.
6. Address, phone, and email.
7. Copyright row.

Navigation is a single-column accordion inspired by Tektron:

- Each closed row shows only the navigation title and arrow.
- All groups are collapsed initially.
- Only one group is open at a time.
- Opening another group closes the current group.
- Links appear below the active title.
- The trigger is a semantic button with `aria-expanded` and `aria-controls`.
- Expanded content is removed from keyboard navigation when closed.

The mobile newsletter input group uses the full available content width.

## Footer Global Schema

The existing `footer` Global is extended. No new Global is introduced.

### Brand group

- `logo`: upload relationship to `media`, required.
- `logoAlt`: text, required.
- `tagline`: textarea, required.
- `socialLinks`: array, maximum six rows, sortable.
  - `platform`: required select.
  - `url`: required text with HTTPS URL validation.

Supported social platforms:

- Facebook
- Instagram
- YouTube
- LinkedIn
- X
- TikTok

Duplicate platform values are rejected. The array order controls frontend icon order.

### Navigation group

- `columns`: existing array, minimum one and maximum four rows, sortable.
  - `label`: required text.
  - `navItems`: sortable array of existing CMS link fields.

Existing Footer navigation data remains in the same field so it can be preserved.

### Newsletter and contact group

- `newsletterHeading`: required text.
- `newsletterDescription`: textarea.
- `newsletterPlaceholder`: text.
- `address`: textarea.
- `phone`: text.
- `email`: email.

The phone renders as a `tel:` link and the email renders as a `mailto:` link when values are present. The address renders as text.

### Legal group

- `companyName`: required text.
- `copyrightText`: required text.

The year is not stored in CMS.

## Admin Array Row Labels

The redesign continues using Payload's native Array Field UI. Drag handles, collapse controls, duplicate, delete, and sorting remain system-provided.

Footer uses isolated RowLabel components rather than sharing the Main Menu component:

- `CustomRowLabelFooterColumns` reads `data.label`.
- `CustomRowLabelSocialLinks` reads `data.platform` and displays its human-readable platform label.

These components use Payload's native `useRowLabel()` hook. They only replace the collapsed row title and do not replace any Payload array interface.

Expected admin display:

```text
⠿ Products
⠿ Solutions
⠿ Company
⠿ Resources
```

and:

```text
⠿ Facebook
⠿ LinkedIn
⠿ Instagram
```

## Social Icon Rendering

CMS stores only the platform and URL. It does not accept uploaded social icon files.

The frontend maps platform values to controlled React icon components. Existing Facebook, Instagram, YouTube, and Twitter/X graphics are reused where suitable. LinkedIn and TikTok icons are added using the same graphics-component convention.

All icons share one presentation:

- Approximately `32px` interactive container.
- Approximately `18px` glyph.
- `currentColor` for theme control.
- Consistent border, hover, and focus-visible states.
- Opens in a new tab with `rel="noopener noreferrer"`.
- Accessible label generated from the platform, such as `Visit ECOLITEA on LinkedIn`.

## Newsletter Placeholder Behavior

The first phase implements appearance only:

- Input and button render in the approved layout.
- No API request is made.
- No data is written to Payload or MongoDB.
- No Form Builder, HubSpot, or external service is invoked.
- Submit button is disabled so the interface cannot imply a successful subscription.

A future integration may replace this placeholder without changing Footer layout or CMS content fields.

## Removed Legacy Behavior

The redesign removes:

- `BackgroundGrid` from Footer.
- `Payload3D` from Footer.
- Hard-coded Payload social URLs and labels.
- Payload-specific `Stay connected` content.
- Footer Cloud/auth pathname segment detection and conditional top-border behavior.
- Unused Footer form and icon imports left by the old implementation.

The Footer remains fixed to the dark theme.

## Data Flow and Caching

The existing page layout continues to fetch the `footer` Global through `fetchGlobals()`. No additional frontend request is added. The existing Footer `afterChange` hook continues to call `revalidatePath('/', 'layout')`, so saved CMS changes invalidate the cached layout.

The Footer Global remains stored through the configured local MongoDB adapter. This design has no Payload Cloud storage dependency.

## Generated Artifacts

Implementation requires:

- Regenerating the Payload admin import map after adding RowLabel components.
- Regenerating Payload TypeScript types if the schema fields change.

The existing uncommitted semicolon-only changes in `src/payload-types.ts` must not be mixed into the feature accidentally. The implementation must first establish a clean generated baseline or isolate intentional generated output in the feature commit.

## Accessibility and Interaction

- Footer logo has meaningful alternative text.
- Social links have generated accessible labels.
- Phone and email use semantic links.
- Accordion triggers are buttons and expose expanded state.
- Closed accordion panels are not focusable or announced as visible content.
- Focus-visible styling is retained for all links and controls.
- Newsletter placeholder clearly exposes its disabled state.
- Motion is not required for understanding or operating the Footer.

## Verification

Implementation verification must include:

- Payload config and TypeScript validation.
- RowLabel unit coverage for label and platform fallbacks where practical.
- Footer rendering with one and four navigation groups.
- Desktop visual check above 1170px at 1220px content width.
- Boundary checks at 1171px and 1170px.
- Mobile accordion keyboard and pointer behavior.
- Empty optional contact-field behavior.
- Social icon ordering and external-link attributes.
- Confirmation that newsletter placeholder makes no network request.
- Confirmation that unrelated `payload-types.ts`, `.superpowers/`, and `tsconfig.tsbuildinfo` changes are excluded from the feature commit unless intentionally required.
