'use client'

import type { PayloadClientReactComponent, RowLabelComponent } from 'payload'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

import { getFooterSocialPlatformLabel } from './footerSocials.js'

const CustomRowLabelSocialLinks: PayloadClientReactComponent<RowLabelComponent> = () => {
  const { data } = useRowLabel<{ platform?: string }>()

  return getFooterSocialPlatformLabel(data?.platform)
}

export default CustomRowLabelSocialLinks
