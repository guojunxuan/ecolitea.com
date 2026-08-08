'use client'

import type { Footer as FooterType } from '@types'

import { BackgroundGrid } from '@components/BackgroundGrid/index'
import { CMSLink } from '@components/CMSLink/index'
import { Gutter } from '@components/Gutter/index'
import { NewsletterSignUp } from '@components/NewsletterSignUp'
import Payload3D from '@components/Payload3D/index'
import { Text } from '@forms/fields/Text/index'
import FormComponent from '@forms/Form/index'
import { validateEmail } from '@forms/validations'
import { ArrowIcon } from '@icons/ArrowIcon/index'
import { DiscordIcon } from '@root/graphics/DiscordIcon/index'
import { FacebookIcon } from '@root/graphics/FacebookIcon/index'
import { InstagramIcon } from '@root/graphics/InstagramIcon/index'
import { TwitterIconAlt } from '@root/graphics/TwitterIconAlt/index'
import { YoutubeIcon } from '@root/graphics/YoutubeIcon/index'
import { usePathname } from 'next/navigation'
import React from 'react'

import classes from './index.module.scss'

export const Footer: React.FC<FooterType> = (props) => {
  const { columns } = props
  const [products, developers, company] = columns ?? []
  const pathname = usePathname()

  const allowedSegments = [
    'cloud',
    'cloud-terms',
    'forgot-password',
    'join-team',
    'login',
    'logout',
    'new',
    'reset-password',
    'verify',
    'signup',
  ]

  const pathnameSegments = pathname.split('/').filter(Boolean)
  const isCloudPage = pathnameSegments.some((segment) => allowedSegments.includes(segment))

  return (
    <footer className={classes.footer} data-theme="dark">
      <BackgroundGrid
        className={[classes.background, isCloudPage ? classes.topBorder : ''].filter(Boolean).join(' ')}
        zIndex={2}
      />
      <Gutter className={classes.container}>
        <div className={[classes.grid, 'grid'].filter(Boolean).join(' ')}>
          <div className={['cols-4 cols-m-8 cols-s-8'].filter(Boolean).join(' ')}>
            <p className={classes.colHeader}>{products?.label}</p>
            <div className={classes.colItems}>
              {products?.navItems?.map(({ link }, index) => {
                return (
                  <React.Fragment key={index}>
                    <CMSLink className={classes.link} {...link} />
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          <div className={['cols-4 cols-m-8 cols-s-8'].filter(Boolean).join(' ')}>
            <p className={classes.colHeader}>{developers?.label}</p>
            <div className={classes.colItems}>
              {developers?.navItems?.map(({ link }, index) => {
                return (
                  <React.Fragment key={index}>
                    <CMSLink className={classes.link} {...link} />
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          <div className={['cols-4 cols-m-8 cols-s-8'].filter(Boolean).join(' ')}>
            <p className={classes.colHeader}>{company?.label}</p>
            <div className={classes.colItems}>
              {company?.navItems?.map(({ link }, index) => {
                return (
                  <React.Fragment key={index}>
                    <CMSLink className={classes.link} {...link} />
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          <div className={['cols-4 cols-m-4 cols-s-8'].filter(Boolean).join(' ')}>
            <p className={`${classes.colHeader} ${classes.thirdColumn}`}>Stay connected</p>
            <NewsletterSignUp />

            <div className={classes.socialLinks}>
              <a
                aria-label="Payload's Twitter page"
                className={`${classes.socialIconLink} ${classes.twitterIcon}`}
                href="https://twitter.com/payloadcms"
                rel="noopener noreferrer"
                target="_blank"
              >
                <TwitterIconAlt />
              </a>
              <a
                aria-label="Payload's Discord"
                className={classes.socialIconLink}
                href="https://discord.com/invite/r6sCXqVk3v"
                rel="noopener noreferrer"
                target="_blank"
              >
                <DiscordIcon />
              </a>
              <a
                aria-label="Payload's YouTube channel"
                className={classes.socialIconLink}
                href="https://www.youtube.com/channel/UCyrx4Wpd4SBIpqUKlkb6N1Q"
                rel="noopener noreferrer"
                target="_blank"
              >
                <YoutubeIcon />
              </a>
              <a
                aria-label="Payload's Instagram page"
                className={classes.socialIconLink}
                href="https://www.instagram.com/payloadcms/"
                rel="noopener noreferrer"
                target="_blank"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>
      </Gutter>
      <Gutter className={classes.payload3dContainer}>
        <Payload3D />
      </Gutter>
    </footer>
  )
}
