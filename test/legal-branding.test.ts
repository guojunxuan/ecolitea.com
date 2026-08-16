import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const legalPages = [
  '../src/app/(frontend)/(pages)/cookie/client_page.tsx',
  '../src/app/(frontend)/(pages)/privacy/page_client.tsx',
]

test('removes legacy Payload identity while retaining the full policy structure', async () => {
  const sources = await Promise.all(
    legalPages.map((page) => readFile(new URL(page, import.meta.url), 'utf8')),
  )
  const legalCopy = sources.join('\n')

  assert.doesNotMatch(legalCopy, /Payload|payloadcms\.com|legal@payloadcms\.com/i)
  assert.match(legalCopy, /Ecolitea/)
  assert.match(legalCopy, /Notice to European users/)
  assert.match(legalCopy, /Types of cookies and how we use them/)
})

test('keeps a working analytics-cookie preference control', async () => {
  const cookiePage = await readFile(new URL(legalPages[0], import.meta.url), 'utf8')

  assert.match(cookiePage, /updateCookieConsent/)
  assert.match(cookiePage, /Analytics cookies/)
  assert.match(cookiePage, /Disabled/)
  assert.match(cookiePage, /Enabled/)
})
