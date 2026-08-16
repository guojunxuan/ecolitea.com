import type { Metadata } from 'next'

import { brandMetadata } from './brandMetadata'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: brandMetadata.openGraph.description,
  images: [
    {
      url: '/images/og-image.jpg',
    },
  ],
  siteName: brandMetadata.name,
  title: brandMetadata.openGraph.title,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
