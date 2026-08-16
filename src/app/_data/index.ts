import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import type {
  CaseStudy,
  Category,
  Footer,
  Form,
  GetStarted,
  MainMenu,
  Page,
  Post,
  TopBar,
} from '../../payload-types'

export const fetchGlobals = async (): Promise<{
  footer: Footer
  mainMenu: MainMenu
  topBar: TopBar
}> => {
  const ecoliteaCMS = await getPayload({ config })
  const mainMenu = await ecoliteaCMS.findGlobal({
    slug: 'main-menu',
    depth: 1,
  })
  const footer = await ecoliteaCMS.findGlobal({
    slug: 'footer',
    depth: 1,
  })
  const topBar = await ecoliteaCMS.findGlobal({
    slug: 'topBar',
    depth: 1,
  })

  return {
    footer,
    mainMenu,
    topBar,
  }
}

export const fetchPage = async (incomingSlugSegments: string[]): Promise<null | Page> => {
  const { isEnabled: draft } = await draftMode()

  const ecoliteaCMS = await getPayload({ config })
  const slugSegments = incomingSlugSegments || ['home']
  const slug = slugSegments.at(-1)

  const data = await ecoliteaCMS.find({
    collection: 'pages',
    depth: 2,
    draft,
    limit: 1,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft
          ? []
          : [
              {
                _status: {
                  equals: 'published',
                },
              },
            ]),
      ],
    },
  })

  const pagePath = `/${slugSegments.join('/')}`

  const page = data.docs.find(({ breadcrumbs }: Page) => {
    if (!breadcrumbs) {
      return false
    }
    const { url } = breadcrumbs[breadcrumbs.length - 1]
    return url === pagePath
  })

  if (page) {
    return page
  }

  return null
}

export const fetchPages = async (): Promise<Partial<Page>[]> => {
  const ecoliteaCMS = await getPayload({ config })
  const data = await ecoliteaCMS.find({
    collection: 'pages',
    depth: 0,
    limit: 300,
    select: {
      breadcrumbs: true,
      noindex: true,
    },
    where: {
      and: [
        {
          slug: {
            not_equals: 'cloud',
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
        {
          noindex: {
            not_equals: true,
          },
        },
      ],
    },
  })

  return data.docs
}

export const fetchPosts = async (): Promise<Partial<Post>[]> => {
  const ecoliteaCMS = await getPayload({ config })
  const data = await ecoliteaCMS.find({
    collection: 'posts',
    depth: 1,
    limit: 300,
    select: {
      slug: true,
      category: true,
      noindex: true,
    },
    where: {
      noindex: {
        not_equals: true,
      },
    },
  })

  return data.docs
}

export const fetchBlogPosts = async (): Promise<Partial<Post>[]> => {
  const currentDate = new Date()
  const ecoliteaCMS = await getPayload({ config })

  const data = await ecoliteaCMS.find({
    collection: 'posts',
    depth: 1,
    limit: 300,
    select: {
      slug: true,
      authors: true,
      image: true,
      publishedOn: true,
      title: true,
    },
    sort: '-publishedOn',
    where: {
      and: [
        { publishedOn: { less_than_equal: currentDate } },
        { _status: { equals: 'published' } },
      ],
    },
  })
  return data.docs
}

export const fetchArchive = async (slug: string, draft?: boolean): Promise<Partial<Category>> => {
  const ecoliteaCMS = await getPayload({ config })
  const currentDate = new Date()

  const data = await ecoliteaCMS.find({
    collection: 'categories',
    depth: 2,
    draft,
    joins: {
      posts: {
        sort: '-publishedOn',
        where: {
          and: [
            { publishedOn: { less_than_equal: currentDate } },
            { _status: { equals: 'published' } },
          ],
        },
      },
    },
    limit: 1,
    select: {
      name: true,
      slug: true,
      description: true,
      headline: true,
      posts: true,
    },
    where: {
      and: [{ slug: { equals: slug } }],
    },
  })
  return data.docs[0]
}

export const fetchArchives = async (slug?: string): Promise<Partial<Category>[]> => {
  const ecoliteaCMS = await getPayload({ config })
  const currentDate = new Date()

  const data = await ecoliteaCMS.find({
    collection: 'categories',
    depth: 0,
    joins: {
      posts: {
        limit: 1,
        where: {
          and: [
            { publishedOn: { less_than_equal: currentDate } },
            { _status: { equals: 'published' } },
            { noindex: { not_equals: true } },
          ],
        },
      },
    },
    select: {
      name: true,
      posts: true,
      slug: true,
    },
    sort: 'name',
    ...(slug && {
      where: {
        slug: {
          not_equals: slug,
        },
      },
    }),
  })

  return data.docs.filter((category) => Boolean(category.posts?.docs?.length))
}

export const fetchBlogPost = async (slug: string, category): Promise<Partial<Post>> => {
  const { isEnabled: draft } = await draftMode()
  const ecoliteaCMS = await getPayload({ config })

  const data = await ecoliteaCMS.find({
    collection: 'posts',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    select: {
      authors: true,
      authorType: true,
      category: true,
      content: true,
      excerpt: true,
      featuredMedia: true,
      guestAuthor: true,
      guestSocials: true,
      image: true,
      meta: true,
      canonical: true,
      noindex: true,
      publishedOn: true,
      relatedPosts: true,
      title: true,
      videoUrl: true,
    },
    where: {
      and: [
        { slug: { equals: slug } },
        { 'category.slug': { equals: category } },
        ...(draft
          ? []
          : [
              {
                _status: {
                  equals: 'published',
                },
              },
            ]),
      ],
    },
  })

  return data.docs[0]
}

export const fetchCaseStudies = async (): Promise<Partial<CaseStudy>[]> => {
  const ecoliteaCMS = await getPayload({ config })
  const data = await ecoliteaCMS.find({
    collection: 'case-studies',
    depth: 0,
    limit: 300,
    select: {
      slug: true,
      noindex: true,
    },
    where: {
      noindex: {
        not_equals: true,
      },
    },
  })

  return data.docs
}

export const fetchCaseStudy = async (slug: string): Promise<CaseStudy> => {
  const { isEnabled: draft } = await draftMode()
  const ecoliteaCMS = await getPayload({ config })

  const data = await ecoliteaCMS.find({
    collection: 'case-studies',
    depth: 1,
    draft,
    limit: 1,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft
          ? []
          : [
              {
                _status: {
                  equals: 'published',
                },
              },
            ]),
      ],
    },
  })

  return data.docs[0]
}

export const fetchGetStarted = async (): Promise<GetStarted> => {
  const ecoliteaCMS = await getPayload({ config })
  const data = await ecoliteaCMS.findGlobal({
    slug: 'get-started',
    depth: 1,
  })

  return data
}

export const fetchForm = async (name: string): Promise<Form> => {
  const ecoliteaCMS = await getPayload({ config })

  const data = await ecoliteaCMS.find({
    collection: 'forms',
    depth: 1,
    limit: 1,
    where: {
      title: {
        equals: name,
      },
    },
  })

  return data.docs[0]
}
