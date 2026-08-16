import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { NextRequest } from 'next/server'

import { externalServices, getAllowedOrigins } from '../src/config/externalServices'

test('keeps optional integrations disabled by default', () => {
  assert.equal(externalServices.analyticsDashboard, false)
  assert.equal(externalServices.metaPixel, false)
  assert.equal(externalServices.email.fromName, 'Ecolitea')
  assert.equal(externalServices.email.fromAddress, null)
})

test('allows only Ecolitea and configured application origins in production', () => {
  assert.deepEqual(getAllowedOrigins(true, 'https://cms.ecolitea.com'), [
    'https://ecolitea.com',
    'https://cms.ecolitea.com',
  ])
  assert.deepEqual(getAllowedOrigins(true, 'https://ecolitea-preview.vercel.app'), [
    'https://ecolitea.com',
  ])
})

test('adds localhost only outside production', () => {
  assert.deepEqual(getAllowedOrigins(false, 'http://localhost:3000'), [
    'https://ecolitea.com',
    'http://localhost:3000',
  ])
})

test('requires active consent globally and contains no Meta Pixel integration', async () => {
  const privacySource = await readFile(
    new URL('../src/providers/Privacy/index.tsx', import.meta.url),
    'utf8',
  )
  const analyticsSource = await readFile(
    new URL('../src/utilities/analytics.ts', import.meta.url),
    'utf8',
  )

  assert.doesNotMatch(privacySource, /\/api\/locate|react-facebook-pixel/)
  assert.doesNotMatch(analyticsSource, /FACEBOOK_PIXEL|react-facebook-pixel/)
  assert.match(privacySource, /setShowConsent\(true\)/)
})

test('removes legacy Payload email, auto-login, and CORS values', async () => {
  const payloadConfig = await readFile(new URL('../src/payload.config.ts', import.meta.url), 'utf8')

  assert.doesNotMatch(payloadConfig, /dev2@payloadcms\.com|info@payloadcms\.com/)
  assert.doesNotMatch(payloadConfig, /https:\/\/payloadcms\.com|https:\/\/discord\.com\/api/)
  assert.doesNotMatch(payloadConfig, /autoLogin:/)
  assert.doesNotMatch(payloadConfig, /googleAnalytics\(/)
})

test('returns 404 from disabled analytics dashboard APIs', async () => {
  const routes = await Promise.all([
    import('../src/app/api/analytics/active-users/route.js'),
    import('../src/app/api/analytics/channel-groups/route.js'),
    import('../src/app/api/analytics/pageviews/route.js'),
  ])

  const responses = await Promise.all(
    routes.map(({ GET }) => GET(new NextRequest('https://ecolitea.com'))),
  )
  assert.deepEqual(
    responses.map((response) => response.status),
    [404, 404, 404],
  )
})
