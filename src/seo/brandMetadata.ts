import type { Viewport } from 'next'

export const brandMetadata = {
  description:
    'Ecolitea provides LED lighting and illuminated mirror solutions for commercial, residential and OEM/ODM projects worldwide.',
  displayName: 'ECOLITEA',
  homepageTitle: 'LED Lighting & Illuminated Mirror Solutions | Ecolitea',
  language: 'en',
  name: 'Ecolitea',
  openGraph: {
    description:
      'Explore LED lighting and illuminated mirror solutions engineered for modern spaces and professional projects.',
    title: 'Ecolitea — Illuminate the Future',
  },
  primaryColor: '#000000',
  siteURL: 'https://ecolitea.com',
  titleTemplate: '%s | Ecolitea',
  twitterAccount: null,
} as const

export const brandViewport: Viewport = {
  colorScheme: 'light',
  initialScale: 1,
  themeColor: '#FFFFFF',
  viewportFit: 'cover',
  width: 'device-width',
}
