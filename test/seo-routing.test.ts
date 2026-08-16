import assert from 'node:assert/strict'
import test from 'node:test'

import sitemapConfig from '../next-sitemap.config.cjs'
import { redirects } from '../redirects.js'

test('redirects the www host to the production non-www domain', async () => {
  const rules = await redirects()
  const wwwRedirect = rules.find((rule) =>
    rule.has?.some(
      (condition) => condition.type === 'host' && condition.value === 'www.ecolitea.com',
    ),
  )

  assert.deepEqual(wwwRedirect, {
    destination: 'https://ecolitea.com/:path*',
    has: [{ type: 'host', value: 'www.ecolitea.com' }],
    permanent: true,
    source: '/:path*',
  })
})

test('generates sitemap and robots entries on the Ecolitea domain', () => {
  assert.equal(sitemapConfig.siteUrl, 'https://ecolitea.com')
  assert.equal(sitemapConfig.generateRobotsTxt, true)
  assert.ok(sitemapConfig.exclude.includes('/thanks-for-subscribing'))
  assert.deepEqual(sitemapConfig.robotsTxtOptions.policies[0].disallow, [
    '/admin/',
    '/api/',
    '/preview/',
  ])
})
