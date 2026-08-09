import assert from 'node:assert/strict'
import test from 'node:test'

import { footerSocialIcons } from '../src/components/Footer/socialIcons'

test('footer social icons include the supported platforms in display order', () => {
  assert.deepEqual(Object.keys(footerSocialIcons), [
    'facebook',
    'instagram',
    'youtube',
    'linkedin',
    'x',
    'tiktok',
  ])
})

test('every footer social icon is a React component function', () => {
  for (const icon of Object.values(footerSocialIcons)) {
    assert.equal(typeof icon, 'function')
  }
})
