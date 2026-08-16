import type { Media } from '@root/payload-types'
import type { Metadata } from 'next'

import { Hero } from '@components/Hero/index'
import { EcoliteaRedirects } from '@components/EcoliteaRedirects'
import { RefreshRouteOnSave } from '@components/RefreshRouterOnSave'
import { RenderBlocks } from '@components/RenderBlocks/index'
import { fetchPage, fetchPages } from '@data'
import { brandMetadata } from '@root/seo/brandMetadata'
import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import {
  canonicalURL,
  indexFollowRobots,
  noIndexFollowRobots,
  resolvePageTitle,
} from '@root/seo/metadata'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import React from 'react'

const getPage = async (slug, draft?) =>
  draft ? fetchPage(slug) : unstable_cache(fetchPage, [`page-${slug}`])(slug)

const Page = async ({
  params,
}: {
  params: Promise<{
    slug: any
  }>
}) => {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const url = '/' + (Array.isArray(slug) ? slug.join('/') : slug)

  const page = await getPage(slug, draft)

  if (!page) {
    return <EcoliteaRedirects url={url} />
  }

  return (
    <React.Fragment>
      <EcoliteaRedirects disableNotFound url={url} />
      <RefreshRouteOnSave />
      <Hero firstContentBlock={page.layout[0]} page={page} />
      <RenderBlocks blocks={page.layout} hero={page.hero} />
    </React.Fragment>
  )
}

export default Page

export async function generateStaticParams() {
  const getPages = unstable_cache(fetchPages, ['pages'])
  const pages = await getPages()

  return pages.map(({ breadcrumbs }) => ({
    slug: breadcrumbs?.[breadcrumbs.length - 1]?.url?.replace(/^\/|\/$/g, '').split('/'),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: any
  }>
}): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const page = await getPage(slug, draft)
  const slugSegments = Array.isArray(slug) ? slug : slug ? [slug] : []
  const isHomepage = slugSegments.length === 0
  const pagePath = isHomepage ? '/' : `/${slugSegments.join('/')}`
  const resolvedTitle = resolvePageTitle({
    isHomepage,
    pageTitle: page?.title,
    seoTitle: page?.meta?.title,
  })

  let ogImage: Media | null = null

  if (page && page.meta?.image && typeof page.meta.image !== 'string') {
    ogImage = page.meta.image
  }

  // check if noIndex is true
  const robots = page?.noindex ? noIndexFollowRobots : indexFollowRobots

  return {
    alternates: {
      canonical: canonicalURL(pagePath, page?.canonical),
    },
    description: page?.meta?.description || brandMetadata.description,
    openGraph: mergeOpenGraph({
      description: page?.meta?.description ?? undefined,
      images: ogImage
        ? [
            {
              url: ogImage.url as string,
            },
          ]
        : undefined,
      title: isHomepage && !page?.meta?.title ? brandMetadata.openGraph.title : resolvedTitle,
      url: canonicalURL(pagePath, page?.canonical),
    }),
    robots,
    title: isHomepage ? { absolute: resolvedTitle } : resolvedTitle,
  }
}
