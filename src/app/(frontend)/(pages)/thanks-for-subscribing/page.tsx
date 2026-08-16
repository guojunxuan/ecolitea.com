import type { Metadata } from 'next'

import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { canonicalURL, noIndexFollowRobots } from '@root/seo/metadata'

import { ThanksForSubscribingPage } from './client_page'

const description = 'Thank you for subscribing to Ecolitea updates.'

export default (props) => {
  return <ThanksForSubscribingPage {...props} />
}

export const metadata: Metadata = {
  alternates: {
    canonical: canonicalURL('/thanks-for-subscribing'),
  },
  description,
  openGraph: mergeOpenGraph({
    description,
    title: 'Thanks for Subscribing | Ecolitea',
    url: canonicalURL('/thanks-for-subscribing'),
  }),
  robots: noIndexFollowRobots,
  title: 'Thanks for Subscribing',
}
