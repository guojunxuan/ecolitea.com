export const getMobileNavigationAction = ({ enableDropdown }) =>
  enableDropdown ? "submenu" : "link";

export const getMobileNavigationBranch = (item) => {
  if (item?.style === "list" && item.listLinks) {
    return {
      kind: "list",
      label: item.listLinks.tag || "",
      landingLink: item.listLinks.landingLink,
      links: item.listLinks.links || [],
    };
  }

  if (item?.style === "featured" && item.featuredLink) {
    return {
      featuredLabel: item.featuredLink.label,
      kind: "featured",
      label: item.featuredLink.tag || "",
      landingLink: item.featuredLink.landingLink,
      links: item.featuredLink.links || [],
    };
  }

  return null;
};

export const initialMobileNavigationState = {
  activeItemIndex: undefined,
  activeTabIndex: undefined,
  level: 1,
};

export const getMobileNavigationFocusTarget = (previousState, nextState) => {
  if (nextState.level === previousState.level + 1) {
    return {
      level: nextState.level,
      type: "back",
    };
  }

  if (
    previousState.level === 3 &&
    nextState.level === 2 &&
    previousState.activeItemIndex !== undefined
  ) {
    return {
      index: previousState.activeItemIndex,
      level: 2,
      type: "source",
    };
  }

  if (
    previousState.level === 2 &&
    nextState.level === 1 &&
    previousState.activeTabIndex !== undefined
  ) {
    return {
      index: previousState.activeTabIndex,
      level: 1,
      type: "source",
    };
  }

  return undefined;
};

export const reduceMobileNavigation = (state, action) => {
  switch (action.type) {
    case "OPEN_TAB":
      return {
        activeItemIndex: undefined,
        activeTabIndex: action.index,
        level: 2,
      };
    case "OPEN_ITEM":
      if (state.activeTabIndex === undefined) return state;

      return {
        ...state,
        activeItemIndex: action.index,
        level: 3,
      };
    case "BACK":
      if (state.level === 3) {
        return {
          activeItemIndex: undefined,
          activeTabIndex: state.activeTabIndex,
          level: 2,
        };
      }

      return initialMobileNavigationState;
    case "RESET":
      return initialMobileNavigationState;
    default:
      return state;
  }
};
