import type { Footer } from '@root/payload-types'

type Expect<T extends true> = T
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false

type FooterSchemaContract = [
  Expect<HasKey<Footer, 'brand'>>,
  Expect<HasKey<Footer, 'socialLinks'>>,
  Expect<HasKey<Footer, 'columns'>>,
  Expect<HasKey<Footer, 'newsletter'>>,
  Expect<HasKey<Footer, 'contact'>>,
  Expect<HasKey<Footer, 'companyName'>>,
  Expect<HasKey<Footer, 'copyrightText'>>,
]

export type { FooterSchemaContract }
