"use client";

import type { MainMenu } from "@root/payload-types";

import { RichText } from "@components/RichText/index";
import { Modal, useModal } from "@faceless-ui/modal";
import { SearchIcon } from "@root/graphics/SearchIcon/index";
import { ArrowIcon } from "@root/icons/ArrowIcon/index";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { FullLogo } from "../../../graphics/FullLogo/index";
import { MenuIcon } from "../../../graphics/MenuIcon/index";
import { CMSLink } from "../../CMSLink/index";
import { getMobileNavigationAction } from "./navigation.js";
import classes from "./index.module.scss";

export const modalSlug = "mobile-nav";

type NavItems = Pick<MainMenu, "tabs">;

const PanelHeader: React.FC<{
  onClose: () => void;
  onLinkActivate: (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
}> = ({ onClose, onLinkActivate }) => {
  return (
    <div className={classes.panelHeader}>
      <button
        aria-label="Close menu"
        className={classes.closeButton}
        onClick={onClose}
        type="button"
      >
        <MenuIcon />
      </button>
      <Link
        aria-label="Full Payload Logo"
        className={classes.logo}
        href="/"
        onClick={onLinkActivate}
        prefetch={false}
      >
        <FullLogo className="w-auto h-[30px]" />
      </Link>
      <span aria-hidden="true" />
    </div>
  );
};

const MobileNavItems = ({
  onLinkActivate,
  setActiveTab,
  submenuTriggerIndexRef,
  submenuTriggerRef,
  tabs,
}) => {
  const handleSubmenuClick = (event, index) => {
    submenuTriggerIndexRef.current = index;
    submenuTriggerRef.current = event.currentTarget;
    setActiveTab(index);
  };

  return (
    <ul className={classes.mobileMenuItems}>
      {(tabs || []).map((tab, index) => {
        const { label, link } = tab;
        const action = getMobileNavigationAction(tab);

        if (action === "link") {
          return (
            <li className={classes.mobileMenuListItem} key={index}>
              <CMSLink
                {...link}
                className={classes.mobileMenuItem}
                label={label}
                onClick={onLinkActivate}
              />
            </li>
          );
        }

        return (
          <li className={classes.mobileMenuListItem} key={index}>
            <button
              className={classes.mobileMenuItem}
              onClick={(event) => handleSubmenuClick(event, index)}
              ref={(element) => {
                if (element && submenuTriggerIndexRef.current === index) {
                  submenuTriggerRef.current = element;
                }
              }}
              type="button"
            >
              <span>{label}</span>
              <ArrowIcon rotation={45} size="medium" />
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const MobileMenuModal: React.FC<
  {
    activeTab: number | undefined;
    isMenuOpen: boolean;
    onClose: () => void;
    onLinkActivate: (
      event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    ) => void;
    setActiveTab: React.Dispatch<React.SetStateAction<number | undefined>>;
  } & NavItems
> = ({
  activeTab,
  isMenuOpen,
  onClose,
  onLinkActivate,
  setActiveTab,
  tabs,
}) => {
  const backButtonRef = React.useRef<HTMLButtonElement>(null);
  const submenuTriggerIndexRef = React.useRef<number | undefined>(undefined);
  const submenuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const shouldRestoreTriggerFocus = React.useRef(false);
  const activeMenu = (tabs || [])[activeTab ?? -1];

  React.useEffect(() => {
    if (!isMenuOpen) {
      shouldRestoreTriggerFocus.current = false;

      return;
    }

    if (activeMenu) {
      const frame = window.requestAnimationFrame(() =>
        backButtonRef.current?.focus(),
      );

      return () => window.cancelAnimationFrame(frame);
    }

    if (shouldRestoreTriggerFocus.current && submenuTriggerRef.current) {
      shouldRestoreTriggerFocus.current = false;
      const frame = window.requestAnimationFrame(() =>
        submenuTriggerRef.current?.focus(),
      );

      return () => window.cancelAnimationFrame(frame);
    }
  }, [activeMenu, isMenuOpen]);

  const handleBack = React.useCallback(() => {
    shouldRestoreTriggerFocus.current = true;
    setActiveTab(undefined);
  }, [setActiveTab]);

  return (
    <Modal
      className={classes.mobileMenuModal}
      onClick={onClose}
      slug={modalSlug}
    >
      <div
        className={classes.mobileMenuPanel}
        data-theme="light"
        onClick={(event) => event.stopPropagation()}
      >
        <PanelHeader onClose={onClose} onLinkActivate={onLinkActivate} />
        {activeMenu ? (
          <SubMenuItems
            backButtonRef={backButtonRef}
            onBack={handleBack}
            onLinkActivate={onLinkActivate}
            tab={activeMenu}
          />
        ) : (
          <MobileNavItems
            onLinkActivate={onLinkActivate}
            setActiveTab={setActiveTab}
            submenuTriggerIndexRef={submenuTriggerIndexRef}
            submenuTriggerRef={submenuTriggerRef}
            tabs={tabs}
          />
        )}
      </div>
    </Modal>
  );
};

const SubMenuItems = ({ backButtonRef, onBack, onLinkActivate, tab }) => {
  return (
    <div className={classes.subMenuItems}>
      <button
        className={classes.backButton}
        onClick={onBack}
        ref={backButtonRef}
        type="button"
      >
        <ArrowIcon rotation={225} size="medium" />
        Back
      </button>
      {tab.descriptionLinks && tab.descriptionLinks.length > 0 && (
        <div className={classes.descriptionLinks}>
          {tab.descriptionLinks.map((link, linkIndex) => (
            <CMSLink
              className={classes.descriptionLink}
              key={linkIndex}
              {...link.link}
              onClick={onLinkActivate}
            >
              <ArrowIcon className={classes.linkArrow} />
            </CMSLink>
          ))}
        </div>
      )}
      {(tab.navItems || []).map((item, index) => {
        return (
          <div className={classes.linkWrap} key={index}>
            {item.style === "default" && item.defaultLink && (
              <CMSLink
                className={classes.defaultLink}
                {...item.defaultLink.link}
                label=""
                onClick={onLinkActivate}
              >
                <div className={classes.listLabelWrap}>
                  <div className={classes.listLabel}>
                    {item.defaultLink.link.label}
                    <ArrowIcon rotation={0} size="medium" />
                  </div>
                  <div className={classes.itemDescription}>
                    {item.defaultLink.description}
                  </div>
                </div>
              </CMSLink>
            )}
            {item.style === "list" && item.listLinks && (
              <div className={classes.linkList}>
                <div className={classes.tag}>{item.listLinks.tag}</div>
                <div className={classes.listWrap}>
                  {item.listLinks.links &&
                    item.listLinks.links.map((link, linkIndex) => (
                      <CMSLink
                        className={classes.link}
                        key={linkIndex}
                        {...link.link}
                        onClick={onLinkActivate}
                      >
                        {link.link?.newTab && link.link?.type === "custom" && (
                          <ArrowIcon className={classes.linkArrow} />
                        )}
                      </CMSLink>
                    ))}
                </div>
              </div>
            )}
            {item.style === "featured" && item.featuredLink && (
              <div className={classes.featuredLink}>
                <div className={classes.tag}>{item.featuredLink.tag}</div>
                {item.featuredLink?.label && (
                  <RichText
                    className={classes.featuredLinkLabel}
                    content={item.featuredLink.label}
                  />
                )}
                <div className={classes.featuredLinkWrap}>
                  {item.featuredLink.links &&
                    item.featuredLink.links.map((link, linkIndex) => (
                      <CMSLink
                        className={classes.featuredLinks}
                        key={linkIndex}
                        {...link.link}
                        onClick={onLinkActivate}
                      >
                        <ArrowIcon />
                      </CMSLink>
                    ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const MobileNav: React.FC<NavItems> = (props) => {
  const { closeAllModals, isModalOpen, openModal } = useModal();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = React.useState<number | undefined>();

  const isMenuOpen = isModalOpen(modalSlug);

  const closeMenu = React.useCallback(() => {
    setActiveTab(undefined);
    closeAllModals();
  }, [closeAllModals]);

  React.useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  React.useEffect(() => {
    const desktopMediaQuery = window.matchMedia("(min-width: 1171px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMenu();
      }
    };

    desktopMediaQuery.addEventListener("change", closeOnDesktop);

    if (desktopMediaQuery.matches) {
      closeMenu();
    }

    return () =>
      desktopMediaQuery.removeEventListener("change", closeOnDesktop);
  }, [closeMenu]);

  const handleLinkActivation = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      closeMenu();
    },
    [closeMenu],
  );

  const toggleModal = React.useCallback(() => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      setActiveTab(undefined);
      openModal(modalSlug);
    }
  }, [isMenuOpen, closeMenu, openModal]);

  return (
    <div className={classes.mobileNav}>
      <div className={classes.menuBar} data-theme="light">
        <div className={classes.menuBarContainer}>
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className={[
              classes.modalToggler,
              isMenuOpen ? classes.hamburgerOpen : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={toggleModal}
            type="button"
          >
            <MenuIcon />
          </button>
          <Link
            aria-label="Full Payload Logo"
            className={classes.logo}
            href="/"
            prefetch={false}
          >
            <FullLogo className="w-auto h-[30px]" />
          </Link>
          <button
            aria-label="Search site"
            className={classes.searchButton}
            type="button"
          >
            <SearchIcon />
          </button>
        </div>
      </div>
      <MobileMenuModal
        {...props}
        activeTab={activeTab}
        isMenuOpen={isMenuOpen}
        onClose={closeMenu}
        onLinkActivate={handleLinkActivation}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};
