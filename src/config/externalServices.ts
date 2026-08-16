import { brandMetadata } from '@root/seo/brandMetadata'

export const externalServices = {
  analyticsDashboard: false,
  email: {
    fromAddress: process.env.EMAIL_FROM_ADDRESS || null,
    fromName: process.env.EMAIL_FROM_NAME || brandMetadata.name,
  },
  metaPixel: false,
} as const

export const getAllowedOrigins = (isProduction: boolean, appURL?: string): string[] => {
  const origins: string[] = [brandMetadata.siteURL]

  if (appURL) {
    try {
      const { hostname, origin } = new URL(appURL)
      const isEcoliteaDomain = hostname === 'ecolitea.com' || hostname.endsWith('.ecolitea.com')
      const isDevelopmentDomain =
        !isProduction && (hostname === 'localhost' || hostname === '127.0.0.1')

      if (isEcoliteaDomain || isDevelopmentDomain) {
        origins.push(origin)
      }
    } catch {
      // Ignore malformed origins rather than adding them to the CORS allowlist.
    }
  }

  if (!isProduction) {
    origins.push('http://localhost:3000')
  }

  return [...new Set(origins)]
}
