import type { Footer } from "@root/payload-types";
import type { ComponentType } from "react";

import {
  FooterFacebookIcon,
  FooterInstagramIcon,
  FooterLinkedInIcon,
  FooterTikTokIcon,
  FooterXIcon,
  FooterYoutubeIcon,
} from "../../graphics/FooterSocialIcons";

type FooterSocialPlatform = NonNullable<
  Footer["socialLinks"]
>[number]["platform"];

/* eslint-disable perfectionist/sort-objects -- CMS platform order is a tested runtime contract. */
export const footerSocialIcons = {
  facebook: FooterFacebookIcon,
  instagram: FooterInstagramIcon,
  youtube: FooterYoutubeIcon,
  linkedin: FooterLinkedInIcon,
  x: FooterXIcon,
  tiktok: FooterTikTokIcon,
} as const satisfies Record<FooterSocialPlatform, ComponentType>;
/* eslint-enable perfectionist/sort-objects */
