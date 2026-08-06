FROM node:20-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM dependencies AS builder

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_CMS_URL
ARG R2_PUBLIC_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_GTM_MEASUREMENT_ID
ARG NEXT_PUBLIC_FACEBOOK_PIXEL_ID
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG DATABASE_URI

RUN : "${NEXT_PUBLIC_SITE_URL:?NEXT_PUBLIC_SITE_URL build argument is required}" \
  && : "${NEXT_PUBLIC_CMS_URL:?NEXT_PUBLIC_CMS_URL build argument is required}" \
  && : "${R2_PUBLIC_URL:?R2_PUBLIC_URL build argument is required}" \
  && : "${DATABASE_URI:?DATABASE_URI build argument is required}"

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL
ENV R2_PUBLIC_URL=$R2_PUBLIC_URL
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GTM_MEASUREMENT_ID=$NEXT_PUBLIC_GTM_MEASUREMENT_ID
ENV NEXT_PUBLIC_FACEBOOK_PIXEL_ID=$NEXT_PUBLIC_FACEBOOK_PIXEL_ID
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV PAYLOAD_PUBLIC_APP_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_IS_LIVE=true

COPY . ./

RUN PAYLOAD_SECRET=build-only-payload-secret-that-is-at-least-32-characters \
  DATABASE_URI="$DATABASE_URI" \
  R2_BUCKET=build-only-bucket \
  R2_ACCESS_KEY_ID=build-only-access-key \
  R2_SECRET_ACCESS_KEY=build-only-secret-key \
  R2_ENDPOINT=https://build-only-account.r2.cloudflarestorage.com \
  NEXT_PUBLIC_ENABLE_CLOUD=false \
  NEXT_PUBLIC_ENABLE_DOCS=false \
  NEXT_PUBLIC_ENABLE_COMMUNITY_HELP=false \
  NEXT_PUBLIC_ENABLE_PARTNERS=false \
  NEXT_PUBLIC_ENABLE_STYLEGUIDE=false \
  NEXT_PUBLIC_SKIP_BUILD_DOCS=true \
  NEXT_PUBLIC_SKIP_BUILD_HELPS=true \
  pnpm build:skipDocs && pnpm prune --prod

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --gid 1001 ecolitea && useradd --uid 1001 --gid ecolitea --create-home ecolitea

COPY --from=builder --chown=ecolitea:ecolitea /app/package.json ./
COPY --from=builder --chown=ecolitea:ecolitea /app/next.config.js ./
COPY --from=builder --chown=ecolitea:ecolitea /app/redirects.js ./
COPY --from=builder --chown=ecolitea:ecolitea /app/src ./src
COPY --from=builder --chown=ecolitea:ecolitea /app/public ./public
COPY --from=builder --chown=ecolitea:ecolitea /app/.next ./.next
COPY --from=builder --chown=ecolitea:ecolitea /app/node_modules ./node_modules

USER ecolitea

EXPOSE 3000

CMD ["pnpm", "start"]
