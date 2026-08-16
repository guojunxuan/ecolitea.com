import type { Metadata } from 'next'

import { brandMetadata } from './brandMetadata'

type ResolvePageTitleArgs = {
  isHomepage: boolean
  pageTitle?: null | string
  seoTitle?: null | string
}

export const resolvePageTitle = ({
  isHomepage,
  pageTitle,
  seoTitle,
}: ResolvePageTitleArgs): string => {
  if (seoTitle) return seoTitle
  if (isHomepage) return brandMetadata.homepageTitle

  return pageTitle || brandMetadata.name
}

export const canonicalURL = (path: string, override?: null | string): string => {
  const normalizedPath = `/${path}`.replace(/\/{2,}/g, '/').replace(/\/$/, '')
  const fallback =
    normalizedPath === '/' ? brandMetadata.siteURL : `${brandMetadata.siteURL}${normalizedPath}`

  if (override) {
    try {
      const candidate = new URL(override)
      if (candidate.origin === brandMetadata.siteURL) {
        return candidate.toString().replace(/\/$/, '')
      }
    } catch {
      return fallback
    }
  }

  return fallback
}

export const indexFollowRobots: Metadata['robots'] = {
  follow: true,
  index: true,
}

export const noIndexFollowRobots: Metadata['robots'] = {
  follow: true,
  index: false,
}

export const noIndexNoFollowRobots: Metadata['robots'] = {
  follow: false,
  index: false,
}
