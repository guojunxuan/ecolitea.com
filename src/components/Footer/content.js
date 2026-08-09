const getPopulatedText = (value) => (typeof value === 'string' ? value.trim() : '')

const hasOwn = (value, key) => {
  try {
    return Object.prototype.hasOwnProperty.call(value, key)
  } catch {
    return false
  }
}

const getOwn = (value, key) => {
  try {
    return hasOwn(value, key) ? value[key] : undefined
  } catch {
    return undefined
  }
}

const isObjectRecord = (value) => {
  try {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false

    const prototype = Object.getPrototypeOf(value)

    return prototype === Object.prototype || prototype === null
  } catch {
    return false
  }
}

export const normalizeFooterRows = (value) => {
  try {
    if (!Array.isArray(value)) return []

    return value.filter((row) => isObjectRecord(row) && Object.keys(row).length > 0)
  } catch {
    return []
  }
}

export const getFooterLogoResource = (resource, footerAlt) => {
  if (!isObjectRecord(resource)) return null

  try {
    return {
      ...resource,
      alt: getPopulatedText(footerAlt),
    }
  } catch {
    return null
  }
}

export const isSafeFooterSocialURL = (value) => {
  const url = getPopulatedText(value)
  if (!url) return false

  try {
    const parsedURL = new URL(url)

    return parsedURL.protocol === 'https:' && Boolean(parsedURL.hostname)
  } catch {
    return false
  }
}

const isSafeFooterCustomURL = (value) => {
  const url = getPopulatedText(value)
  if (!url || /[\u0000-\u001F\u007F]/.test(url) || url.startsWith('//')) return false

  if (url.startsWith('/')) return !url.startsWith('/\\')
  if (url.startsWith('#')) return url.length > 1

  try {
    const parsedURL = new URL(url)

    if (parsedURL.protocol === 'http:' || parsedURL.protocol === 'https:') {
      return Boolean(parsedURL.hostname)
    }

    if (parsedURL.protocol === 'mailto:' || parsedURL.protocol === 'tel:') {
      return url.slice(url.indexOf(':') + 1).trim().length > 0
    }

    return false
  } catch {
    return false
  }
}

const footerReferenceRelations = {
  'case-studies': true,
  pages: true,
  posts: true,
}

const isSafeFooterSlug = (value) => typeof value === 'string' && /^[\p{L}\p{N}_-]+$/u.test(value)

const isSafeFooterReference = (reference) => {
  if (!isObjectRecord(reference)) return false

  const relationTo = getOwn(reference, 'relationTo')
  const value = getOwn(reference, 'value')
  if (
    typeof relationTo !== 'string' ||
    !hasOwn(footerReferenceRelations, relationTo) ||
    !isObjectRecord(value)
  ) {
    return false
  }

  if (relationTo === 'pages') {
    const breadcrumbs = getOwn(value, 'breadcrumbs')

    try {
      if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
        const finalBreadcrumb = breadcrumbs[breadcrumbs.length - 1]

        return (
          isObjectRecord(finalBreadcrumb) && isSafeFooterCustomURL(getOwn(finalBreadcrumb, 'url'))
        )
      }
    } catch {
      return false
    }
  }

  return isSafeFooterSlug(getOwn(value, 'slug'))
}

export const getSafeFooterLink = (link, view) => {
  if (!isObjectRecord(link) || (view !== 'desktop' && view !== 'mobile')) return null

  const label = getOwn(link, 'label')
  const type = getOwn(link, 'type')
  const customId = getOwn(link, 'customId')
  const url = getOwn(link, 'url')

  if (typeof label !== 'string' || !label.trim()) return null

  if (type === 'reference') {
    const reference = getOwn(link, 'reference')
    if (!isSafeFooterReference(reference)) return null
  } else if ((type === 'custom' || type === undefined) && !isSafeFooterCustomURL(url)) {
    return null
  } else if (type !== 'custom' && type !== undefined) {
    return null
  }

  try {
    const safeLink = { ...link }

    if (typeof customId === 'string' && customId.trim()) {
      safeLink.customId = `${customId.trim()}-footer-${view}`
    } else if (hasOwn(safeLink, 'customId')) {
      delete safeLink.customId
    }

    if (typeof url === 'string') safeLink.url = url.trim()

    return safeLink
  } catch {
    return null
  }
}

export const getFooterCopyright = (year, companyName, copyrightText) => {
  const company = getPopulatedText(companyName)
  const text = getPopulatedText(copyrightText)
  const companyWithPunctuation = company && !/[.!?]$/.test(company) ? `${company}.` : company

  return [`© ${year}`, companyWithPunctuation, text].filter(Boolean).join(' ')
}

export const getFooterPhoneHref = (phone) => {
  const value = getPopulatedText(phone)

  if (!value) return null

  const digits = value.replace(/\D/g, '')
  if (!digits) return null

  return `tel:${value.startsWith('+') ? '+' : ''}${digits}`
}

export const getFooterEmailHref = (email) => {
  const value = getPopulatedText(email)

  return value ? `mailto:${value}` : null
}
