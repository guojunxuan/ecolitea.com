"use client";

import type { Footer as FooterType } from "@types";

import { CMSLink } from "@components/CMSLink/index";
import { Gutter } from "@components/Gutter/index";
import { Media } from "@components/Media/index";
import { getFooterSocialPlatformLabel } from "@root/globals/footerSocials.js";
import React, { useId, useState } from "react";

import {
  getFooterCopyright,
  getFooterLogoResource,
  getSafeFooterLink,
  isSafeFooterSocialURL,
  normalizeFooterRows,
} from "./content.js";
import { getFooterContactItems } from "./contact.js";
import { FooterContactList } from "./ContactList";
import { getNextFooterAccordionItem } from "./navigation.js";
import { footerSocialIcons } from "./socialIcons";

import classes from "./index.module.scss";

const hasFooterSocialIcon = (
  platform: unknown,
): platform is keyof typeof footerSocialIcons =>
  typeof platform === "string" &&
  Object.prototype.hasOwnProperty.call(footerSocialIcons, platform);

const isFooterRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const Footer: React.FC<FooterType> = (props) => {
  const {
    brand,
    columns: columnsFromProps,
    companyName,
    contact,
    copyrightText,
    newsletter,
    socialLinks: socialLinksFromProps,
  } = props;
  const columns = normalizeFooterRows(columnsFromProps);
  const socialLinks = normalizeFooterRows(socialLinksFromProps);
  const contactItems = getFooterContactItems(contact);
  const [openColumnID, setOpenColumnID] = useState<null | string>(null);
  const accordionID = useId();
  const currentYear = new Date().getUTCFullYear();
  const logoResource = getFooterLogoResource(brand?.logo, brand?.logoAlt);

  return (
    <footer className={classes.footer} data-theme="dark">
      <Gutter className={classes.gutter}>
        <div className={classes.container}>
          <div className={classes.content}>
            <section className={classes.brand}>
              {logoResource ? (
                <Media
                  alt={brand?.logoAlt || ""}
                  className={classes.logo}
                  resource={logoResource}
                />
              ) : null}

              {typeof brand?.tagline === "string" && brand.tagline.trim() ? (
                <p className={classes.tagline}>{brand.tagline}</p>
              ) : null}

              <ul aria-label="Social media" className={classes.socialLinks}>
                {socialLinks.map((socialLink, index) => {
                  if (!isFooterRecord(socialLink)) return null;

                  const { id, platform, url } = socialLink;
                  if (
                    !hasFooterSocialIcon(platform) ||
                    typeof url !== "string" ||
                    !isSafeFooterSocialURL(url)
                  ) {
                    return null;
                  }

                  const Icon = footerSocialIcons[platform];

                  return (
                    <li
                      key={
                        (typeof id === "string" && id) || `${platform}-${index}`
                      }
                    >
                      <a
                        aria-label={getFooterSocialPlatformLabel(platform)}
                        className={classes.socialLink}
                        href={url.trim()}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span aria-hidden="true">
                          <Icon />
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>

            <nav aria-label="Footer" className={classes.navigation}>
              <div
                className={classes.desktopNavigation}
                style={
                  {
                    "--footer-column-count": Math.max(columns.length, 1),
                  } as React.CSSProperties
                }
              >
                {columns.map((column, columnIndex) => {
                  if (!isFooterRecord(column)) return null;

                  const { id, label, navItems: navItemsFromColumn } = column;
                  if (typeof label !== "string" || !label.trim()) return null;

                  const navItems = normalizeFooterRows(navItemsFromColumn);
                  const columnKey =
                    (typeof id === "string" && id) ||
                    `desktop-column-${columnIndex}`;

                  return (
                    <section
                      className={classes.navigationGroup}
                      key={columnKey}
                    >
                      <h2 className={classes.navigationHeading}>{label}</h2>
                      <div className={classes.navigationLinks}>
                        {navItems.map((navItem, linkIndex) => {
                          if (!isFooterRecord(navItem)) return null;

                          const safeLink = getSafeFooterLink(
                            navItem.link,
                            "desktop",
                          );
                          if (!safeLink) return null;

                          const navItemID = navItem.id;
                          const linkLabel = safeLink.label;

                          return (
                            <CMSLink
                              {...safeLink}
                              className={classes.navigationLink}
                              key={
                                (typeof navItemID === "string" && navItemID) ||
                                `${typeof linkLabel === "string" ? linkLabel : "link"}-${linkIndex}`
                              }
                            />
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className={classes.mobileNavigation}>
                {columns.map((column, columnIndex) => {
                  if (!isFooterRecord(column)) return null;

                  const { id, label, navItems: navItemsFromColumn } = column;
                  if (typeof label !== "string" || !label.trim()) return null;

                  const navItems = normalizeFooterRows(navItemsFromColumn);
                  const columnID =
                    (typeof id === "string" && id) ||
                    `${accordionID}-column-${columnIndex}`;
                  const panelID = `${accordionID}-panel-${columnIndex}`;
                  const isOpen = openColumnID === columnID;

                  return (
                    <div className={classes.navigationGroup} key={columnID}>
                      <h2 className={classes.mobileNavigationHeading}>
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
                          <span>{label}</span>
                          <span
                            aria-hidden="true"
                            className={classes.navigationArrow}
                          />
                        </button>
                      </h2>
                      <div
                        className={classes.navigationPanel}
                        hidden={!isOpen}
                        id={panelID}
                      >
                        {navItems.map((navItem, linkIndex) => {
                          if (!isFooterRecord(navItem)) return null;

                          const safeLink = getSafeFooterLink(
                            navItem.link,
                            "mobile",
                          );
                          if (!safeLink) return null;

                          const navItemID = navItem.id;
                          const linkLabel = safeLink.label;

                          return (
                            <CMSLink
                              {...safeLink}
                              className={classes.navigationLink}
                              key={
                                (typeof navItemID === "string" && navItemID) ||
                                `${typeof linkLabel === "string" ? linkLabel : "link"}-${linkIndex}`
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </nav>

            <section className={classes.details}>
              <div className={classes.newsletter}>
                {typeof newsletter?.heading === "string" &&
                newsletter.heading.trim() ? (
                  <h2>{newsletter.heading}</h2>
                ) : null}
                {typeof newsletter?.description === "string" &&
                newsletter.description.trim() ? (
                  <p>{newsletter.description}</p>
                ) : null}
                <div className={classes.subscribePlaceholder}>
                  <input
                    aria-label="Email address"
                    disabled
                    placeholder={newsletter?.emailPlaceholder || ""}
                    type="email"
                  />
                  <button disabled type="button">
                    Subscribe
                  </button>
                </div>
              </div>

              <FooterContactList
                classNames={{
                  contact: classes.contact,
                  contactIcon: classes.contactIcon,
                  contactItem: classes.contactItem,
                  contactList: classes.contactList,
                  contactText: classes.contactText,
                }}
                items={contactItems}
              />
            </section>
          </div>

          <div className={classes.copyright}>
            <p suppressHydrationWarning>
              {getFooterCopyright(currentYear, companyName, copyrightText)}
            </p>
          </div>
        </div>
      </Gutter>
    </footer>
  );
};
