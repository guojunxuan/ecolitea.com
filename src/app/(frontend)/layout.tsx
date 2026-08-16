import type { Metadata, Viewport } from 'next'

import { GoogleAnalytics } from '@components/Analytics/GoogleAnalytics/index'
import { GoogleTagManager } from '@components/Analytics/GoogleTagManager/index'
import { PrivacyBanner } from '@components/PrivacyBanner/index'
import { Providers } from '@providers/index'
import { PrivacyProvider } from '@root/providers/Privacy/index'
import { brandMetadata, brandViewport } from '@root/seo/brandMetadata'
import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { indexFollowRobots } from '@root/seo/metadata'
import { GeistMono } from 'geist/font/mono'
import React from 'react'

import { untitledSans } from './fonts'
import '../../css/app.scss'

const analyticsConfigured = Boolean(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GTM_MEASUREMENT_ID,
)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html data-theme="light" lang={brandMetadata.language}>
      <PrivacyProvider>
        <head>
          <link href="/images/favicon.svg" rel="icon" />
          {analyticsConfigured && (
            <>
              <link href="https://www.googletagmanager.com" rel="preconnect" />
              <link href="https://www.google-analytics.com" rel="preconnect" />
            </>
          )}
          <GoogleAnalytics />
        </head>
        <body className={[GeistMono.variable, untitledSans.variable].join(' ')}>
          <GoogleTagManager />
          <Providers>
            {children}
            <PrivacyBanner />
          </Providers>
        </body>
      </PrivacyProvider>
    </html>
  )
}

export const metadata: Metadata = {
  applicationName: brandMetadata.name,
  creator: brandMetadata.name,
  description: brandMetadata.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || brandMetadata.siteURL),
  openGraph: mergeOpenGraph(),
  publisher: brandMetadata.name,
  robots: indexFollowRobots,
  title: {
    default: brandMetadata.homepageTitle,
    template: brandMetadata.titleTemplate,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = brandViewport
