import type { CMSLinkType } from '@components/CMSLink/index'
import type { SerializedUploadNode } from '@payloadcms/richtext-lexical'
import type { Media as MediaType } from '@types'
import type { TypedUploadCollection, UploadCollectionSlug } from 'payload'

import { CMSLink } from '@components/CMSLink/index'
import { Media } from '@components/Media/index'
import React from 'react'

export type Props = {
  className?: string
  node: SerializedUploadNode
}

export const RichTextUpload: React.FC<Props> = ({ className, node: { fields, value } }) => {
  const Wrap: React.ComponentType<CMSLinkType> | string = fields?.enableLink ? CMSLink : 'div'
  const wrapProps: CMSLinkType = fields?.enableLink ? { ...fields.link } : {}

  return (
    typeof value !== 'string' &&
    typeof value !== 'number' && (
      <div className={className}>
        <Wrap {...wrapProps}>
          <Media resource={value as TypedUploadCollection[UploadCollectionSlug]} />
        </Wrap>
      </div>
    )
  )
}

export default RichTextUpload
