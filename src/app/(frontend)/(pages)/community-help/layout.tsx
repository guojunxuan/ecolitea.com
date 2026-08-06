import type { Metadata } from 'next'
import { featureFlags } from '@root/features'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  description:
    'Find what you need faster. The Payload Community Help archive is a great place to start.',
  title: {
    absolute: 'Community Help | Payload',
    template: '%s | Community Help | Payload',
  },
}

export default async ({ children }) => {
  if (!featureFlags.communityHelp) {
    notFound()
  }

  return <>{children}</>
}
