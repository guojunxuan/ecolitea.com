import type { Metadata } from 'next'

import { EcoliteaRedirects } from '@components/EcoliteaRedirects/index'
import { RefreshRouteOnSave } from '@components/RefreshRouterOnSave/index'
import { fetchCaseStudies, fetchCaseStudy } from '@data'
import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { brandMetadata } from '@root/seo/brandMetadata'
import { canonicalURL, indexFollowRobots, noIndexFollowRobots } from '@root/seo/metadata'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

import { CaseStudy } from './client_page'

const getCaseStudy = (slug, draft) =>
  draft ? fetchCaseStudy(slug) : unstable_cache(fetchCaseStudy, [`case-study-${slug}`])(slug)

const CaseStudyBySlug = async ({ params }) => {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params

  const url = `/case-studies/${slug}`

  const caseStudy = await getCaseStudy(slug, draft)

  if (!caseStudy) {
    return <EcoliteaRedirects url={url} />
  }

  return (
    <>
      <EcoliteaRedirects disableNotFound url={url} />
      <RefreshRouteOnSave />
      <CaseStudy {...caseStudy} />
    </>
  )
}

export default CaseStudyBySlug

export async function generateStaticParams() {
  const getCaseStudies = unstable_cache(fetchCaseStudies, ['caseStudies'])
  const caseStudies = await getCaseStudies()

  return caseStudies.map(({ slug }) => ({
    slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: any
  }>
}): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const page = await getCaseStudy(slug, draft)

  const ogImage =
    typeof page?.meta?.image === 'object' &&
    page?.meta?.image !== null &&
    'url' in page?.meta?.image &&
    `${process.env.NEXT_PUBLIC_CMS_URL}${page.meta.image.url}`
  const path = `/case-studies/${slug}`
  const description = page?.meta?.description || brandMetadata.description

  return {
    alternates: {
      canonical: canonicalURL(path, page?.canonical),
    },
    description,
    openGraph: mergeOpenGraph({
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title: page?.meta?.title ?? page?.title ?? undefined,
      url: canonicalURL(path, page?.canonical),
    }),
    robots: page?.noindex ? noIndexFollowRobots : indexFollowRobots,
    title: page?.meta?.title ?? page?.title,
  }
}
