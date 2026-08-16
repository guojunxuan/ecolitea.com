import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('dynamic OG rendering contains no legacy Payload brand copy', async () => {
  const source = await readFile(
    new URL('../src/app/(frontend)/api/og/route.tsx', import.meta.url),
    'utf8',
  )

  assert.doesNotMatch(source, /Payload CMS|payloadcms\.com|@payloadcms/)
  assert.match(source, /brandMetadata\.name/)
})
