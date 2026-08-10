import type { Footer } from "@root/payload-types";

import { getFooterEmailHref, getFooterPhoneHref } from "./content.js";

export type FooterContactItem =
  | {
      kind: "address";
      text: string;
    }
  | {
      href: string;
      kind: "phone";
      text: string;
    }
  | {
      href: string;
      kind: "email";
      text: string;
    };

const getTrimmedContactValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const getFooterContactItems = (
  contact: Footer["contact"],
): FooterContactItem[] => {
  const address = getTrimmedContactValue(contact?.address);
  const phone = getTrimmedContactValue(contact?.phone);
  const email = getTrimmedContactValue(contact?.email);
  const phoneHref = getFooterPhoneHref(phone);
  const emailHref = getFooterEmailHref(email);
  const items: FooterContactItem[] = [];

  if (address) items.push({ kind: "address", text: address });
  if (phone && phoneHref) {
    items.push({ href: phoneHref, kind: "phone", text: phone });
  }
  if (email && emailHref) {
    items.push({ href: emailHref, kind: "email", text: email });
  }

  return items;
};
