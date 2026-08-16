import assert from 'node:assert/strict'
import test from 'node:test'

import { brandMetadata, brandViewport } from '../src/seo/brandMetadata'

test('defines the approved Ecolitea brand metadata', () => {
  assert.equal(brandMetadata.name, 'Ecolitea')
  assert.equal(brandMetadata.displayName, 'ECOLITEA')
  assert.equal(brandMetadata.siteURL, 'https://ecolitea.com')
  assert.equal(brandMetadata.language, 'en')
  assert.equal(
    brandMetadata.homepageTitle,
    'LED Lighting & Illuminated Mirror Solutions | Ecolitea',
  )
  assert.equal(brandMetadata.titleTemplate, '%s | Ecolitea')
  assert.equal(
    brandMetadata.description,
    'Ecolitea provides LED lighting and illuminated mirror solutions for commercial, residential and OEM/ODM projects worldwide.',
  )
  assert.equal(brandMetadata.openGraph.title, 'Ecolitea — Illuminate the Future')
  assert.equal(
    brandMetadata.openGraph.description,
    'Explore LED lighting and illuminated mirror solutions engineered for modern spaces and professional projects.',
  )
  assert.equal(brandMetadata.twitterAccount, null)
})

test('defines the approved light-only browser theme', () => {
  assert.equal(brandMetadata.primaryColor, '#000000')
  assert.deepEqual(brandViewport, {
    colorScheme: 'light',
    initialScale: 1,
    themeColor: '#FFFFFF',
    viewportFit: 'cover',
    width: 'device-width',
  })
})
