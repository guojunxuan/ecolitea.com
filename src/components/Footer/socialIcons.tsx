import type { ComponentType } from "react";

import type { Footer } from "@root/payload-types";

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

export const footerSocialIcons = {
  facebook: FooterFacebookIcon,
  instagram: FooterInstagramIcon,
  youtube: FooterYoutubeIcon,
  linkedin: FooterLinkedInIcon,
  x: FooterXIcon,
  tiktok: FooterTikTokIcon,
} as const satisfies Record<FooterSocialPlatform, ComponentType>;
