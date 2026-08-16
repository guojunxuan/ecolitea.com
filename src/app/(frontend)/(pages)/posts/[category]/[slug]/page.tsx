import type { Metadata } from 'next'

import BreadcrumbsBar from '@components/Hero/BreadcrumbsBar/index'
import { EcoliteaRedirects } from '@components/EcoliteaRedirects/index'
import { Post } from '@components/Post/index'
import { RefreshRouteOnSave } from '@components/RefreshRouterOnSave/index'
import { fetchBlogPost, fetchPosts } from '@data'
import { brandMetadata } from '@root/seo/brandMetadata'
import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { canonicalURL, indexFollowRobots, noIndexFollowRobots } from '@root/seo/metadata'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import React from 'react'

const getPost = async (slug, category, draft?) =>
  draft
    ? await fetchBlogPost(slug, category)
    : await unstable_cache(fetchBlogPost, ['blogPost', `post-${slug}`])(slug, category)

const PostPage = async ({
  params,
}: {
  params: Promise<{
    category: string
    slug: any
  }>
}) => {
  const { isEnabled: draft } = await draftMode()
  const { slug, category } = await params

  const blogPost = await getPost(slug, category, draft)

  const url = `/${category}/${slug}`

  if (!blogPost) {
    return <EcoliteaRedirects url={url} />
  }

  return (
    <>
      <EcoliteaRedirects disableNotFound url={url} />
      <RefreshRouteOnSave />
      <BreadcrumbsBar breadcrumbs={[]} hero={{ type: 'default' }} />
      <Post {...blogPost} />
    </>
  )
}

export default PostPage

export async function generateStaticParams() {
  const getPosts = unstable_cache(fetchPosts, ['allPosts'])
  const posts = await getPosts()

  return posts
    .map(({ slug, category }) => {
      if (!category || typeof category === 'string' || !category.slug) {
        return null
      }

      return {
        slug,
        category: category.slug,
      }
    })
    .filter(Boolean)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    category: string
    slug: string
  }>
}): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug, category } = await params
  const post = await getPost(slug, category, draft)
  const path = `/posts/${category}/${slug}`
  const description = post?.meta?.description || brandMetadata.description

  let ogImage: null | string = null

  if (post) {
    if (post?.meta?.image && typeof post.meta.image !== 'string' && post.meta.image?.url) {
      ogImage = post.meta.image.url
    } else if (
      post.featuredMedia === 'upload' &&
      post.image &&
      typeof post.image !== 'string' &&
      post.image?.url
    ) {
      ogImage = post.image.url
    } else if (post.featuredMedia === 'videoUrl' && post.videoUrl) {
      ogImage = `${process.env.NEXT_PUBLIC_SITE_URL}/api/og?type=${category}&title=${post.title}`
    }
  }

  return {
    alternates: {
      canonical: canonicalURL(path, post?.canonical),
    },
    description,
    openGraph: mergeOpenGraph({
      authors:
        post?.authorType === 'guest'
          ? post.guestAuthor
            ? [post.guestAuthor]
            : undefined
          : post?.authors
              ?.filter((author) => typeof author !== 'string')
              .map((author) => `${author.firstName} ${author.lastName}`),
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      modifiedTime: post?.updatedAt,
      publishedTime: post?.publishedOn,
      title: post?.meta?.title ?? post?.title ?? undefined,
      type: 'article',
      url: canonicalURL(path, post?.canonical),
    }),
    robots: post?.noindex ? noIndexFollowRobots : indexFollowRobots,
    title: post?.meta?.title ?? post?.title ?? undefined,
  }
}
