import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { featureFlags } from '../features'

const Filter: (slug: string, label: string) => CollectionConfig = (slug, label) => {
  return {
    slug,
    access: {
      create: isAdmin,
      delete: isAdmin,
      read: () => featureFlags.partners,
      update: isAdmin,
    },
    admin: {
      group: 'Partner Program',
      hidden: !featureFlags.partners,
      useAsTitle: 'name',
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        label: label + ' Label',
        required: true,
        unique: true,
      },
      {
        name: 'value',
        type: 'text',
        admin: {
          description: 'Must contain only lowercase letters, numbers, hyphens, and underscores',
        },
        label: 'Value',
        required: true,
        unique: true,
      },
    ],
  }
}

export const Specialties = Filter('specialties', 'Specialty')
export const Industries = Filter('industries', 'Industry')
export const Regions = Filter('regions', 'Region')
export const Budgets = Filter('budgets', 'Budget')
