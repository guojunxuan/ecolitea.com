import { formatPermalink } from './src/utilities/formatPermalink.js'

export const redirects = async () => {
  const staticRedirects = [
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'www.ecolitea.com',
        },
      ],
      destination: 'https://ecolitea.com/:path*',
      permanent: true,
    },
    {
      source: '/blog',
      destination: '/posts/blog',
      permanent: true,
    },
    {
      source: '/blog/:slug',
      destination: '/posts/blog/:slug',
      permanent: true,
    },
  ]

  const internetExplorerRedirect = {
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    destination: '/ie-incompatible.html',
  }

  const redirects = [...staticRedirects, internetExplorerRedirect]

  return redirects
}
