'use client'

import type { PayloadClientReactComponent, RowLabelComponent } from 'payload'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

import { footerSocialPlatformLabels } from './footerSocials.js'

const CustomRowLabelSocialLinks: PayloadClientReactComponent<RowLabelComponent> = () => {
  const { data } = useRowLabel<{ platform?: string }>()

  const platform = data?.platform

  if (!platform || !(platform in footerSocialPlatformLabels)) return 'Social link'

  return (
    footerSocialPlatformLabels[platform as keyof typeof footerSocialPlatformLabels] ?? 'Social link'
  )
}

export default CustomRowLabelSocialLinks
