import { NextResponse } from 'next/server'
import { featureFlags } from '@root/features'

import syncToAlgolia from '../../../../scripts/syncToAlgolia'

export async function GET(): Promise<NextResponse> {
  if (!featureFlags.communityHelp) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await syncToAlgolia()

  return NextResponse.json((JSON.stringify({ success: true }), { status: 200 }))
}
