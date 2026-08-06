# Ecolitea CMS

Ecolitea is a CMS-driven website built on a tailored Payload implementation. Its admin panel is the editorial workspace for managing site content, media, navigation, forms, and operational settings; the public-facing Next.js website renders that managed content.

## Core Capabilities

- **Content management** — Create and maintain pages, posts, categories, case studies, reusable content, and flexible page blocks.
- **Media management** — Upload media, generate configured image sizes, and deliver public assets through Cloudflare R2.
- **Site configuration** — Manage the main navigation, footer, top bar, and conversion settings without changing application code.
- **Growth operations** — Receive form submissions and email notifications; configure SEO, redirects, analytics, and operational counters.
- **Administration** — Maintain administrator users and access to the content-management workspace.

## Production Architecture

```mermaid
flowchart LR
  Editor[Content editor] --> Admin[Ecolitea Admin]
  Admin --> App[Ecolitea application]
  App --> MongoDB[(MongoDB)]
  App --> R2[Cloudflare R2]
  MongoDB --> Website[Next.js website]
  R2 --> Website
  Visitor[Visitor] --> Cloudflare[Cloudflare CDN]
  Cloudflare --> Caddy[Caddy reverse proxy]
  Caddy --> Website
  GHCR[GHCR public image] --> Compose[Docker Compose]
  Compose --> App
  Compose --> MongoDB
```

Content editors work in Ecolitea Admin. The application stores structured content in MongoDB and sends uploaded media to Cloudflare R2; the website reads both to render the public experience.

For production delivery, Cloudflare provides the CDN and TLS edge, Caddy proxies requests at the origin, and Docker Compose runs the Ecolitea application with MongoDB. Public release images are distributed through GitHub Container Registry (GHCR). R2 remains external to the server and containers.

## Local Development

### Prerequisites

- Node.js 20 or newer.
- Corepack, used to run the project-pinned pnpm version.
- MongoDB running and reachable from this project.
- A configured `.env` file. Copy `.env.example` and replace its placeholders with values from your team's secret manager; do not commit `.env`.

### Start the application

```bash
git clone https://github.com/GHCR_OWNER/YOUR_REPOSITORY.git ecolitea
cd ecolitea

corepack enable
corepack pnpm@9.15.4 install --frozen-lockfile
cp .env.example .env
corepack pnpm@9.15.4 payload migrate
corepack pnpm@9.15.4 dev
```

Open `http://localhost:3000/admin` to sign in to the admin panel. The website is served by the same application.

### Validate a local change

```bash
corepack pnpm@9.15.4 exec tsc --noEmit --incremental false
corepack pnpm@9.15.4 build:skipDocs
```

Local development uses the generic `DATABASE_URI` in `.env`. Use `payload migrate` only when a release intentionally introduces a database schema change. `build:skipDocs` is the production build used by this streamlined Ecolitea installation.

## Environment Configuration

Keep environment values in `.env` locally and on the server. Use placeholders rather than live credentials in documentation or deployment manifests; do not commit `.env`.

| Group | Variables | Purpose |
| --- | --- | --- |
| Core application | `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CMS_URL`, `PAYLOAD_PUBLIC_APP_URL`, `SITEMAP_URL`, `NEXT_PUBLIC_IS_LIVE` | Session security, canonical application URLs, sitemap host, and production indexing. Set `NEXT_PUBLIC_IS_LIVE=true` in production. |
| Local database | `DATABASE_URI` | Generic MongoDB connection string for local development. |
| Docker database | `MONGODB_URI`, `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD` | The production application connection string and MongoDB's first-run root-user initialization values. |
| Docker deployment | `DOMAIN`, `ECOLITEA_IMAGE`, `IMAGE_TAG` | The public host name, GHCR image reference, and selected immutable release image tag. |
| Media storage | `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_PUBLIC_URL` | Cloudflare R2 bucket access and the public media origin. |
| Optional email and analytics | `SENDGRID_API_KEY`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GTM_MEASUREMENT_ID`, `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`, `GA_USE_DEMO_DATA` | Optional email notifications and analytics integrations. Set `GA_USE_DEMO_DATA=false` in production. |
| Optional forms and publishing | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PRIVATE_RECAPTCHA_SECRET_KEY`, `NEXT_PRIVATE_HUBSPOT_PORTAL_KEY`, `NEXT_PRIVATE_DRAFT_SECRET`, `REVALIDATION_KEY`, `NEXT_PRIVATE_REVALIDATION_KEY` | Optional reCAPTCHA and form integrations, draft access, and controlled content revalidation. |

For a Docker deployment, set `MONGODB_URI` to an authenticated internal connection string. It is passed to the application as `DATABASE_URI`:

```env
MONGODB_URI=mongodb://MONGODB_ROOT_USERNAME:URL_ENCODED_MONGODB_ROOT_PASSWORD@mongodb:27017/ecolitea?authSource=admin
```

The root username and password used in that URI must match the MongoDB initialization credentials. URL-encode the password before placing it in the URI.

Use placeholders rather than live credentials when creating configuration files:

```env
# Core application
PAYLOAD_SECRET=REPLACE_WITH_A_RANDOM_32_PLUS_CHARACTER_SECRET
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_CMS_URL=https://YOUR_DOMAIN
PAYLOAD_PUBLIC_APP_URL=https://YOUR_DOMAIN
SITEMAP_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_IS_LIVE=true

# Production publishing and analytics settings
NEXT_PRIVATE_DRAFT_SECRET=REPLACE_WITH_A_RANDOM_SECRET
NEXT_PRIVATE_REVALIDATION_KEY=REPLACE_WITH_A_RANDOM_SECRET
REVALIDATION_KEY=REPLACE_WITH_A_RANDOM_SECRET
GA_USE_DEMO_DATA=false

# Docker deployment
DOMAIN=YOUR_DOMAIN
ECOLITEA_IMAGE=ghcr.io/GHCR_OWNER/ecolitea
IMAGE_TAG=YOUR_IMAGE_TAG
MONGO_INITDB_ROOT_USERNAME=MONGODB_ROOT_USERNAME
MONGO_INITDB_ROOT_PASSWORD=REPLACE_WITH_A_URL_SAFE_PASSWORD
MONGODB_URI=mongodb://MONGODB_ROOT_USERNAME:URL_ENCODED_MONGODB_ROOT_PASSWORD@mongodb:27017/ecolitea?authSource=admin

# Local MongoDB only
DATABASE_URI=mongodb://MONGODB_HOST:27017/ecolitea

# Cloudflare R2
R2_BUCKET=YOUR_R2_BUCKET
R2_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_ACCESS_KEY
R2_ENDPOINT=https://YOUR_CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://media.YOUR_DOMAIN
```

Email, analytics, and reCAPTCHA are optional integrations. When one is enabled, provide its public `NEXT_PUBLIC_*` integration value as an optional GitHub Actions Variable before the image build; Next.js bakes those public values into the image. Keep server-only integration keys, including `SENDGRID_API_KEY`, `NEXT_PRIVATE_RECAPTCHA_SECRET_KEY`, and `NEXT_PRIVATE_HUBSPOT_PORTAL_KEY`, only in the server `.env`.

Generate `PAYLOAD_SECRET` with a cryptographically secure value of at least 32 characters, for example:

```bash
openssl rand -base64 48
```

Never commit `PAYLOAD_SECRET`, R2 keys, database credentials, revalidation secrets, or service API keys. R2 access keys should have only the bucket permissions required by the application.

## Production Deployment

The production delivery path is:

```text
Cloudflare CDN -> Caddy -> Docker Compose -> Ecolitea application + MongoDB
GHCR -> Docker Compose image pull
Cloudflare R2 -> public media storage
```

### Infrastructure contract

| Component | Responsibility |
| --- | --- |
| Cloudflare | DNS, CDN caching, and edge TLS. Enable the proxy for `YOUR_DOMAIN` and use **Full (strict)** SSL/TLS mode so Cloudflare validates the origin certificate. |
| Caddy | Runs in Docker Compose, uses `DOMAIN` as the origin host, terminates origin TLS, and forwards traffic to the Ecolitea container. |
| Docker Compose | Runs the Ecolitea application image, MongoDB, and Caddy as coordinated services. |
| MongoDB volume | The named `mongodb_data` volume persists application data independently of container replacement. MongoDB initializes its root user only on first use. |
| Cloudflare R2 | Stores public uploads independently of the server filesystem and container lifecycle. |
| GHCR | Publishes public images such as `ghcr.io/GHCR_OWNER/ecolitea:YOUR_IMAGE_TAG`. |

MongoDB data is separate from the application image. It is not automatically migrated by Docker Compose or the release workflow. Preserve the `mongodb_data` volume during maintenance; do not remove it when stopping or replacing application containers.

> **Warning:** Never use `docker compose down -v` as a release command: it removes `mongodb_data` and therefore deletes the persisted MongoDB data.

### First server deployment

1. Provision a Linux server at `YOUR_SERVER_IP` with Docker Engine and Docker Compose v2.
2. Point `YOUR_DOMAIN` to `YOUR_SERVER_IP` in Cloudflare, enable the proxy, and configure Full (strict) TLS.
3. Place the project deployment files on the server and run:

```bash
cp .env.example .env
# Edit .env: set runtime credentials, DOMAIN, ECOLITEA_IMAGE, IMAGE_TAG, and MongoDB credentials.
docker compose pull
docker compose up -d
docker compose ps
```

Before the first start, ensure the server `.env` sets `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CMS_URL`, `PAYLOAD_PUBLIC_APP_URL`, and `SITEMAP_URL` to `https://YOUR_DOMAIN`; set `NEXT_PUBLIC_IS_LIVE=true` and `GA_USE_DEMO_DATA=false`; and replace `NEXT_PRIVATE_DRAFT_SECRET`, `NEXT_PRIVATE_REVALIDATION_KEY`, and `REVALIDATION_KEY` with random values. Configure only the optional email, analytics, and reCAPTCHA integrations your site uses.

The first start initializes MongoDB with `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`, then persists its data in `mongodb_data`. Later application releases do not reinitialize the database.

### Routine application-only update

Set `IMAGE_TAG` in the server `.env` to the release image to deploy. Then run exactly:

```bash
docker compose pull ecolitea
docker compose up -d --no-deps ecolitea
docker compose ps ecolitea mongodb caddy
```

This replaces only the Ecolitea application container. MongoDB, Caddy, and the `mongodb_data` volume remain in place.

### Rollback

Keep the previously deployed immutable `IMAGE_TAG`. To roll back, set it again in the server `.env`, then use the same routine application-only update commands. Restore a MongoDB backup only when an explicitly run schema change requires it.

## Release Images

The release workflow is started manually from **Actions → Release Ecolitea → Run workflow**. Before running it, create and push a Docker-compatible Git tag that identifies the release:

```bash
git tag YOUR_IMAGE_TAG
git push origin YOUR_IMAGE_TAG
```

Enter that existing tag in the required `tag` field. The workflow validates and checks out the tag, typechecks the project, builds against a disposable CI MongoDB instance, builds the container image, and pushes both the selected-tag and commit-SHA image tags to GHCR. It then creates a GitHub Release with `--generate-notes`. It never connects to, migrates, or otherwise changes production MongoDB data. The workflow sends no external notification.

Before the first release is deployed, open the new GHCR package's GitHub package settings and set its visibility to **Public**.

### GitHub Actions Variables

Configure these repository-level GitHub Actions Variables before running the release workflow:

| Variable | Required value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR_DOMAIN` |
| `NEXT_PUBLIC_CMS_URL` | `https://YOUR_DOMAIN` |
| `R2_PUBLIC_URL` | `https://media.YOUR_DOMAIN` |

These are build-time values and must match production because Next.js public values are baked into the image. No custom Secret is required for a release.

```env
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_CMS_URL=https://YOUR_DOMAIN
R2_PUBLIC_URL=https://media.YOUR_DOMAIN
```

## Operations

| Routine | What to do |
| --- | --- |
| Database migrations | No migration runs during image build, first deployment, or routine application-only update. Plan and run an intentional schema migration separately, with a verified MongoDB backup. |
| Type safety | The release workflow runs `corepack pnpm@9.15.4 exec tsc --noEmit --incremental false` before publishing an image. |
| Production build | The release workflow builds the production image before it is pushed to GHCR. |
| Service health | Review `docker compose ps` and `docker compose logs` after deployment. |
| MongoDB backup | Back up `mongodb_data` before an intentionally run schema migration and retain a restore-tested copy. |
| R2 verification | Confirm the bucket credentials allow the required upload, read, and delete operations and that `R2_PUBLIC_URL` serves media publicly. |
| Image rollback | Keep the previous GHCR image tag available until the new release is verified. |

## Troubleshooting

| Symptom | Check | Corrective action |
| --- | --- | --- |
| The application cannot connect to MongoDB | `MONGODB_URI`, service name, network, and MongoDB logs | Confirm the authenticated URI, including `authSource=admin`, and ensure MongoDB is healthy before starting the application. |
| Media uploads fail or images do not load | R2 credentials, bucket name, endpoint, and public URL | Verify the R2 credentials and S3-compatible endpoint; ensure `R2_PUBLIC_URL` resolves to the public media domain. |
| Admin sign-in or preview URLs use the wrong host | `NEXT_PUBLIC_SITE_URL` and `PAYLOAD_PUBLIC_APP_URL` | Set both URLs to `https://YOUR_DOMAIN`, then rebuild and redeploy the application. |
| Forms do not send notifications | `SENDGRID_API_KEY` and the sending configuration | Supply a valid email service key and verify the provider configuration. |
| Cloudflare returns a 502 or origin error | Caddy logs, container status, and application logs | Confirm Caddy can reach the application service and that Docker Compose reports Ecolitea, MongoDB, and Caddy as running. |
| A release needs to be reverted | Current and previous image tags, database migration state | Re-deploy the previous immutable GHCR image tag; restore the matching MongoDB backup only after an intentional incompatible schema change. |
