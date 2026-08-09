import assert from 'node:assert/strict'
import test from 'node:test'
import * as React from 'react'

import { footerSocialIcons } from '../src/components/Footer/socialIcons'

test('footer social icons include the exact supported platform keys', () => {
  assert.deepEqual(Object.keys(footerSocialIcons), [
    'facebook',
    'instagram',
    'youtube',
    'linkedin',
    'x',
    'tiktok',
  ])
})

test('every footer social icon is React-renderable', () => {
  for (const icon of Object.values(footerSocialIcons)) {
    assert.ok(React.isValidElement(React.createElement(icon)))
  }
})
