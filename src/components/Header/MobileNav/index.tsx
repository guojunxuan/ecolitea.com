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
import { CMSLink, type CMSLinkType } from "../../CMSLink/index";
import classes from "./index.module.scss";
import {
  getMobileNavigationAction,
  getMobileNavigationBranch,
  getMobileNavigationFocusTarget,
  initialMobileNavigationState,
  reduceMobileNavigation,
} from "./navigation.js";

export const modalSlug = "mobile-nav";

type NavItems = Pick<MainMenu, "tabs">;
type NavigationTab = NonNullable<MainMenu["tabs"]>[number];
type LinkActivationHandler = NonNullable<CMSLinkType["onClick"]>;
type NavigationLevel = 1 | 2 | 3;
type NavigationState = {
  activeItemIndex: number | undefined;
  activeTabIndex: number | undefined;
  level: NavigationLevel;
};
type NavigationAction =
  | { index: number; type: "OPEN_ITEM" | "OPEN_TAB" }
  | { type: "BACK" | "RESET" };
type NavigationBranch = {
  featuredLabel?: NonNullable<
    NonNullable<NavigationTab["navItems"]>[number]["featuredLink"]
  >["label"];
  kind: "featured" | "list";
  label: string;
  landingLink?: CMSLinkType;
  links: Array<{ id?: null | string; link: CMSLinkType }>;
};
type ArrowReference = (element: HTMLButtonElement | null) => void;

const PanelHeader: React.FC<{
  onClose: () => void;
  onLinkActivate: LinkActivationHandler;
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
        <FullLogo />
      </Link>
      <span aria-hidden="true" />
    </div>
  );
};

const FinalLink: React.FC<{
  description?: null | string;
  link?: CMSLinkType;
  onLinkActivate: LinkActivationHandler;
  title?: null | string;
}> = ({ description, link, onLinkActivate, title }) => {
  const finalTitle = title ?? link?.label;

  return (
    <li className={classes.finalLinkItem}>
      <CMSLink
        {...link}
        className={classes.finalLink}
        label={description ? undefined : finalTitle}
        onClick={onLinkActivate}
      >
        {description && (
          <span className={classes.finalLinkCopy}>
            <span className={classes.finalLinkTitle}>{finalTitle}</span>
            <span className={classes.itemDescription}>{description}</span>
          </span>
        )}
      </CMSLink>
    </li>
  );
};

const DrilldownRow: React.FC<{
  arrowRef: ArrowReference;
  label: string;
  link?: CMSLinkType;
  onDrilldown: () => void;
  onLinkActivate: LinkActivationHandler;
}> = ({ arrowRef, label, link, onDrilldown, onLinkActivate }) => {
  return (
    <li className={classes.branchRow}>
      <CMSLink
        {...link}
        className={classes.branchTitle}
        label={label}
        onClick={onLinkActivate}
      />
      <button
        aria-label={`Open ${label} submenu`}
        className={classes.drilldownButton}
        onClick={onDrilldown}
        ref={arrowRef}
        type="button"
      >
        <ArrowIcon
          className={classes.drilldownArrow}
          rotation={45}
          size="medium"
        />
      </button>
    </li>
  );
};

const BackRow: React.FC<{
  arrowRef: ArrowReference;
  onBack: () => void;
  onLinkActivate: LinkActivationHandler;
  parentLabel: string;
  parentLink?: CMSLinkType;
}> = ({ arrowRef, onBack, onLinkActivate, parentLabel, parentLink }) => {
  return (
    <li className={classes.backRow}>
      <button
        aria-label={`Back to ${parentLabel}`}
        className={classes.backButton}
        onClick={onBack}
        ref={arrowRef}
        type="button"
      >
        <ArrowIcon rotation={225} size="medium" />
      </button>
      <CMSLink
        {...parentLink}
        className={classes.backTitle}
        onClick={onLinkActivate}
      >
        Back to {parentLabel}
      </CMSLink>
    </li>
  );
};

const NavigationLevels: React.FC<
  {
    dispatchNavigation: React.Dispatch<NavigationAction>;
    isMenuOpen: boolean;
    navigationState: NavigationState;
    onLinkActivate: LinkActivationHandler;
  } & NavItems
> = ({
  dispatchNavigation,
  isMenuOpen,
  navigationState,
  onLinkActivate,
  tabs,
}) => {
  const navigationTabs = tabs ?? [];
  const activeTab = navigationTabs[navigationState.activeTabIndex ?? -1];
  const activeItem =
    activeTab?.navItems?.[navigationState.activeItemIndex ?? -1];
  const activeBranch = getMobileNavigationBranch(
    activeItem,
  ) as NavigationBranch | null;
  const backArrowRefs = React.useRef<
    Partial<Record<NavigationLevel, HTMLButtonElement | null>>
  >({});
  const levelOneArrowRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const levelTwoArrowRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const previousNavigationStateRef = React.useRef(navigationState);

  React.useEffect(() => {
    const previousNavigationState = previousNavigationStateRef.current;
    previousNavigationStateRef.current = navigationState;

    if (!isMenuOpen) {
      return;
    }

    const focusTarget = getMobileNavigationFocusTarget(
      previousNavigationState,
      navigationState,
    );

    if (!focusTarget) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (focusTarget.type === "source") {
        const sourceRefs =
          focusTarget.level === 1
            ? levelOneArrowRefs.current
            : levelTwoArrowRefs.current;
        sourceRefs[focusTarget.index]?.focus();
        return;
      }

      backArrowRefs.current[focusTarget.level]?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isMenuOpen, navigationState]);

  const handleBack = React.useCallback(() => {
    dispatchNavigation({ type: "BACK" });
  }, [dispatchNavigation]);

  return (
    <div className={classes.navigationViewport}>
      <div
        className={classes.navigationTrack}
        data-level={navigationState.level}
      >
        <section
          aria-hidden={navigationState.level !== 1}
          className={classes.levelOnePanel}
          data-level="1"
          inert={navigationState.level !== 1}
        >
          <ul className={classes.mobileMenuItems}>
            {navigationTabs.map((tab, tabIndex) => {
              if (
                getMobileNavigationAction({
                  enableDropdown: tab.enableDropdown,
                }) === "link"
              ) {
                return (
                  <FinalLink
                    key={tab.id ?? tabIndex}
                    link={tab.link}
                    onLinkActivate={onLinkActivate}
                    title={tab.label}
                  />
                );
              }

              return (
                <DrilldownRow
                  arrowRef={(element) => {
                    levelOneArrowRefs.current[tabIndex] = element;
                  }}
                  key={tab.id ?? tabIndex}
                  label={tab.label}
                  link={tab.link}
                  onDrilldown={() =>
                    dispatchNavigation({ type: "OPEN_TAB", index: tabIndex })
                  }
                  onLinkActivate={onLinkActivate}
                />
              );
            })}
          </ul>
        </section>

        <section
          aria-hidden={navigationState.level !== 2}
          className={classes.levelTwoPanel}
          data-level="2"
          inert={navigationState.level !== 2}
        >
          <ul className={classes.mobileMenuItems}>
            <BackRow
              arrowRef={(element) => {
                backArrowRefs.current[2] = element;
              }}
              onBack={handleBack}
              onLinkActivate={onLinkActivate}
              parentLabel="Main menu"
              parentLink={{ url: "/" }}
            />
            {activeTab?.descriptionLinks?.map((descriptionLink, linkIndex) => (
              <FinalLink
                key={descriptionLink.id ?? linkIndex}
                link={descriptionLink.link}
                onLinkActivate={onLinkActivate}
              />
            ))}
            {activeTab?.navItems?.map((item, itemIndex) => {
              if (item.style === "default" && item.defaultLink) {
                return (
                  <FinalLink
                    description={item.defaultLink.description}
                    key={item.id ?? itemIndex}
                    link={item.defaultLink.link}
                    onLinkActivate={onLinkActivate}
                  />
                );
              }

              const branch = getMobileNavigationBranch(
                item,
              ) as NavigationBranch | null;

              if (!branch) {
                return null;
              }

              return (
                <DrilldownRow
                  arrowRef={(element) => {
                    levelTwoArrowRefs.current[itemIndex] = element;
                  }}
                  key={item.id ?? itemIndex}
                  label={branch.label}
                  link={branch.landingLink}
                  onDrilldown={() =>
                    dispatchNavigation({ type: "OPEN_ITEM", index: itemIndex })
                  }
                  onLinkActivate={onLinkActivate}
                />
              );
            })}
          </ul>
        </section>

        <section
          aria-hidden={navigationState.level !== 3}
          className={classes.levelThreePanel}
          data-level="3"
          inert={navigationState.level !== 3}
        >
          <ul className={classes.mobileMenuItems}>
            <BackRow
              arrowRef={(element) => {
                backArrowRefs.current[3] = element;
              }}
              onBack={handleBack}
              onLinkActivate={onLinkActivate}
              parentLabel={activeTab?.label ?? "Main menu"}
              parentLink={activeTab?.link}
            />
            {activeBranch?.kind === "featured" &&
              activeBranch.featuredLabel && (
                <li className={classes.featuredContent}>
                  <RichText
                    className={classes.featuredLinkLabel}
                    content={activeBranch.featuredLabel}
                  />
                </li>
              )}
            {activeBranch?.links.map((link, linkIndex) => (
              <FinalLink
                key={link.id ?? linkIndex}
                link={link.link}
                onLinkActivate={onLinkActivate}
              />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

const MobileMenuModal: React.FC<
  {
    dispatchNavigation: React.Dispatch<NavigationAction>;
    isMenuOpen: boolean;
    navigationState: NavigationState;
    onClose: () => void;
    onLinkActivate: LinkActivationHandler;
  } & NavItems
> = ({
  dispatchNavigation,
  isMenuOpen,
  navigationState,
  onClose,
  onLinkActivate,
  tabs,
}) => {
  return (
    <Modal
      className={classes.mobileMenuModal}
      onClick={onClose}
      slug={modalSlug}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- This non-interactive panel only prevents clicks from reaching the modal backdrop. */}
      <div
        className={classes.mobileMenuPanel}
        data-theme="light"
        onClick={(event) => event.stopPropagation()}
      >
        <PanelHeader onClose={onClose} onLinkActivate={onLinkActivate} />
        <NavigationLevels
          dispatchNavigation={dispatchNavigation}
          isMenuOpen={isMenuOpen}
          navigationState={navigationState}
          onLinkActivate={onLinkActivate}
          tabs={tabs}
        />
      </div>
    </Modal>
  );
};

export const MobileNav: React.FC<NavItems> = (props) => {
  const { closeAllModals, isModalOpen, openModal } = useModal();
  const pathname = usePathname();
  const [navigationState, dispatchNavigation] = React.useReducer(
    reduceMobileNavigation as React.Reducer<NavigationState, NavigationAction>,
    initialMobileNavigationState as NavigationState,
  );

  const isMenuOpen = isModalOpen(modalSlug);

  React.useEffect(() => {
    if (!isMenuOpen) {
      dispatchNavigation({ type: "RESET" });
    }
  }, [isMenuOpen]);

  const closeMenu = React.useCallback(() => {
    dispatchNavigation({ type: "RESET" });
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

  const handleLinkActivation = React.useCallback<LinkActivationHandler>(
    (event) => {
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
      dispatchNavigation({ type: "RESET" });
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
            <FullLogo />
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
        dispatchNavigation={dispatchNavigation}
        isMenuOpen={isMenuOpen}
        navigationState={navigationState}
        onClose={closeMenu}
        onLinkActivate={handleLinkActivation}
      />
    </div>
  );
};
