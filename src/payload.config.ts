import { revalidateRedirects } from '@hooks/revalidateRedirects'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import {
  EXPERIMENTAL_TableFeature,
  lexicalEditor,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import link from '@root/fields/link'
import { LabelFeature } from '@root/fields/richText/features/label/server'
import { LargeBodyFeature } from '@root/fields/richText/features/largeBody/server'
import { revalidateTag } from 'next/cache'
import nodemailerSendgrid from 'nodemailer-sendgrid'
import path from 'path'
import { buildConfig, type TextField } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { BlogContent } from './blocks/BlogContent'
import { BlogMarkdown } from './blocks/BlogMarkdown'
import { Callout } from './blocks/Callout'
import { CallToAction } from './blocks/CallToAction'
import { CardGrid } from './blocks/CardGrid'
import { CaseStudiesHighlight } from './blocks/CaseStudiesHighlight'
import { CaseStudyCards } from './blocks/CaseStudyCards'
import { CaseStudyParallax } from './blocks/CaseStudyParallax'
import { Code } from './blocks/Code'
import { CodeFeature } from './blocks/CodeFeature'
import { ComparisonTable } from './blocks/ComparisonTable'
import { Content } from './blocks/Content'
import { ContentGrid } from './blocks/ContentGrid'
import { DownloadBlock } from './blocks/Download'
import { CodeExampleBlock, ExampleTabs, MediaExampleBlock } from './blocks/ExampleTabs'
import { Form } from './blocks/Form'
import { HoverCards } from './blocks/HoverCards'
import { HoverHighlights } from './blocks/HoverHighlights'
import { LinkGrid } from './blocks/LinkGrid'
import { LogoGrid } from './blocks/LogoGrid'
import { MediaBlock } from './blocks/Media'
import { MediaContent } from './blocks/MediaContent'
import { MediaContentAccordion } from './blocks/MediaContentAccordion'
import { Pricing } from './blocks/Pricing'
import { ReusableContent as ReusableContentBlock } from './blocks/ReusableContent'
import { Slider } from './blocks/Slider'
import { Statement } from './blocks/Statement'
import { Steps } from './blocks/Steps'
import { StickyHighlights } from './blocks/StickyHighlights'
import { CaseStudies } from './collections/CaseStudies'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { ReusableContent } from './collections/ReusableContent'
import { Users } from './collections/Users'
import { Footer } from './globals/Footer'
import { GetStarted } from './globals/GetStarted'
import { MainMenu } from './globals/MainMenu'
import { TopBar } from './globals/TopBar'
import { opsCounterPlugin } from './plugins/opsCounter'
import { externalServices, getAllowedOrigins } from './config/externalServices'
import redeployWebsite from './scripts/redeployWebsite'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const sendGridAPIKey = process.env.SENDGRID_API_KEY
const emailAdapter =
  sendGridAPIKey && externalServices.email.fromAddress
    ? nodemailerAdapter({
        defaultFromAddress: externalServices.email.fromAddress,
        defaultFromName: externalServices.email.fromName,
        transportOptions: nodemailerSendgrid({
          apiKey: sendGridAPIKey,
        }),
      })
    : undefined

const requiredR2Variables = [
  'R2_BUCKET',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_ENDPOINT',
  'R2_PUBLIC_URL',
] as const

const isR2Configured = requiredR2Variables.every((variable) => Boolean(process.env[variable]))

export default buildConfig({
  admin: {
    components: {
      graphics: {
        Logo: '@root/components/AdminLogo',
      },
    },
    importMap: {
      baseDir: dirname,
    },
    meta: {
      titleSuffix: '- Ecolitea',
    },
  },
  blocks: [
    BlogContent,
    BlogMarkdown,
    CodeExampleBlock,
    MediaExampleBlock,
    Callout,
    CallToAction,
    DownloadBlock,
    CardGrid,
    CaseStudyCards,
    CaseStudiesHighlight,
    CaseStudyParallax,
    CodeFeature,
    Content,
    ContentGrid,
    ComparisonTable,
    Form,
    HoverCards,
    HoverHighlights,
    LinkGrid,
    LogoGrid,
    MediaBlock,
    MediaContent,
    MediaContentAccordion,
    Pricing,
    ReusableContentBlock,
    Slider,
    Statement,
    Steps,
    StickyHighlights,
    ExampleTabs,
    {
      slug: 'spotlight',
      fields: [
        {
          name: 'element',
          type: 'select',
          options: [
            {
              label: 'H1',
              value: 'h1',
            },
            {
              label: 'H2',
              value: 'h2',
            },
            {
              label: 'H3',
              value: 'h3',
            },
            {
              label: 'Paragraph',
              value: 'p',
            },
          ],
        },
        {
          name: 'richText',
          type: 'richText',
          editor: lexicalEditor(),
        },
      ],
      interfaceName: 'SpotlightBlock',
    },
    {
      slug: 'video',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
      interfaceName: 'VideoBlock',
    },
    {
      slug: 'br',
      fields: [
        {
          name: 'ignore',
          type: 'text',
        },
      ],

      interfaceName: 'BrBlock',
    },
    {
      slug: 'commandLine',
      fields: [
        {
          name: 'command',
          type: 'text',
        },
      ],
      interfaceName: 'CommandLineBlock',
    },
    {
      slug: 'command',
      fields: [
        {
          name: 'command',
          type: 'text',
          required: true,
        },
      ],
      labels: {
        plural: 'Command Lines',
        singular: 'Command Line',
      },
    },
    {
      slug: 'link',
      fields: [link()],
      labels: {
        plural: 'Links',
        singular: 'Link',
      },
    },
    Code,
  ],
  collections: [CaseStudies, Media, Pages, Posts, Categories, ReusableContent, Users],
  cors: getAllowedOrigins(
    process.env.NODE_ENV === 'production',
    process.env.PAYLOAD_PUBLIC_APP_URL,
  ),
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  defaultDepth: 1,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((feature) => feature.key !== 'link'),
      LinkFeature({
        fields({ defaultFields }) {
          return [
            ...defaultFields.filter((field) => field.name !== 'url'),
            {
              // Own url field to disable URL encoding links starting with '../'
              name: 'url',
              type: 'text',
              label: ({ t }) => t('fields:enterURL'),
              required: true,
              validate: (value: string, options) => {
                return
              },
            } as TextField,
          ]
        },
      }),
      EXPERIMENTAL_TableFeature(),
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: 'enableLink',
                type: 'checkbox',
                label: 'Enable Link',
              },
              link({
                appearances: false,
                disableLabel: true,
                overrides: {
                  admin: {
                    condition: (_, data) => Boolean(data?.enableLink),
                  },
                },
              }),
            ],
          },
        },
      }),
      LabelFeature(),
      LargeBodyFeature(),
    ],
  }),
  ...(emailAdapter ? { email: emailAdapter } : {}),
  endpoints: [
    {
      handler: redeployWebsite,
      method: 'post',
      path: '/redeploy/website',
    },
  ],
  globals: [Footer, MainMenu, GetStarted, TopBar],
  graphQL: {
    disablePlaygroundInProduction: false,
  },
  plugins: [
    opsCounterPlugin({
      max: 200,
      warnAt: 25,
    }),
    formBuilderPlugin({
      formOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'hubSpotFormID',
            type: 'text',
            admin: {
              position: 'sidebar',
            },
            label: 'HubSpot Form ID',
          },
          {
            name: 'customID',
            type: 'text',
            admin: {
              description: 'Attached to submission button to track clicks',
              position: 'sidebar',
            },
            label: 'Custom ID',
          },
          {
            name: 'requireRecaptcha',
            type: 'checkbox',
            admin: {
              position: 'sidebar',
            },
            label: 'Require reCAPTCHA',
          },
        ],
        hooks: {
          afterChange: [
            ({ doc }) => {
              revalidateTag(`form-${doc.title}`)
            },
          ],
        },
      },
      formSubmissionOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'recaptcha',
            type: 'text',
            validate: async (value, { req, siblingData }) => {
              const form = await req.payload.findByID({
                id: siblingData?.form,
                collection: 'forms',
              })

              if (!form?.requireRecaptcha) {
                return true
              }

              if (!value) {
                return 'Please complete the reCAPTCHA'
              }

              const res = await fetch(
                `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.NEXT_PRIVATE_RECAPTCHA_SECRET_KEY}&response=${value}`,
                {
                  method: 'POST',
                },
              )
              const data = await res.json()
              if (!data.success) {
                return 'Invalid captcha'
              } else {
                return true
              }
            },
          },
        ],
        hooks: {
          afterChange: [
            async ({ doc, req }) => {
              req.payload.logger.info('Form Submission Received')
              req.payload.logger.info(Object.fromEntries(req?.headers.entries()))

              const body = req.json ? await req.json() : {}

              const sendSubmissionToHubSpot = async (): Promise<void> => {
                const { form, submissionData: submissionDataFromDoc } = doc
                const portalID = process.env.NEXT_PRIVATE_HUBSPOT_PORTAL_KEY

                // Remove partnerId from HubSpot submission (toEmail already populated by beforeChange hook)
                const submissionData = submissionDataFromDoc.filter(
                  (field) => field.field !== 'partnerId',
                )

                const data = {
                  context: {
                    ...('hubspotCookie' in body && {
                      hutk: body?.hubspotCookie,
                    }),
                    pageName: 'pageName' in body ? body?.pageName : '',
                    pageUri: 'pageUri' in body ? body?.pageUri : '',
                  },
                  fields: submissionData.map((key) => ({
                    name: key.field,
                    value: key.value,
                  })),
                }

                try {
                  await fetch(
                    `https://api.hsforms.com/submissions/v3/integration/submit/${portalID}/${form.hubSpotFormID}`,
                    {
                      body: JSON.stringify(data),
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      method: 'POST',
                    },
                  )
                } catch (err: unknown) {
                  req.payload.logger.error({
                    err,
                    msg: 'Fetch to HubSpot form submissions failed',
                  })
                }
              }
              await sendSubmissionToHubSpot()
            },
          ],
        },
      },
    }),
    seoPlugin({
      collections: ['case-studies', 'pages', 'posts'],
      globals: ['get-started'],
      uploadsCollection: 'media',
    }),
    nestedDocsPlugin({
      collections: ['pages'],
      generateLabel: (_, doc) => doc.title as string,
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug as string}`, ''),
    }),
    redirectsPlugin({
      collections: ['case-studies', 'pages', 'posts'],
      overrides: {
        hooks: {
          afterChange: [revalidateRedirects],
        },
      },
    }),
    s3Storage({
      enabled: isR2Configured,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            const key = prefix ? `${prefix}/${filename}` : filename
            const publicURL = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')

            return `${publicURL}/${key}`
          },
        },
      },
      bucket: process.env.R2_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
        endpoint: process.env.R2_ENDPOINT,
        forcePathStyle: true,
        region: 'auto',
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
