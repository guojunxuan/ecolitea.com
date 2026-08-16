import { Archive } from '@components/Archive'
import { fetchArchive, fetchArchives } from '@data'
import { brandMetadata } from '@root/seo/brandMetadata'
import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { canonicalURL, indexFollowRobots, noIndexFollowRobots } from '@root/seo/metadata'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

export default async ({
  params,
}: {
  params: Promise<{
    category: string
  }>
}) => {
  const { category } = await params
  const { isEnabled: draft } = await draftMode()
  const archive = draft
    ? await fetchArchive(category, draft)
    : await unstable_cache(fetchArchive, [`${category}-archive`])(category, draft)

  const posts = archive?.posts?.docs

  if (!archive || !posts) {
    notFound()
  }

  return <Archive category={category} />
}

export const generateStaticParams = async () => {
  const archives = await fetchArchives()
  return archives.map((archive) => ({
    category: archive.slug,
  }))
}

export const generateMetadata = async ({ params }: { params: Promise<{ category: string }> }) => {
  const { category } = await params
  const archive = await fetchArchive(category)

  if (!archive) {
    return null
  }

  const { name, description } = archive
  const hasPublishedPosts = Boolean(archive.posts?.docs?.length)
  const path = `/posts/${category}`

  const resolvedDescription = description || brandMetadata.description

  return {
    alternates: {
      canonical: canonicalURL(path),
    },
    description: resolvedDescription,
    openGraph: mergeOpenGraph({
      description: resolvedDescription,
      title: name,
      url: canonicalURL(path),
    }),
    robots: hasPublishedPosts ? indexFollowRobots : noIndexFollowRobots,
    title: name,
  }
}
