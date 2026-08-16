import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('uses the existing Ecolitea full logo on Payload authentication screens', async () => {
  const [payloadConfig, adminLogo] = await Promise.all([
    readFile(new URL('../src/payload.config.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/AdminLogo/index.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(payloadConfig, /graphics:\s*{\s*Logo:\s*'@root\/components\/AdminLogo'/)
  assert.match(payloadConfig, /meta:\s*{\s*titleSuffix:\s*'- Ecolitea'/)
  assert.match(adminLogo, /FullLogo/)
  assert.match(adminLogo, /aria-label="Ecolitea"/)
})

test('ignores local agent state and TypeScript incremental build files', async () => {
  const gitignore = await readFile(new URL('../.gitignore', import.meta.url), 'utf8')

  assert.match(gitignore, /^\.superpowers\/$/m)
  assert.match(gitignore, /^\*\.tsbuildinfo$/m)
})
