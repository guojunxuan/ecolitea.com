import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getFooterCopyright,
  getFooterEmailHref,
  getFooterPhoneHref,
} from '../src/components/Footer/content.js'

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
