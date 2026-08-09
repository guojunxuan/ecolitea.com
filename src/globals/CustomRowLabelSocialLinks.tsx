'use client'

import type { PayloadClientReactComponent, RowLabelComponent } from 'payload'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

import { footerSocialPlatformLabels } from './footerSocials.js'

const CustomRowLabelSocialLinks: PayloadClientReactComponent<RowLabelComponent> = () => {
  const { data } = useRowLabel<{ platform?: keyof typeof footerSocialPlatformLabels }>()

  return data.platform ? footerSocialPlatformLabels[data.platform] : 'Social link'
}

export default CustomRowLabelSocialLinks
