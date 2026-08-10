import type { ComponentType } from "react";

import { EmailIcon } from "@graphics/EmailIcon";
import { LocationIcon } from "@graphics/LocationIcon";
import { PhoneIcon } from "@graphics/PhoneIcon";

import type { FooterContactItem } from "./contact";

type FooterContactKind = FooterContactItem["kind"];

export const footerContactIcons = {
  address: LocationIcon,
  phone: PhoneIcon,
  email: EmailIcon,
} as const satisfies Record<FooterContactKind, ComponentType>;
