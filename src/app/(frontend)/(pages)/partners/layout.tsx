import { featureFlags } from '@root/features'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

export default function PartnersLayout({ children }: { children: ReactNode }) {
  if (!featureFlags.partners) {
    notFound()
  }

  return children
}
