import assert from 'node:assert/strict'
import test from 'node:test'

import {
  canonicalURL,
  indexFollowRobots,
  noIndexFollowRobots,
  noIndexNoFollowRobots,
  resolvePageTitle,
} from '../src/seo/metadata'

test('builds canonical URLs on the production non-www domain', () => {
  assert.equal(canonicalURL('/'), 'https://ecolitea.com')
  assert.equal(canonicalURL('/about'), 'https://ecolitea.com/about')
  assert.equal(canonicalURL('products/example'), 'https://ecolitea.com/products/example')
  assert.equal(canonicalURL('/privacy/'), 'https://ecolitea.com/privacy')
})

test('never derives canonicals from preview or deployment domains', () => {
  assert.equal(canonicalURL('/about'), 'https://ecolitea.com/about')
  assert.equal(
    canonicalURL('/about', 'https://ecolitea.com/company'),
    'https://ecolitea.com/company',
  )
  assert.equal(
    canonicalURL('/about', 'https://preview.example.com/company'),
    'https://ecolitea.com/about',
  )
})

test('defines the approved robots policies', () => {
  assert.deepEqual(indexFollowRobots, { follow: true, index: true })
  assert.deepEqual(noIndexFollowRobots, { follow: true, index: false })
  assert.deepEqual(noIndexNoFollowRobots, { follow: false, index: false })
})

test('falls back to the CMS page title when SEO Title is empty', () => {
  assert.equal(
    resolvePageTitle({ isHomepage: false, pageTitle: 'LED Mirror Solutions', seoTitle: null }),
    'LED Mirror Solutions',
  )
  assert.equal(
    resolvePageTitle({ isHomepage: false, pageTitle: 'LED Mirror Solutions', seoTitle: 'OEM LED Mirrors' }),
    'OEM LED Mirrors',
  )
})
