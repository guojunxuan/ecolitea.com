'use client'

import type { Reference } from '@components/CMSLink'
import type { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { SerializedLexicalNode } from '@payloadcms/richtext-lexical/lexical'
import type { SerializedLabelNode } from '@root/fields/richText/features/label/LabelNode'
import type { SerializedLargeBodyNode } from '@root/fields/richText/features/largeBody/LargeBodyNode'
import type { BrBlock, CommandLineBlock, DownloadBlockType, SpotlightBlock, VideoBlock } from '@types'

import { CMSLink } from '@components/CMSLink'
import { CommandLine } from '@components/CommandLine'
import { Label } from '@components/Label'
import { LargeBody } from '@components/LargeBody'
import RichTextUpload from '@components/RichText/Upload'
import { Video } from '@components/RichText/Video'
import SpotlightAnimation from '@components/SpotlightAnimation'

import './index.scss'

import {
  type JSXConverters,
  type JSXConvertersFunction,
  RichText as SerializedRichText,
} from '@payloadcms/richtext-lexical/react'
import { Download } from '@root/components/blocks/Download'
import { getVideo } from '@root/utilities/get-video'
import React from 'react'

import type { AllowedElements } from '../SpotlightAnimation/types'
import { CustomTableJSXConverters } from './Table/index'

type Props = {
  className?: string
  content: any
}

export type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<BrBlock | CommandLineBlock | DownloadBlockType | SpotlightBlock | VideoBlock>
  | SerializedLabelNode
  | SerializedLargeBodyNode

export const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => {
  const converters: JSXConverters<NodeTypes> = {
    ...defaultConverters,
    ...CustomTableJSXConverters,
    blocks: {
      br: () => <br />,
      commandLine: ({ node }) => {
        const { command } = node.fields
        if (command) {
          return <CommandLine command={command} lexical />
        }
        return null
      },
      downloadBlock: ({ node }) => {
        return <Download {...node.fields} />
      },
      spotlight: ({ node, nodesToJSX }) => {
        const { element, richText } = node.fields

        const as: AllowedElements = (element as AllowedElements) ?? 'h2'

        const Children = nodesToJSX({
          nodes: richText?.root?.children as SerializedLexicalNode[],
        })

        return <SpotlightAnimation as={as}>{Children}</SpotlightAnimation>
      },
      video: ({ node }) => {
        const { url } = node.fields
        return url ? <Video {...getVideo(url)} /> : null
      },
    },
    label: ({ node, nodesToJSX }) => {
      return <Label>{nodesToJSX({ nodes: node.children })}</Label>
    },
    largeBody: ({ node, nodesToJSX }) => {
      return <LargeBody>{nodesToJSX({ nodes: node.children })}</LargeBody>
    },
    link: ({ node, nodesToJSX }) => {
      const fields = node.fields

      return (
        <CMSLink
          newTab={Boolean(fields?.newTab)}
          reference={fields.doc as Reference}
          type={fields.linkType === 'internal' ? 'reference' : 'custom'}
          url={fields.url}
        >
          {nodesToJSX({ nodes: node.children })}
        </CMSLink>
      )
    },
    upload: ({ node }) => {
      return <RichTextUpload node={node} />
    },
  }

  return converters
}

export const RichText: React.FC<Props> = ({ className, content }) => {
  if (!content) {
    return null
  }

  return (
    <SerializedRichText
      className={['payload-richtext', className].filter(Boolean).join(' ')}
      converters={jsxConverters}
      data={content}
    />
  )
}
