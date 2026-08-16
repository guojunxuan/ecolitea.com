import type { Metadata } from 'next'

import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { canonicalURL, indexFollowRobots } from '@root/seo/metadata'
import React from 'react'

import { CookieClientPage } from './client_page'

const description = 'Learn how Ecolitea uses cookies and similar technologies across its website.'

export default (props) => {
  return <CookieClientPage {...props} />
}

export const metadata: Metadata = {
  alternates: {
    canonical: canonicalURL('/cookie'),
  },
  description,
  openGraph: mergeOpenGraph({
    description,
    title: 'Cookie Policy | Ecolitea',
    url: canonicalURL('/cookie'),
  }),
  robots: indexFollowRobots,
  title: 'Cookie Policy',
}
