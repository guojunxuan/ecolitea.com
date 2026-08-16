'use client'
import { RefreshRouteOnSave as EcoliteaLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export const RefreshRouteOnSave: React.FC = () => {
  const router = useRouter()

  return (
    <EcoliteaLivePreview
      refresh={() => router.refresh()}
      serverURL={process.env.NEXT_PUBLIC_SITE_URL || ''}
    />
  )
}
