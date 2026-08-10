import * as React from "react";

import type { FooterContactItem } from "./contact";
import { footerContactIcons } from "./contactIcons";

type FooterContactListProps = {
  classNames: {
    contact: string;
    contactIcon: string;
    contactItem: string;
    contactList: string;
    contactText: string;
  };
  items: FooterContactItem[];
};

export const FooterContactList: React.FC<FooterContactListProps> = ({
  classNames,
  items,
}) => (
  <address className={classNames.contact}>
    <ul className={classNames.contactList}>
      {items.map((item) => {
        const Icon = footerContactIcons[item.kind];

        return (
          <li className={classNames.contactItem} key={item.kind}>
            <span aria-hidden="true" className={classNames.contactIcon}>
              <Icon />
            </span>
            {"href" in item ? (
              <a href={item.href}>{item.text}</a>
            ) : (
              <span className={classNames.contactText}>{item.text}</span>
            )}
          </li>
        );
      })}
    </ul>
  </address>
);
