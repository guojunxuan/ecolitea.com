'use client'

import type { Footer as FooterType } from '@types'

import { CMSLink } from '@components/CMSLink/index'
import { Gutter } from '@components/Gutter/index'
import { Media } from '@components/Media/index'
import { getFooterSocialPlatformLabel } from '@root/globals/footerSocials.js'
import React, { useId, useState } from 'react'

import { getFooterCopyright, getFooterEmailHref, getFooterPhoneHref } from './content.js'
import { getNextFooterAccordionItem } from './navigation.js'
import { footerSocialIcons } from './socialIcons'

import classes from './index.module.scss'

const hasFooterSocialIcon = (platform: unknown): platform is keyof typeof footerSocialIcons =>
  typeof platform === 'string' && Object.prototype.hasOwnProperty.call(footerSocialIcons, platform)

export const Footer: React.FC<FooterType> = (props) => {
  const {
    brand,
    columns: columnsFromProps,
    companyName,
    contact,
    copyrightText,
    newsletter,
    socialLinks: socialLinksFromProps,
  } = props
  const columns = columnsFromProps ?? []
  const socialLinks = socialLinksFromProps ?? []
  const [openColumnID, setOpenColumnID] = useState<null | string>(null)
  const accordionID = useId()
  const currentYear = new Date().getFullYear()
  const phoneHref = getFooterPhoneHref(contact?.phone)
  const emailHref = getFooterEmailHref(contact?.email)

  return (
    <footer className={classes.footer} data-theme="dark">
      <Gutter className={classes.gutter}>
        <div className={classes.container}>
          <div className={classes.content}>
            <section className={classes.brand}>
              {brand?.logo && typeof brand.logo !== 'string' ? (
                <Media alt={brand.logoAlt || ''} className={classes.logo} resource={brand.logo} />
              ) : null}

              {typeof brand?.tagline === 'string' && brand.tagline.trim() ? (
                <p className={classes.tagline}>{brand.tagline}</p>
              ) : null}

              <ul aria-label="Social media" className={classes.socialLinks}>
                {socialLinks.map(({ id, platform, url }, index) => {
                  if (!hasFooterSocialIcon(platform) || typeof url !== 'string' || !url.trim()) {
                    return null
                  }

                  const Icon = footerSocialIcons[platform]

                  return (
                    <li key={id || `${platform}-${index}`}>
                      <a
                        aria-label={getFooterSocialPlatformLabel(platform)}
                        className={classes.socialLink}
                        href={url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span aria-hidden="true">
                          <Icon />
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </section>

            <nav aria-label="Footer" className={classes.navigation}>
              <div
                className={classes.desktopNavigation}
                style={
                  {
                    '--footer-column-count': Math.max(columns.length, 1),
                  } as React.CSSProperties
                }
              >
                {columns.map((column, columnIndex) => (
                  <section
                    className={classes.navigationGroup}
                    key={column.id || `desktop-column-${columnIndex}`}
                  >
                    <h2 className={classes.navigationHeading}>{column.label}</h2>
                    <div className={classes.navigationLinks}>
                      {column.navItems?.map(({ id, link }, linkIndex) => (
                        <CMSLink
                          className={classes.navigationLink}
                          key={id || `${link.label || 'link'}-${linkIndex}`}
                          {...link}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className={classes.mobileNavigation}>
                {columns.map((column, columnIndex) => {
                  const columnID = column.id || `${accordionID}-column-${columnIndex}`
                  const panelID = `${accordionID}-panel-${columnIndex}`
                  const isOpen = openColumnID === columnID

                  return (
                    <div className={classes.navigationGroup} key={columnID}>
                      <button
                        aria-controls={panelID}
                        aria-expanded={isOpen}
                        className={classes.navigationTrigger}
                        onClick={() =>
                          setOpenColumnID((current) =>
                            getNextFooterAccordionItem(current, columnID),
                          )
                        }
                        type="button"
                      >
                        <span>{column.label}</span>
                        <span aria-hidden="true" className={classes.navigationArrow} />
                      </button>
                      <div className={classes.navigationPanel} hidden={!isOpen} id={panelID}>
                        {column.navItems?.map(({ id, link }, linkIndex) => (
                          <CMSLink
                            className={classes.navigationLink}
                            key={id || `${link.label || 'link'}-${linkIndex}`}
                            {...link}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </nav>

            <section className={classes.details}>
              <div className={classes.newsletter}>
                {typeof newsletter?.heading === 'string' && newsletter.heading.trim() ? (
                  <h2>{newsletter.heading}</h2>
                ) : null}
                {typeof newsletter?.description === 'string' && newsletter.description.trim() ? (
                  <p>{newsletter.description}</p>
                ) : null}
                <div className={classes.subscribePlaceholder}>
                  <input
                    aria-label="Email address"
                    disabled
                    placeholder={newsletter?.emailPlaceholder || ''}
                    type="email"
                  />
                  <button disabled type="button">
                    Subscribe
                  </button>
                </div>
              </div>

              <address className={classes.contact}>
                {contact?.address ? <p>{contact.address}</p> : null}
                {phoneHref ? <a href={phoneHref}>{contact?.phone}</a> : null}
                {emailHref ? <a href={emailHref}>{contact?.email}</a> : null}
              </address>
            </section>
          </div>

          <div className={classes.copyright}>
            <p>{getFooterCopyright(currentYear, companyName, copyrightText)}</p>
          </div>
        </div>
      </Gutter>
    </footer>
  )
}
