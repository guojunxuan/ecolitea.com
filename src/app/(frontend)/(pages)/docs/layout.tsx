import { featureFlags } from '@root/features'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

export default function DocsLayout({ children }: { children: ReactNode }) {
  if (!featureFlags.docs) {
    notFound()
  }

  return children
}
