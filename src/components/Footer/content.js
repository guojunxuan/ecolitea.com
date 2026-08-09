const getPopulatedText = (value) => (typeof value === 'string' ? value.trim() : '')

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
