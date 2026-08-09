import type { ArrayFieldValidation, GlobalConfig } from "payload";

import { validations } from "payload";

import { revalidatePath } from "next/cache";

import { isAdmin } from "../access/isAdmin";
import link from "../fields/link";
import {
  footerSocialPlatformOptions,
  validateFooterSocialURL,
  validateUniqueSocialPlatforms,
} from "./footerSocials.js";

const validateSocialLinks: ArrayFieldValidation = async (value, options) => {
  const arrayValidationResult = await validations.array(value, options);

  if (arrayValidationResult !== true) return arrayValidationResult;

  return validateUniqueSocialPlatforms(value);
};

export const Footer: GlobalConfig = {
  slug: "footer",
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: "brand",
      type: "group",
      fields: [
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "logoAlt",
          type: "text",
          required: true,
        },
        {
          name: "tagline",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      name: "socialLinks",
      type: "array",
      admin: {
        components: {
          RowLabel: "@root/globals/CustomRowLabelSocialLinks",
        },
      },
      fields: [
        {
          name: "platform",
          type: "select",
          options: footerSocialPlatformOptions,
          required: true,
        },
        {
          name: "url",
          type: "text",
          required: true,
          validate: validateFooterSocialURL,
        },
      ],
      maxRows: 6,
      validate: validateSocialLinks,
    },
    {
      name: "columns",
      type: "array",
      admin: {
        components: {
          RowLabel: "@root/globals/CustomRowLabelFooterColumns",
        },
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "navItems",
          type: "array",
          fields: [
            link({
              appearances: false,
            }),
          ],
        },
      ],
      maxRows: 4,
      minRows: 1,
    },
    {
      name: "newsletter",
      type: "group",
      fields: [
        {
          name: "heading",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
          required: true,
        },
        {
          name: "emailPlaceholder",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "contact",
      type: "group",
      fields: [
        {
          name: "address",
          type: "textarea",
        },
        {
          name: "phone",
          type: "text",
        },
        {
          name: "email",
          type: "email",
        },
      ],
    },
    {
      name: "companyName",
      type: "text",
      required: true,
    },
    {
      name: "copyrightText",
      type: "text",
      required: true,
    },
  ],
  hooks: {
    afterChange: [() => revalidatePath("/", "layout")],
  },
};
