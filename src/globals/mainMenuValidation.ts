type LinkValue = {
  reference?: unknown;
  type?: "custom" | "reference" | null;
  url?: null | string;
};

type NavigationGroup = {
  featuredLink?: {
    landingLink?: LinkValue;
    links?: null | unknown[];
    tag?: null | string;
  };
  listLinks?: {
    landingLink?: LinkValue;
    links?: null | unknown[];
    tag?: null | string;
  };
  style?: "default" | "featured" | "list" | null;
};

type NavigationTab = {
  enableDirectLink?: boolean | null;
  enableDropdown?: boolean | null;
  label?: null | string;
  link?: LinkValue;
  navItems?: NavigationGroup[] | null;
};

const hasDestination = (link?: LinkValue): boolean => {
  if (!link) {
    return false;
  }
  if (link.type === "custom") {
    return Boolean(link.url?.trim());
  }
  if (link.type === "reference") {
    return Boolean(link.reference);
  }
  return false;
};

export const validateMainMenuTabs = (
  tabs?: NavigationTab[] | null,
): string | true => {
  for (const tab of tabs ?? []) {
    if (!tab.enableDropdown) {
      continue;
    }
    const tabLabel = tab.label?.trim() || "Expandable menu item";
    if (!tab.enableDirectLink || !hasDestination(tab.link)) {
      return `${tabLabel} must enable and configure its Direct Link before it can open a submenu.`;
    }
    for (const item of tab.navItems ?? []) {
      const isBranch = item.style === "list" || item.style === "featured";
      if (!isBranch) {
        continue;
      }
      const group = item.style === "list" ? item.listLinks : item.featuredLink;
      const groupLabel = group?.tag?.trim() || "Untitled group";
      if (!hasDestination(group?.landingLink)) {
        return `${tabLabel} → ${groupLabel} requires a Landing Link.`;
      }
      if (!group?.tag?.trim()) {
        return `${tabLabel} → ${groupLabel} requires a non-empty Tag.`;
      }
    }
  }
  return true;
};
