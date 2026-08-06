/**
 * Optional product areas are disabled by default while this project is used as
 * a focused CMS website. Set an environment variable to `true` and rebuild to
 * restore the related CMS screens, public routes, and integrations.
 */
const enabled = (name: string): boolean => process.env[name] === 'true'

export const featureFlags = {
  cloud: enabled('NEXT_PUBLIC_ENABLE_CLOUD'),
  communityHelp: enabled('NEXT_PUBLIC_ENABLE_COMMUNITY_HELP'),
  docs: enabled('NEXT_PUBLIC_ENABLE_DOCS'),
  partners: enabled('NEXT_PUBLIC_ENABLE_PARTNERS'),
  styleguide: enabled('NEXT_PUBLIC_ENABLE_STYLEGUIDE'),
} as const
