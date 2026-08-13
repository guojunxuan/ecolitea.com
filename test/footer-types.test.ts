import type { Footer } from "@root/payload-types";

type Expect<T extends true> = T;
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;
type IsEqual<T, U> =
  (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
    ? true
    : false;
type IsRequired<T, K extends keyof T> = {} extends Pick<T, K> ? false : true;

type Brand = Footer["brand"];
type Contact = NonNullable<Footer["contact"]>;
type Newsletter = Footer["newsletter"];
type SocialLink = NonNullable<Footer["socialLinks"]>[number];

type FooterSchemaContract = [
  Expect<HasKey<Footer, "columns">>,
  Expect<IsEqual<keyof Brand, "description">>,
  Expect<IsRequired<Brand, "description">>,
  Expect<
    IsEqual<keyof Newsletter, "heading" | "description" | "emailPlaceholder">
  >,
  Expect<IsRequired<Newsletter, "heading">>,
  Expect<IsRequired<Newsletter, "description">>,
  Expect<IsRequired<Newsletter, "emailPlaceholder">>,
  Expect<
    IsEqual<
      SocialLink["platform"],
      "facebook" | "instagram" | "youtube" | "linkedin" | "x" | "tiktok"
    >
  >,
  Expect<IsRequired<Footer, "companyName">>,
  Expect<IsRequired<Footer, "copyrightText">>,
  Expect<HasKey<Contact, "address">>,
  Expect<HasKey<Contact, "phone">>,
  Expect<HasKey<Contact, "email">>,
];

export type { FooterSchemaContract };
