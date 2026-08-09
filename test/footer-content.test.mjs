import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getFooterCopyright,
  getFooterEmailHref,
  getFooterLogoResource,
  getFooterPhoneHref,
  getSafeFooterLink,
  isSafeFooterSocialURL,
  normalizeFooterRows,
} from '../src/components/Footer/content.js'

test('normalizes footer rows to populated object records', () => {
  const column = { label: 'Products' }
  const socialLink = { platform: 'facebook', url: 'https://example.test' }

  assert.deepEqual(normalizeFooterRows(null), [])
  assert.deepEqual(normalizeFooterRows('legacy'), [])
  assert.deepEqual(
    normalizeFooterRows([
      null,
      'legacy',
      42,
      false,
      [],
      {},
      new Date(0),
      () => {},
      column,
      socialLink,
    ]),
    [column, socialLink],
  )
})

test('clones a populated footer logo with the Footer-specific alt text', () => {
  const resource = {
    alt: 'Media library alt',
    id: 'logo',
    url: '/logo.svg',
  }
  const result = getFooterLogoResource(resource, 'Footer logo alt')

  assert.deepEqual(result, {
    alt: 'Footer logo alt',
    id: 'logo',
    url: '/logo.svg',
  })
  assert.notEqual(result, resource)
  assert.equal(getFooterLogoResource('logo-id', 'Footer logo alt'), null)
  assert.equal(getFooterLogoResource(null, 'Footer logo alt'), null)
  assert.equal(getFooterLogoResource([], 'Footer logo alt'), null)
})

test('accepts only valid HTTPS footer social URLs', () => {
  assert.equal(isSafeFooterSocialURL('https://example.test/profile'), true)

  for (const value of [
    'http://example.test/profile',
    'javascript:alert(1)',
    'data:text/html,unsafe',
    'https://',
    'not a url',
    '',
    '   ',
    null,
  ]) {
    assert.equal(isSafeFooterSocialURL(value), false)
  }
})

test('accepts safe custom footer links and scopes their IDs by view', () => {
  for (const url of [
    '/products',
    '#contact',
    'http://example.test',
    'https://example.test',
    'mailto:hello@example.test',
    'tel:+8675512345678',
  ]) {
    const link = { customId: 'footer-link', label: 'Footer link', type: 'custom', url }

    assert.deepEqual(getSafeFooterLink(link, 'desktop'), {
      ...link,
      customId: 'footer-link-footer-desktop',
    })
    assert.deepEqual(getSafeFooterLink(link, 'mobile'), {
      ...link,
      customId: 'footer-link-footer-mobile',
    })
  }
})

test('accepts valid reference footer links', () => {
  const link = {
    customId: 'about',
    label: 'About',
    reference: {
      relationTo: 'pages',
      value: { slug: 'about' },
    },
    type: 'reference',
  }

  assert.deepEqual(getSafeFooterLink(link, 'desktop'), {
    ...link,
    customId: 'about-footer-desktop',
  })
})

test('rejects unsafe or malformed footer links', () => {
  for (const link of [
    null,
    'legacy',
    {},
    { label: 'Missing URL', type: 'custom' },
    { label: 'Unsafe', type: 'custom', url: 'javascript:alert(1)' },
    { label: 'Unsafe', type: 'custom', url: 'data:text/html,unsafe' },
    { label: 'Unsafe', type: 'custom', url: '//example.test' },
    { label: 'Malformed', type: 'custom', url: 'https://' },
    { label: 'Missing reference', type: 'reference' },
  ]) {
    assert.equal(getSafeFooterLink(link, 'desktop'), null)
  }
})

test('formats a complete footer copyright notice', () => {
  assert.equal(
    getFooterCopyright(2026, 'ECOLITEA', 'All rights reserved.'),
    '© 2026 ECOLITEA. All rights reserved.',
  )
})

test('formats a safe footer copyright notice when optional copy is absent', () => {
  assert.equal(getFooterCopyright(2026, undefined, null), '© 2026')
  assert.equal(getFooterCopyright(2026, 'ECOLITEA', undefined), '© 2026 ECOLITEA.')
  assert.equal(
    getFooterCopyright(2026, null, 'All rights reserved.'),
    '© 2026 All rights reserved.',
  )

  for (const result of [
    getFooterCopyright(2026, undefined, null),
    getFooterCopyright(2026, 'ECOLITEA', undefined),
    getFooterCopyright(2026, null, 'All rights reserved.'),
  ]) {
    assert.doesNotMatch(result, /undefined|null/)
  }
})

test('formats a compact telephone href and ignores blank values', () => {
  assert.equal(getFooterPhoneHref('+86 755 1234 5678'), 'tel:+8675512345678')
  assert.equal(getFooterPhoneHref('   '), null)
  assert.equal(getFooterPhoneHref(null), null)
})

test('formats an email href and ignores blank values', () => {
  assert.equal(getFooterEmailHref('hello@example.test'), 'mailto:hello@example.test')
  assert.equal(getFooterEmailHref('   '), null)
  assert.equal(getFooterEmailHref(undefined), null)
})
