import type { MainMenu } from '@root/payload-types'

import { Gutter } from '@components/Gutter/index'
import { RichText } from '@components/RichText/index'
import { SearchIcon } from '@root/graphics/SearchIcon/index'
import { ArrowIcon } from '@root/icons/ArrowIcon/index'
import { useHeaderObserver } from '@root/providers/HeaderIntersectionObserver/index'
import Link from 'next/link'
import * as React from 'react'

import { FullLogo } from '../../../graphics/FullLogo/index'
import { CMSLink } from '../../CMSLink/index'
import classes from './index.module.scss'
import { getVisibleNavigationCount } from './overflow.js'

type DesktopNavType = { hideBackground?: boolean } & Pick<MainMenu, 'menuCta' | 'tabs'>
type NavigationTab = NonNullable<MainMenu['tabs']>[number]

export const DesktopNav: React.FC<DesktopNavType> = ({ hideBackground, menuCta, tabs }) => {
  const navigationTabs = tabs ?? []
  const [activeTab, setActiveTab] = React.useState<number | undefined>()
  const [activeDropdown, setActiveDropdown] = React.useState<boolean | undefined>(false)
  const [isMoreOpen, setIsMoreOpen] = React.useState(false)
  const [visibleCount, setVisibleCount] = React.useState(navigationTabs.length)
  const [backgroundStyles, setBackgroundStyles] = React.useState<any>({
    height: '0px',
  })
  const bgHeight = hideBackground ? { top: '0px' } : ''
  const [underlineStyles, setUnderlineStyles] = React.useState<any>({})
  const { headerTheme } = useHeaderObserver()
  const [activeDropdownItem, setActiveDropdownItem] = React.useState<number | undefined>(undefined)
  const moreMenuId = React.useId()

  const navRegionRef = React.useRef<HTMLDivElement | null>(null)
  const measurementRowRef = React.useRef<HTMLDivElement | null>(null)
  const menuItemRefs = React.useRef<(HTMLElement | null)[]>([])
  const tabTriggerRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const dropdownMenuRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const moreTriggerRef = React.useRef<HTMLButtonElement | null>(null)
  const invokingTriggerRef = React.useRef<HTMLElement | null>(null)
  const suppressTriggerFocusRef = React.useRef(false)
  const suppressInteractionBlurRef = React.useRef(false)
  const hoverTimeout = React.useRef<null | number>(null)
  const resizeFrame = React.useRef<null | number>(null)
  const dropdownAnimationFrame = React.useRef<null | number>(null)
  const panelFocusFrame = React.useRef<null | number>(null)
  const resizeFocusFrame = React.useRef<null | number>(null)
  const previousVisibleCount = React.useRef(visibleCount)
  const focusedNavigationTarget = React.useRef<number | 'more' | undefined>(undefined)
  const focusedNavigationElement = React.useRef<HTMLElement | null>(null)
  const focusedPanelTab = React.useRef<number | undefined>(undefined)
  const pendingResizeFocus = React.useRef<{ destination: 'more' | number; request: number } | null>(null)
  const resizeFocusRequest = React.useRef(0)
  const visibleCountRef = React.useRef(visibleCount)
  const activeTabRef = React.useRef(activeTab)
  const [visibleDropdownTab, setVisibleDropdownTab] = React.useState<number | undefined>()

  activeTabRef.current = activeTab

  const clearHoverTimeout = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current)
      hoverTimeout.current = null
    }
  }

  React.useEffect(() => {
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current)
        hoverTimeout.current = null
      }
      if (dropdownAnimationFrame.current) window.cancelAnimationFrame(dropdownAnimationFrame.current)
      if (panelFocusFrame.current) window.cancelAnimationFrame(panelFocusFrame.current)
      if (resizeFocusFrame.current) window.cancelAnimationFrame(resizeFocusFrame.current)
    }
  }, [])

  const getDropdownPanelId = (tabIndex: number) => `${moreMenuId}-panel-${tabIndex}`

  const getTabTrigger = (tabIndex: number) =>
    tabIndex < visibleCount ? tabTriggerRefs.current[tabIndex] : moreTriggerRef.current

  const getVisibleTabFocusable = (tabIndex: number) =>
    tabTriggerRefs.current[tabIndex] || menuItemRefs.current[tabIndex]?.querySelector<HTMLElement>('a, button')

  const shouldSuppressTriggerFocus = () => {
    if (!suppressTriggerFocusRef.current) return false

    suppressTriggerFocusRef.current = false
    return true
  }

  React.useEffect(() => {
    visibleCountRef.current = visibleCount
  }, [visibleCount])

  const setActiveTabStyles = React.useCallback(
    (tabIndex: number) => {
      const hoveredMenuItem =
        tabIndex < visibleCount ? menuItemRefs.current[tabIndex] : moreTriggerRef.current
      const hoveredDropdownMenu = dropdownMenuRefs.current[tabIndex]
      const dropdownHeight = hoveredDropdownMenu?.clientHeight || 0

      if (hoveredMenuItem) {
        setUnderlineStyles({
          left: hoveredMenuItem.offsetLeft,
          width: `${hoveredMenuItem.clientWidth}px`,
        })
      }

      if (dropdownHeight === 0) {
        setBackgroundStyles({ height: '0px' })
      } else {
        setBackgroundStyles({
          height: hideBackground ? `${dropdownHeight + 90}px` : `${dropdownHeight}px`,
        })
      }
    },
    [hideBackground, visibleCount],
  )

  const measureVisibleTabs = React.useCallback(() => {
    const navRegion = navRegionRef.current
    const measurementRow = measurementRowRef.current

    if (!navRegion || !measurementRow) return

    const measuredItems = Array.from(measurementRow.querySelectorAll<HTMLElement>('[data-navigation-measure]'))
    const moreItem = measurementRow.querySelector<HTMLElement>('[data-more-measure]')

    if (!moreItem || measuredItems.length !== navigationTabs.length) return

    const itemWidths = measuredItems.map((item) => item.getBoundingClientRect().width)
    const gap = Number.parseFloat(window.getComputedStyle(measurementRow).columnGap) || 0
    const reservedEndSpace = Number.parseFloat(window.getComputedStyle(navRegion).paddingInlineEnd) || 0
    const nextVisibleCount = getVisibleNavigationCount({
      availableWidth: navRegion.clientWidth,
      gap,
      itemWidths,
      moreWidth: moreItem.getBoundingClientRect().width,
      reservedEndSpace,
    })

    const currentVisibleCount = visibleCountRef.current
    if (nextVisibleCount !== currentVisibleCount) {
      const focusedTarget = focusedNavigationTarget.current
      const focusedElement = focusedNavigationElement.current
      const focusedActiveTab = activeTabRef.current
      const focusedElementWillUnmount =
        focusedElement &&
        document.activeElement === focusedElement &&
        ((typeof focusedTarget === 'number' &&
          ((focusedTarget < currentVisibleCount && focusedTarget >= nextVisibleCount) ||
            (focusedTarget >= currentVisibleCount && focusedTarget < nextVisibleCount))) ||
          (focusedTarget === 'more' && currentVisibleCount < navigationTabs.length && nextVisibleCount >= navigationTabs.length))
      const focusedPanelWillUnmount =
        focusedActiveTab !== undefined &&
        focusedPanelTab.current === focusedActiveTab &&
        focusedActiveTab < currentVisibleCount &&
        focusedActiveTab >= nextVisibleCount &&
        dropdownMenuRefs.current[focusedActiveTab]?.contains(document.activeElement)

      resizeFocusRequest.current += 1
      pendingResizeFocus.current = null

      if (focusedPanelWillUnmount) {
        pendingResizeFocus.current = {
          destination: 'more',
          request: resizeFocusRequest.current,
        }
      } else if (focusedElementWillUnmount && focusedTarget !== undefined) {
        pendingResizeFocus.current = {
          destination:
            focusedTarget === 'more' || focusedTarget < currentVisibleCount
              ? focusedTarget === 'more' && nextVisibleCount >= navigationTabs.length
                ? currentVisibleCount
                : 'more'
              : focusedTarget,
          request: resizeFocusRequest.current,
        }
      }
    }

    setVisibleCount((currentVisibleCount) =>
      currentVisibleCount === nextVisibleCount ? currentVisibleCount : nextVisibleCount,
    )
  }, [navigationTabs.length])

  React.useEffect(() => {
    const navRegion = navRegionRef.current
    if (!navRegion) return

    const scheduleMeasurement = () => {
      if (resizeFrame.current) window.cancelAnimationFrame(resizeFrame.current)
      resizeFrame.current = window.requestAnimationFrame(() => {
        resizeFrame.current = null
        measureVisibleTabs()
      })
    }

    scheduleMeasurement()
    const resizeObserver = new ResizeObserver(scheduleMeasurement)
    resizeObserver.observe(navRegion)

    return () => {
      resizeObserver.disconnect()
      if (resizeFrame.current) window.cancelAnimationFrame(resizeFrame.current)
    }
  }, [measureVisibleTabs])

  React.useEffect(() => {
    const wasActiveTabVisible = activeTab !== undefined && activeTab < previousVisibleCount.current
    const activeTabIsOverflowing = activeTab !== undefined && activeTab >= visibleCount
    previousVisibleCount.current = visibleCount

    if (activeTab === undefined) return

    if (wasActiveTabVisible && activeTabIsOverflowing) {
      setActiveDropdown(false)
      setActiveTab(undefined)
      setBackgroundStyles({ height: '0px' })
      setIsMoreOpen(true)
      return
    }

    if (!activeTabIsOverflowing) setIsMoreOpen(false)
    setActiveTabStyles(activeTab)
  }, [activeTab, setActiveTabStyles, visibleCount])

  React.useEffect(() => {
    if (dropdownAnimationFrame.current) window.cancelAnimationFrame(dropdownAnimationFrame.current)

    setVisibleDropdownTab(undefined)

    if (
      activeTab === undefined ||
      !navigationTabs[activeTab]?.enableDropdown
    ) {
      return
    }

    dropdownAnimationFrame.current = window.requestAnimationFrame(() => {
      dropdownAnimationFrame.current = null
      setVisibleDropdownTab(activeTab)
    })

    return () => {
      if (dropdownAnimationFrame.current) window.cancelAnimationFrame(dropdownAnimationFrame.current)
    }
  }, [activeTab, navigationTabs, visibleCount])

  const handleMouseEnter = (tabIndex: number, invokingTrigger?: HTMLElement | null) => {
    if (!activeDropdown) {
      hoverTimeout.current = window.setTimeout(() => {
        handleHoverEnter(tabIndex, invokingTrigger)
      }, 200)
    } else {
      handleHoverEnter(tabIndex, invokingTrigger)
    }
  }

  const handleMouseLeave = () => {
    clearHoverTimeout()
  }

  const handleHoverEnter = (tabIndex: number, invokingTrigger: HTMLElement | null = getTabTrigger(tabIndex)) => {
    if (!navigationTabs[tabIndex]?.enableDropdown) return

    clearHoverTimeout()
    invokingTriggerRef.current = invokingTrigger
    setVisibleDropdownTab(undefined)
    setActiveTab(tabIndex)
    setActiveDropdown(true)
    setIsMoreOpen(false)
    setActiveTabStyles(tabIndex)

    setActiveDropdownItem(undefined)

    if (tabIndex >= visibleCount && document.activeElement === invokingTrigger) {
      suppressInteractionBlurRef.current = true
      if (panelFocusFrame.current) window.cancelAnimationFrame(panelFocusFrame.current)
      panelFocusFrame.current = window.requestAnimationFrame(() => {
        panelFocusFrame.current = null
        dropdownMenuRefs.current[tabIndex]?.focus()
      })
    }
  }

  const resetHoverStyles = (restoreFocus = false) => {
    const fallbackFocusTarget = activeTab !== undefined ? getTabTrigger(activeTab) : null
    const focusTarget = invokingTriggerRef.current?.isConnected ? invokingTriggerRef.current : fallbackFocusTarget

    clearHoverTimeout()
    if (panelFocusFrame.current) window.cancelAnimationFrame(panelFocusFrame.current)
    suppressInteractionBlurRef.current = false
    focusedPanelTab.current = undefined
    setActiveDropdown(false)
    setActiveTab(undefined)
    setIsMoreOpen(false)
    setBackgroundStyles({ height: '0px' })

    if (restoreFocus && focusTarget) {
      if (document.activeElement !== focusTarget) suppressTriggerFocusRef.current = true
      focusTarget.focus()
    }
  }

  const openMore = (invokingTrigger = moreTriggerRef.current) => {
    resetHoverStyles()
    invokingTriggerRef.current = invokingTrigger
    setIsMoreOpen(true)
  }

  const handleMoreToggle = () => {
    if (moreIsExpanded) {
      resetHoverStyles()
    } else {
      openMore()
    }
  }

  const handleInteractionKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return

    event.preventDefault()
    resetHoverStyles(true)
  }

  const handleInteractionBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      focusedNavigationTarget.current = undefined
      focusedNavigationElement.current = null
      focusedPanelTab.current = undefined
      if (!pendingResizeFocus.current) resizeFocusRequest.current += 1
      if (suppressInteractionBlurRef.current) {
        suppressInteractionBlurRef.current = false
        return
      }
      resetHoverStyles()
    }
  }

  const handleInteractionFocusCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    const tabIndex = target.closest<HTMLElement>('[data-navigation-tab-index]')?.dataset.navigationTabIndex

    if (target.closest('[data-navigation-more-trigger]')) {
      focusedNavigationTarget.current = 'more'
      focusedNavigationElement.current = target
      focusedPanelTab.current = undefined
    } else if (tabIndex !== undefined) {
      focusedNavigationTarget.current = Number(tabIndex)
      focusedNavigationElement.current = target
      focusedPanelTab.current = undefined
    } else {
      focusedNavigationTarget.current = undefined
      focusedNavigationElement.current = null
      focusedPanelTab.current = target.closest('[data-navigation-panel]') ? activeTab : undefined
      if (!pendingResizeFocus.current) resizeFocusRequest.current += 1
    }

    if (!target.closest('[data-navigation-menu-focus]') && (activeDropdown || isMoreOpen)) {
      resetHoverStyles()
    }
  }

  React.useEffect(() => {
    if (resizeFocusFrame.current) window.cancelAnimationFrame(resizeFocusFrame.current)
    resizeFocusFrame.current = null

    const pendingFocus = pendingResizeFocus.current
    pendingResizeFocus.current = null
    if (!pendingFocus) return

    const focusTarget =
      pendingFocus.destination === 'more'
        ? moreTriggerRef.current
        : getVisibleTabFocusable(pendingFocus.destination)
    if (!focusTarget) return

    resetHoverStyles()
    resizeFocusFrame.current = window.requestAnimationFrame(() => {
      resizeFocusFrame.current = null
      const targetIsCurrent =
        pendingFocus.destination === 'more'
          ? moreTriggerRef.current === focusTarget
          : getVisibleTabFocusable(pendingFocus.destination) === focusTarget
      const activeElementIsStable =
        document.activeElement === document.body || document.activeElement === document.documentElement

      if (resizeFocusRequest.current !== pendingFocus.request || !focusTarget.isConnected || !targetIsCurrent || !activeElementIsStable) {
        return
      }

      const isMenuTrigger =
        focusTarget === moreTriggerRef.current || tabTriggerRefs.current.some((trigger) => trigger === focusTarget)
      if (isMenuTrigger) suppressTriggerFocusRef.current = true
      focusTarget.focus()
    })
  }, [visibleCount])

  const renderTabTrigger = (tab: NavigationTab, tabIndex: number, className: string) => {
    const tabContent = (
      <>
        {tab.label}
        {tab.link?.newTab && tab.link.type === 'custom' && <ArrowIcon className={classes.tabArrow} />}
      </>
    )

    if (tab.enableDirectLink && !tab.enableDropdown) {
      return (
        <CMSLink className={className} {...tab.link} label={undefined}>
          {tabContent}
        </CMSLink>
      )
    }

    if (tab.enableDropdown) {
      return (
        <button
          aria-controls={getDropdownPanelId(tabIndex)}
          aria-expanded={activeTab === tabIndex}
          className={className}
          data-navigation-menu-focus
          onClick={(event) => handleHoverEnter(tabIndex, event.currentTarget)}
          onFocus={(event) => {
            if (!shouldSuppressTriggerFocus()) handleHoverEnter(tabIndex, event.currentTarget)
          }}
          ref={(ref) => {
            tabTriggerRefs.current[tabIndex] = ref
          }}
          type="button"
        >
          {tab.label}
        </button>
      )
    }

    return (
      <button
        className={className}
        type="button"
      >
        {tab.label}
      </button>
    )
  }

  const visibleTabs = navigationTabs.slice(0, visibleCount)
  const overflowTabs = navigationTabs.slice(visibleCount)
  const moreIsExpanded = isMoreOpen

  return (
    <div
      className={[classes.desktopNav, headerTheme && classes[headerTheme]].filter(Boolean).join(' ')}
      style={{ width: '100%' }}
    >
      <Gutter
        className={[classes.desktopNav, (activeDropdown || moreIsExpanded) && classes.active].filter(Boolean).join(' ')}
      >
        <div className={classes.grid}>
          <div className={classes.logo}>
            <Link aria-label="Go to Ecolitea homepage" className={classes.logo} href="/" prefetch={false}>
              <FullLogo className="w-auto h-[30px]" />
            </Link>
          </div>
          <div className={classes.content} ref={navRegionRef}>
            <div
              className={classes.interactionBoundary}
              onBlur={handleInteractionBlur}
              onFocusCapture={handleInteractionFocusCapture}
              onKeyDown={handleInteractionKeyDown}
              onMouseLeave={() => resetHoverStyles()}
            >
              <div className={classes.tabs}>
                {visibleTabs.map((tab, tabIndex) => {
                return (
                  <div
                    className={classes.tabWrap}
                    data-navigation-tab-index={tabIndex}
                    key={tabIndex}
                    onMouseEnter={() => handleMouseEnter(tabIndex, tabTriggerRefs.current[tabIndex])}
                    onMouseLeave={() => handleMouseLeave()}
                    ref={(ref) => {
                      menuItemRefs.current[tabIndex] = ref
                    }}
                  >
                    {renderTabTrigger(
                      tab,
                      tabIndex,
                      tab.enableDirectLink && !tab.enableDropdown ? classes.directLink : classes.tab,
                    )}
                  </div>
                )
                })}
                {overflowTabs.length > 0 && (
                <div
                  className={classes.more}
                  onMouseEnter={() => openMore()}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    aria-controls={moreMenuId}
                    aria-expanded={moreIsExpanded}
                    className={classes.tab}
                    data-navigation-menu-focus
                    data-navigation-more-trigger
                    onClick={handleMoreToggle}
                    onFocus={(event) => {
                      if (!shouldSuppressTriggerFocus()) openMore(event.currentTarget)
                    }}
                    ref={moreTriggerRef}
                    type="button"
                  >
                    More
                  </button>
                  {moreIsExpanded && (
                    <ul className={classes.moreMenu} data-navigation-menu-focus id={moreMenuId}>
                      {overflowTabs.map((tab, overflowIndex) => {
                        const tabIndex = visibleCount + overflowIndex
                        return (
                          <li
                            data-navigation-tab-index={tabIndex}
                            key={tab.id || tabIndex}
                            onMouseEnter={() => handleMouseEnter(tabIndex, tabTriggerRefs.current[tabIndex])}
                            onMouseLeave={handleMouseLeave}
                          >
                            {renderTabTrigger(tab, tabIndex, classes.moreMenuItem)}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
                )}
                <div
                aria-hidden="true"
                className={classes.underline}
                style={{ ...underlineStyles, opacity: activeDropdown || activeTab ? 1 : 0 }}
                >
                  <div className={classes.underlineFill} />
                </div>
                <div aria-hidden="true" className={classes.measurementRow} ref={measurementRowRef}>
                {navigationTabs.map((tab, tabIndex) => (
                  <span className={classes.measurementItem} data-navigation-measure key={tab.id || tabIndex}>
                    {tab.label}
                    {tab.link?.newTab && tab.link.type === 'custom' && <ArrowIcon className={classes.tabArrow} />}
                  </span>
                ))}
                <span className={classes.measurementItem} data-more-measure>
                  More
                </span>
                </div>
              </div>
              {activeTab !== undefined && navigationTabs[activeTab]?.enableDropdown && (
                  <div
                    aria-label={navigationTabs[activeTab].label}
                    className={['grid', classes.dropdown, visibleDropdownTab === activeTab && classes.activeTab]
                      .filter(Boolean)
                      .join(' ')}
                    id={getDropdownPanelId(activeTab)}
                    data-navigation-menu-focus
                    data-navigation-panel
                    onClick={() => resetHoverStyles()}
                    onMouseLeave={() => resetHoverStyles()}
                    role="region"
                    tabIndex={-1}
                    ref={(ref) => {
                      dropdownMenuRefs.current[activeTab] = ref
                    }}
                  >
                    <div className={[classes.description, 'cols-4'].join(' ')}>
                      {navigationTabs[activeTab].description}
                      {navigationTabs[activeTab].descriptionLinks && (
                        <div className={classes.descriptionLinks}>
                          {navigationTabs[activeTab].descriptionLinks.map((link, linkIndex) => (
                            <CMSLink className={classes.descriptionLink} key={linkIndex} {...link.link}>
                              <ArrowIcon className={classes.linkArrow} />
                            </CMSLink>
                          ))}
                        </div>
                      )}
                    </div>
                    {navigationTabs[activeTab].navItems &&
                      navigationTabs[activeTab].navItems.map((item, index) => {
                        const navItems = navigationTabs[activeTab].navItems ?? []
                        const isActive = activeDropdownItem === index
                        let columnSpan = 12 / (navItems.length || 1)
                        const containsFeatured = navItems.some((navItem) => navItem.style === 'featured')
                        const showUnderline = isActive && item.style === 'default'

                        if (containsFeatured) {
                          columnSpan = item.style === 'featured' ? 6 : 3
                        }
                        return (
                          <div
                            className={[
                              `cols-${columnSpan}`,
                              classes.dropdownItem,
                              showUnderline && classes.showUnderline,
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            key={item.id || index}
                            onMouseEnter={() => setActiveDropdownItem(index)}
                          >
                            {item.style === 'default' && item.defaultLink && (
                              <CMSLink className={classes.defaultLink} {...item.defaultLink.link} label="">
                                <div className={classes.defaultLinkLabel}>{item.defaultLink.link.label}</div>
                                <div className={classes.defaultLinkDescription}>
                                  {item.defaultLink.description}
                                  <ArrowIcon size="medium" />
                                </div>
                              </CMSLink>
                            )}
                            {item.style === 'list' && item.listLinks && (
                              <div className={classes.linkList}>
                                <div className={classes.listLabel}>{item.listLinks.tag}</div>
                                {item.listLinks.links &&
                                  item.listLinks.links.map((link, linkIndex) => (
                                    <CMSLink className={classes.link} key={link.id || linkIndex} {...link.link}>
                                      {link.link?.newTab && link.link?.type === 'custom' && (
                                        <ArrowIcon className={classes.linkArrow} />
                                      )}
                                    </CMSLink>
                                  ))}
                              </div>
                            )}
                            {item.style === 'featured' && item.featuredLink && (
                              <div className={classes.featuredLink}>
                                <div className={classes.listLabel}>{item.featuredLink.tag}</div>
                                {item.featuredLink?.label && (
                                  <RichText className={classes.featuredLinkLabel} content={item.featuredLink.label} />
                                )}
                                <div className={classes.featuredLinkWrap}>
                                  {item.featuredLink.links &&
                                    item.featuredLink.links.map((link, linkIndex) => (
                                      <CMSLink className={classes.featuredLinks} key={link.id || linkIndex} {...link.link}>
                                        <ArrowIcon className={classes.linkArrow} />
                                      </CMSLink>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
              )}
            </div>
          </div>
          <div>
            <div className={[classes.secondaryNavItems, classes.show].join(' ')}>
              {menuCta && menuCta.label && <CMSLink {...menuCta} className={classes.button} />}
              <button aria-label="Search site" className={classes.searchButton} type="button">
                <SearchIcon />
              </button>
            </div>
          </div>
        </div>
        <div className={classes.background} style={{ ...backgroundStyles, ...bgHeight }} />
      </Gutter>
    </div>
  )
}
