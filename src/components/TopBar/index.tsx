import type { TopBar as TopBarType } from "@root/payload-types";

import { CMSLink } from "@components/CMSLink";
import { ArrowIcon } from "@icons/ArrowIcon";

import classes from "./index.module.scss";

export const TopBar: React.FC<TopBarType> = ({ link, message }) => {
  const desktopContent = (
    <span className={classes.desktopContent}>
      <span className={classes.message}>{message}</span>
      {link?.label && <span className={classes.label}>{link.label}</span>}
      {link && <ArrowIcon />}
    </span>
  );

  const tickerContent = (
    <span className={classes.ticker}>
      <span className={classes.tickerTrack}>
        <span className={classes.tickerItem}>
          <span className={classes.message}>{message}</span>
          {link?.label && <span className={classes.label}>{link.label}</span>}
        </span>
        <span aria-hidden="true" className={classes.tickerItem}>
          <span className={classes.message}>{message}</span>
          {link?.label && <span className={classes.label}>{link.label}</span>}
        </span>
      </span>
    </span>
  );

  if (link) {
    return (
      <CMSLink className={classes.topBar} {...link} label={undefined}>
        {desktopContent}
        {tickerContent}
      </CMSLink>
    );
  }

  return (
    <div className={classes.topBar}>
      {desktopContent}
      {tickerContent}
    </div>
  );
};
