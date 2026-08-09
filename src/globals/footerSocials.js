export const footerSocialPlatformLabels = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  x: 'X',
  tiktok: 'TikTok',
}

export const footerSocialPlatformOptions = Object.entries(footerSocialPlatformLabels).map(([value, label]) => ({
  label,
  value,
}))

export const validateFooterSocialURL = (value) => {
  if (!value) return 'URL is required.'

  try {
    return new URL(value).protocol === 'https:' ? true : 'Use an HTTPS URL.'
  } catch {
    return 'Enter a valid URL.'
  }
}

export const validateUniqueSocialPlatforms = (value) => {
  if (!Array.isArray(value)) return true

  const platforms = value.map((row) => row?.platform).filter(Boolean)
  return new Set(platforms).size === platforms.length
    ? true
    : 'Each social platform can only be added once.'
}
