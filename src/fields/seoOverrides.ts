import type { Field } from 'payload'

export const seoOverrideFields: Field[] = [
  {
    name: 'noindex',
    type: 'checkbox',
    admin: {
      description: 'Prevent this content from appearing in search results.',
      position: 'sidebar',
    },
    defaultValue: false,
    label: 'No Index',
  },
  {
    name: 'canonical',
    type: 'text',
    admin: {
      description:
        'Optional canonical URL override. Only absolute https://ecolitea.com URLs are accepted by the frontend.',
      position: 'sidebar',
    },
    label: 'Canonical URL Override',
  },
]
