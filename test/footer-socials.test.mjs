import assert from 'node:assert/strict'
import test from 'node:test'

import {
  footerSocialPlatformLabels,
  footerSocialPlatformOptions,
  validateFooterSocialURL,
  validateUniqueSocialPlatforms,
} from '../src/globals/footerSocials.js'

test('provides the exact labels for supported footer social platforms', () => {
  assert.deepEqual(footerSocialPlatformLabels, {
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
    linkedin: 'LinkedIn',
    x: 'X',
    tiktok: 'TikTok',
  })
  assert.deepEqual(footerSocialPlatformOptions, [
    { label: 'Facebook', value: 'facebook' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'YouTube', value: 'youtube' },
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'X', value: 'x' },
    { label: 'TikTok', value: 'tiktok' },
  ])
})

test('accepts undefined and unique social platform arrays', () => {
  assert.equal(validateUniqueSocialPlatforms(undefined), true)
  assert.equal(validateUniqueSocialPlatforms([{ platform: 'facebook' }, { platform: 'instagram' }]), true)
  assert.equal(validateUniqueSocialPlatforms([null, { platform: 'facebook' }]), true)
})

test('rejects duplicate social platforms', () => {
  assert.equal(
    validateUniqueSocialPlatforms([{ platform: 'facebook' }, { platform: 'facebook' }]),
    'Each social platform can only be added once.',
  )
})

test('validates HTTPS social URLs', () => {
  assert.equal(validateFooterSocialURL(undefined), 'URL is required.')
  assert.equal(validateFooterSocialURL('https://example.com/account'), true)
  assert.equal(validateFooterSocialURL('http://example.com/account'), 'Use an HTTPS URL.')
  assert.equal(validateFooterSocialURL('not a url'), 'Enter a valid URL.')
})
