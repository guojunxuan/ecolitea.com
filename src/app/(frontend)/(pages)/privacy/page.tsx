import type { Metadata } from 'next'

import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { canonicalURL, indexFollowRobots } from '@root/seo/metadata'
import React from 'react'

import { PrivacyClientPage } from './page_client'

const description =
  'Learn how Ecolitea collects, uses and protects personal information when you visit or interact with our website.'

export default (props) => {
  return <PrivacyClientPage {...props} />
}

export const metadata: Metadata = {
  alternates: {
    canonical: canonicalURL('/privacy'),
  },
  description,
  openGraph: mergeOpenGraph({
    description,
    title: 'Privacy Policy | Ecolitea',
    url: canonicalURL('/privacy'),
  }),
  robots: indexFollowRobots,
  title: 'Privacy Policy',
}
