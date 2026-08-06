import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Media: CollectionConfig<'media'> = {
  slug: 'media',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
    ],

    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'darkModeFallback',
      type: 'upload',
      admin: {
        description: 'Choose an upload to render if the visitor is using dark mode.',
      },
      relationTo: 'media',
    },
  ],
}
