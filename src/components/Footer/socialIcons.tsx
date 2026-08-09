import type { ComponentType } from 'react'

import type { Footer } from '@root/payload-types'

import { FacebookIcon } from '../../graphics/FacebookIcon'
import { InstagramIcon } from '../../graphics/InstagramIcon'
import { LinkedInIcon } from '../../graphics/LinkedInIcon'
import { TikTokIcon } from '../../graphics/TikTokIcon'
import { TwitterIconAlt } from '../../graphics/TwitterIconAlt'
import { YoutubeIcon } from '../../graphics/YoutubeIcon'

type FooterSocialPlatform = NonNullable<Footer['socialLinks']>[number]['platform']

export const footerSocialIcons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedInIcon,
  x: TwitterIconAlt,
  tiktok: TikTokIcon,
} as const satisfies Record<FooterSocialPlatform, ComponentType>
