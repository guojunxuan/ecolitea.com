import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const fromTest = (path: string) => new URL(path, import.meta.url)

test('does not register removed Community Help, Partners, or release-note features', async () => {
  const payloadConfig = await readFile(fromTest('../src/payload.config.ts'), 'utf8')

  assert.doesNotMatch(
    payloadConfig,
    /CommunityHelp|Partners|PartnerProgram|PartnerFilters|createReleasePost/,
  )
})

test('removes retired frontend routes and integration APIs', () => {
  const removedPaths = [
    '../src/app/(frontend)/(pages)/community-help/page.tsx',
    '../src/app/(frontend)/(pages)/partners/page.tsx',
    '../src/app/(frontend)/api/sync-ch/route.ts',
    '../src/app/(frontend)/api/locate/route.ts',
    '../src/app/(frontend)/(pages)/styleguide/page.tsx',
    '../src/app/(frontend)/gh/page.tsx',
    '../src/collections/CommunityHelp/index.ts',
    '../src/collections/Partners.ts',
    '../src/collections/PartnerFilters.ts',
    '../src/globals/PartnerProgram.ts',
  ]

  for (const path of removedPaths) {
    assert.equal(existsSync(fromTest(path)), false, `${path} should be removed`)
  }
})

test('removes user-facing Payload promotional components', () => {
  const removedPaths = [
    '../src/components/CreatePayloadApp/index.tsx',
    '../src/components/Payload3D/index.tsx',
    '../src/graphics/PayloadIcon/index.tsx',
    '../public/images/payload-mask.svg',
  ]

  for (const path of removedPaths) {
    assert.equal(existsSync(fromTest(path)), false, `${path} should be removed`)
  }
})

test('uses the Ecolitea project name in package tooling output', async () => {
  const packageJSON = JSON.parse(await readFile(fromTest('../package.json'), 'utf8'))

  assert.equal(packageJSON.name, 'ecolitea-website')
})

test('uses Ecolitea names for project-owned CMS integration code', async () => {
  const ownedSources = await Promise.all(
    [
      '../src/components/EcoliteaRedirects/index.tsx',
      '../src/components/RefreshRouterOnSave/index.tsx',
      '../src/components/RichText/index.tsx',
      '../src/components/RichText/index.scss',
      '../src/providers/ToastContainer/index.tsx',
      '../src/css/toasts.scss',
    ].map((path) => readFile(fromTest(path), 'utf8')),
  )

  assert.equal(existsSync(fromTest('../src/components/PayloadRedirects')), false)
  assert.doesNotMatch(
    ownedSources.join('\n'),
    /PayloadRedirects|PayloadLivePreview|payload-richtext|payload-toast-/,
  )
})

test('contains no retired feature copy in active frontend components', async () => {
  const activeSources = await Promise.all(
    [
      '../src/components/blocks/CaseStudiesHighlight/index.tsx',
      '../src/components/blocks/CallToAction/index.tsx',
      '../src/components/blocks/Pricing/index.tsx',
      '../src/components/Hero/Three/index.tsx',
      '../src/globals/GetStarted.ts',
    ].map((path) => readFile(fromTest(path), 'utf8')),
  )

  assert.doesNotMatch(
    activeSources.join('\n'),
    /Powered by Payload|CreatePayloadApp|enableCreatePayload|Get started with Payload/,
  )
})
