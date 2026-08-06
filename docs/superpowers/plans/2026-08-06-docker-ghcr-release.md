# Ecolitea Docker and GHCR Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure Docker Compose deployment and a manually dispatched GitHub Actions workflow that validates a pushed Git tag, publishes its Ecolitea image to GHCR, and creates a generated-notes Release.

**Architecture:** The production server runs Ecolitea, MongoDB, and Caddy as separate Compose services. MongoDB data and Caddy certificate state use named volumes; routine code releases update only the `ecolitea` service. GitHub Actions builds from the selected tag using a disposable CI MongoDB service, then publishes two immutable GHCR tags and creates a Release using `GITHUB_TOKEN`.

**Tech Stack:** Node.js 20, Corepack, pnpm 9.15.4, Next.js 15, Payload 3, Docker multi-stage builds, Docker Compose, Caddy 2, MongoDB 7, GitHub Actions, GHCR.

---

## File Structure

- Create: `.gitignore` — excludes local credentials, generated output, dependencies, and local container state while retaining `.env.example`.
- Create: `.dockerignore` — excludes credentials and local artifacts from the Docker build context.
- Create: `Dockerfile` — builds and runs the Ecolitea application without baking in runtime credentials.
- Modify: `Caddyfile` — replaces inherited local OAuth proxy hosts with production `DOMAIN` proxy configuration.
- Create: `docker-compose.yml` — defines `ecolitea`, `mongodb`, and `caddy` services plus named volumes.
- Modify: `.env.example` — adds safe Docker deployment variables `DOMAIN`, `ECOLITEA_IMAGE`, and `IMAGE_TAG`.
- Create: `.github/workflows/release.yml` — manually releases a supplied existing Git tag to GHCR and GitHub Releases.
- Modify: `README.md` — documents first deployment, application-only updates, GitHub Variables, and manual release operation.

### Task 1: Add credential and build-context boundaries

**Files:**
- Create: `.gitignore`
- Create: `.dockerignore`
- Test: one-off Node.js assertion against both ignore files

- [ ] **Step 1: Confirm the ignore files do not yet exist**

Run:

```bash
node -e 'const fs=require("fs");const files=[".gitignore",".dockerignore"];const present=files.filter(fs.existsSync);if(present.length){console.error(present);process.exit(1)}console.log("Ignore files are absent before implementation")'
```

Expected: exit code `0` and `Ignore files are absent before implementation`.

- [ ] **Step 2: Create `.gitignore` with local-runtime exclusions**

Create `.gitignore` with this content:

```gitignore
# Dependencies and generated application output
node_modules/
.next/
out/
coverage/

# Local environment files; the safe template remains tracked
.env
.env.local
.env.*.local
!.env.example

# Logs and operating-system files
*.log
.DS_Store

# Local Docker and Caddy state
docker-compose.override.yml
docker-compose.override.yaml
caddy/data/
caddy/config/
```

- [ ] **Step 3: Create `.dockerignore` with image-build exclusions**

Create `.dockerignore` with this content:

```dockerignore
.env
.env.local
.env.*.local
.next
node_modules
.git
.github
coverage
out
*.log
.DS_Store
docker-compose.override.yml
docker-compose.override.yaml
caddy/data
caddy/config
docs
```

- [ ] **Step 4: Verify secret and template handling**

Run:

```bash
node -e 'const fs=require("fs");const git=fs.readFileSync(".gitignore","utf8");const docker=fs.readFileSync(".dockerignore","utf8");const checks=[git.includes(".env\n"),git.includes("!.env.example"),docker.includes(".env\n"),!docker.includes(".env.example")];if(checks.some((value)=>!value)){process.exit(1)}console.log("Ignore-file credential boundaries passed")'
```

Expected: exit code `0` and `Ignore-file credential boundaries passed`.

### Task 2: Package the application and define production services

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Modify: `Caddyfile`
- Modify: `.env.example`
- Test: `docker compose --env-file .env.example config`

- [ ] **Step 1: Create the multi-stage `Dockerfile`**

Create `Dockerfile` with this content. The final stage has production dependencies, compiled Next output, static public files, runtime configuration files, and source files required by Payload configuration loading. It never copies `.env` because `.dockerignore` excludes it.

```dockerfile
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

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL
ENV R2_PUBLIC_URL=$R2_PUBLIC_URL
ENV PAYLOAD_PUBLIC_APP_URL=$NEXT_PUBLIC_SITE_URL
ENV PAYLOAD_SECRET=build-only-payload-secret-that-is-at-least-32-characters
ENV DATABASE_URI=mongodb://127.0.0.1:27017/ecolitea-build
ENV R2_BUCKET=build-only-bucket
ENV R2_ACCESS_KEY_ID=build-only-access-key
ENV R2_SECRET_ACCESS_KEY=build-only-secret-key
ENV R2_ENDPOINT=https://build-only-account.r2.cloudflarestorage.com
ENV NEXT_PUBLIC_ENABLE_CLOUD=false
ENV NEXT_PUBLIC_ENABLE_DOCS=false
ENV NEXT_PUBLIC_ENABLE_COMMUNITY_HELP=false
ENV NEXT_PUBLIC_ENABLE_PARTNERS=false
ENV NEXT_PUBLIC_ENABLE_STYLEGUIDE=false
ENV NEXT_PUBLIC_SKIP_BUILD_DOCS=true
ENV NEXT_PUBLIC_SKIP_BUILD_HELPS=true

COPY . ./

RUN pnpm build:skipDocs && pnpm prune --prod

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
```

- [ ] **Step 2: Replace `Caddyfile` with production reverse-proxy configuration**

Replace `Caddyfile` with this content:

```caddyfile
{$DOMAIN} {
	encode zstd gzip
	reverse_proxy ecolitea:3000
}
```

- [ ] **Step 3: Create `docker-compose.yml` with independent MongoDB storage**

Create `docker-compose.yml` with this content:

```yaml
services:
  ecolitea:
    image: ${ECOLITEA_IMAGE}:${IMAGE_TAG}
    restart: unless-stopped
    env_file:
      - .env
    environment:
      DATABASE_URI: mongodb://mongodb:27017/ecolitea
      NODE_ENV: production
      PORT: 3000
      HOSTNAME: 0.0.0.0
    depends_on:
      mongodb:
        condition: service_healthy
    healthcheck:
      test:
        - CMD
        - node
        - -e
        - "fetch('http://127.0.0.1:3000/admin', { redirect: 'manual' }).then((response) => process.exit(response.status < 500 ? 0 : 1)).catch(() => process.exit(1))"
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s
    networks:
      - internal

  mongodb:
    image: mongo:7.0
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping').ok"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - internal

  caddy:
    image: caddy:2.10.2-alpine
    restart: unless-stopped
    depends_on:
      ecolitea:
        condition: service_healthy
    environment:
      DOMAIN: ${DOMAIN}
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - internal

volumes:
  mongodb_data:
  caddy_data:
  caddy_config:

networks:
  internal:
    driver: bridge
```

- [ ] **Step 4: Add safe deployment variables to `.env.example`**

Append this block to `.env.example`:

```env

# Docker Compose deployment
DOMAIN=YOUR_DOMAIN
ECOLITEA_IMAGE=ghcr.io/GHCR_OWNER/ecolitea
IMAGE_TAG=YOUR_IMAGE_TAG
```

- [ ] **Step 5: Validate Compose interpolation and service boundaries**

Run:

```bash
docker compose --env-file .env.example config
```

Expected: exit code `0`; the rendered configuration contains `ecolitea`, `mongodb`, and `caddy`, includes `mongodb_data`, and contains no expanded live credential.

### Task 3: Add the manual tag release workflow

**Files:**
- Create: `.github/workflows/release.yml`
- Test: one-off Node.js content assertion against workflow YAML

- [ ] **Step 1: Confirm the release workflow does not yet exist**

Run:

```bash
node -e 'const fs=require("fs");if(fs.existsSync(".github/workflows/release.yml")){process.exit(1)}console.log("Release workflow is absent before implementation")'
```

Expected: exit code `0` and `Release workflow is absent before implementation`.

- [ ] **Step 2: Create `.github/workflows/release.yml`**

Create the workflow with this content:

```yaml
name: Release Ecolitea

on:
  workflow_dispatch:
    inputs:
      tag:
        description: Existing Git tag to release
        required: true
        type: string

permissions:
  contents: write
  packages: write

concurrency:
  group: release-${{ inputs.tag }}
  cancel-in-progress: false

jobs:
  release:
    name: Validate, publish, and release
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --quiet --eval 'db.adminCommand(\"ping\").ok'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      RELEASE_TAG: ${{ inputs.tag }}
      DATABASE_URI: mongodb://127.0.0.1:27017/ecolitea-ci
      PAYLOAD_SECRET: ci-only-payload-secret-that-is-at-least-32-characters
      NEXT_PUBLIC_SITE_URL: ${{ vars.NEXT_PUBLIC_SITE_URL }}
      NEXT_PUBLIC_CMS_URL: ${{ vars.NEXT_PUBLIC_CMS_URL }}
      PAYLOAD_PUBLIC_APP_URL: ${{ vars.NEXT_PUBLIC_SITE_URL }}
      R2_BUCKET: ci-only-bucket
      R2_ACCESS_KEY_ID: ci-only-access-key
      R2_SECRET_ACCESS_KEY: ci-only-secret-key
      R2_ENDPOINT: https://ci-only-account.r2.cloudflarestorage.com
      R2_PUBLIC_URL: ${{ vars.R2_PUBLIC_URL }}
      NEXT_PUBLIC_ENABLE_CLOUD: "false"
      NEXT_PUBLIC_ENABLE_DOCS: "false"
      NEXT_PUBLIC_ENABLE_COMMUNITY_HELP: "false"
      NEXT_PUBLIC_ENABLE_PARTNERS: "false"
      NEXT_PUBLIC_ENABLE_STYLEGUIDE: "false"
      NEXT_PUBLIC_SKIP_BUILD_DOCS: "true"
      NEXT_PUBLIC_SKIP_BUILD_HELPS: "true"
      NEXT_PRIVATE_DRAFT_SECRET: ci-only-draft-secret
      NEXT_PRIVATE_REVALIDATION_KEY: ci-only-revalidation-secret
      REVALIDATION_KEY: ci-only-revalidation-secret
      GA_USE_DEMO_DATA: "false"

    steps:
      - name: Check out the requested tag
        uses: actions/checkout@v4
        with:
          ref: ${{ inputs.tag }}
          fetch-depth: 0

      - name: Verify the requested tag exists
        run: git rev-parse --verify "refs/tags/${RELEASE_TAG}^{commit}"

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: corepack pnpm@9.15.4 install --frozen-lockfile

      - name: Type-check the release
        run: corepack pnpm@9.15.4 exec tsc --noEmit --incremental false

      - name: Build the release
        run: corepack pnpm@9.15.4 build:skipDocs

      - name: Read the release commit
        id: commit
        run: echo "short_sha=$(git rev-parse --short=7 HEAD)" >> "$GITHUB_OUTPUT"

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push the image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository_owner }}/ecolitea:${{ inputs.tag }}
            ghcr.io/${{ github.repository_owner }}/ecolitea:sha-${{ steps.commit.outputs.short_sha }}
          build-args: |
            NEXT_PUBLIC_SITE_URL=${{ vars.NEXT_PUBLIC_SITE_URL }}
            NEXT_PUBLIC_CMS_URL=${{ vars.NEXT_PUBLIC_CMS_URL }}
            R2_PUBLIC_URL=${{ vars.R2_PUBLIC_URL }}

      - name: Create GitHub Release
        env:
          GH_TOKEN: ${{ github.token }}
        run: gh release create "$RELEASE_TAG" --title "$RELEASE_TAG" --generate-notes
```

- [ ] **Step 3: Verify the workflow contract without running a release**

Run:

```bash
node -e 'const fs=require("fs");const text=fs.readFileSync(".github/workflows/release.yml","utf8");const required=["workflow_dispatch:","inputs:","tag:","ref: ${{ inputs.tag }}","corepack pnpm@9.15.4 exec tsc --noEmit --incremental false","corepack pnpm@9.15.4 build:skipDocs","packages: write","gh release create \"$RELEASE_TAG\" --title \"$RELEASE_TAG\" --generate-notes","ghcr.io/${{ github.repository_owner }}/ecolitea:${{ inputs.tag }}"];const forbidden=["push:","SLACK_WEBHOOK_URL","slack", "payload migrate"];const missing=required.filter((item)=>!text.includes(item));const present=forbidden.filter((item)=>text.includes(item));if(missing.length||present.length){console.error(JSON.stringify({missing,present}));process.exit(1)}console.log("Release workflow contract passed")'
```

Expected: exit code `0` and `Release workflow contract passed`.

### Task 4: Document deployment and release operation

**Files:**
- Modify: `README.md`
- Modify: `.env.example`
- Test: one-off Node.js documentation contract assertion

- [ ] **Step 1: Extend the environment documentation with Compose values**

Add `DOMAIN`, `ECOLITEA_IMAGE`, and `IMAGE_TAG` to the README environment table. Explain that production `DATABASE_URI` is supplied by Compose as `mongodb://mongodb:27017/ecolitea`, while all other `.env` values remain server-local and untracked.

- [ ] **Step 2: Replace generic deployment commands with exact initial and update commands**

In `README.md`, document this first-deployment sequence:

```bash
cp .env.example .env
# Edit .env: set DOMAIN, ECOLITEA_IMAGE, IMAGE_TAG, and runtime credentials.
docker compose pull
docker compose up -d
docker compose ps
```

Document this normal code-update sequence exactly:

```bash
docker compose pull ecolitea
docker compose up -d --no-deps ecolitea
docker compose ps ecolitea mongodb caddy
```

State that `mongodb_data` is preserved and that `docker compose down -v` is not a release command.

- [ ] **Step 3: Document GitHub Actions configuration and manual release steps**

Add a GitHub Release section that requires these GitHub Actions Variables:

```text
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_CMS_URL=https://YOUR_DOMAIN
R2_PUBLIC_URL=https://media.YOUR_DOMAIN
```

Explain that no Slack, webhook, or custom token Secret is needed. Document these operator commands and UI action:

```bash
git tag YOUR_IMAGE_TAG
git push origin YOUR_IMAGE_TAG
```

Then use **Actions → Release Ecolitea → Run workflow**, enter `YOUR_IMAGE_TAG`, and start the workflow. The workflow checks out the tag, validates it, publishes GHCR images, and creates the generated-notes GitHub Release. Set the first published container package to public in GitHub package settings.

- [ ] **Step 4: Verify README operational content**

Run:

```bash
node -e 'const fs=require("fs");const text=fs.readFileSync("README.md","utf8");const required=["docker compose pull ecolitea","docker compose up -d --no-deps ecolitea","Actions → Release Ecolitea → Run workflow"];const missing=required.filter((item)=>!text.includes(item));if(missing.length){console.error(missing);process.exit(1)}if(text.includes("SLACK_WEBHOOK_URL")){console.error("README must not mention a Slack secret");process.exit(1)}console.log("README deployment contract passed")'
```

Expected: exit code `0` and `README deployment contract passed`.

### Task 5: Run non-destructive integration checks

**Files:**
- Test: Docker and configuration assets created above

- [ ] **Step 1: Validate Caddyfile inside the official image**

Run:

```bash
docker run --rm -e DOMAIN=example.com -v "$PWD/Caddyfile:/etc/caddy/Caddyfile:ro" caddy:2.10.2-alpine caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

Expected: exit code `0` and Caddy reports the configuration is valid.

- [ ] **Step 2: Build the Docker image without runtime credentials**

Run:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://example.com \
  --build-arg NEXT_PUBLIC_CMS_URL=https://example.com \
  --build-arg R2_PUBLIC_URL=https://media.example.com \
  --tag ecolitea:local-test .
```

Expected: exit code `0`; `.env` is absent from the Docker context and the resulting image is tagged `ecolitea:local-test`.

- [ ] **Step 3: Re-run TypeScript checking without disturbing the active development server**

Run:

```bash
corepack pnpm@9.15.4 exec tsc --noEmit --incremental false
```

Expected: exit code `0`.

- [ ] **Step 4: Review the changed deployment assets**

Run:

```bash
sed -n '1,240p' Dockerfile
sed -n '1,280p' docker-compose.yml
sed -n '1,260p' .github/workflows/release.yml
sed -n '1,120p' Caddyfile
```

Confirm that no live credentials, Slack configuration, automatic migration, `push` workflow trigger, or `docker compose down -v` command appears in the created assets.

## Version Control

No Git initialization, commit, tag push, GHCR publication, GitHub Release creation, or package-visibility change is part of this implementation. The workspace is not a Git repository; publish operations begin only after the user places these files in their GitHub repository and manually dispatches the workflow.
