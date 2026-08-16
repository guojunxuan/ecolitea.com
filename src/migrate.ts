import config from '@payload-config'
import { migrateSlateToLexical } from '@payloadcms/richtext-lexical/migrate'
import { getPayload } from 'payload'

async function run() {
  const ecoliteaCMS = await getPayload({ config })

  await migrateSlateToLexical({ payload: ecoliteaCMS })
  process.exit(0)
}

void run()
