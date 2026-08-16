import assert from 'node:assert/strict'
import test from 'node:test'

import { seoOverrideFields } from '../src/fields/seoOverrides'

test('defines reusable canonical and noindex controls', () => {
  assert.deepEqual(
    seoOverrideFields.map((field) => ('name' in field ? field.name : undefined)),
    ['noindex', 'canonical'],
  )

  const [noindex, canonical] = seoOverrideFields
  assert.equal('defaultValue' in noindex ? noindex.defaultValue : undefined, false)
  assert.equal('admin' in noindex ? noindex.admin?.position : undefined, 'sidebar')
  assert.equal('admin' in canonical ? canonical.admin?.position : undefined, 'sidebar')
})
