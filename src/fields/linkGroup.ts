import type { ArrayField, Field } from 'payload'

import type { LinkAppearances } from './link'

import deepMerge from '../utilities/deepMerge'
import link from './link'

type LinkGroupType = (options?: {
  appearances?: false | LinkAppearances[]
  overrides?: Partial<ArrayField>
}) => Field

const linkGroup: LinkGroupType = ({ appearances, overrides = {} } = {}) => {
  const generatedLinkGroup: Field = {
    name: 'links',
    type: 'array',
    fields: [link({ appearances })],
  }

  return deepMerge(generatedLinkGroup, overrides)
}

export default linkGroup
